import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCategorias } from '../context/CategoryContext';

export default function GraficosScreen() {
  const router = useRouter();

  // Controle de Mês
  const [mesSelecionado, setMesSelecionado] = useState('Setembro');
  const meses = ['Julho', 'Agosto', 'Setembro'];

  // Transações com os dados atuais
  const [transacoes] = useState([
    { id: '1', titulo: 'Supermercado', valor: 250.50, tipo: 'DESPESA', categoria: 'Alimentação', data: '21/09/2026' },
    { id: '2', titulo: 'Restaurante', valor: 120.00, tipo: 'DESPESA', categoria: 'Alimentação', data: '22/09/2026' },
    { id: '3', titulo: 'Uber / Combustível', valor: 180.00, tipo: 'DESPESA', categoria: 'Transporte', data: '18/09/2026' },
    { id: '4', titulo: 'Cinema & Lazer', valor: 85.00, tipo: 'DESPESA', categoria: 'Lazer', data: '15/09/2026' },
    { id: '5', titulo: 'Conta de Luz', valor: 140.00, tipo: 'DESPESA', categoria: 'Contas', data: '10/09/2026' },
  ]);

  const definicaoCategorias = [
    { nome: 'Alimentação', icone: 'restaurant-outline', cor: '#EF4444' },
    { nome: 'Transporte', icone: 'car-outline', cor: '#3B82F6' },
    { nome: 'Contas', icone: 'receipt-outline', cor: '#F59E0B' },
    { nome: 'Lazer', icone: 'game-controller-outline', cor: '#8B5CF6' },
    { nome: 'Outros', icone: 'grid-outline', cor: '#64748B' },
  ];

  // Filtros e Cálculos
  const apenasDespesas = transacoes.filter(t => t.tipo === 'DESPESA');
  const totalDespesasGeral = apenasDespesas.reduce((acc, curr) => acc + curr.valor, 0);

  const categoriasCalculadas = definicaoCategorias.map(cat => {
    const totalCategoria = apenasDespesas
      .filter(t => t.categoria === cat.nome)
      .reduce((acc, curr) => acc + curr.valor, 0);

    const porcentagem = totalDespesasGeral > 0 
      ? Math.round((totalCategoria / totalDespesasGeral) * 100) 
      : 0;

    return {
      ...cat,
      total: totalCategoria,
      porcentagem,
    };
  }).filter(c => c.total > 0); // Exibe apenas categorias com gastos

  const formatarMoeda = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#162D50" />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Análise Visual</Text>
          <Text style={styles.headerSub}>Distribuição do seu orçamento</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* SELETOR DE MÊS */}
        <View style={styles.monthSelectorContainer}>
          {meses.map((mes) => (
            <TouchableOpacity
              key={mes}
              style={[
                styles.monthChip,
                mesSelecionado === mes && styles.monthChipActive
              ]}
              onPress={() => setMesSelecionado(mes)}
            >
              <Text style={[
                styles.monthText,
                mesSelecionado === mes && styles.monthTextActive
              ]}>
                {mes}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CARD BRANCO - GRÁFICO CIRCULAR/DONUT */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardLabel}>Gastos por Categoria</Text>
          <Text style={styles.totalAmount}>{formatarMoeda(totalDespesasGeral)}</Text>

          {/* VISUAL DO GRÁFICO CIRCULAR COM MIOLO (DONUT) */}
          <View style={styles.donutWrapper}>
            <View style={styles.donutOuterCircle}>
              {/* Anel Externo representando o gráfico em fatias */}
              <View style={styles.donutInnerCircle}>
                <Text style={styles.donutCenterValue}>{formatarMoeda(totalDespesasGeral)}</Text>
                <Text style={styles.donutCenterLabel}>Total Gasto</Text>
              </View>
            </View>
          </View>

          {/* LEGENDA DAS CORES */}
          <View style={styles.legendContainer}>
            {categoriasCalculadas.map((item) => (
              <View key={item.nome} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.cor }]} />
                <Text style={styles.legendText}>{item.nome}</Text>
                <Text style={styles.legendPercent}>{item.porcentagem}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* INFOGRÁFICO DE DETALHAMENTO */}
        <Text style={styles.sectionTitle}>Infográfico de Despesas</Text>

        <View style={styles.infographicContainer}>
          {categoriasCalculadas.map((cat) => {
            const itensCategoria = apenasDespesas.filter(t => t.categoria === cat.nome);

            return (
              <View key={cat.nome} style={styles.infographicCard}>
                {/* Cabeçalho da Categoria no Infográfico */}
                <View style={styles.infoCardHeader}>
                  <View style={styles.infoCardHeaderLeft}>
                    <View style={[styles.infoIconBg, { backgroundColor: cat.cor }]}>
                      <Ionicons name={cat.icone} size={18} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.infoCategoryName}>{cat.nome}</Text>
                      <Text style={styles.infoCategoryCount}>{itensCategoria.length} lançamento(s)</Text>
                    </View>
                  </View>
                  <View style={styles.infoCardHeaderRight}>
                    <Text style={styles.infoCategoryTotal}>{formatarMoeda(cat.total)}</Text>
                    <View style={[styles.infoBadge, { backgroundColor: `${cat.cor}15` }]}>
                      <Text style={[styles.infoBadgeText, { color: cat.cor }]}>{cat.porcentagem}%</Text>
                    </View>
                  </View>
                </View>

                {/* Barra Estilizada de Progresso Infográfico */}
                <View style={styles.infoBarBackground}>
                  <View 
                    style={[
                      styles.infoBarFill, 
                      { width: `${cat.porcentagem}%`, backgroundColor: cat.cor }
                    ]} 
                  />
                </View>

                {/* Lista de Itens que compõem esta Categoria */}
                <View style={styles.infoItemsList}>
                  {itensCategoria.map((item, idx) => (
                    <View key={item.id} style={styles.infoItemRow}>
                      <View style={styles.infoItemBullet}>
                        <View style={[styles.bulletDot, { backgroundColor: cat.cor }]} />
                        <Text style={styles.infoItemTitle}>{item.titulo}</Text>
                      </View>
                      <Text style={styles.infoItemValue}>{formatarMoeda(item.valor)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* TAB BAR INFERIOR */}
{/* TAB BAR INFERIOR */}
      <View style={styles.tabBar}>
        {/* Aba Início */}
        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/DashboardScreen')}
        >
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={styles.tabLabelInactive}>Início</Text>
        </TouchableOpacity>

        {/* Aba Relatórios */}
        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/GraficosScreen')}
        >
          <Ionicons name="stats-chart" size={22} color="#10B981" />
          <Text style={styles.tabLabelActive}>Gráficos</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        {/* Aba Ajustes */}
        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/ConfiguracaoScreen')}
        >
          <Ionicons name="settings-outline" size={22} color="#94A3B8" />
          <Text style={styles.tabLabelInactive}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#162D50',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 90,
  },

  /* SELETOR DE MÊS */
  monthSelectorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  monthChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  monthChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  monthText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  monthTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  /* CARD BRANCO */
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },

  /* GRÁFICO CIRCULAR / DONUT */
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  donutOuterCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 16,
    borderColor: '#3B82F6', // Cor base do anel
    borderTopColor: '#EF4444',
    borderRightColor: '#F59E0B',
    borderBottomColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  donutCenterValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  donutCenterLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },

  /* LEGENDA DE CORES */
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  /* INFOGRÁFICO DE CATEGORIAS */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  infographicContainer: {
    gap: 14,
  },
  infographicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCategoryName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  infoCategoryCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  infoCardHeaderRight: {
    alignItems: 'flex-end',
  },
  infoCategoryTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginVertical: 12,
    overflow: 'hidden',
  },
  infoBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  infoItemsList: {
    gap: 6,
    paddingTop: 4,
  },
  infoItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItemBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  infoItemTitle: {
    fontSize: 13,
    color: '#64748B',
  },
  infoItemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },

  /* TAB BAR */
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabelInactive: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});