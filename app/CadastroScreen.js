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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../Services/api';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para o Modal de Confirmação do Código
  const [modalVisivel, setModalVisivel] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  // Função para validar se a senha é forte
  const validarSenhaForte = (valorSenha) => {
    // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
    const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regexSenhaForte.test(valorSenha);
  };

  async function handleCadastro() {
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (!validarSenhaForte(senha)) {
      Alert.alert(
        'Senha Fraca',
        'A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).'
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Envia a solicitação de cadastro
      await api.post('/usuarios/cadastrar', {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha,
      });

      // Abre o modal de código de confirmação em cima da tela
      setModalVisivel(true);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      const msg = error.response?.data?.message || 'Não foi possível realizar o cadastro.';
      Alert.alert('Erro no Cadastro', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmarCodigo() {
    if (!codigoConfirmacao.trim()) {
      Alert.alert('Atenção', 'Digite o código de confirmação recebido.');
      return;
    }

    setLoadingModal(true);

    try {
      // 2. Confirma o código enviado por e-mail
      await api.post('/usuarios/confirmar-codigo', {
        email: email.trim(),
        codigo: codigoConfirmacao.trim(),
      });

      setModalVisivel(false);
      Alert.alert('Sucesso!', 'Conta criada e e-mail confirmado com sucesso!', [
        { text: 'Ir para Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      console.error('Erro ao confirmar código:', error);
      const msg = error.response?.data?.message || 'Código inválido ou expirado.';
      Alert.alert('Erro na Confirmação', msg);
    } finally {
      setLoadingModal(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Botão Voltar para a Home */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#94A3B8" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Criar Conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#64748B"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#64748B"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <Text style={styles.hintText}>
          * Mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo (@$!%*?&).
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODAL DE CONFIRMAÇÃO DE CÓDIGO POR E-MAIL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirme seu E-mail</Text>
            <Text style={styles.modalSubtitle}>
              Digite o código que enviamos para:{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Código"
              placeholderTextColor="#64748B"
              value={codigoConfirmacao}
              onChangeText={setCodigoConfirmacao}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleConfirmarCodigo} 
              disabled={loadingModal}
            >
              {loadingModal ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Confirmar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#162D50' },
  scroll: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#FFF', marginBottom: 12 },
  hintText: { color: '#94A3B8', fontSize: 11, marginBottom: 16, marginTop: -4 },
  button: { backgroundColor: '#10B981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8, width: '100%' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  modalSubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  emailHighlight: { color: '#10B981', fontWeight: 'bold' },
  modalInput: {
    backgroundColor: '#162D50',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 14,
    color: '#FFF',
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
    marginBottom: 12,
  },
  cancelButton: { marginTop: 12, padding: 8 },
  cancelButtonText: { color: '#94A3B8', fontSize: 14 },
});