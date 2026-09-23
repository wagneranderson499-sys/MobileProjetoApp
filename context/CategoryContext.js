import React, { createContext, useState, useContext } from 'react';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([
    { id: '1', nome: 'Alimentação', icone: 'restaurant-outline' },
    { id: '2', nome: 'Transporte', icone: 'car-outline' },
    { id: '3', nome: 'Lazer', icone: 'game-controller-outline' },
    { id: '4', nome: 'Contas', icone: 'receipt-outline' },
  ]);

  const adicionarCategoria = (nome) => {
    if (!nome.trim()) return;
    const nova = {
      id: Date.now().toString(),
      nome,
      icone: 'pricetag-outline',
    };
    setCategorias((prev) => [...prev, nova]);
  };

  const removerCategoria = (id) => {
    setCategorias((prev) => prev.filter((cat) => cat.id !== id));
  };

  return (
    <CategoryContext.Provider value={{ categorias, adicionarCategoria, removerCategoria }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategorias = () => useContext(CategoryContext);