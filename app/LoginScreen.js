import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../Services/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// COMPONENTE DE CAMPO
// IMPORTANTE: fica fora de LoginScreen para não perder
// o foco do TextInput quando o estado é atualizado.
// =====================================================

function CampoIcone({
  icone,
  valor,
  aoMudar,
  placeholder,
  senhaSegura = false,
  tipoTeclado = 'default',
  autoFocus = false,
  maxLength,
}) {
  return (
    <View style={styles.inputContainer}>
      <Feather
        name={icone}
        size={19}
        color="#64748B"
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={valor}
        onChangeText={aoMudar}
        secureTextEntry={senhaSegura}
        keyboardType={tipoTeclado}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={maxLength}
        returnKeyType="done"
      />
    </View>
  );
}

// =====================================================
// TELA DE LOGIN
// =====================================================

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados da recuperação de senha
  const [modalVisible, setModalVisible] = useState(false);
  const [etapaRecuperacao, setEtapaRecuperacao] = useState(1);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [codigoRecuperacao, setCodigoRecuperacao] = useState('');
  const [novaSenhaRecuperacao, setNovaSenhaRecuperacao] =
    useState('');
  const [confirmarSenhaRecuperacao, setConfirmarSenhaRecuperacao] =
    useState('');
  const [loadingRecuperacao, setLoadingRecuperacao] =
    useState(false);

  const router = useRouter();

  // ===================================================
  // LOGIN
  // ===================================================

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha o e-mail e a senha.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        senha,
      });

      const usuarioLogado = response.data;

      await AsyncStorage.setItem(
        '@usuario_logado',
        JSON.stringify(usuarioLogado)
      );

      Alert.alert(
        'Sucesso!',
        `Bem-vindo(a), ${usuarioLogado.nome || 'de volta'}!`,
        [
          {
            text: 'OK',
            onPress: () =>
              router.push({
                pathname: '/DashboardScreen',
                params: {
                  usuario: JSON.stringify(usuarioLogado),
                },
              }),
          },
        ]
      );
    } catch (error) {
      console.error('Erro de Login:', error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 404
      ) {
        Alert.alert(
          'Erro no Login',
          'E-mail ou senha incorretos.'
        );
      } else {
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor em http://172.20.10.2:8080. Verifique se o backend está rodando e se o celular está no mesmo Wi-Fi.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // ETAPA 1 — ENVIAR CÓDIGO DE RECUPERAÇÃO
  // ===================================================

  async function handleEnviarCodigo() {
    if (!emailRecuperacao.trim()) {
      Alert.alert(
        'Atenção',
        'Informe o seu e-mail para recuperar a senha.'
      );
      return;
    }

    setLoadingRecuperacao(true);

    try {
      const response = await api.post('/esqueci-senha', {
        email: emailRecuperacao.trim(),
      });

      Alert.alert(
        'Código enviado!',
        response.data?.mensagem ||
          response.data?.message ||
          'Verifique seu e-mail para encontrar o código de recuperação.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEtapaRecuperacao(2);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao enviar código:', error);

      Alert.alert(
        'Erro',
        error.response?.data?.mensagem ||
          error.response?.data?.message ||
          'Não foi possível enviar o código. Tente novamente.'
      );
    } finally {
      setLoadingRecuperacao(false);
    }
  }

  // ===================================================
  // ETAPA 2 — VALIDAR CÓDIGO
  // ===================================================

  async function handleValidarCodigo() {
    const codigo = codigoRecuperacao.trim();

    if (!codigo) {
      Alert.alert(
        'Atenção',
        'Digite o código recebido por e-mail.'
      );
      return;
    }

    if (codigo.length !== 6) {
      Alert.alert(
        'Atenção',
        'O código deve ter 6 dígitos.'
      );
      return;
    }

    setLoadingRecuperacao(true);

    try {
      const response = await api.post(
        '/validar-codigo-redefinicao',
        {
          email: emailRecuperacao.trim(),
          codigo,
        }
      );

      Alert.alert(
        'Código válido!',
        response.data?.mensagem ||
          response.data?.message ||
          'Código validado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEtapaRecuperacao(3);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao validar código:', error);

      Alert.alert(
        'Código inválido',
        error.response?.data?.mensagem ||
          error.response?.data?.message ||
          'O código é inválido ou expirou.'
      );
    } finally {
      setLoadingRecuperacao(false);
    }
  }

  // ===================================================
  // ETAPA 3 — REDEFINIR SENHA
  // ===================================================

  async function handleRedefinirSenha() {
    if (!novaSenhaRecuperacao) {
      Alert.alert(
        'Atenção',
        'Digite uma nova senha.'
      );
      return;
    }

    if (novaSenhaRecuperacao.length < 8) {
      Alert.alert(
        'Atenção',
        'A senha deve ter pelo menos 8 caracteres.'
      );
      return;
    }

    if (!confirmarSenhaRecuperacao) {
      Alert.alert(
        'Atenção',
        'Confirme sua nova senha.'
      );
      return;
    }

    if (
      novaSenhaRecuperacao !== confirmarSenhaRecuperacao
    ) {
      Alert.alert(
        'Erro',
        'As senhas não coincidem.'
      );
      return;
    }

    setLoadingRecuperacao(true);

    try {
      const response = await api.post(
        '/redefinir-senha',
        {
          email: emailRecuperacao.trim(),
          codigo: codigoRecuperacao.trim(),
          novaSenha: novaSenhaRecuperacao,
        }
      );

      Alert.alert(
        'Sucesso!',
        response.data?.mensagem ||
          response.data?.message ||
          'Senha redefinida com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              fecharModalRecuperacao();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);

      Alert.alert(
        'Erro',
        error.response?.data?.mensagem ||
          error.response?.data?.message ||
          'Não foi possível redefinir a senha.'
      );
    } finally {
      setLoadingRecuperacao(false);
    }
  }

  // ===================================================
  // FECHAR E RESETAR RECUPERAÇÃO
  // ===================================================

  function fecharModalRecuperacao() {
    setModalVisible(false);
    setEtapaRecuperacao(1);
    setEmailRecuperacao('');
    setCodigoRecuperacao('');
    setNovaSenhaRecuperacao('');
    setConfirmarSenhaRecuperacao('');
    setLoadingRecuperacao(false);
  }

  // ===================================================
  // VOLTAR UMA ETAPA
  // ===================================================

  function voltarEtapaRecuperacao() {
    if (etapaRecuperacao === 2) {
      setCodigoRecuperacao('');
      setEtapaRecuperacao(1);
      return;
    }

    if (etapaRecuperacao === 3) {
      setNovaSenhaRecuperacao('');
      setConfirmarSenhaRecuperacao('');
      setEtapaRecuperacao(2);
    }
  }

  // ===================================================
  // INTERFACE
  // ===================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === 'ios' ? 'interactive' : 'none'
        }
      >
        {/* Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/HomeScreen')}
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

        {/* Card de login */}
        <View style={styles.loginCard}>
          <View style={styles.loginIcon}>
            <Feather
              name="lock"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.title}>
            Bem-vindo de volta!
          </Text>

          <Text style={styles.subtitle}>
            Acesse sua conta para continuar controlando
            suas finanças.
          </Text>

          {/* E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              E-mail
            </Text>

            <CampoIcone
              icone="mail"
              placeholder="Digite seu e-mail"
              valor={email}
              aoMudar={setEmail}
              tipoTeclado="email-address"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Senha
            </Text>

            <CampoIcone
              icone="lock"
              placeholder="Digite sua senha"
              valor={senha}
              aoMudar={setSenha}
              senhaSegura
            />
          </View>

          {/* Esqueceu senha */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => {
              setEtapaRecuperacao(1);
              setEmailRecuperacao(email);
              setCodigoRecuperacao('');
              setNovaSenhaRecuperacao('');
              setConfirmarSenhaRecuperacao('');
              setModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          {/* Entrar */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  Entrar
                </Text>

                <Feather
                  name="arrow-right"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>
              ou
            </Text>

            <View style={styles.divider} />
          </View>

          {/* Cadastro */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/CadastroScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerText}>
              Ainda não tem uma conta?
            </Text>

            <Text style={styles.registerHighlight}>
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          FinanceControl • Gestão financeira simples e
          inteligente
        </Text>
      </ScrollView>

      {/* =================================================
          MODAL DE RECUPERAÇÃO DE SENHA
      ================================================= */}

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={fecharModalRecuperacao}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'none'
              }
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.modalContainer}>
                {/* Cabeçalho */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.modalBackButton}
                    onPress={
                      etapaRecuperacao === 1
                        ? fecharModalRecuperacao
                        : voltarEtapaRecuperacao
                    }
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={
                        etapaRecuperacao === 1
                          ? 'x'
                          : 'arrow-left'
                      }
                      size={22}
                      color="#162D50"
                    />
                  </TouchableOpacity>

                  <Text style={styles.modalTitle}>
                    {etapaRecuperacao === 1 &&
                      'Recuperar senha'}

                    {etapaRecuperacao === 2 &&
                      'Código de recuperação'}

                    {etapaRecuperacao === 3 &&
                      'Redefinir senha'}
                  </Text>

                  <View style={{ width: 42 }} />
                </View>

                {/* Indicador das etapas */}
                <View style={styles.stepsContainer}>
                  <View
                    style={[
                      styles.step,
                      etapaRecuperacao >= 1 &&
                        styles.stepActive,
                    ]}
                  />

                  <View
                    style={[
                      styles.step,
                      etapaRecuperacao >= 2 &&
                        styles.stepActive,
                    ]}
                  />

                  <View
                    style={[
                      styles.step,
                      etapaRecuperacao >= 3 &&
                        styles.stepActive,
                    ]}
                  />
                </View>

                {/* ETAPA 1 — E-MAIL */}
                {etapaRecuperacao === 1 && (
                  <View>
                    <Text style={styles.modalSubtitle}>
                      Digite seu e-mail cadastrado para
                      receber o código de recuperação.
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        E-mail
                      </Text>

                      <CampoIcone
                        icone="mail"
                        placeholder="Seu e-mail"
                        valor={emailRecuperacao}
                        aoMudar={setEmailRecuperacao}
                        tipoTeclado="email-address"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleEnviarCodigo}
                      disabled={loadingRecuperacao}
                      activeOpacity={0.85}
                    >
                      {loadingRecuperacao ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>
                            Enviar código
                          </Text>

                          <Feather
                            name="send"
                            size={18}
                            color="#FFFFFF"
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* ETAPA 2 — CÓDIGO */}
                {etapaRecuperacao === 2 && (
                  <View>
                    <Text style={styles.modalSubtitle}>
                      Digite o código de 6 dígitos que
                      enviamos para o seu e-mail.
                    </Text>

                    <Text style={styles.label}>
                      Código
                    </Text>

                    <TextInput
                      style={[
                        styles.input,
                        styles.codigoInput,
                      ]}
                      placeholder="000000"
                      placeholderTextColor="#94A3B8"
                      value={codigoRecuperacao}
                      onChangeText={(texto) =>
                        setCodigoRecuperacao(
                          texto
                            .replace(/[^0-9]/g, '')
                            .slice(0, 6)
                        )
                      }
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                      returnKeyType="done"
                    />

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleValidarCodigo}
                      disabled={loadingRecuperacao}
                      activeOpacity={0.85}
                    >
                      {loadingRecuperacao ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>
                            Validar código
                          </Text>

                          <Feather
                            name="check"
                            size={19}
                            color="#FFFFFF"
                          />
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleEnviarCodigo}
                      disabled={loadingRecuperacao}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name="refresh-cw"
                        size={15}
                        color="#2563EB"
                      />

                      <Text style={styles.resendText}>
                        Reenviar código
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ETAPA 3 — NOVA SENHA */}
                {etapaRecuperacao === 3 && (
                  <View>
                    <Text style={styles.modalSubtitle}>
                      Digite sua nova senha abaixo.
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Nova senha
                      </Text>

                      <CampoIcone
                        icone="lock"
                        placeholder="Digite sua nova senha"
                        valor={novaSenhaRecuperacao}
                        aoMudar={setNovaSenhaRecuperacao}
                        senhaSegura
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Confirmar nova senha
                      </Text>

                      <CampoIcone
                        icone="lock"
                        placeholder="Digite novamente sua senha"
                        valor={confirmarSenhaRecuperacao}
                        aoMudar={setConfirmarSenhaRecuperacao}
                        senhaSegura
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleRedefinirSenha}
                      disabled={loadingRecuperacao}
                      activeOpacity={0.85}
                    >
                      {loadingRecuperacao ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>
                            Redefinir senha
                          </Text>

                          <Feather
                            name="check-circle"
                            size={19}
                            color="#FFFFFF"
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Cancelar */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={fecharModalRecuperacao}
                  disabled={loadingRecuperacao}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
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

  loginCard: {
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

  loginIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#162D50',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },

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

  codigoInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 58,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#162D50',
    marginBottom: 18,
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 20,
  },

  forgotPasswordText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  button: {
    minHeight: 54,
    backgroundColor: '#10B981',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
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

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 12,
  },

  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },

  registerText: {
    color: '#64748B',
    fontSize: 13,
  },

  registerHighlight: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
    lineHeight: 17,
  },

  // Ajuste do teclado
  modalKeyboardAvoiding: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },

  // Permite rolar o conteúdo quando o teclado reduz o espaço
  modalScrollView: {
    flex: 1,
  },

  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalBackButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: '#162D50',
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 20,
  },

  stepsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },

  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },

  stepActive: {
    backgroundColor: '#10B981',
  },

  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 7,
  },

  resendText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});