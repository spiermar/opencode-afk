# Workspace Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add workspace abstraction to organize sessions by directory path, with local storage and x-opencode-directory header support.

**Architecture:** Add workspace state to OpenCodeProvider, create new screens for workspace list and directory navigator, modify sessions list to filter by workspace.

**Tech Stack:** React Native, Expo Router, AsyncStorage, @opencode-ai/sdk

---

## Phase 1: Provider Updates

### Task 1: Add Workspace Types and Storage Keys

**Files:**
- Modify: `src/providers/OpenCodeProvider.tsx`

**Step 1: Add types and storage key**

Add after existing interfaces (around line 10):

```typescript
interface Workspace {
  id: string;
  name: string;
  path: string;
  createdAt: number;
}

const STORAGE_KEYS = {
  // ... existing
  workspaces: '@workspaces',
  currentWorkspace: '@currentWorkspace',
} as const;
```

**Step 2: Add state and commit**

Run: `git add src/providers/OpenCodeProvider.tsx && git commit -m "feat: add workspace types and storage keys"`

---

### Task 2: Add Workspace State and Methods

**Files:**
- Modify: `src/providers/OpenCodeProvider.tsx`

**Step 1: Add workspace state**

Add after `sessionsRefreshing` state (around line 100):

```typescript
const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
const [workspacesLoading, setWorkspacesLoading] = useState(true);
```

**Step 2: Add loadWorkspaces function**

Add after `initialize` function (around line 200):

```typescript
const loadWorkspaces = useCallback(async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.workspaces);
    const loaded = stored ? JSON.parse(stored) : [];
    setWorkspaces(loaded);

    const currentStored = await AsyncStorage.getItem(STORAGE_KEYS.currentWorkspace);
    if (currentStored) {
      setCurrentWorkspaceState(JSON.parse(currentStored));
    }
  } catch (err) {
    console.error('Failed to load workspaces:', err);
  } finally {
    setWorkspacesLoading(false);
  }
}, []);

const setCurrentWorkspace = useCallback(async (workspace: Workspace | null) => {
  setCurrentWorkspaceState(workspace);
  if (workspace) {
    await AsyncStorage.setItem(STORAGE_KEYS.currentWorkspace, JSON.stringify(workspace));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.currentWorkspace);
  }
}, []);
```

**Step 3: Add createWorkspace function**

Add after `setCurrentWorkspace`:

```typescript
const createWorkspace = useCallback(async (path: string, name?: string) => {
  const dirName = name || path.split('/').filter(Boolean).pop() || 'Workspace';
  const workspace: Workspace = {
    id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: dirName,
    path,
    createdAt: Date.now(),
  };
  const updated = [...workspaces, workspace];
  setWorkspaces(updated);
  await AsyncStorage.setItem(STORAGE_KEYS.workspaces, JSON.stringify(updated));
  return workspace;
}, [workspaces]);
```

**Step 4: Add deleteWorkspace function**

Add after `createWorkspace`:

```typescript
const deleteWorkspace = useCallback(async (id: string) => {
  const updated = workspaces.filter(w => w.id !== id);
  setWorkspaces(updated);
  await AsyncStorage.setItem(STORAGE_KEYS.workspaces, JSON.stringify(updated));
  if (currentWorkspace?.id === id) {
    await setCurrentWorkspace(null);
  }
}, [workspaces, currentWorkspace, setCurrentWorkspace]);
```

**Step 5: Add createSession with workspace header**

Modify existing session creation or add new method:

```typescript
const createSessionWithWorkspace = useCallback(async (options?: { parentID?: string; title?: string }) => {
  if (!currentWorkspace || !client) return null;
  
  const headers: Record<string, string> = {};
  if (currentWorkspace.path !== '/') {
    headers['x-opencode-directory'] = currentWorkspace.path;
  }

  try {
    const result = await client.session.create({
      body: {
        parentID: options?.parentID,
        title: options?.title,
      },
      fetchOptions: {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      },
    });
    
    // Refresh sessions after creating
    await refreshSessionsWithWorkspace(currentWorkspace.path);
    
    return result;
  } catch (err) {
    console.error('Failed to create session:', err);
    throw err;
  }
}, [client, currentWorkspace]);
```

**Step 6: Add refreshSessionsWithWorkspace function**

Add after existing `refreshSessions`:

```typescript
const refreshSessionsWithWorkspace = useCallback(async (workspacePath: string) => {
  if (!client) return;
  
  setSessionsRefreshing(true);
  try {
    const headers: Record<string, string> = {};
    if (workspacePath !== '/') {
      headers['x-opencode-directory'] = workspacePath;
    }

    const result = await client.session.list({
      fetchOptions: {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      },
    });
    
    setSessions((result.data ?? []) as Session[]);
  } catch (err) {
    console.error('Failed to refresh sessions:', err);
    setError((err as Error).message);
  } finally {
    setSessionsRefreshing(false);
  }
}, [client]);
```

**Step 7: Add useEffect to load workspaces on init**

Find the initialize function's useEffect and add workspace loading:

```typescript
useEffect(() => {
  initialize();
  loadWorkspaces(); // Add this line
}, [initialize, loadWorkspaces]);
```

**Step 8: Expose in context value**

Add to the provider's context value object:

```typescript
{
  // ... existing
  workspaces,
  currentWorkspace,
  workspacesLoading,
  createWorkspace,
  deleteWorkspace,
  setCurrentWorkspace,
  createSessionWithWorkspace,
  refreshSessionsWithWorkspace,
}
```

**Step 9: Commit**

Run: `git add src/providers/OpenCodeProvider.tsx && git commit -m "feat: add workspace state and methods to provider"`

---

## Phase 2: Update useOpenCode Hook

### Task 3: Expose Workspace in Hook

**Files:**
- Modify: `src/hooks/useOpenCode.ts`

**Step 1: Add workspace exports**

Add after existing exports (around line 30):

```typescript
export function useOpenCode() {
  const context = useContext(OpenCodeContext);
  
  if (!context) {
    throw new Error('useOpenCode must be used within OpenCodeProvider');
  }
  
  const {
    // ... existing
    workspaces,
    currentWorkspace,
    workspacesLoading,
    createWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    createSessionWithWorkspace,
    refreshSessionsWithWorkspace,
  } = context;
  
  return {
    // ... existing
    workspaces,
    currentWorkspace,
    workspacesLoading,
    createWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    createSessionWithWorkspace,
    refreshSessionsWithWorkspace,
  };
}
```

**Step 2: Commit**

Run: `git add src/hooks/useOpenCode.ts && git commit -m "feat: expose workspace methods in useOpenCode hook"`

---

## Phase 3: Create Workspace Screens

### Task 4: Create Workspace List Screen

**Files:**
- Create: `app/workspaces/index.tsx`

**Step 1: Write the screen**

```typescript
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
import { useOpenCode } from '../src/hooks/useOpenCode';
import { useTheme } from '../src/hooks/useTheme';
import { Icon } from '../src/components/Icon';

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
        <Icon name="folder" size={24} color={c.text} />
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
              <Icon name="plus" size={24} color={c.accent} />
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
```

**Step 2: Commit**

Run: `git add app/workspaces/index.tsx && git commit -m "feat: create workspace list screen"`

---

### Task 5: Create Directory Navigator Screen

**Files:**
- Create: `app/workspaces/create.tsx`

**Step 1: Write the screen**

```typescript
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
  type: 'file' | 'directory';
}

export default function CreateWorkspaceScreen() {
  const router = useRouter();
  const { client } = useOpenCode();
  const { theme, colors: c } = useTheme();
  const { createWorkspace, setCurrentWorkspace } = useOpenCode();

  const [currentPath, setCurrentPath] = useState('/');
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDirectories = useCallback(async (path: string) => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.get('/files', {
        query: { path },
      });
      
      const dirs = (response.data?.files || []).filter(
        (item: DirectoryItem) => item.type === 'directory'
      );
      setDirectories(dirs.sort((a: DirectoryItem, b: DirectoryItem) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadDirectories(currentPath);
  }, [currentPath, loadDirectories]);

  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const handleSelectDirectory = useCallback(async (dir: DirectoryItem) => {
    const workspace = await createWorkspace(dir.path);
    await setCurrentWorkspace(workspace);
    router.replace('/(tabs)/sessions');
  }, [createWorkspace, setCurrentWorkspace, router]);

  const pathParts = currentPath.split('/').filter(Boolean);

  const renderItem = useCallback(({ item }: { item: DirectoryItem }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: c.bgCard }]}
      onPress={() => handleSelectDirectory(item)}
    >
      <Icon name="folder" size={24} color={c.text} />
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
```

**Step 2: Commit**

Run: `git add app/workspaces/create.tsx && git commit -m "feat: create directory navigator screen"`

---

## Phase 4: Update Sessions Screen

### Task 6: Modify Sessions Screen for Workspace Context

**Files:**
- Modify: `app/(tabs)/sessions/index.tsx`

**Step 1: Read current implementation**

Check current file structure first.

**Step 2: Update the screen**

Replace content with:

```typescript
import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useOpenCode } from '../../../src/hooks/useOpenCode';
import { SessionsScreen } from '../../../src/screens/SessionsScreen';

export default function SessionsScreenWrapper() {
  const router = useRouter();
  const {
    currentWorkspace,
    refreshSessionsWithWorkspace,
    createSessionWithWorkspace,
    sessions,
    sessionsLoading,
    sessionsRefreshing,
    refreshSessions, // fallback
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

  // Redirect to workspaces if none selected
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
            <View style={{ padding: 8 }}>
              {/* Add create session button - would need Icon component wrapper */}
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <SessionsScreen
          sessions={sessions}
          loading={sessionsLoading}
          refreshing={sessionsRefreshing}
          onRefresh={handleRefresh}
          onCreateSession={handleCreateSession}
          emptyMessage={`No sessions in ${currentWorkspace.name}. Tap + to create one.`}
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
```

**Step 3: Commit**

Run: `git add app/(tabs)/sessions/index.tsx && git commit -m "feat: modify sessions screen for workspace context"`

---

### Task 7: Update SessionsScreen Component

**Files:**
- Modify: `src/screens/SessionsScreen.tsx`

**Step 1: Add create session button and pull-to-refresh support**

Add props interface and update component:

```typescript
interface SessionsScreenProps {
  sessions: Session[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCreateSession: () => void;
  emptyMessage?: string;
}

export function SessionsScreen({
  sessions,
  loading,
  refreshing,
  onRefresh,
  onCreateSession,
  emptyMessage = 'No Sessions',
}: SessionsScreenProps) {
  // ... existing code, update FlatList to include:
  // - refreshing={refreshing}
  // - onRefresh={onRefresh}
  
  // Add headerRight with + button that calls onCreateSession
}
```

**Step 2: Commit**

Run: `git add src/screens/SessionsScreen.tsx && git commit -m "feat: update SessionsScreen with create session button"`

---

## Phase 5: Update Navigation

### Task 8: Update Root Layout Redirect

**Files:**
- Modify: `app/index.tsx`

**Step 1: Change redirect target**

```typescript
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to workspaces instead of tabs
  return <Redirect href="/workspaces" />;
}
```

**Step 2: Commit**

Run: `git add app/index.tsx && git commit -m "feat: redirect to workspaces on app launch"`

---

### Task 9: Ensure Workspaces is a Stack Navigator

**Files:**
- Create: `app/workspaces/_layout.tsx`

**Step 1: Create layout**

```typescript
import { Stack } from 'expo-router';

export default function WorkspacesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Workspaces' }} />
      <Stack.Screen
        name="create"
        options={{
          title: 'Select Directory',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

**Step 2: Commit**

Run: `git add app/workspaces/_layout.tsx && git commit -m "feat: create workspaces stack layout"`

---

## Phase 6: Type Check and Test

### Task 10: Run TypeScript Check

**Step 1: Run tsc**

Run: `npx tsc --noEmit`

Fix any type errors. Commit any fixes.

---

## Summary of Commits

1. `feat: add workspace types and storage keys`
2. `feat: add workspace state and methods to provider`
3. `feat: expose workspace methods in useOpenCode hook`
4. `feat: create workspace list screen`
5. `feat: create directory navigator screen`
6. `feat: modify sessions screen for workspace context`
7. `feat: update SessionsScreen with create session button`
8. `feat: redirect to workspaces on app launch`
9. `feat: create workspaces stack layout`
10. `fix: type errors and final fixes`

---

**Plan complete and saved to `docs/plans/2026-02-28-workspace-implementation.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**