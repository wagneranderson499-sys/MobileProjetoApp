import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header / Logo */}
        <View style={styles.header}>
          <Text style={styles.logoText}>
            Finance<Text style={styles.logoHighlight}>Control</Text>
          </Text>
          <Text style={styles.tagline}>Sua gestão financeira simplificada</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Assuma o controle total do seu dinheiro</Text>
          <Text style={styles.heroDescription}>
            Acompanhe entradas, saídas e relatórios em tempo real de forma prática, rápida e intuitiva.
          </Text>
        </View>

        {/* Funcionalidades em Destaque */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>O que você encontra aqui:</Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Dashboard Inteligente</Text>
              <Text style={styles.featureSub}>Veja resumos visuais das suas finanças.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💸</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Lançamentos Rápidos</Text>
              <Text style={styles.featureSub}>Cadastre receitas e despesas com poucos toques.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Segurança Avançada</Text>
              <Text style={styles.featureSub}>Seus dados financeiros sempre protegidos.</Text>
            </View>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation?.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Acessar Minha Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation?.navigate('Cadastro')}
          >
            <Text style={styles.secondaryButtonText}>Criar Nova Conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#162D50',
  },
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoHighlight: {
    color: '#10B981', // Verde Emerald
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
  },
});