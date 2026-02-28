import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ConnectScreen } from '../src/screens/ConnectScreen';
import { useOpenCode } from '../src/providers/OpenCodeProvider';

export default function Connect() {
  const router = useRouter();
  const { serverUrl, setServerUrl, connect, connecting, error, currentWorkspace } = useOpenCode();

  const handleConnect = useCallback(async () => {
    const directory = currentWorkspace?.path;
    const success = await connect(serverUrl, directory);
    if (success) {
      router.replace('/(tabs)/sessions');
    }
  }, [connect, serverUrl, router, currentWorkspace]);

  return (
    <ConnectScreen
      serverUrl={serverUrl}
      onServerUrlChange={setServerUrl}
      onConnect={handleConnect}
      connecting={connecting}
      error={error}
    />
  );
}
