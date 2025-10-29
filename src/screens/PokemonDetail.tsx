import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { RootStackParamList } from "../../App";

type DetailRouteProp = RouteProp<RootStackParamList, "PokemonDetail">;

interface PokemonData {
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  cries?: { latest?: string; legacy?: string };
}

const PokemonDetail: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const { name, image, url } = route.params;
  const [details, setDetails] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    // Limpar som ao sair da tela
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  const playCry = async () => {
    if (!details?.cries?.latest) return;
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: details.cries.latest,
      });
      setSound(newSound);
      await newSound.playAsync();
      setPlaying(true);

      // Parar automaticamente quando terminar
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  };

  if (loading || !details) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e3350d" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      </View>

      <TouchableOpacity
        onPress={playCry}
        style={[styles.soundButton, playing && styles.soundButtonPlaying]}
      >
        <Text style={styles.soundText}>{playing ? "🔊 Tocando..." : "▶️ Ouvir Som"}</Text>
      </TouchableOpacity>

      <Text style={styles.info}>Altura: {details.height / 10} m</Text>
      <Text style={styles.info}>Peso: {details.weight / 10} kg</Text>

      <Text style={styles.subtitle}>Tipos:</Text>
      <View style={styles.typeContainer}>
        {details.types.map((t, index) => (
          <Text key={index} style={styles.type}>
            {t.type.name}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 10,
  },
  imageContainer: {
    backgroundColor: "transparent",
    borderRadius: 20,
    overflow: "hidden",
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    fontSize: 16,
    marginTop: 8,
  },
  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  typeContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  type: {
    backgroundColor: "#ffcb05",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 5,
    textTransform: "capitalize",
  },
  soundButton: {
    backgroundColor: "#e3350d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 15,
  },
  soundButtonPlaying: {
    backgroundColor: "#ff9800",
  },
  soundText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PokemonDetail;
