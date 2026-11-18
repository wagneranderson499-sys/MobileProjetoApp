// app/_layout.js
import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { Stack } from 'expo-router';

// 1. Verifique se a importação está exatamente assim com chaves { CategoryProvider }:
import { CategoryProvider } from '../context/CategoryContext'; 
import { PeriodoProvider } from '../context/PeriodoContext';
import { TransactionProvider } from '../context/TransactionContext';

export default function Layout() {
  return (
    <ThemeProvider>
    <CategoryProvider>
      <PeriodoProvider>
      <TransactionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TransactionProvider>
      </PeriodoProvider>
    </CategoryProvider>
    </ThemeProvider>
  );
}