import { Redirect } from 'expo-router';
import { useOpenCode } from '../src/providers/OpenCodeProvider';

export default function Index() {
  const { connected, connecting } = useOpenCode();

  // While connecting, show nothing (the layout handles the redirect)
  if (connecting) {
    return null;
  }

  if (connected) {
    return <Redirect href="/(tabs)/sessions" />;
  }
  
  return <Redirect href="/connect" />;
}
