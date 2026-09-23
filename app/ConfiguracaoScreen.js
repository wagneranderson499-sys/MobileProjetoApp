import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Image,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCategorias } from '../context/CategoryContext';

export default function ConfiguracaoScreen() {
  const [notificacoes, setNotificacoes] = useState(true);
  const [biometria, setBiometria] = useState(false);
  
  // Contexto Global de Categorias
  const { categorias, adicionarCategoria, removerCategoria } = useCategorias();
  
  // Estado para controle do Modal de Categorias
  const [modalVisible, setModalVisible] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  const handleAdicionar = () => {
    if (!novaCategoria.trim()) {
      Alert.alert('Atenção', 'Digite o nome da categoria.');
      return;
    }
    adicionarCategoria(novaCategoria);
    setNovaCategoria('');
  };

  const handleRemover = (id, nome) => {
    Alert.alert(
      'Excluir Categoria',
      `Deseja remover a categoria "${nome}"? Ela também será removida da Tela Inicial.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removerCategoria(id) }
      ]
    );
  };

  const handleSair = () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => console.log('Sessão encerrada') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#162D50" />

      {/* CABEÇALHO */}
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CARD PERFIL */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://avatar.iran.liara.run/public/boy' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>João Silva</Text>
            <Text style={styles.userEmail}>joao.silva@email.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={18} color="#162D50" />
          </TouchableOpacity>
        </View>

        {/* SEÇÃO 1: GERENCIAMENTO */}
        <Text style={styles.sectionTitle}>Gerenciamento</Text>
        <View style={styles.optionsCard}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setModalVisible(true)}>
            <View style={styles.optionLeft}>
              <Ionicons name="pricetags-outline" size={22} color="#162D50" />
              <Text style={styles.optionText}>Gerenciar Categorias</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="person-outline" size={22} color="#162D50" />
              <Text style={styles.optionText}>Dados Pessoais</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* SEÇÃO 2: PREFERÊNCIAS */}
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={22} color="#162D50" />
              <Text style={styles.optionText}>Notificações</Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="finger-print-outline" size={22} color="#162D50" />
              <Text style={styles.optionText}>Segurança / Biometria</Text>
            </View>
            <Switch
              value={biometria}
              onValueChange={setBiometria}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SAIR DO APP */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSair}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair do Aplicativo</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL DE CATEGORIAS */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categorias Personalizadas</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* INPUT DE ADICIONAR */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nova categoria..."
                placeholderTextColor="#94A3B8"
                value={novaCategoria}
                onChangeText={setNovaCategoria}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAdicionar}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* LISTA DE CATEGORIAS */}
            <FlatList
              data={categorias}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.categoryItem}>
                  <View style={styles.categoryItemLeft}>
                    <Ionicons name={item.icone || 'pricetag-outline'} size={20} color="#162D50" />
                    <Text style={styles.categoryName}>{item.nome}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemover(item.id, item.nome)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              style={{ maxHeight: 300 }}
            />
          </View>
        </View>
      </Modal>

      {/* TAB BAR PADRONIZADA */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/DashboardScreen')}
        >
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={styles.tabLabelInactive}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/GraficoScreen')}
        >
          <Ionicons name="stats-chart" size={22} color="#94A3B8" />
          <Text style={styles.tabLabelInactive}>Gráficos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          activeOpacity={0.7}
          onPress={() => router.push('/ConfiguracaoScreen')}
        >
          <Ionicons name="settings" size={22} color="#10B981" />
          <Text style={styles.tabLabelActive}>Ajustes</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#162D50', // Fundo Geral Azul
  },
  headerArea: {
    backgroundColor: '#162D50',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Card Branco
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF', // Título em Branco
    marginBottom: 10,
    marginLeft: 4,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF', // Card Branco
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* MODAL CATEGORIAS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: '#0F172A',
  },
  addButton: {
    width: 46,
    height: 46,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryName: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },

  /* TAB BAR */
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabelInactive: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 3,
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});