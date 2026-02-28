import { Stack } from 'expo-router';

export default function WorkspacesLayout() {
  return (
    <Stack>
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