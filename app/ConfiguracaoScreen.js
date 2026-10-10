import React, { useState, useCallback } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
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
  Keyboard,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategorias } from '../context/CategoryContext';
import api from '../Services/api';

export default function ConfiguracaoScreen() {
  const [notificacoes, setNotificacoes] = useState(true);

  // Dados do Usuário Logado
  const [usuario, setUsuario] = useState(null);

  // Modal de Edição de Perfil
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');

  // Modal de Alteração de Senha
  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Contexto Global de Categorias
  const {
    categorias,
    adicionarCategoria,
    removerCategoria,
  } = useCategorias();

  // Modal de Categorias
  const [modalCategoryVisible, setModalCategoryVisible] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // Recarrega os dados do usuário sempre que a tela entrar em foco
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

  // Salvar alteração do nome
  const handleSalvarPerfil = async () => {
    if (!nomeEdit.trim()) {
      Alert.alert('Erro', 'Digite um nome.');
      return;
    }

    if (!usuario?.id) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar o usuário.'
      );
      return;
    }

    try {
      const response = await api.put(
        `/${usuario.id}/nome`,
        {
          nome: nomeEdit.trim(),
        }
      );

      const usuarioAtualizado = {
        ...usuario,
        nome: response.data.nome || nomeEdit.trim(),
      };

      await AsyncStorage.setItem(
        '@usuario_logado',
        JSON.stringify(usuarioAtualizado)
      );

      setUsuario(usuarioAtualizado);
      setNomeEdit(usuarioAtualizado.nome);
      setModalPerfilVisible(false);

      Alert.alert(
        'Sucesso',
        'Nome atualizado com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar nome:',
        error
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível atualizar o nome.'
      );
    }
  };

  // Alterar senha
  const handleAlterarSenha = async () => {
    if (
      !senhaAtual ||
      !novaSenha ||
      !confirmarSenha
    ) {
      Alert.alert(
        'Atenção',
        'Preencha todos os campos da senha.'
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert(
        'Erro',
        'A nova senha e a confirmação não coincidem.'
      );
      return;
    }

    if (!usuario?.email) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar o e-mail do usuário.'
      );
      return;
    }

    try {
      const response = await api.put(
        '/alterar-senha',
        {
          email: usuario.email,
          senhaAtual: senhaAtual,
          novaSenha: novaSenha,
        }
      );

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setModalSenhaVisible(false);

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          'Senha alterada com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao alterar senha:',
        error
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível alterar a senha.'
      );
    }
  };

  // Adicionar Categoria
  const handleAdicionar = () => {
    if (!novaCategoria.trim()) {
      Alert.alert(
        'Atenção',
        'Digite o nome da categoria.'
      );
      return;
    }

    adicionarCategoria(novaCategoria);
    setNovaCategoria('');
    Keyboard.dismiss();
  };

  // Remover Categoria
  const handleRemover = (id, nome) => {
    Alert.alert(
      'Excluir Categoria',
      `Deseja remover a categoria "${nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removerCategoria(id),
        },
      ]
    );
  };

  // Sair do Aplicativo
  const handleSair = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja encerrar a sessão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(
              '@usuario_logado'
            );

            router.replace('/LoginScreen');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      {/* CABEÇALHO */}
      <View style={styles.headerArea}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="settings-outline"
              size={21}
              color="#162D50"
            />
          </View>

          <View>
            <Text style={styles.headerTitle}>
              Configurações
            </Text>

            <Text style={styles.headerSub}>
              Gerencie sua conta e preferências
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CARD PERFIL */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: `https://avatar.iran.liara.run/public/username?username=${
                usuario?.nome || 'User'
              }`,
            }}
            style={styles.avatar}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {usuario?.nome || 'Usuário Logado'}
            </Text>

            <Text style={styles.userEmail}>
              {usuario?.email || 'email@exemplo.com'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              setModalPerfilVisible(true)
            }
          >
            <Ionicons
              name="pencil-outline"
              size={18}
              color="#162D50"
            />
          </TouchableOpacity>
        </View>

        {/* GERENCIAMENTO */}
        <Text style={styles.sectionTitle}>
          Gerenciamento
        </Text>

        <View style={styles.optionsCard}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              setModalCategoryVisible(true)
            }
          >
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="pricetags-outline"
                  size={20}
                  color="#162D50"
                />
              </View>

              <View>
                <Text style={styles.optionText}>
                  Gerenciar Categorias
                </Text>

                <Text style={styles.optionSubtext}>
                  Organize suas despesas
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              setModalSenhaVisible(true)
            }
          >
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#162D50"
                />
              </View>

              <View>
                <Text style={styles.optionText}>
                  Redefinir Senha
                </Text>

                <Text style={styles.optionSubtext}>
                  Altere sua senha de acesso
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* PREFERÊNCIAS */}
        <Text style={styles.sectionTitle}>
          Preferências
        </Text>

        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#162D50"
                />
              </View>

              <View>
                <Text style={styles.optionText}>
                  Notificações
                </Text>

                <Text style={styles.optionSubtext}>
                  Receba avisos do aplicativo
                </Text>
              </View>
            </View>

            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{
                false: '#CBD5E1',
                true: '#10B981',
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SAIR */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSair}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#EF4444"
          />

          <Text style={styles.logoutText}>
            Sair do Aplicativo
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: EDITAR PERFIL */}
      <Modal
        visible={modalPerfilVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleArea}>
                    <View style={styles.modalIcon}>
                      <Ionicons
                        name="person-outline"
                        size={21}
                        color="#162D50"
                      />
                    </View>

                    <View>
                      <Text style={styles.modalTitle}>
                        Editar Perfil
                      </Text>

                      <Text style={styles.modalSubtitle}>
                        Atualize seus dados
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setModalPerfilVisible(false)
                    }
                    style={styles.modalCloseButton}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>
                  Nome
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#94A3B8"
                  value={nomeEdit}
                  onChangeText={setNomeEdit}
                  autoCapitalize="words"
                />

                <Text style={styles.fieldLabelEmail}>
                  E-mail
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.disabledInput,
                  ]}
                  value={usuario?.email || ''}
                  editable={false}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSalvarPerfil}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    Salvar alterações
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: CATEGORIAS */}
      <Modal
        visible={modalCategoryVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : undefined
            }
            style={styles.categoryKeyboardView}
          >
            <View style={styles.categoryModalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleArea}>
                  <View style={styles.modalIcon}>
                    <Ionicons
                      name="pricetags-outline"
                      size={21}
                      color="#162D50"
                    />
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>
                      Categorias
                    </Text>

                    <Text style={styles.modalSubtitle}>
                      Personalize suas categorias
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setModalCategoryVisible(false)
                  }
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color="#64748B"
                  />
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

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAdicionar}
                >
                  <Ionicons
                    name="add"
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* LISTA ROLÁVEL */}
              <FlatList
                data={categorias}
                keyExtractor={(item) =>
                  item.id.toString()
                }
                extraData={categorias}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                style={styles.categoryList}
                contentContainerStyle={
                  styles.categoryListContent
                }
                renderItem={({ item }) => (
                  <View style={styles.categoryItem}>
                    <View
                      style={styles.categoryItemLeft}
                    >
                      <View
                        style={
                          styles.categoryItemIcon
                        }
                      >
                        <Ionicons
                          name={
                            item.icone ||
                            'pricetag-outline'
                          }
                          size={18}
                          color="#162D50"
                        />
                      </View>

                      <Text
                        style={styles.categoryName}
                      >
                        {item.nome}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        handleRemover(
                          item.id,
                          item.nome
                        )
                      }
                      style={styles.categoryDelete}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                ItemSeparatorComponent={() => (
                  <View style={styles.divider} />
                )}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL: ALTERAR SENHA */}
      <Modal
        visible={modalSenhaVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleArea}>
                    <View style={styles.modalIcon}>
                      <Ionicons
                        name="key-outline"
                        size={21}
                        color="#162D50"
                      />
                    </View>

                    <View>
                      <Text style={styles.modalTitle}>
                        Redefinir Senha
                      </Text>

                      <Text style={styles.modalSubtitle}>
                        Altere sua senha de acesso
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setModalSenhaVisible(false)
                    }
                    style={styles.modalCloseButton}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>
                  Senha atual
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#94A3B8"
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry
                />

                <Text style={styles.fieldLabelEmail}>
                  Nova senha
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#94A3B8"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry
                />

                <Text style={styles.fieldLabelEmail}>
                  Confirmar nova senha
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Digite novamente a nova senha"
                  placeholderTextColor="#94A3B8"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAlterarSenha}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    Alterar senha
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {/* INÍCIO */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/DashboardScreen')
          }
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.tabLabelInactive}>
            Início
          </Text>
        </TouchableOpacity>

        {/* GRÁFICOS */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/GraficoScreen')
          }
        >
          <Ionicons
            name="stats-chart"
            size={21}
            color="#94A3B8"
          />

          <Text style={styles.tabLabelInactive}>
            Gráficos
          </Text>
        </TouchableOpacity>

        {/* CONFIGURAÇÃO - ATIVO */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/ConfiguracaoScreen')
          }
        >
          <View style={styles.activeIconContainer}>
            <Ionicons
              name="settings"
              size={21}
              color="#162D50"
            />
          </View>

          <Text style={styles.tabLabelActive}>
            Configuração
          </Text>

          <View style={styles.activeIndicator} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // TELA
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // CABEÇALHO
  headerArea: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#162D50',
  },

  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  // SCROLL
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  // PERFIL
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#162D50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#162D50',
  },

  userEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8EEF5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // SEÇÕES
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#162D50',
    marginBottom: 10,
    marginLeft: 2,
  },

  // CARDS DE OPÇÕES
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#162D50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#162D50',
  },

  optionSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 2,
    marginBottom: 20,
  },

  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },

  // MODAIS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 320,
  },

  // MODAL DE CATEGORIAS
  categoryKeyboardView: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },

  categoryModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '75%',
    maxHeight: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  modalIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#162D50',
  },

  modalSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#162D50',
    marginBottom: 7,
  },

  fieldLabelEmail: {
    fontSize: 12,
    fontWeight: '700',
    color: '#162D50',
    marginTop: 15,
    marginBottom: 7,
  },

  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: '#162D50',
    fontSize: 13,
  },

  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },

  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 20,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CATEGORIAS
  categoryList: {
    flex: 1,
    minHeight: 0,
  },

  categoryListContent: {
    paddingBottom: 20,
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
    flex: 1,
  },

  categoryItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  categoryName: {
    fontSize: 13,
    color: '#162D50',
    fontWeight: '700',
  },

  categoryDelete: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // TAB BAR
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 5,
    paddingTop: 5,
    shadowColor: '#162D50',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },

  activeIconContainer: {
    width: 38,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLabelInactive: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },

  tabLabelActive: {
    fontSize: 10,
    color: '#162D50',
    fontWeight: '800',
    marginTop: 4,
  },

  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 25,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});