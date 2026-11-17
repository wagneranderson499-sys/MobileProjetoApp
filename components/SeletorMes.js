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
  linha:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#FFFFFF',borderRadius:14,padding:10,marginBottom:16,borderWidth:1,borderColor:'#E2E8F0'},
  botao:{padding:10},centro:{alignItems:'center'},rotulo:{fontSize:10,color:'#64748B',fontWeight:'700',letterSpacing:0.5},mes:{fontSize:16,fontWeight:'800',color:'#162D50',marginTop:3}
});
