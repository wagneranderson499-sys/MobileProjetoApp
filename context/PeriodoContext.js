import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';

const PeriodoContext = createContext(null);
export const chaveMesAtual = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
export function chaveDaTransacao(data) {
  if (typeof data !== 'string') return null;
  const s = data.trim();
  let m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) { const dia=Number(m[1]), mes=Number(m[2]), ano=Number(m[3]); const d=new Date(ano,mes-1,dia); return d.getFullYear()===ano && d.getMonth()===mes-1 && d.getDate()===dia ? `${ano}-${m[2]}` : null; }
  m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) { const ano=Number(m[1]), mes=Number(m[2]), dia=Number(m[3]); const d=new Date(ano,mes-1,dia); return d.getFullYear()===ano && d.getMonth()===mes-1 && d.getDate()===dia ? `${m[1]}-${m[2]}` : null; }
  return null;
}
export const nomeMes = chave => { const [ano,mes]=chave.split('-').map(Number); return new Date(ano,mes-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase()); };
export const moverMes = (chave,delta) => { const [ano,mes]=chave.split('-').map(Number); const d=new Date(ano,mes-1+delta,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
export function PeriodoProvider({children}) {
  const [periodo,setPeriodo]=useState(chaveMesAtual);
  useEffect(()=>{
    const assinatura=AppState.addEventListener('change',estado=>{if(estado==='active') setPeriodo(chaveMesAtual());});
    const timer=setInterval(()=>setPeriodo(atual=>atual===chaveMesAtual()?atual:chaveMesAtual()),60000);
    return ()=>{assinatura.remove();clearInterval(timer);};
  },[]);
  return <PeriodoContext.Provider value={{periodo,setPeriodo}}>{children}</PeriodoContext.Provider>;
}
export const usePeriodo = () => useContext(PeriodoContext);
