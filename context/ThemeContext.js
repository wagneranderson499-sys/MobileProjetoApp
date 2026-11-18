import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const STORAGE_KEY = '@financecontrol_tema';
const CORES = {
  '#FFFFFF': '#192536', '#F8FAFC': '#101827', '#F1F5F9': '#202D40',
  '#E8EEF5': '#243349', '#E2E8F0': '#35465C', '#CBD5E1': '#53657B',
  '#162D50': '#E8EFF9', '#233D62': '#DCE7F5', '#334A6B': '#C6D5E7',
  '#64748B': '#A4B4C9', '#94A3B8': '#8FA2B9',
  '#D1FAE5': '#163D34', '#FEE2E2': '#47282F', '#F0FDF4': '#18352A',
  '#FEF2F2': '#3B252B', '#FECACA': '#754047',
};
export const corTema = (cor, escuro, propriedade = 'color') => {
  if (!escuro || typeof cor !== 'string') return cor;
  const chave = cor.toUpperCase();
  if (chave === '#FFFFFF' && propriedade === 'color') return '#FFFFFF';
  return CORES[chave] || cor;
};
export function estilosTema(base, escuro) {
  if (!escuro) return base;
  const resultado = {};
  Object.keys(base).forEach(nome => {
    const original = StyleSheet.flatten(base[nome]);
    if (!original) { resultado[nome] = base[nome]; return; }
    const novo = { ...original };
    const fundo = typeof original.backgroundColor === 'string' ? original.backgroundColor.toUpperCase() : '';
    for (const prop of ['backgroundColor', 'borderColor', 'borderBottomColor', 'borderTopColor', 'color']) {
      if (novo[prop]) {
        if (prop === 'color' && novo[prop].toUpperCase() === '#FFFFFF' && fundo !== '#FFFFFF' && fundo !== '#F8FAFC') continue;
        novo[prop] = corTema(novo[prop], true, prop);
        if (prop === 'color' && novo[prop] === '#FFFFFF' && original.color?.toUpperCase() === '#FFFFFF' && (fundo === '#FFFFFF' || fundo === '#F8FAFC')) novo[prop] = '#E8EFF9';
      }
    }
    resultado[nome] = novo;
  });
  return resultado;
}
export function ThemeProvider({ children }) {
  const [modo, setModo] = useState('automatico');
  const [sistema, setSistema] = useState(Appearance.getColorScheme() || 'light');
  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(STORAGE_KEY).then(valor => {
      if (ativo && ['claro','escuro','automatico'].includes(valor)) setModo(valor);
    }).catch(() => {});
    const assinatura = Appearance.addChangeListener(({ colorScheme }) => setSistema(colorScheme || 'light'));
    return () => { ativo = false; assinatura.remove(); };
  }, []);
  const alterarModo = async novo => {
    if (!['claro','escuro','automatico'].includes(novo)) return;
    setModo(novo);
    try { await AsyncStorage.setItem(STORAGE_KEY, novo); } catch(e) { console.warn('Não foi possível salvar o tema', e); }
  };
  const escuro = modo === 'escuro' || (modo === 'automatico' && sistema === 'dark');
  const value = useMemo(() => ({ modo, alterarModo, escuro }), [modo, escuro]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTema() {
  const contexto = useContext(ThemeContext);
  if (!contexto) throw new Error('useTema requer ThemeProvider');
  return contexto;
}
