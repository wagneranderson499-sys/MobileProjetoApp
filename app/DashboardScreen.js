import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { nome, saldo: saldoInicial } = useLocalSearchParams();

  // Estados dos Dados Financeiros
  const [transacoes, setTransacoes] = useState([
    { id: '1', titulo: 'Salário', valor: 3500.00, tipo: 'RECEITA', categoria: 'Renda', data: '20/09/2026' },
    { id: '2', titulo: 'Supermercado', valor: 250.50, tipo: 'DESPESA', categoria: 'Alimentação', data: '21/09/2026' },
    { id: '3', titulo: 'Assinatura Stream', valor: 39.90, tipo: 'DESPESA', categoria: 'Lazer', data: '22/09/2026' },
  ]);

  // Modal e Formulário
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState('RECEITA'); // 'RECEITA' ou 'DESPESA'
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Alimentação');

  const categoriasDisponiveis = ['Alimentação', 'Transporte', 'Lazer', 'Contas', 'Outros'];

  // Cálculos Automáticos de Finanças
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'RECEITA')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'DESPESA')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoAtual = Number(saldoInicial || 0) + totalReceitas - totalDespesas;

  const formatarMoeda = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Abrir Modal
  const abrirModal = (tipo) => {
    setTipoTransacao(tipo);
    setDescricao('');
    setValor('');
    setCategoria('Alimentação');
    setModalVisivel(true);
  };

  // Salvar Nova Transação
  const handleSalvarTransacao = () => {
    const valorNumerico = parseFloat(valor.replace(',', '.'));

    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Informe a descrição da transação.');
      return;
    }

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido maior que zero.');
      return;
    }

    const hoje = new Date();
    const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;

    const novaTransacao = {
      id: Date.now().toString(),
      titulo: descricao.trim(),
      valor: valorNumerico,
      tipo: tipoTransacao,
      categoria: tipoTransacao === 'DESPESA' ? categoria : 'Receita',
      data: dataFormatada,
    };

    setTransacoes([novaTransacao, ...transacoes]);
    setModalVisivel(false);
  };

  // Excluir Transação
  const handleExcluirTransacao = (id) => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza que deseja remover este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: () => {
            setTransacoes(transacoes.filter(t => t.id !== id));
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#162D50" />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Bem-vindo de volta,</Text>
          <Text style={styles.userNameText}>{nome || 'Usuário'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#fffdfd" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* CARD PRINCIPAL EM BRANCO - SALDO TOTAL */}
        <View style={styles.whiteCard}>
          <Text style={styles.mainCardLabel}>Saldo Total</Text>
          <Text style={styles.mainCardBalance}>{formatarMoeda(saldoAtual)}</Text>

          <View style={styles.divider} />

          {/* RESUMO ENTRADAS E SAÍDAS */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <View style={[styles.arrowIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Feather name="arrow-up-right" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Receitas</Text>
                <Text style={styles.summaryIncome}>{formatarMoeda(totalReceitas)}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.arrowIconBg, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="arrow-down-left" size={18} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={styles.summaryOutcome}>{formatarMoeda(totalDespesas)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BOTOES DE AÇÃO RÁPIDA (RECEITA E DESPESA) */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={styles.whiteActionButton} 
            activeOpacity={0.8}
            onPress={() => abrirModal('RECEITA')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#10B981' }]}>
              <Feather name="plus" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Nova Receita</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.whiteActionButton} 
            activeOpacity={0.8}
            onPress={() => abrirModal('DESPESA')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#EF4444' }]}>
              <Feather name="minus" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Nova Despesa</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE ÚLTIMAS TRANSAÇÕES EM CARD BRANCO */}
        <Text style={styles.sectionTitle}>Últimas Transações</Text>

        <View style={styles.whiteCardTransactions}>
          {transacoes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma transação cadastrada.</Text>
          ) : (
            transacoes.map((item, index) => (
              <View key={item.id}>
                <View style={styles.transactionRow}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIconBg, 
                      { backgroundColor: item.tipo === 'RECEITA' ? '#ECFDF5' : '#FEF2F2' }
                    ]}>
                      <Ionicons 
                        name={item.tipo === 'RECEITA' ? 'arrow-down' : 'arrow-up'} 
                        size={18} 
                        color={item.tipo === 'RECEITA' ? '#10B981' : '#EF4444'} 
                      />
                    </View>
                    <View>
                      <Text style={styles.transactionTitle}>{item.titulo}</Text>
                      <Text style={styles.transactionSub}>{item.categoria} • {item.data}</Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount, 
                      { color: item.tipo === 'RECEITA' ? '#10B981' : '#EF4444' }
                    ]}>
                      {item.tipo === 'RECEITA' ? `+ ${formatarMoeda(item.valor)}` : `- ${formatarMoeda(item.valor)}`}
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => handleExcluirTransacao(item.id)}
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
                {index < transacoes.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* MODAL ADICIONAR RECEITA / DESPESA */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {tipoTransacao === 'RECEITA' ? 'Adicionar Receita' : 'Adicionar Despesa'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Nome / Descrição */}
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={tipoTransacao === 'RECEITA' ? "Ex: Salário, Freelance..." : "Ex: Supermercado, Conta de Luz..."}
              placeholderTextColor="#94A3B8"
              value={descricao}
              onChangeText={setDescricao}
            />

            {/* Valor */}
            <Text style={styles.inputLabel}>Valor (R$)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0,00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            {/* Categoria (Apenas para Despesa) */}
            {tipoTransacao === 'DESPESA' && (
              <>
                <Text style={styles.inputLabel}>Categoria</Text>
                <View style={styles.categoryContainer}>
                  {categoriasDisponiveis.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        categoria === cat && styles.categoryChipSelected
                      ]}
                      onPress={() => setCategoria(cat)}
                    >
                      <Text style={[
                        styles.categoryText,
                        categoria === cat && styles.categoryTextSelected
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Botão de Salvar */}
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { backgroundColor: tipoTransacao === 'RECEITA' ? '#10B981' : '#EF4444' }
              ]} 
              onPress={handleSalvarTransacao}
            >
              <Text style={styles.saveButtonText}>Salvar {tipoTransacao === 'RECEITA' ? 'Receita' : 'Despesa'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TAB BAR INFERIOR */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="home" size={22} color="#10B981" />
          <Text style={styles.tabLabelActive}>Início</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/GraficoScreen')}
        >
          <Ionicons name="stats-chart-outline" size={22} color="#94A3B8" />
          <Text style={styles.tabLabelInactive}>Gráfico</Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  greetingText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 90,
  },

  /* CARDS BRANCOS */
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainCardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  mainCardBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arrowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryIncome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  summaryOutcome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },

  /* AÇÕES RÁPIDAS BRANCAS */
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  whiteActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  /* LISTA TRANSAÇÕES BRANCA */
  whiteCardTransactions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  transactionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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