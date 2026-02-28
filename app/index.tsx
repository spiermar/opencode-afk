import { Redirect } from 'expo-router';
import { useOpenCode } from '../src/providers/OpenCodeProvider';

export default function Index() {
  const { connected } = useOpenCode();

  if (connected) {
    return <Redirect href="/workspaces" />;
  }

  return <Redirect href="/connect" />;
}
