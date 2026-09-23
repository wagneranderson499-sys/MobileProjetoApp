import { Stack } from 'expo-router';
import { CategoryProvider } from '../context/CategoryContext';

export default function Layout() {
  return (
    <CategoryProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CategoryProvider>
  );
}