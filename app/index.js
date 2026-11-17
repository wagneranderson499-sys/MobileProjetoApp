import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Rota inicial: aparece somente ao abrir o aplicativo.
export default function Abertura() {
  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.94)).current;
  const [destino, setDestino] = useState(null);

  useEffect(() => {
    let ativo = true;
    Animated.parallel([
      Animated.timing(opacidade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(escala, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();

    async function iniciar() {
      let proximaTela = '/HomeScreen';
      try {
        const sessao = await AsyncStorage.getItem('@usuario_logado');
        const usuario = sessao ? JSON.parse(sessao) : null;
        if (usuario && typeof usuario === 'object' && (usuario.id || usuario.email)) {
          proximaTela = '/DashboardScreen';
        }
      } catch (erro) {
        console.warn('Não foi possível recuperar a sessão:', erro);
      }
      if (ativo) setDestino(proximaTela);
    }
    iniciar();
    return () => { ativo = false; };
  }, [opacidade, escala]);

  useEffect(() => {
    if (!destino) return;
    const timer = setTimeout(() => router.replace(destino), 2000);
    return () => clearTimeout(timer);
  }, [destino]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#102A4C" />
      <Animated.View style={[styles.centro, { opacity: opacidade, transform: [{ scale: escala }] }]}>
        <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.titulo}>Finance<Text style={styles.destaque}>Control</Text></Text>
        <Text style={styles.subtitulo}>Sua gestão financeira simplificada</Text>
      </Animated.View>
      <View style={styles.rodape}>
        <Ionicons name="wallet-outline" size={17} color="#34D399" />
        <Text style={styles.carregando}>Preparando suas finanças...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#102A4C', alignItems: 'center', justifyContent: 'center' },
  centro: { alignItems: 'center', paddingHorizontal: 24 },
  logo: { width: 118, height: 118, borderRadius: 24, marginBottom: 22 },
  titulo: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  destaque: { color: '#34D399' },
  subtitulo: { color: '#CBD5E1', fontSize: 13, marginTop: 10, textAlign: 'center' },
  rodape: { position: 'absolute', bottom: 64, flexDirection: 'row', alignItems: 'center', gap: 9 },
  carregando: { color: '#CBD5E1', fontSize: 12 },
});
