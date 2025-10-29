import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PokemonList from './src/screens/PokemonList';
import PokemonDetail from './src/screens/PokemonDetail';

export type RootStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { name: string; image: string; url: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="PokemonList"
          component={PokemonList}
          options={{ title: 'Pokédex' }}
        />
        <Stack.Screen
          name="PokemonDetail"
          component={PokemonDetail}
          options={{ title: 'Detalhes do Pokémon' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
