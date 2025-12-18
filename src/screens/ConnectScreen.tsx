import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from '../components/GlassCard';
import { Icon } from '../components/Icon';
import { spacing, radius, typography } from '../theme';

interface ConnectScreenProps {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
}

export function ConnectScreen({
  serverUrl,
  onServerUrlChange,
  onConnect,
  connecting,
  error,
}: ConnectScreenProps) {
  const { theme, colors: c } = useTheme();

  return (
    <SafeAreaView style={theme.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo/Hero */}
          <View style={styles.hero}>
            <View style={[styles.logoContainer, { backgroundColor: c.accent }]}>
              <Icon name="zap" size={36} color={c.textInverse} strokeWidth={2.5} />
            </View>
            <Text style={[theme.hero, styles.title]}>OpenPad</Text>
            <Text style={[theme.body, theme.textSecondary, styles.subtitle]}>
              Connect to your OpenCode server to get started
            </Text>
          </View>

          {/* Connection Form */}
          <GlassCard style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={[theme.smallMedium, theme.textSecondary, styles.label]}>
                Server URL
              </Text>
              <TextInput
                style={[theme.input, styles.input]}
                value={serverUrl}
                onChangeText={onServerUrlChange}
                placeholder="http://192.168.1.100:4096"
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!connecting}
                returnKeyType="go"
                onSubmitEditing={onConnect}
              />
            </View>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: `${c.error}15` }]}>
                <Icon name="alert" size={18} color={c.error} />
                <Text style={[theme.small, { color: c.error, marginLeft: spacing.sm, flex: 1 }]}>
                  {error}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                theme.buttonPrimary,
                styles.connectButton,
                connecting && styles.buttonDisabled,
              ]}
              onPress={onConnect}
              disabled={connecting}
              activeOpacity={0.8}
            >
              {connecting ? (
                <ActivityIndicator color={c.textInverse} size="small" />
              ) : (
                <>
                  <Icon name="wifi" size={20} color={c.textInverse} />
                  <Text style={[theme.buttonPrimaryText, styles.buttonText]}>
                    Connect
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </GlassCard>

          {/* Status */}
          <View style={styles.statusRow}>
            <View style={[
              theme.statusDot,
              connecting ? theme.statusPending : { backgroundColor: c.textMuted }
            ]} />
            <Text style={theme.caption}>
              {connecting ? 'Connecting to server...' : 'Ready to connect'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
});
