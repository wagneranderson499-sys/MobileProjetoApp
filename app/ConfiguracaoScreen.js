import React, { useState, useCallback } from 'react';
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
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategorias } from '../context/CategoryContext';

export default function ConfiguracaoScreen() {
  const [notificacoes, setNotificacoes] = useState(true);

  // Dados do Usuário Logado
  const [usuario, setUsuario] = useState(null);

  // Modais de Edição de Perfil e Alteração de Senha
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');

  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Contexto Global de Categorias
  const { categorias, adicionarCategoria, removerCategoria } = useCategorias();
  
  // Modal de Categorias
  const [modalCategoryVisible, setModalCategoryVisible] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // Recarrega os dados do usuário sempre que a tela de Ajustes entrar em foco
  useFocusEffect(
    useCallback(() => {
      async function carregarUsuario() {
        try {
          const userJson = await AsyncStorage.getItem('@usuario_logado');
          if (userJson) {
            const user = JSON.parse(userJson);
            setUsuario(user);
            setNomeEdit(user.nome || '');
            setEmailEdit(user.email || '');
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
        }
      }
      carregarUsuario();
    }, [])
  );

  // Salvar alterações de Nome e E-mail do Usuário
  const handleSalvarPerfil = async () => {
    if (!nomeEdit.trim() || !emailEdit.trim()) {
      Alert.alert('Erro', 'Por favor, preencha nome e e-mail.');
      return;
    }

    try {
      const usuarioAtualizado = { ...usuario, nome: nomeEdit, email: emailEdit };
      await AsyncStorage.setItem('@usuario_logado', JSON.stringify(usuarioAtualizado));
      setUsuario(usuarioAtualizado);
      setModalPerfilVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  // Alterar Senha com Validação
  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos da senha.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    if (usuario?.senha && senhaAtual !== usuario.senha) {
      Alert.alert('Erro', 'A senha atual está incorreta.');
      return;
    }

    try {
      const usuarioAtualizado = { ...usuario, senha: novaSenha };
      await AsyncStorage.setItem('@usuario_logado', JSON.stringify(usuarioAtualizado));
      setUsuario(usuarioAtualizado);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setModalSenhaVisible(false);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
    }
  };

  // Gerenciamento de Categorias
  const handleAdicionar = () => {
    if (!novaCategoria.trim()) {
      Alert.alert('Atenção', 'Digite o nome da categoria.');
      return;
    }
    adicionarCategoria(novaCategoria);
    setNovaCategoria('');
    Keyboard.dismiss();
  };

  const handleRemover = (id, nome) => {
    Alert.alert(
      'Excluir Categoria',
      `Deseja remover a categoria "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removerCategoria(id) }
      ]
    );
  };

  // Sair do Aplicativo
  const handleSair = () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => {
          await AsyncStorage.removeItem('@usuario_logado');
          router.replace('/LoginScreen');
        } 
      },
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
        
        {/* CARD PERFIL DINÂMICO */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: `https://avatar.iran.liara.run/public/username?username=${usuario?.nome || 'User'}` }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{usuario?.nome || 'Usuário Logado'}</Text>
            <Text style={styles.userEmail}>{usuario?.email || 'email@exemplo.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setModalPerfilVisible(true)}>
            <Ionicons name="pencil" size={18} color="#162D50" />
          </TouchableOpacity>
        </View>

        {/* SEÇÃO 1: GERENCIAMENTO */}
        <Text style={styles.sectionTitle}>Gerenciamento</Text>
        <View style={styles.optionsCard}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setModalCategoryVisible(true)}>
            <View style={styles.optionLeft}>
              <Ionicons name="pricetags-outline" size={22} color="#162D50" />
              <Text style={styles.optionText}>Gerenciar Categorias</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow} onPress={() => setModalSenhaVisible(true)}>
            <View style={styles.optionLeft}>
              <Ionicons name="key-outline" size={22} color="#162D50" />
              <Text style={styles.optionText}>Redefinir Senha</Text>
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
        </View>

        {/* SAIR DO APP */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSair}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair do Aplicativo</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL: CATEGORIAS (TRATADO CONTRA O TECLADO) */}
      <Modal visible={modalCategoryVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%' }}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Categorias Personalizadas</Text>
                  <TouchableOpacity onPress={() => setModalCategoryVisible(false)}>
                    <Ionicons name="close" size={24} color="#0F172A" />
                  </TouchableOpacity>
                </View>

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

                <FlatList
                  data={categorias}
                  keyExtractor={(item) => item.id.toString()}
                  extraData={categorias} // Garante a re-renderização imediata ao mudar o array
                  keyboardShouldPersistTaps="handled"
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
                  style={{ maxHeight: 250 }}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* TAB BAR PADRONIZADA */}
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
    <Ionicons name="stats-chart-outline" size={22} color="#94A3B8" />
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
    backgroundColor: '#162D50',
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
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF',
    marginBottom: 10,
    marginLeft: 4,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
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

  /* MODAIS */
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
    minHeight: 320,
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

  /* TAB BAR PADRONIZADA (AZUL ESCURO) */
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#0F172A', // Cor alterada de #FFFFFF para o azul escuro
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)', // Borda sutil para fundo escuro
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
    color: '#94A3B8', // Cinza claro para itens inativos
    marginTop: 3,
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#10B981', // Verde de destaque para a aba ativa
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