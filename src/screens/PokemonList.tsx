import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonDetail {
  name: string;
  image: string;
  url: string;
}

type NavProp = StackNavigationProp<RootStackParamList, "PokemonList">;

const PAGE_SIZE = 20; // Quantos carregar por vez

const PokemonList: React.FC = () => {
  const [pokemons, setPokemons] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation<NavProp>();

  // 🔹 Buscar Pokémons com lazy loading
  const fetchPokemons = useCallback(async () => {
    if (!hasMore) return;

    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = await response.json();

      if (data.results.length === 0) {
        setHasMore(false);
        return;
      }

      const detailsPromises = data.results.map(async (pokemon: Pokemon) => {
        const detailResponse = await fetch(pokemon.url);
        const detailData = await detailResponse.json();

        // 🔸 Usa sprite animado (Black/White) com fallback para sprite estático
        const animatedSprite =
          detailData.sprites?.versions?.["generation-v"]?.["black-white"]
            ?.animated?.front_default || detailData.sprites.front_default;

        return {
          name: pokemon.name,
          image: animatedSprite,
          url: pokemon.url,
        };
      });

      const newPokemons = await Promise.all(detailsPromises);
      setPokemons((prev) => [...prev, ...newPokemons]);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, hasMore]);

  useEffect(() => {
    fetchPokemons();
  }, []);

  if (loading && pokemons.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text>Carregando Pokémons...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={pokemons}
      numColumns={2}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.container}
      columnWrapperStyle={{ justifyContent: "space-around" }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("PokemonDetail", {
              name: item.name,
              image: item.image,
              url: item.url,
            })
          }
        >
          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="small" color="#ccc" />
            )}
          </View>
          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
      )}
      onEndReached={() => {
        if (!loadingMore && hasMore) fetchPokemons();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#e3350d" />
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginVertical: 8,
    width: 150,
    height: 160,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    marginTop: 8,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
});

export default PokemonList;
