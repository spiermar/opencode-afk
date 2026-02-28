import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function WorkspacesLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenOptions = {
    headerStyle: {
      backgroundColor: isDark ? '#000000' : '#ffffff',
    },
    headerTintColor: isDark ? '#ffffff' : '#000000',
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Workspaces' }} />
      <Stack.Screen
        name="create"
        options={{
          title: 'Select Directory',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}