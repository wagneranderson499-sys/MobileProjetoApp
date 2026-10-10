import { useRouter } from 'expo-router';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.logoText}>
              Finance<Text style={styles.logoHighlight}>Control</Text>
            </Text>
          </View>

          <Text style={styles.tagline}>
            Sua gestão financeira simplificada
          </Text>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="trending-up-outline"
              size={26}
              color="#10B981"
            />
          </View>

          <Text style={styles.heroTitle}>
            Tenha o controle das suas finanças
          </Text>

          <Text style={styles.heroDescription}>
            Organize suas receitas e despesas, acompanhe
            seus gastos e tenha uma visão clara da sua
            vida financeira.
          </Text>

          <View style={styles.heroBottom}>
            <View style={styles.heroStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                Controle simples e inteligente
              </Text>
            </View>
          </View>
        </View>

        {/* Funcionalidades */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>
            Tudo em um só lugar
          </Text>

          <Text style={styles.sectionDescription}>
            Ferramentas para deixar sua organização financeira
            mais prática.
          </Text>

          {/* Feature 1 */}
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIconContainer,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color="#2563EB"
              />
            </View>

            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Dashboard inteligente
              </Text>

              <Text style={styles.featureSub}>
                Visualize seus principais indicadores financeiros
                de forma rápida.
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIconContainer,
                styles.greenIcon,
              ]}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={24}
                color="#059669"
              />
            </View>

            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Lançamentos rápidos
              </Text>

              <Text style={styles.featureSub}>
                Cadastre suas receitas e despesas com poucos
                toques.
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureItem}>
            <View
              style={[
                styles.featureIconContainer,
                styles.purpleIcon,
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#7C3AED"
              />
            </View>

            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Segurança
              </Text>

              <Text style={styles.featureSub}>
                Seus dados financeiros organizados e protegidos.
              </Text>
            </View>
          </View>
        </View>

        {/* Botões */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/LoginScreen')}
          >
            <Text style={styles.primaryButtonText}>
              Acessar minha conta
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => router.push('/CadastroScreen')}
          >
            <Text style={styles.secondaryButtonText}>
              Criar nova conta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <Text style={styles.footerText}>
          Organize hoje. Tenha mais controle amanhã.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    marginBottom: 28,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#162D50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoText: {
    fontSize: 27,
    fontWeight: '800',
    color: '#162D50',
    letterSpacing: -0.8,
  },

  logoHighlight: {
    color: '#10B981',
  },

  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 7,
    marginLeft: 58,
  },

  /* =========================
     HERO
  ========================= */

  heroCard: {
    backgroundColor: '#162D50',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,

    shadowColor: '#162D50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  heroDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#CBD5E1',
  },

  heroBottom: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },

  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },

  /* =========================
     FEATURES
  ========================= */

  featuresContainer: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#162D50',
    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    marginBottom: 18,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  blueIcon: {
    backgroundColor: '#EFF6FF',
  },

  greenIcon: {
    backgroundColor: '#ECFDF5',
  },

  purpleIcon: {
    backgroundColor: '#F5F3FF',
  },

  featureTextContainer: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#162D50',
    marginBottom: 4,
  },

  featureSub: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  /* =========================
     BUTTONS
  ========================= */

  actionContainer: {
    width: '100%',
    marginBottom: 22,
  },

  primaryButton: {
    height: 56,
    backgroundColor: '#10B981',
    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 4,

    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 10,
  },

  secondaryButton: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },

  secondaryButtonText: {
    color: '#162D50',
    fontSize: 15,
    fontWeight: '700',
  },

  /* =========================
     FOOTER
  ========================= */

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});