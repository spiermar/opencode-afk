import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useOpenCode } from '../../src/hooks/useOpenCode';
import { useTheme } from '../../src/hooks/useTheme';
import { Icon } from '../../src/components/Icon';

interface WorkspaceItem {
  id: string;
  name: string;
  path: string;
  isDefault?: boolean;
}

export default function WorkspacesScreen() {
  const router = useRouter();
  const { theme, colors: c } = useTheme();
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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workspaces',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/workspaces/create')}
              style={{ padding: 8 }}
            >
              <Icon name="file-plus" size={24} color={c.accent} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <FlatList
          data={allWorkspaces}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={workspacesLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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