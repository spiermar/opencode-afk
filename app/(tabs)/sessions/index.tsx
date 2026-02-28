import { useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SessionsScreen } from '../../../src/screens/SessionsScreen';
import { useOpenCode, Session } from '../../../src/providers/OpenCodeProvider';
import { Icon } from '../../../src/components/Icon';

export default function Sessions() {
  const router = useRouter();
  const {
    currentWorkspace,
    refreshSessionsWithWorkspace,
    createSessionWithWorkspace,
    sessions,
    sessionsLoading,
    sessionsRefreshing,
  } = useOpenCode();

  useEffect(() => {
    if (currentWorkspace) {
      refreshSessionsWithWorkspace(currentWorkspace.path);
    }
  }, [currentWorkspace, refreshSessionsWithWorkspace]);

  const handleRefresh = useCallback(() => {
    if (currentWorkspace) {
      refreshSessionsWithWorkspace(currentWorkspace.path);
    }
  }, [currentWorkspace, refreshSessionsWithWorkspace]);

  const handleCreateSession = useCallback(async () => {
    if (!currentWorkspace) {
      Alert.alert('No Workspace', 'Please select a workspace first.');
      router.push('/workspaces');
      return;
    }

    try {
      await createSessionWithWorkspace();
    } catch (err) {
      Alert.alert('Error', 'Failed to create session');
    }
  }, [currentWorkspace, createSessionWithWorkspace, router]);

  const handleSelectSession = useCallback((session: Session) => {
    router.push(`/chat/${session.id}`);
  }, [router]);

  if (!currentWorkspace) {
    router.replace('/workspaces');
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: currentWorkspace.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateSession} style={{ padding: 8 }}>
              <Icon name="file-plus" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <SessionsScreen
          sessions={sessions}
          loading={sessionsLoading}
          refreshing={sessionsRefreshing}
          onRefresh={handleRefresh}
          onSelectSession={handleSelectSession}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});