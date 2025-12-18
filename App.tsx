import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OpenCodeProvider, useOpenCode, Session } from './src/providers/OpenCodeProvider';
import { useTheme } from './src/hooks/useTheme';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { Icon } from './src/components/Icon';
import { spacing, colors } from './src/theme';

type Tab = 'sessions' | 'settings';

type RootStackParamList = {
  Main: undefined;
  Chat: { session: Session };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main screen with tabs
function MainScreen({ navigation }: { navigation: any }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { theme, colors: c } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  
  const {
    sessions,
    sessionsLoading,
    sessionsRefreshing,
    refreshSessions,
    subscribeToSession,
    serverUrl,
    disconnect,
  } = useOpenCode();

  const handleSelectSession = useCallback((session: Session) => {
    subscribeToSession(session.id);
    navigation.navigate('Chat', { session });
  }, [navigation, subscribeToSession]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <View style={theme.container}>
      {activeTab === 'sessions' ? (
        <SessionsScreen
          sessions={sessions}
          loading={sessionsLoading}
          refreshing={sessionsRefreshing}
          onRefresh={refreshSessions}
          onSelectSession={handleSelectSession}
        />
      ) : (
        <SettingsScreen
          serverUrl={serverUrl}
          onDisconnect={handleDisconnect}
        />
      )}

      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        <BlurView
          intensity={isDark ? 60 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.tabBarBlur, { borderTopColor: c.border }]}
        >
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('sessions')}
            activeOpacity={0.7}
          >
            <Icon 
              name="message-square" 
              size={22} 
              color={activeTab === 'sessions' ? c.accent : c.textMuted} 
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === 'sessions' ? c.accent : c.textMuted }
            ]}>
              Sessions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('settings')}
            activeOpacity={0.7}
          >
            <Icon 
              name="settings" 
              size={22} 
              color={activeTab === 'settings' ? c.accent : c.textMuted} 
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === 'settings' ? c.accent : c.textMuted }
            ]}>
              Settings
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

// Chat screen wrapper to handle navigation props
function ChatScreenWrapper({ route, navigation }: { route: any; navigation: any }) {
  const { session } = route.params;
  const {
    getSessionMessages,
    isSessionMessagesLoading,
    isSessionMessagesRefreshing,
    refreshSessionMessages,
    unsubscribeFromSession,
  } = useOpenCode();

  const messages = getSessionMessages(session.id);
  const loading = isSessionMessagesLoading(session.id);
  const refreshing = isSessionMessagesRefreshing(session.id);

  // Unsubscribe when navigating away (including swipe back gesture)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      unsubscribeFromSession();
    });
    return unsubscribe;
  }, [navigation, unsubscribeFromSession]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ChatScreen
      session={session}
      messages={messages}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => refreshSessionMessages(session.id)}
      onBack={handleBack}
    />
  );
}

function AppNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  const {
    connected,
    connecting,
    error,
    serverUrl,
    connect,
    setServerUrl,
  } = useOpenCode();

  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnectAttempted) {
      setAutoConnectAttempted(true);
      connect();
    }
  }, [autoConnectAttempted, connect]);

  const handleConnect = useCallback(() => {
    connect(serverUrl);
  }, [connect, serverUrl]);

  // Custom navigation theme
  const navigationTheme = useMemo(() => ({
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: c.bg,
      card: c.bgElevated,
      text: c.text,
      border: c.border,
      primary: c.accent,
    },
  }), [isDark, c]);

  // Show connect screen if not connected
  if (!connected) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ConnectScreen
          serverUrl={serverUrl}
          onServerUrlChange={setServerUrl}
          onConnect={handleConnect}
          connecting={connecting}
          error={error}
        />
      </>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreenWrapper}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <OpenCodeProvider>
      <AppNavigator />
    </OpenCodeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBlur: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
