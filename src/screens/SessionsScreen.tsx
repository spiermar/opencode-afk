import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Icon } from '../components/Icon';
import { spacing, radius, typography } from '../theme';
import type { Session } from '../hooks/useOpenCode';

interface SessionsScreenProps {
  getSessions: () => Promise<Session[]>;
  onSelectSession: (session: Session) => void;
  onDisconnect: () => void;
}

export function SessionsScreen({
  getSessions,
  onSelectSession,
  onDisconnect,
}: SessionsScreenProps) {
  const { theme, colors: c } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    const data = await getSessions();
    const sorted = data.sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || '';
      const dateB = b.updatedAt || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
    setSessions(sorted);
    setLoading(false);
  }, [getSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={[styles.sessionItem, { backgroundColor: c.bgCard, borderBottomColor: c.divider }]}
      onPress={() => onSelectSession(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.sessionIcon, { backgroundColor: c.accentSubtle }]}>
        <Icon name="message-square" size={20} color={c.accent} />
      </View>
      
      <View style={styles.sessionContent}>
        <Text style={[theme.bodyMedium]} numberOfLines={1}>
          {item.title || 'Untitled Session'}
        </Text>
        <Text style={[theme.small, theme.textSecondary]}>
          {formatDate(item.updatedAt || item.createdAt)}
        </Text>
      </View>
      
      <Icon name="chevron-right" size={20} color={c.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={theme.container}>
      {/* Header */}
      <View style={[theme.header]}>
        <View>
          <Text style={theme.title}>Sessions</Text>
          <Text style={[theme.small, theme.textSecondary]}>
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.disconnectButton}
          onPress={onDisconnect}
          activeOpacity={0.7}
        >
          <Icon name="logout" size={20} color={c.error} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
        contentContainerStyle={[
          styles.list,
          sessions.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: c.accentSubtle }]}>
              <Icon name="message-square" size={32} color={c.accent} />
            </View>
            <Text style={[theme.subtitle, { marginTop: spacing.lg }]}>
              {loading ? 'Loading...' : 'No Sessions'}
            </Text>
            <Text style={[theme.body, theme.textSecondary, styles.emptyText]}>
              {loading 
                ? 'Fetching your sessions' 
                : 'Start a conversation in OpenCode to see it here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  disconnectButton: {
    padding: spacing.sm,
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionContent: {
    flex: 1,
    marginLeft: spacing.lg,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
