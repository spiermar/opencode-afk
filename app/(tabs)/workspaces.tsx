import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { useOpenCode } from '../../src/hooks/useOpenCode';
import { useTheme } from '../../src/hooks/useTheme';
import { Icon } from '../../src/components/Icon';
import { spacing, typography } from '../../src/theme';

interface WorkspaceItem {
  id: string;
  name: string;
  path: string;
  isDefault?: boolean;
}

export default function WorkspacesTab() {
  const router = useRouter();
  const { theme, colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    workspaces,
    currentWorkspace,
    workspacesLoading,
    setCurrentWorkspace,
    deleteWorkspace,
  } = useOpenCode();

  const defaultWorkspace: WorkspaceItem = {
    id: 'default',
    name: 'Default',
    path: '/',
    isDefault: true,
  };

  const allWorkspaces: WorkspaceItem[] = [
    defaultWorkspace,
    ...workspaces.map(w => ({ ...w, isDefault: false })),
  ];

  const handleSelectWorkspace = useCallback(async (workspace: WorkspaceItem) => {
    await setCurrentWorkspace({
      id: workspace.id,
      name: workspace.name,
      path: workspace.path,
      createdAt: 0,
    });
    router.push('/(tabs)/sessions');
  }, [setCurrentWorkspace, router]);

  const handleDeleteWorkspace = useCallback((workspace: WorkspaceItem) => {
    if (workspace.isDefault) return;
    
    Alert.alert(
      'Delete Workspace',
      `Are you sure you want to delete "${workspace.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkspace(workspace.id),
        },
      ]
    );
  }, [deleteWorkspace]);

  const handleCreateWorkspace = useCallback(() => {
    router.push('/workspaces/create');
  }, [router]);

  const renderItem = useCallback(({ item }: { item: WorkspaceItem }) => {
    const isSelected = currentWorkspace?.path === item.path;
    
    return (
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: c.bgCard, borderColor: isSelected ? c.accent : c.border },
        ]}
        onPress={() => handleSelectWorkspace(item)}
        onLongPress={() => handleDeleteWorkspace(item)}
      >
        <Icon name="folder-open" size={24} color={c.text} />
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: c.text }]}>{item.name}</Text>
          <Text style={[styles.itemPath, { color: c.textMuted }]}>{item.path}</Text>
        </View>
        {isSelected && <Icon name="check" size={20} color={c.accent} />}
      </TouchableOpacity>
    );
  }, [currentWorkspace, c, handleSelectWorkspace, handleDeleteWorkspace]);

  const topPadding = insets.top + spacing.sm;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Workspaces</Text>
        <TouchableOpacity 
          onPress={handleCreateWorkspace}
          activeOpacity={0.8}
        >
          <GlassView style={styles.glassButton}>
            <Icon name="file-plus" size={20} color={c.text} />
            <Text style={[styles.buttonText, { color: c.text }]}>New</Text>
          </GlassView>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allWorkspaces}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={workspacesLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPath: {
    fontSize: 12,
    marginTop: 4,
  },
});