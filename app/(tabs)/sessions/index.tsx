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

  const handleBack = useCallback(() => {
    router.push('/workspaces');
  }, [router]);

  if (!currentWorkspace) {
    router.replace('/workspaces');
    return null;
  }

  const topPadding = insets.top + spacing.sm;

  return (
    <View style={theme.container}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity 
          onPress={handleBack} 
          activeOpacity={0.8}
        >
          <GlassView style={styles.glassBackButton}>
            <Icon name="chevron-left" size={20} color={c.text} />
            <Text style={[styles.backText, { color: c.text }]}>Back</Text>
          </GlassView>
        </TouchableOpacity>
        
        <GlassView style={styles.glassTitlePill}>
          <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
            {currentWorkspace.name}
          </Text>
        </GlassView>
        
        <TouchableOpacity 
          onPress={handleCreateSession} 
          activeOpacity={0.8}
        >
          <GlassView style={styles.glassBackButton}>
            <Icon name="file-plus" size={20} color={c.text} />
            <Text style={[styles.backText, { color: c.text }]}>New</Text>
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  glassBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    gap: 4,
  },
  glassTitlePill: {
    flex: 1,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    alignItems: 'center',
  },
  backText: {
    ...typography.body,
    fontWeight: '500',
  },
  headerTitle: {
    ...typography.bodyMedium,
  },
  container: {
    flex: 1,
  },
});