import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useOpenCode } from '../../src/hooks/useOpenCode';
import { useTheme } from '../../src/hooks/useTheme';
import { Icon } from '../../src/components/Icon';

interface DirectoryItem {
  name: string;
  path: string;
  absolute?: string;
  type: 'file' | 'directory';
}

export default function CreateWorkspaceScreen() {
  const router = useRouter();
  const { serverUrl } = useOpenCode();
  const { theme, colors: c } = useTheme();
  const { createWorkspace, setCurrentWorkspace } = useOpenCode();

  const [currentPath, setCurrentPath] = useState('/');
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDirectories = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = new URL(`${serverUrl}/file`);
      url.searchParams.set('path', path);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      const dirs = (data || []).filter(
        (item: DirectoryItem) => item.type === 'directory'
      );
      setDirectories(dirs.sort((a: DirectoryItem, b: DirectoryItem) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    loadDirectories(currentPath);
  }, [currentPath, loadDirectories]);

  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const handleSelectDirectory = useCallback(async (dir: DirectoryItem) => {
    const workspace = await createWorkspace(dir.absolute || dir.path, dir.name);
    await setCurrentWorkspace(workspace);
    router.replace('/(tabs)/sessions');
  }, [createWorkspace, setCurrentWorkspace, router]);

  const pathParts = currentPath.split('/').filter(Boolean);

  const renderItem = useCallback(({ item }: { item: DirectoryItem }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: c.bgCard }]}
      onPress={() => handleSelectDirectory(item)}
    >
      <Icon name="folder-open" size={24} color={c.text} />
      <Text style={[styles.itemName, { color: c.text }]}>{item.name}</Text>
    </TouchableOpacity>
  ), [c, handleSelectDirectory]);

  const renderBreadcrumb = () => {
    const parts = ['/'];
    let cumulative = '';
    
    pathParts.forEach(part => {
      cumulative += '/' + part;
      parts.push(cumulative);
    });

    return (
      <View style={[styles.breadcrumb, { backgroundColor: c.bgCard }]}>
        <FlatList
          horizontal
          data={parts}
          keyExtractor={(item, index) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isLast = index === parts.length - 1;
            const label = index === 0 ? 'Root' : pathParts[index - 1];
            
            return (
              <View style={styles.breadcrumbItem}>
                <TouchableOpacity
                  onPress={() => handleNavigate(item)}
                  disabled={isLast}
                >
                  <Text
                    style={[
                      styles.breadcrumbText,
                      { color: isLast ? c.text : c.accent },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
                {!isLast && <Text style={{ color: c.textMuted }}> / </Text>}
              </View>
            );
          }}
        />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Directory',
        }}
      />
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        {renderBreadcrumb()}
        
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={c.accent} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={{ color: c.error }}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: c.accent }]}
              onPress={() => loadDirectories(currentPath)}
            >
              <Text style={{ color: c.bg }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : directories.length === 0 ? (
          <View style={styles.centered}>
            <Text style={{ color: c.textMuted }}>No directories found</Text>
          </View>
        ) : (
          <FlatList
            data={directories}
            renderItem={renderItem}
            keyExtractor={item => item.path}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  breadcrumb: {
    padding: 12,
    marginBottom: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 14,
    paddingHorizontal: 4,
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
  },
  itemName: {
    fontSize: 16,
    marginLeft: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});