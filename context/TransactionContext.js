import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransactionContext = createContext();

function identificarUsuario(usuario) {
  if (!usuario || typeof usuario !== 'object') return null;
  const id = usuario.id ?? usuario.usuarioId;
  if (id !== null && id !== undefined && String(id).trim()) return String(id);
  if (typeof usuario.email === 'string' && usuario.email.trim()) {
    return usuario.email.trim().toLowerCase();
  }
  return null;
}

export function TransactionProvider({ children }) {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const userIdRef = useRef(null);
  const generationRef = useRef(0);

  useEffect(() => {
    carregarTransacoes();
    return () => { generationRef.current += 1; };
  }, []);

  async function carregarTransacoes() {
    const generation = ++generationRef.current;
    setLoading(true);
    // Nunca exibir dados de uma conta enquanto outra é carregada.
    setTransacoes([]);
    userIdRef.current = null;
    setUserId(null);
    try {
      const salvo = await AsyncStorage.getItem('@usuario_logado');
      let usuario = null;
      try { usuario = salvo ? JSON.parse(salvo) : null; } catch (_) {}
      const id = identificarUsuario(usuario);
      if (generation !== generationRef.current) return;
      if (!id) return;
      const dados = await AsyncStorage.getItem(`@transacoes_user_${id}`);
      if (generation !== generationRef.current) return;
      const lista = dados ? JSON.parse(dados) : [];
      userIdRef.current = id;
      setUserId(id);
      setTransacoes(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('Erro ao carregar transações da conta:', error);
      if (generation === generationRef.current) setTransacoes([]);
    } finally {
      if (generation === generationRef.current) setLoading(false);
    }
  }

  async function verificarContaAtiva() {
    const salvo = await AsyncStorage.getItem('@usuario_logado');
    let usuario = null;
    try { usuario = salvo ? JSON.parse(salvo) : null; } catch (_) {}
    const id = identificarUsuario(usuario);
    if (!id || id !== userIdRef.current) {
      await carregarTransacoes();
      throw new Error('Sessão alterada. Aguarde o carregamento da conta e tente novamente.');
    }
    return id;
  }

  async function adicionarTransacao(novaTransacao) {
    const id = await verificarContaAtiva();
    const item = {
      ...novaTransacao,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      valor: Number(novaTransacao.valor),
    };
    const storageKey = `@transacoes_user_${id}`;
    const salvas = await AsyncStorage.getItem(storageKey);
    const lista = salvas ? JSON.parse(salvas) : [];
    const novaLista = [item, ...(Array.isArray(lista) ? lista : [])];
    // Persistir primeiro, só então mostrar sucesso.
    await AsyncStorage.setItem(storageKey, JSON.stringify(novaLista));
    if (userIdRef.current === id) setTransacoes(novaLista);
    return { sucesso: true };
  }

  async function removerTransacao(transacaoId) {
    const id = await verificarContaAtiva();
    const storageKey = `@transacoes_user_${id}`;
    const salvas = await AsyncStorage.getItem(storageKey);
    const lista = salvas ? JSON.parse(salvas) : [];
    const novaLista = (Array.isArray(lista) ? lista : []).filter((t) => t.id !== transacaoId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(novaLista));
    if (userIdRef.current === id) setTransacoes(novaLista);
    return { sucesso: true };
  }

  function obterGastosPorCategoria() {
    const cores = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];
    const despesas = transacoes.filter((t) => String(t.tipo || '').toLowerCase() === 'despesa');
    const agrupado = despesas.reduce((acc, item) => {
      const cat = item.categoria || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(item.valor || 0);
      return acc;
    }, {});
    return Object.keys(agrupado).map((categoria, index) => ({
      name: categoria,
      population: agrupado[categoria],
      color: cores[index % cores.length],
      legendFontColor: '#94A3B8',
      legendFontSize: 13,
    }));
  }

  return (
    <TransactionContext.Provider value={{
      transacoes, loading, userId, carregarTransacoes,
      adicionarTransacao, removerTransacao, obterGastosPorCategoria,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions deve ser usado dentro de TransactionProvider');
  return context;
}
