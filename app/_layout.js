// app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';

// 1. Verifique se a importação está exatamente assim com chaves { CategoryProvider }:
import { CategoryProvider } from '../context/CategoryContext'; 
import { TransactionProvider } from '../context/TransactionContext';

export default function Layout() {
  return (
    <CategoryProvider>
      <TransactionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TransactionProvider>
    </CategoryProvider>
  );
}