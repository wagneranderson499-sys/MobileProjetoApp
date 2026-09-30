import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // 1. Ao iniciar, obtém o usuário atual logado do AsyncStorage
  useEffect(() => {
    carregarUsuarioEListas();
  }, []);

  async function carregarUsuarioEListas() {
    try {
      // Busca a identificação do usuário salva no login (email ou id)
      const userSalvo = await AsyncStorage.getItem('@usuario_logado');
      if (userSalvo) {
        const parsedUser = JSON.parse(userSalvo);
        const id = parsedUser.id || parsedUser.email || parsedUser;
        setUserId(id);
        await carregarTransacoesDoUsuario(id);
      } else {
        setUserId(null);
        setTransacoes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário ativo:', error);
    }
  }

  // 2. Carrega as transações específicas do usuário logado
  async function carregarTransacoesDoUsuario(id) {
    if (!id) {
      setTransacoes([]);
      return;
    }

    setLoading(true);
    try {
      const storageKey = `@transacoes_user_${id}`;
      const dadosSalvos = await AsyncStorage.getItem(storageKey);
      if (dadosSalvos) {
        setTransacoes(JSON.parse(dadosSalvos));
      } else {
        setTransacoes([]); // Novo usuário começa limpo
      }
    } catch (error) {
      console.error('Erro ao carregar transações locais:', error);
    } finally {
      setLoading(false);
    }
  }

  // Função auxiliar para recarregar quando o usuário faz login/logout
  async function carregarTransacoes() {
    const userSalvo = await AsyncStorage.getItem('@usuario_logado');
    if (userSalvo) {
      const parsedUser = JSON.parse(userSalvo);
      const id = parsedUser.id || parsedUser.email || parsedUser;
      setUserId(id);
      await carregarTransacoesDoUsuario(id);
    } else {
      setUserId(null);
      setTransacoes([]);
    }
  }

  // 3. Cadastra novo gasto/receita localmente para o usuário atual
  async function adicionarTransacao(novaTransacao) {
    try {
      const userSalvo = await AsyncStorage.getItem('@usuario_logado');
      const parsedUser = userSalvo ? JSON.parse(userSalvo) : null;
      const currentId = userId || parsedUser?.id || parsedUser?.email || parsedUser;

      const storageKey = currentId ? `@transacoes_user_${currentId}` : '@transacoes_app';

      const itemFormatado = {
        ...novaTransacao,
        id: Date.now().toString(),
        valor: Number(novaTransacao.valor),
      };

      const novaLista = [itemFormatado, ...transacoes];

      setTransacoes(novaLista);
      await AsyncStorage.setItem(storageKey, JSON.stringify(novaLista));

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      return { sucesso: false, error };
    }
  }

  // 4. Remove uma transação do usuário atual
  async function removerTransacao(id) {
    try {
      const userSalvo = await AsyncStorage.getItem('@usuario_logado');
      const parsedUser = userSalvo ? JSON.parse(userSalvo) : null;
      const currentId = userId || parsedUser?.id || parsedUser?.email || parsedUser;

      const storageKey = currentId ? `@transacoes_user_${currentId}` : '@transacoes_app';

      const novaLista = transacoes.filter((t) => t.id !== id);
      setTransacoes(novaLista);
      await AsyncStorage.setItem(storageKey, JSON.stringify(novaLista));
      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao remover transação:', error);
      return { sucesso: false, error };
    }
  }

  // 5. Helper que calcula os totais por categoria para o gráfico
  function obterGastosPorCategoria() {
    const cores = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];

    const despesas = transacoes.filter((t) => t.tipo === 'DESPESA' || !t.tipo);

    const agrupado = despesas.reduce((acc, item) => {
      const cat = item.categoria || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(item.valor);
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
    <TransactionContext.Provider
      value={{
        transacoes,
        loading,
        carregarTransacoes,
        adicionarTransacao,
        removerTransacao,
        obterGastosPorCategoria,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}