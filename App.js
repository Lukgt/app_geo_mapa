import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const App = () => {
  const [movieTitle, setMovieTitle] = useState('');
  const [movieData, setMovieData] = useState(null);
  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização não concedida', 'Por favor, conceda permissão de localização para obter a localização.');
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    })();

    fetch('http://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=d85bf4e3-637e-4e1b-9b03-970dca4403c7&limit=5')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setLocations(data.result.records);
        } else {
          Alert.alert('Erro', 'Não foi possível buscar os dados.');
        }
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Erro', 'Houve um problema na busca dos dados.');
      });
  }, []);

  const handleSearch = async () => {
    if (movieTitle.trim() === '') {
      Alert.alert('Aviso', 'Por favor, insira um título de filme válido.');
      return;
    }
    try {
      const apiKey = '83a82fc6'; // Substitua pelo seu próprio API Key
      const apiUrl = `https://www.omdbapi.com/?t=${movieTitle}&apikey=${apiKey}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.Response === 'True') {
        setMovieData(data);
      } else {
        Alert.alert('Erro', 'Filme não encontrado. Verifique o título e tente novamente.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Houve um problema na busca do filme. Tente novamente mais tarde.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busca de Filmes</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome do filme"
        placeholderTextColor="#777"
        value={movieTitle}
        onChangeText={(text) => setMovieTitle(text)}
      />
      <Button title="Buscar Filme" onPress={handleSearch} color="#993399" />

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Sua Localização</Text>
          <Text style={styles.locationText}>Latitude: {location.coords.latitude}</Text>
          <Text style={styles.locationText}>Longitude: {location.coords.longitude}</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Sua Localização"
            />
            {locations.map(loc => (
              <Marker
                key={loc._id}
                coordinate={{
                  latitude: parseFloat(loc.latitude),
                  longitude: parseFloat(loc.longitude),
                }}
                title={loc.nome}
              />
            ))}
          </MapView>
        </View>
      )}

      {movieData && (
        <View style={styles.movieContainer}>
          <Text style={styles.movieTitle}>{movieData.Title}</Text>
          <Text style={styles.movieText}>Ano: {movieData.Year}</Text>
          <Text style={styles.movieText}>Gênero: {movieData.Genre}</Text>
          <Text style={styles.movieText}>Diretor: {movieData.Director}</Text>
          <Text style={styles.movieText}>Prêmios: {movieData.Awards}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    padding: 10,
    marginBottom: 10,
  },
  locationContainer: {
    marginTop: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  locationText: {
    color: '#aaaaaa',
  },
  map: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  movieContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  movieText: {
    color: '#aaaaaa',
  },
});

export default App;