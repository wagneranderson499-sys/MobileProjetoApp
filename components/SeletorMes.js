import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePeriodo, moverMes, nomeMes, chaveMesAtual } from '../context/PeriodoContext';

export default function SeletorMes() {
  const { periodo, setPeriodo } = usePeriodo();
  const atual = chaveMesAtual();
  return (
    <View style={styles.linha}>
      <TouchableOpacity accessibilityLabel="Mês anterior" onPress={() => setPeriodo(moverMes(periodo,-1))} style={styles.botao}>
        <Ionicons name="chevron-back" size={20} color="#162D50" />
      </TouchableOpacity>
      <View style={styles.centro}>
        <Text style={styles.rotulo}>PERÍODO SELECIONADO</Text>
        <Text style={styles.mes}>{nomeMes(periodo)}</Text>
      </View>
      <TouchableOpacity accessibilityLabel="Próximo mês" disabled={periodo>=atual} onPress={() => setPeriodo(moverMes(periodo,1))} style={styles.botao}>
        <Ionicons name="chevron-forward" size={20} color={periodo>=atual?'#CBD5E1':'#162D50'} />
      </TouchableOpacity>
    </View>
  );
}
const styles=StyleSheet.create({
  linha:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'transparent',paddingVertical:8,paddingHorizontal:2,marginBottom:12},
  botao:{padding:10},centro:{alignItems:'center'},rotulo:{fontSize:10,color:'#94A3B8',fontWeight:'500',letterSpacing:0.4},mes:{fontSize:16,fontWeight:'600',color:'#162D50',marginTop:3}
});
