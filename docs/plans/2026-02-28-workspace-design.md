# Workspace Feature Design

## Overview

Add a Workspace abstraction to the OpenCode AFK mobile app. Workspaces provide a local UI layer wrapping the project path, allowing users to organize sessions by directory and specify the `x-opencode-directory` header for API calls.

## Background

Currently, the app lists all sessions globally without workspace organization. The SDK supports creating sessions in specific directories via the `x-opencode-directory` HTTP header. This feature adds a local workspace concept to:

- Allow users to select a directory path for their sessions
- Organize sessions under different workspaces
- Pass the correct directory header to SDK calls

## Data Model

### Workspace

```typescript
interface Workspace {
  id: string;           // UUID
  name: string;         // User-friendly name (defaults to directory name)
  path: string;         // Absolute path (e.g., "/home/user/project")
  createdAt: number;    // Unix timestamp
}
```

- **Default Workspace**: A special workspace with path `/` (always exists, non-deletable)
- **Storage**: AsyncStorage key `@workspaces`

### Session (existing, extended)

The SDK's session type includes a `directory` field. We use this to filter sessions by workspace path.

## Navigation Structure

```
/app/index.tsx          → Redirects to /workspaces
/app/workspaces/
  ├── index.tsx         → Workspace list (includes "Default")
  └── create.tsx        → Create workspace with directory navigator
/app/(tabs)/
  └── sessions/
      └── index.tsx     → Sessions for selected workspace
```

## Implementation Details

### 1. Directory Navigator

Use `GET /files` endpoint to list directory contents:
- SDK call: `client.get('/files', { query: { path: currentPath } })`
- Filter items where `type === 'directory'`
- Navigate up with: `path.dirname(currentPath)` 
- Confirm selection → creates workspace with that path

### 2. Custom Headers for SDK

The SDK supports `fetchOptions` for custom headers:

```typescript
// session.list() with workspace
await client.session.list({
  fetchOptions: {
    headers: { 'x-opencode-directory': workspace.path }
  }
})

// session.create() with workspace
await client.session.create({
  fetchOptions: {
    headers: { 'x-opencode-directory': workspace.path }
  }
})
```

### 3. Provider Changes (OpenCodeProvider)

Add to state:
- `workspaces: Workspace[]`
- `currentWorkspace: Workspace | null`
- `sessionsLoading: boolean`
- `sessionsRefreshing: boolean`

Add methods:
- `loadWorkspaces()` - Load from AsyncStorage
- `createWorkspace(path: string)` - Create with directory name as default name
- `deleteWorkspace(id: string)` - Remove workspace
- `setCurrentWorkspace(workspace: Workspace)` - Select workspace
- `createSession(options?)` - Create with current workspace header
- `refreshSessions()` - Refresh with current workspace header

### 4. Screen Updates

#### Workspaces List (`app/workspaces/index.tsx`)
- List all workspaces + "Default" (path: "/")
- (+) button in header to create new workspace
- Tap workspace → navigate to sessions tab with workspace context
- Swipe to delete (except Default)

#### Create Workspace (`app/workspaces/create.tsx`)
- Directory navigator UI
- Shows current path breadcrumb
- Lists directories in current path
- Back button to navigate up
- Confirm button to create workspace
- Default name: last segment of path (e.g., "project" from "/home/user/project")

#### Sessions List (`app/(tabs)/sessions/index.tsx`)
- Show sessions filtered by current workspace
- (+) button in header to create new session
- Pull-to-refresh
- If no workspace selected, redirect to workspaces

### 5. UX Flow

1. **Launch** → Redirects to /workspaces
2. **Default workspace** shown with path "/" 
3. **Select workspace** → Sessions list loads with header
4. **Create workspace** → Directory navigator → Select path → Creates workspace
5. **Create session** → Calls SDK with workspace path in header

## Error Handling

- Directory list fails: Show error toast, allow retry
- Create workspace fails: Show error, allow retry
- Session operations fail: Show error state in UI
- Empty directories: Show "No directories" empty state

## Testing Considerations

- Test directory navigation at various depths
- Test workspace CRUD operations
- Test session creation with different workspaces
- Test persistence across app restarts
- Test "Default" workspace behavior (non-deletable)

## Acceptance Criteria

1. User can view list of workspaces including "Default"
2. User can create a new workspace by selecting a directory path
3. User can delete workspaces (except Default)
4. User can select a workspace to view its sessions
5. Sessions list shows only sessions for selected workspace
6. User can create sessions in the selected workspace
7. Sessions are created with correct `x-opencode-directory` header
8. Pull-to-refresh works on sessions list
9. Workspace data persists across app restarts
10. Default workspace path "/" shows sessions without explicit directory