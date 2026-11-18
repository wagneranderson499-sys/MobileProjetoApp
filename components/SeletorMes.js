import { useTema, estilosTema } from '../context/ThemeContext';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePeriodo, nomeMes, chaveMesAtual, chaveDaTransacao } from '../context/PeriodoContext';
import { useTransactions } from '../context/TransactionContext';

// Na tela de gráficos, navega somente entre meses com despesas e o mês atual.
// Nas demais telas, preserva a navegação mensal normal.
export default function SeletorMes({ apenasMesesComDespesas = false }) {
  const { escuro } = useTema();
  const styles = React.useMemo(() => estilosTema(baseStyles, escuro), [escuro]);
  const { periodo, setPeriodo } = usePeriodo();
  const { transacoes } = useTransactions();
  const atual = chaveMesAtual();

  const meses = React.useMemo(() => {
    const disponiveis = new Set([atual]);
    if (apenasMesesComDespesas && Array.isArray(transacoes)) {
      transacoes.forEach((item) => {
        if (String(item?.tipo ?? '').toLowerCase() !== 'despesa') return;
        const chave = chaveDaTransacao(item?.data);
        if (chave && chave <= atual) disponiveis.add(chave);
      });
    }
    return [...disponiveis].sort();
  }, [apenasMesesComDespesas, transacoes, atual]);

  const deslocar = (delta) => {
    const [ano, mes] = periodo.split('-').map(Number);
    const data = new Date(ano, mes - 1 + delta, 1);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  };
  const anterior = apenasMesesComDespesas
    ? [...meses].reverse().find((mes) => mes < periodo)
    : deslocar(-1);
  const proximo = apenasMesesComDespesas
    ? meses.find((mes) => mes > periodo)
    : (periodo < atual ? deslocar(1) : null);

  return (
    <View style={styles.linha}>
      <TouchableOpacity
        accessibilityLabel="Mês anterior"
        accessibilityState={{ disabled: !anterior }}
        disabled={!anterior}
        onPress={() => anterior && setPeriodo(anterior)}
        style={styles.botao}
      >
        <Ionicons name="chevron-back" size={20} color={anterior ? (escuro ? '#DCE7F5' : '#162D50') : '#64748B'} />
      </TouchableOpacity>
      <View style={styles.centro}>
        <Text style={styles.rotulo}>PERÍODO SELECIONADO</Text>
        <Text style={styles.mes}>{nomeMes(periodo)}</Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Próximo mês"
        accessibilityState={{ disabled: !proximo }}
        disabled={!proximo}
        onPress={() => proximo && setPeriodo(proximo)}
        style={styles.botao}
      >
        <Ionicons name="chevron-forward" size={20} color={proximo ? (escuro ? '#DCE7F5' : '#162D50') : '#64748B'} />
      </TouchableOpacity>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', paddingVertical: 2, marginBottom: 8, gap: 12 },
  botao: { padding: 5 },
  centro: { alignItems: 'center', minWidth: 135 },
  rotulo: { fontSize: 9, color: '#94A3B8', fontWeight: '500', letterSpacing: 0.2 },
  mes: { fontSize: 13, fontWeight: '600', color: '#162D50', marginTop: 1 },
});
