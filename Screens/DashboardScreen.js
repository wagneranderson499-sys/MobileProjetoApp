import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../Services/api';

export default function DashboardScreen() {
  const [saldo, setSaldo] = useState(0);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  async function carregarDadosDashboard() {
    try {
      setLoading(true);

      // Exemplo de chamadas simultâneas à sua API Spring Boot:
      // const [resResumo, resCategorias] = await Promise.all([
      //   api.get('/transacoes/resumo'),
      //   api.get('/categorias')
      // ]);

      // Mock temporário para exibição imediata:
      setSaldo(3850.5);
      setEntradas(5200.0);
      setSaidas(1349.5);
      setCategorias([
        { id: '1', nome: 'Alimentação', total: 450.0, cor: '#f59e0b', icone: 'fast-food-outline' },
        { id: '2', nome: 'Transporte', total: 280.5, cor: '#3b82f6', icone: 'car-outline' },
        { id: '3', nome: 'Lazer', total: 180.0, cor: '#ec4899', icone: 'game-controller-outline' },
        { id: '4', nome: 'Moradia', total: 439.0, cor: '#10b981', icone: 'home-outline' },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do painel:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
    } finally {
      setLoading(false);
    }
  }

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CABEÇALHO DO PAINEL */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Painel Financeiro</Text>
            <Text style={styles.userNameText}>Visão Geral</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color="#f4f4f5" />
          </TouchableOpacity>
        </View>

        {/* CARD PRINCIPAL: SALDO DISPONÍVEL */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceValue}>{formatarMoeda(saldo)}</Text>

          <View style={styles.divider} />

          {/* FLUXO DE CAIXA: ENTRADAS X SAÍDAS */}
          <View style={styles.flowContainer}>
            <View style={styles.flowItem}>
              <View style={[styles.flowIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="arrow-down" size={16} color="#10b981" />
              </View>
              <View>
                <Text style={styles.flowLabel}>Receitas</Text>
                <Text style={styles.flowIncome}>+ {formatarMoeda(entradas)}</Text>
              </View>
            </View>

            <View style={styles.flowItem}>
              <View style={[styles.flowIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="arrow-up" size={16} color="#ef4444" />
              </View>
              <View>
                <Text style={styles.flowLabel}>Despesas</Text>
                <Text style={styles.flowExpense}>- {formatarMoeda(saidas)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={26} color="#10b981" />
            <Text style={styles.actionLabel}>Nova Receita</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]} activeOpacity={0.7}>
            <Ionicons name="remove-circle-outline" size={26} color="#ef4444" />
            <Text style={styles.actionLabel}>Nova Despesa</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO DE GASTOS POR CATEGORIA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeMoreText}>Gerenciar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          {categorias.map((cat) => (
            <View key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIconBg, { backgroundColor: cat.cor + '20' }]}>
                  <Ionicons name={cat.icone} size={20} color={cat.cor} />
                </View>
                <Text style={styles.categoryName}>{cat.nome}</Text>
              </View>
              <Text style={styles.categoryTotal}>{formatarMoeda(cat.total)}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greetingText: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  userNameText: {
    color: '#f4f4f5',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginVertical: 16,
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flowIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowLabel: {
    color: '#71717a',
    fontSize: 12,
  },
  flowIncome: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  flowExpense: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '600',
  },
  seeMoreText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryContainer: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTotal: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
});