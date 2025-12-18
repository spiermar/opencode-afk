import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useOpenCode, Session } from './src/hooks/useOpenCode';
import { useTheme } from './src/hooks/useTheme';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { Icon } from './src/components/Icon';
import { spacing, radius } from './src/theme';

type Tab = 'sessions' | 'projects';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { theme, colors: c } = useTheme();
  
  const {
    connected,
    connecting,
    error,
    serverUrl,
    connect,
    disconnect,
    setServerUrl,
    getSessions,
    getProjects,
    getSessionMessages,
  } = useOpenCode();

  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
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

  const handleDisconnect = useCallback(() => {
    disconnect();
    setSelectedSession(null);
  }, [disconnect]);

  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session);
  }, []);

  const handleBackFromChat = useCallback(() => {
    setSelectedSession(null);
  }, []);

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

  // Show chat screen if session is selected
  if (selectedSession) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ChatScreen
          session={selectedSession}
          getSessionMessages={getSessionMessages}
          onBack={handleBackFromChat}
        />
      </>
    );
  }

  // Main tabbed interface
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={theme.container}>
        {activeTab === 'sessions' ? (
          <SessionsScreen
            getSessions={getSessions}
            onSelectSession={handleSelectSession}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <ProjectsScreen
            getProjects={getProjects}
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
              onPress={() => setActiveTab('projects')}
              activeOpacity={0.7}
            >
              <Icon 
                name="folder-open" 
                size={22} 
                color={activeTab === 'projects' ? c.accent : c.textMuted} 
              />
              <Text style={[
                styles.tabLabel,
                { color: activeTab === 'projects' ? c.accent : c.textMuted }
              ]}>
                Projects
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </>
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
