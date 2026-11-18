import { useTema, estilosTema } from '../context/ThemeContext';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePeriodo, moverMes, nomeMes, chaveMesAtual } from '../context/PeriodoContext';

export default function SeletorMes() {
  const { escuro } = useTema();
  const styles = React.useMemo(() => estilosTema(baseStyles, escuro), [escuro]);
  const { periodo, setPeriodo } = usePeriodo();
  const atual = chaveMesAtual();
  return (
    <View style={styles.linha}>
      <TouchableOpacity accessibilityLabel="Mês anterior" onPress={() => setPeriodo(moverMes(periodo,-1))} style={styles.botao}>
        <Ionicons name="chevron-back" size={16} color="#162D50" />
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
const baseStyles=StyleSheet.create({
  linha:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'transparent',paddingVertical:2,marginBottom:8,gap:12},
  botao:{padding:5},centro:{alignItems:'center',minWidth:135},rotulo:{fontSize:9,color:'#94A3B8',fontWeight:'500',letterSpacing:0.2},mes:{fontSize:13,fontWeight:'600',color:'#162D50',marginTop:1}
});
