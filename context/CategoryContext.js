import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Categorias padrão para novos usuários
const CATEGORIAS_PADRAO = [
  { id: '1', nome: 'Alimentação', icone: 'fast-food-outline' },
  { id: '2', nome: 'Moradia', icone: 'home-outline' },
  { id: '3', nome: 'Transporte', icone: 'car-outline' },
  { id: '4', nome: 'Lazer', icone: 'game-controller-outline' },
  { id: '5', nome: 'Saúde', icone: 'medical-outline' },
  { id: '6', nome: 'Educação', icone: 'book-outline' },
  { id: '7', nome: 'Serviços', icone: 'construct-outline' },
  { id: '8', nome: 'Outros', icone: 'ellipsis-horizontal-circle-outline' },
];

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categorias, setCategorias] = useState([]);

  // Carrega do AsyncStorage ou define o padrão na primeira execução
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const salvas = await AsyncStorage.getItem('@categorias_app');
        if (salvas !== null) {
          setCategorias(JSON.parse(salvas));
        } else {
          setCategorias(CATEGORIAS_PADRAO);
          await AsyncStorage.setItem('@categorias_app', JSON.stringify(CATEGORIAS_PADRAO));
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    }
    carregarCategorias();
  }, []);

  const salvarCategorias = async (novasCategorias) => {
    try {
      await AsyncStorage.setItem('@categorias_app', JSON.stringify(novasCategorias));
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
    }
  };

  // ADICIONAR
  const adicionarCategoria = (nome) => {
    if (!nome.trim()) return;

    const nova = {
      id: Date.now().toString(),
      nome: nome.trim(),
      icone: 'pricetag-outline',
    };

    const atualizadas = [...categorias, nova];
    setCategorias(atualizadas);
    salvarCategorias(atualizadas);
  };

  // EXCLUIR
  const removerCategoria = (id) => {
    const atualizadas = categorias.filter((cat) => cat.id !== id);
    setCategorias(atualizadas);
    salvarCategorias(atualizadas);
  };

  // EDITAR / ATUALIZAR
  const editarCategoria = (id, novoNome) => {
    if (!novoNome.trim()) return;

    const atualizadas = categorias.map((cat) =>
      cat.id === id ? { ...cat, nome: novoNome.trim() } : cat
    );
    setCategorias(atualizadas);
    salvarCategorias(atualizadas);
  };

  return (
    <CategoryContext.Provider
      value={{
        categorias,
        adicionarCategoria,
        removerCategoria,
        editarCategoria,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategorias() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategorias deve ser usado dentro de um CategoryProvider');
  }
  return context;
}