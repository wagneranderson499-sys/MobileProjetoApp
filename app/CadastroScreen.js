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

// ⚠️ Substitua pelo IP IPv4 local da sua máquina (ex: ipconfig)
const API_BASE_URL = 'http://172.20.10.2:8080/api/usuarios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function CadastroScreen() {
  const router = useRouter();

  // Estados do Formulário Principal
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estado do Modal de Redefinir Senha
  const [modalEsqueciSenha, setModalEsqueciSenha] = useState(false);

  // Inputs do Modal
  const [emailEsqueci, setEmailEsqueci] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  // --- 1. CADASTRAR USUÁRIO ---
  const handleCadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
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

      // Dados retornados do backend Spring Boot
      const dadosUsuario = response.data;

      Alert.alert(
        'Sucesso',
        dadosUsuario?.message || 'Conta criada com sucesso!',
        [
          {
            text: 'Acessar Painel',
            onPress: () => {
              router.replace({
                pathname: '/DashboardScreen',
                params: { 
                  usuario: JSON.stringify({
                    id: dadosUsuario.id,
                    nome: dadosUsuario.nome || nome.trim(),
                    email: dadosUsuario.email || email.trim(),
                    saldo: dadosUsuario.saldo ?? 0.0,
                  }),
                },
              });
            },
          },
        ]
      );
    } catch (error) {
      setCarregando(false);
      console.error('Erro no cadastro:', error);

      if (error.response) {
        Alert.alert('Erro', error.response.data?.message || 'Falha ao realizar cadastro.');
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert('Tempo Esgotado', 'O servidor demorou para responder. Verifique sua conexão.');
      } else {
        Alert.alert(
          'Erro de Conexão',
          `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique se o dispositivo está no mesmo Wi-Fi que o seu computador.`
        );
      }
    }
  };

  // --- 2. REDEFINIR SENHA ---
  const handleRedefinirSenha = async () => {
    if (!emailEsqueci.trim() || !novaSenha.trim()) {
      Alert.alert('Atenção', 'Informe o e-mail e a nova senha.');
      return;
    }

    setCarregando(true);
    Keyboard.dismiss();

    try {
      const response = await api.post('/redefinir-senha', {
        email: emailEsqueci.trim().toLowerCase(),
        novaSenha: novaSenha,
      });

      setCarregando(false);
      setModalEsqueciSenha(false);
      setEmailEsqueci('');
      setNovaSenha('');
      Alert.alert('Sucesso', response.data?.message || 'Senha redefinida com sucesso!');
    } catch (error) {
      setCarregando(false);
      const msg = error.response?.data?.message || 'Erro ao redefinir senha.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Botão de Voltar */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={22} color="#94A3B8" />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Criar Conta</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#64748B"
              value={nome}
              onChangeText={setNome}
              returnKeyType="next"
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#64748B"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleCadastrar} 
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => setModalEsqueciSenha(true)}
            >
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* MODAL: ESQUECI A SENHA */}
      <Modal visible={modalEsqueciSenha} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Redefinir Senha</Text>
              <Text style={styles.modalSubtitle}>
                Informe seu e-mail cadastrado e a nova senha.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#64748B"
                value={emailEsqueci}
                onChangeText={setEmailEsqueci}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Nova Senha"
                placeholderTextColor="#64748B"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRedefinirSenha}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Atualizar Senha</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalEsqueciSenha(false)}
              >
                <Text style={styles.cancelButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#162D50' 
  },
  scroll: { 
    padding: 24, 
    justify: 'center', 
    flexGrow: 1 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 20, 
    alignSelf: 'flex-start' 
  },
  backButtonText: { 
    color: '#94A3B8', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom: 32, 
    textAlign: 'center' 
  },
  input: { 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155', 
    borderRadius: 10, 
    padding: 14, 
    color: '#FFF', 
    marginBottom: 16,
    fontSize: 16,
  },
  button: { 
    backgroundColor: '#10B981', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 8 
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  linkContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#38BDF8', 
    fontSize: 14 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { 
    backgroundColor: '#162D50', 
    borderRadius: 16, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  modalSubtitle: { 
    color: '#94A3B8', 
    fontSize: 13, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  cancelButton: { 
    marginTop: 14, 
    alignItems: 'center' 
  },
  cancelButtonText: { 
    color: '#EF4444', 
    fontSize: 14, 
    fontWeight: '500' 
  },
});