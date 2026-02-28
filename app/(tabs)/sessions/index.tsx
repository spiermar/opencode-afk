import { useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { SessionsScreen } from '../../../src/screens/SessionsScreen';
import { useOpenCode, Session } from '../../../src/providers/OpenCodeProvider';
import { Icon } from '../../../src/components/Icon';
import { useTheme } from '../../../src/hooks/useTheme';
import { spacing, typography } from '../../../src/theme';

export default function Sessions() {
  const router = useRouter();
  const { theme, colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    currentWorkspace,
    refreshSessions,
    createSession,
    sessions,
    sessionsLoading,
    sessionsRefreshing,
  } = useOpenCode();

  useEffect(() => {
    refreshSessions();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleCreateSession = useCallback(async () => {
    try {
      await createSession();
    } catch (err) {
      Alert.alert('Error', 'Failed to create session');
    }
  }, [createSession, router]);

  const handleSelectSession = useCallback((session: Session) => {
    router.push(`/chat/${session.id}`);
  }, [router]);

  useEffect(() => {
    refreshSessions();
  }, []);

  const topPadding = insets.top + spacing.sm;

  if (!currentWorkspace) {
    return (
      <View style={theme.container}>
        <View style={[styles.header, { paddingTop: topPadding }]}>
          <Text style={[styles.headerTitle, { color: c.text }]}>Sessions</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            No workspace selected
          </Text>
          <Text style={[styles.emptySubtext, { color: c.textMuted }]}>
            Go to Workspaces to select a workspace
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={theme.container}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {currentWorkspace.name}
        </Text>
        
        <TouchableOpacity 
          onPress={handleCreateSession} 
          activeOpacity={0.8}
        >
          <GlassView style={styles.glassButton}>
            <Icon name="file-plus" size={20} color={c.text} />
            <Text style={[styles.buttonText, { color: c.text }]}>New</Text>
          </GlassView>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <SessionsScreen
          sessions={sessions}
          loading={sessionsLoading}
          refreshing={sessionsRefreshing}
          onRefresh={handleRefresh}
          onSelectSession={handleSelectSession}
          workspacePath={currentWorkspace.path}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.title,
  },
  glassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    gap: 4,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.title,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});