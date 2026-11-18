import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';

// OCR experimental: requer expo-text-extractor e uma development build.
// Nenhuma imagem é enviada ao backend ou a serviços externos.
function extrairValor(texto) {
  const linhas = texto.split(/\r?\n/);
  const candidatas = [];
  for (const linha of linhas) {
    const achados = [...linha.matchAll(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})/g)];
    const prioridade = /(?:total\s*(?:a\s*pagar|da\s*compra)?|valor\s*(?:pago|total)|pagamento)/i.test(linha) ? 3 : 1;
    for (const achado of achados) {
      const bruto = achado[1].replace(/\./g, '').replace(',', '.');
      const numero = Number(bruto);
      if (Number.isFinite(numero) && numero > 0 && numero < 1000000) candidatas.push({ numero, prioridade });
    }
  }
  candidatas.sort((a,b) => b.prioridade - a.prioridade || b.numero - a.numero);
  return candidatas[0]?.numero ?? null;
}
function dataHoje() {
  const d = new Date();
  return [String(d.getDate()).padStart(2,'0'),String(d.getMonth()+1).padStart(2,'0'),d.getFullYear()].join('/');
}
export default function EscanearComprovante() {
  const { adicionarTransacao } = useTransactions();
  const [ocupado,setOcupado] = useState(false);
  const [texto,setTexto] = useState('');
  const [valor,setValor] = useState('');
  const [descricao,setDescricao] = useState('');
  const [data,setData] = useState(dataHoje());
  const [categoria,setCategoria] = useState('Outros');

  async function selecionar(camera) {
    try {
      if (camera) {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) { Alert.alert('Permissão necessária','Autorize a câmera para fotografar o comprovante.'); return; }
      }
      const resultado = camera
        ? await ImagePicker.launchCameraAsync({mediaTypes:['images'],quality:0.85})
        : await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.85});
      if (resultado.canceled || !resultado.assets?.[0]?.uri) return;
      setOcupado(true);
      const { extractTextFromImage } = require('expo-text-extractor');
      const linhas = await extractTextFromImage(resultado.assets[0].uri);
      const reconhecido = Array.isArray(linhas) ? linhas.join('\n') : String(linhas ?? '');
      setTexto(reconhecido);
      const total = extrairValor(reconhecido);
      setValor(total === null ? '' : total.toFixed(2).replace('.',','));
      setDescricao('');
      if (!reconhecido.trim()) Alert.alert('Texto não identificado','Tente uma foto mais nítida ou preencha os dados manualmente.');
    } catch (erro) {
      console.error('OCR:', erro);
      Alert.alert('Leitura indisponível','O reconhecimento precisa de uma development build com expo-text-extractor. Você ainda pode preencher os campos manualmente.');
    } finally { setOcupado(false); }
  }
  async function salvar() {
    const numero = Number(valor.replace(/\./g,'').replace(',','.'));
    if (!Number.isFinite(numero) || numero <= 0 || !descricao.trim()) {
      Alert.alert('Confira os dados','Informe um valor válido e uma descrição.'); return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      Alert.alert('Data inválida','Use o formato DD/MM/AAAA.'); return;
    }
    setOcupado(true);
    try {
      await adicionarTransacao({id:Date.now().toString(),tipo:'despesa',valor:numero,descricao:descricao.trim(),data,categoria:categoria.trim()||'Outros',icone:'arrow-down-outline'});
      Alert.alert('Despesa salva','O comprovante foi registrado como despesa.',[{text:'OK',onPress:()=>router.back()}]);
    } catch(e) { Alert.alert('Erro','Não foi possível salvar a despesa.'); }
    finally { setOcupado(false); }
  }
  return <ScrollView style={s.tela} contentContainerStyle={s.conteudo}>
    <TouchableOpacity onPress={()=>router.back()} style={s.voltar}><Ionicons name="arrow-back" size={23} color="#102A4C"/><Text style={s.titulo}>Escanear comprovante</Text></TouchableOpacity>
    <Text style={s.info}>Fotografe ou selecione um comprovante. O valor sugerido pode estar incorreto: confira antes de salvar.</Text>
    <TouchableOpacity style={s.botao} disabled={ocupado} onPress={()=>selecionar(true)}><Ionicons name="camera-outline" size={21} color="#fff"/><Text style={s.botaoTexto}>Tirar foto</Text></TouchableOpacity>
    <TouchableOpacity style={[s.botao,s.secundario]} disabled={ocupado} onPress={()=>selecionar(false)}><Ionicons name="images-outline" size={21} color="#102A4C"/><Text style={[s.botaoTexto,{color:'#102A4C'}]}>Escolher da galeria</Text></TouchableOpacity>
    {ocupado && <ActivityIndicator size="large" color="#15803D"/>}
    <Text style={s.rotulo}>Valor (R$)</Text><TextInput style={s.campo} keyboardType="decimal-pad" value={valor} onChangeText={setValor} placeholder="0,00"/>
    <Text style={s.rotulo}>Descrição</Text><TextInput style={s.campo} value={descricao} onChangeText={setDescricao} placeholder="Ex.: Compra no mercado"/>
    <Text style={s.rotulo}>Data (DD/MM/AAAA)</Text><TextInput style={s.campo} value={data} onChangeText={setData} placeholder="DD/MM/AAAA"/>
    <Text style={s.rotulo}>Categoria</Text><TextInput style={s.campo} value={categoria} onChangeText={setCategoria} placeholder="Outros"/>
    {texto ? <><Text style={s.rotulo}>Texto reconhecido (para conferência)</Text><Text style={s.ocr}>{texto.slice(0,3000)}</Text></> : null}
    <TouchableOpacity style={s.botao} disabled={ocupado} onPress={salvar}><Ionicons name="checkmark-circle-outline" size={21} color="#fff"/><Text style={s.botaoTexto}>Confirmar e salvar despesa</Text></TouchableOpacity>
    <Text style={s.rodape}>Leitura experimental. Nenhum lançamento é salvo automaticamente.</Text>
  </ScrollView>;
}
const s=StyleSheet.create({
  tela:{flex:1,backgroundColor:'#F8FAFC'},conteudo:{padding:22,paddingTop:52,paddingBottom:55},
  voltar:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:18},titulo:{fontSize:21,fontWeight:'800',color:'#102A4C'},
  info:{fontSize:14,color:'#475569',lineHeight:21,marginBottom:18},botao:{backgroundColor:'#102A4C',borderRadius:13,padding:15,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,marginBottom:11},
  secundario:{backgroundColor:'#E2E8F0'},botaoTexto:{color:'#fff',fontWeight:'700',fontSize:15},
  rotulo:{fontWeight:'700',color:'#334155',marginTop:15,marginBottom:6},campo:{borderWidth:1,borderColor:'#CBD5E1',borderRadius:11,backgroundColor:'#fff',padding:13,color:'#0F172A'},
  ocr:{backgroundColor:'#E2E8F0',padding:12,borderRadius:10,color:'#334155',fontSize:12},rodape:{textAlign:'center',color:'#64748B',marginTop:12,fontSize:12}
});