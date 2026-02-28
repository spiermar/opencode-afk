# AGENTS.md - OpenCode AFK Development Guide

## Overview

OpenCode AFK is a mobile client for OpenCode, built with Expo (React Native). This guide covers development conventions for agents working in this codebase.

## Build & Development Commands

### Running the App

```bash
# Start Expo development server
npm start
# or: npx expo start

# Run on iOS simulator
npm run ios
# or: press 'i' in Expo CLI

# Run on Android emulator
npm run android
# or: press 'a' in Expo CLI

# Run on web
npm run web
# or: npx expo start --web
```

### Type Checking

```bash
# Run TypeScript type checking (no emit)
npx tsc --noEmit
```

Note: No ESLint or Prettier is configured. Run `tsc --noEmit` before committing.

### Testing

**No test framework is currently configured.** If adding tests, use:
- Jest (default with Expo)
- `@testing-library/react-native` for component tests
- `npx jest` to run tests

To run a single test file:
```bash
npx jest path/to/test-file.test.ts
# or with coverage:
npx jest --coverage path/to/test-file.test.ts
```

## Project Structure

```
opencode-afk/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Redirects to connect or sessions
│   ├── connect.tsx         # Server connection screen
│   ├── chat/[id].tsx       # Chat session screen
│   └── (tabs)/             # Tab navigation group
│       ├── _layout.tsx     # Tab navigator config
│       ├── sessions/       # Sessions list
│       └── settings.tsx    # Settings screen
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── GlassCard.tsx
│   │   ├── Icon.tsx        # lucide-react-native wrapper
│   │   └── Markdown.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useOpenCode.ts  # Legacy hook (prefer context)
│   │   └── useTheme.ts     # Theme hook for colors/styles
│   ├── providers/          # Context providers
│   │   └── OpenCodeProvider.tsx  # Main state management
│   ├── screens/            # Screen components (legacy, prefer app/)
│   └── theme/              # Design system
│       └── index.ts        # Colors, spacing, typography, shadows
├── package.json
└── tsconfig.json
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled**: All TypeScript features must work with strict mode
- Use explicit types for function parameters and return values
- Use `type` for interfaces and unions, `interface` for object shapes
- Prefer `as` casting for error handling: `(err as Error).message`

```typescript
// Good
interface Session {
  id: string;
  title?: string;
}

function connect(url: string): Promise<boolean> { ... }

// Error handling pattern
catch (err) {
  setError((err as Error).message);
}
```

### Components

- Use functional components with hooks exclusively
- Component files: PascalCase (e.g., `ConnectScreen.tsx`)
- Props interface named `<ComponentName>Props` and defined in the same file
- Use `StyleSheet.create()` for component styles at the bottom of the file

```typescript
interface ConnectScreenProps {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
}

export function ConnectScreen({
  serverUrl,
  onServerUrlChange,
}: ConnectScreenProps) {
  const { theme, colors: c } = useTheme();
  // ...
}

const styles = StyleSheet.create({ ... });
```

### Imports

Order imports consistently:
1. React core imports (`import React, { ... } from 'react'`)
2. Third-party library imports
3. Relative imports from src/ (use `./` or `../`)
4. Relative imports from app/ (for routes)

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../components/Icon';
import { useTheme } from '../hooks/useTheme';
import { spacing, radius, typography } from '../theme';
```

### Hooks

- Custom hooks: `useCamelCase` naming (e.g., `useTheme`, `useOpenCode`)
- Always wrap callbacks with `useCallback` when passed as props
- Use `useMemo` for expensive computations

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: camelCase or UPPER_SNAKE_CASE for config
- **Types/Interfaces**: PascalCase
- **React components**: PascalCase

### Error Handling

- Use try/catch for async operations
- Set error state for user-facing errors
- Use `console.error` for development logging
- Type cast errors: `(err as Error).message`

### Theme System

Always use the theme system for colors, spacing, and typography:

```typescript
const { theme, colors: c } = useTheme();

// Access colors: c.text, c.bg, c.accent, c.error, etc.
// Access spacing: spacing.md, spacing.lg, etc.
// Use theme objects: theme.container, theme.card, theme.body
```

Available theme colors include: `bg`, `bgElevated`, `bgCard`, `text`, `textSecondary`, `textMuted`, `accent`, `error`, `success`, `border`, etc.

### Navigation

- Uses Expo Router (file-based routing)
- Use `<Redirect />` for programmatic redirects
- Stack navigation with `Stack.Screen`
- Group routes with parentheses: `(tabs)/`

```typescript
import { Redirect } from 'expo-router';

return <Redirect href="/(tabs)/sessions" />;
```

### Icons

Use the Icon component from `../components/Icon`:

```typescript
import { Icon } from '../components/Icon';

// Available icons: 'zap', 'wifi', 'settings', 'user', 'bot', etc.
<Icon name="zap" size={24} color={c.text} />
```

### Async Storage

Use `@react-native-async-storage/async-storage` for persistent storage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save
await AsyncStorage.setItem('key', value);

// Load
const value = await AsyncStorage.getItem('key');
```

## Commit Convention

Follow Conventional Commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## Additional Notes

- This is an Expo SDK 54 project with React Native 0.81.5
- Target iOS and Android (physical device via Expo Go or simulator)
- Default server URL: `http://localhost:9034`
- Uses @opencode-ai/sdk for API communication
- Supports dark/light themes (follows system preference)