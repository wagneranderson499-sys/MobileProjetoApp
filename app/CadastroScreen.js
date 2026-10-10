import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

// IP IPv4 local da sua máquina
const API_BASE_URL =
  'http://172.20.10.2:8080/api/usuarios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function CadastroScreen() {
  const router = useRouter();

  // ==============================
  // ESTADOS DO FORMULÁRIO
  // ==============================

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // ==============================
  // MODAL DE REDEFINIR SENHA
  // ==============================

  const [modalEsqueciSenha, setModalEsqueciSenha] =
    useState(false);

  const [emailEsqueci, setEmailEsqueci] =
    useState('');

  const [novaSenha, setNovaSenha] =
    useState('');

  // ==============================
  // CADASTRAR USUÁRIO
  // ==============================

  const handleCadastrar = async () => {
    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Preencha todos os campos!'
      );
      return;
    }

    setCarregando(true);
    Keyboard.dismiss();

    try {
      const response = await api.post('/register', {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha,
      });

      setCarregando(false);

      const dadosUsuario = response.data;

      Alert.alert(
        'Sucesso',
        dadosUsuario?.message ||
          'Conta criada com sucesso!',
        [
          {
            text: 'Acessar Painel',
            onPress: () => {
              router.replace({
                pathname: '/DashboardScreen',
                params: {
                  usuario: JSON.stringify({
                    id: dadosUsuario.id,
                    nome:
                      dadosUsuario.nome ||
                      nome.trim(),
                    email:
                      dadosUsuario.email ||
                      email.trim(),
                    saldo:
                      dadosUsuario.saldo ?? 0.0,
                  }),
                },
              });
            },
          },
        ]
      );
    } catch (error) {
      setCarregando(false);

      console.error(
        'Erro no cadastro:',
        error
      );

      if (error.response) {
        Alert.alert(
          'Erro',
          error.response.data?.message ||
            'Falha ao realizar cadastro.'
        );
      } else if (
        error.code === 'ECONNABORTED'
      ) {
        Alert.alert(
          'Tempo Esgotado',
          'O servidor demorou para responder. Verifique sua conexão.'
        );
      } else {
        Alert.alert(
          'Erro de Conexão',
          `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique se o dispositivo está no mesmo Wi-Fi que o seu computador.`
        );
      }
    }
  };

  // ==============================
  // REDEFINIR SENHA
  // ==============================

  const handleRedefinirSenha = async () => {
    if (
      !emailEsqueci.trim() ||
      !novaSenha.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Informe o e-mail e a nova senha.'
      );
      return;
    }

    setCarregando(true);
    Keyboard.dismiss();

    try {
      const response = await api.post(
        '/redefinir-senha',
        {
          email: emailEsqueci
            .trim()
            .toLowerCase(),
          novaSenha: novaSenha,
        }
      );

      setCarregando(false);
      setModalEsqueciSenha(false);

      setEmailEsqueci('');
      setNovaSenha('');

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          'Senha redefinida com sucesso!'
      );
    } catch (error) {
      setCarregando(false);

      const msg =
        error.response?.data?.message ||
        'Erro ao redefinir senha.';

      Alert.alert('Erro', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ==============================
                BOTÃO VOLTAR
            ============================== */}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Feather
                name="arrow-left"
                size={20}
                color="#162D50"
              />

              <Text style={styles.backButtonText}>
                Voltar
              </Text>
            </TouchableOpacity>

            {/* ==============================
                CARD DE CADASTRO
            ============================== */}

            <View style={styles.card}>
              {/* Ícone */}

              <View style={styles.iconContainer}>
                <Feather
                  name="user-plus"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.title}>
                Criar sua conta
              </Text>

              <Text style={styles.subtitle}>
                Comece a organizar suas finanças
                de forma simples e inteligente.
              </Text>

              {/* ==============================
                  NOME
              ============================== */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nome completo
                </Text>

                <View style={styles.inputContainer}>
                  <Feather
                    name="user"
                    size={19}
                    color="#64748B"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome"
                    placeholderTextColor="#94A3B8"
                    value={nome}
                    onChangeText={setNome}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* ==============================
                  EMAIL
              ============================== */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  E-mail
                </Text>

                <View style={styles.inputContainer}>
                  <Feather
                    name="mail"
                    size={19}
                    color="#64748B"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu e-mail"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* ==============================
                  SENHA
              ============================== */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Senha
                </Text>

                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={19}
                    color="#64748B"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Crie uma senha"
                    placeholderTextColor="#94A3B8"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={
                      Keyboard.dismiss
                    }
                  />
                </View>
              </View>

              {/* ==============================
                  BOTÃO CADASTRAR
              ============================== */}

              <TouchableOpacity
                style={styles.button}
                onPress={handleCadastrar}
                disabled={carregando}
                activeOpacity={0.85}
              >
                {carregando ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      Criar conta
                    </Text>

                    <Feather
                      name="arrow-right"
                      size={19}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* ==============================
                  JÁ TEM CONTA
              ============================== */}

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Já possui uma conta?
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push('/LoginScreen')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginHighlight}>
                    Entrar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ==============================
                  ESQUECEU SENHA
              ============================== */}

              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() =>
                  setModalEsqueciSenha(true)
                }
                activeOpacity={0.7}
              >
                <Feather
                  name="help-circle"
                  size={15}
                  color="#2563EB"
                />

                <Text style={styles.forgotText}>
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              FinanceControl • Gestão financeira
              simples e inteligente
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* =========================================
          MODAL: REDEFINIR SENHA
      ========================================== */}

      <Modal
        visible={modalEsqueciSenha}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalEsqueciSenha(false)
        }
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>

              {/* Cabeçalho */}

              <View style={styles.modalHeader}>
                <View
                  style={styles.modalIcon}
                >
                  <Feather
                    name="lock"
                    size={20}
                    color="#FFFFFF"
                  />
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setModalEsqueciSenha(false)
                  }
                >
                  <Feather
                    name="x"
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>
                Redefinir senha
              </Text>

              <Text style={styles.modalSubtitle}>
                Informe seu e-mail cadastrado e
                escolha uma nova senha.
              </Text>

              {/* E-mail */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  E-mail
                </Text>

                <View
                  style={styles.inputContainer}
                >
                  <Feather
                    name="mail"
                    size={19}
                    color="#64748B"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu e-mail"
                    placeholderTextColor="#94A3B8"
                    value={emailEsqueci}
                    onChangeText={
                      setEmailEsqueci
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Nova senha */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nova senha
                </Text>

                <View
                  style={styles.inputContainer}
                >
                  <Feather
                    name="lock"
                    size={19}
                    color="#64748B"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Digite sua nova senha"
                    placeholderTextColor="#94A3B8"
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Atualizar */}

              <TouchableOpacity
                style={styles.button}
                onPress={handleRedefinirSenha}
                disabled={carregando}
                activeOpacity={0.85}
              >
                {carregando ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text
                      style={styles.buttonText}
                    >
                      Atualizar senha
                    </Text>

                    <Feather
                      name="check-circle"
                      size={19}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Fechar */}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setModalEsqueciSenha(false)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={styles.cancelButtonText}
                >
                  Fechar
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ==============================
  // TELA
  // ==============================

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scroll: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ==============================
  // VOLTAR
  // ==============================

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 22,
  },

  backButtonText: {
    color: '#162D50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 7,
  },

  // ==============================
  // CARD
  // ==============================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  // ==============================
  // ÍCONE
  // ==============================

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#162D50',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },

  // ==============================
  // TÍTULOS
  // ==============================

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#162D50',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },

  // ==============================
  // INPUTS
  // ==============================

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    color: '#162D50',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },

  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#162D50',
    fontSize: 14,
    marginLeft: 10,
  },

  // ==============================
  // BOTÃO
  // ==============================

  button: {
    height: 54,
    backgroundColor: '#10B981',
    borderRadius: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,

    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginRight: 9,
  },

  // ==============================
  // LOGIN
  // ==============================

  loginContainer: {
    alignItems: 'center',
    marginTop: 24,
  },

  loginText: {
    color: '#64748B',
    fontSize: 13,
  },

  loginHighlight: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },

  // ==============================
  // ESQUECEU SENHA
  // ==============================

  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },

  forgotText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  // ==============================
  // RODAPÉ
  // ==============================

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
    lineHeight: 17,
  },

  // ==============================
  // MODAL
  // ==============================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#162D50',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#162D50',
    marginBottom: 7,
  },

  modalSubtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 22,
  },

  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});