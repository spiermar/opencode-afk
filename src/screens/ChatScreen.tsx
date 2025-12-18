import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';
import { Markdown } from '../components/Markdown';
import { Icon, IconName } from '../components/Icon';
import { spacing, radius, typography } from '../theme';
import type { Session, MessageWithParts, MessagePart } from '../hooks/useOpenCode';

interface ChatScreenProps {
  session: Session;
  getSessionMessages: (sessionId: string) => Promise<MessageWithParts[]>;
  onBack: () => void;
}

// Get icon for tool type
function getToolIcon(toolName: string): IconName {
  const iconMap: Record<string, IconName> = {
    'read': 'file-text',
    'write': 'file-plus',
    'edit': 'pencil',
    'bash': 'terminal',
    'glob': 'folder-search',
    'grep': 'search',
    'list': 'folder-open',
    'todowrite': 'list-todo',
    'todoread': 'list-todo',
    'task': 'play',
    'webfetch': 'globe',
    'websearch': 'globe',
    'codesearch': 'search',
  };
  return iconMap[toolName] || 'zap';
}

// Extract meaningful info from tool input/output
interface ToolDetails {
  label: string;
  detail?: string;
  expandedContent?: {
    input?: string;
    output?: string;
    filePath?: string;
    command?: string;
    todos?: any[];
  };
}

function getToolDetails(toolName: string, state: any): ToolDetails | null {
  const input = state?.input;
  const output = state?.output;
  
  // Clean output - remove line numbers if present
  const cleanOutput = (text: string | undefined) => {
    if (!text) return undefined;
    // Remove <file> tags and line number prefixes like "00001| "
    return text
      .replace(/<\/?file>/g, '')
      .replace(/^\d{5}\| /gm, '')
      .trim()
      .substring(0, 800);
  };
  
  switch (toolName) {
    case 'read': {
      const filePath = input?.filePath;
      const fileName = filePath?.split('/').pop() || filePath;
      return { 
        label: 'Read file', 
        detail: fileName,
        expandedContent: {
          filePath,
          output: cleanOutput(output),
        }
      };
    }
    case 'write': {
      const filePath = input?.filePath;
      const fileName = filePath?.split('/').pop() || filePath;
      return { 
        label: 'Wrote file', 
        detail: fileName,
        expandedContent: { filePath }
      };
    }
    case 'edit': {
      const filePath = input?.filePath;
      const fileName = filePath?.split('/').pop() || filePath;
      return { 
        label: 'Edited', 
        detail: fileName,
        expandedContent: { filePath }
      };
    }
    case 'bash': {
      const command = input?.command;
      const description = input?.description;
      return { 
        label: 'Ran', 
        detail: description || (command?.length > 40 ? command.substring(0, 37) + '...' : command),
        expandedContent: {
          command,
          output: cleanOutput(output),
        }
      };
    }
    case 'glob': {
      const pattern = input?.pattern;
      return { 
        label: 'Found files', 
        detail: pattern,
        expandedContent: { output: cleanOutput(output) }
      };
    }
    case 'grep': {
      const pattern = input?.pattern;
      return { 
        label: 'Searched', 
        detail: pattern,
        expandedContent: { output: cleanOutput(output) }
      };
    }
    case 'list': {
      const path = input?.path;
      const dirName = path?.split('/').pop() || path;
      return { 
        label: 'Listed', 
        detail: dirName || 'directory',
        expandedContent: { output: cleanOutput(output) }
      };
    }
    case 'todowrite': {
      const todos = input?.todos;
      const count = Array.isArray(todos) ? todos.length : 0;
      return { 
        label: 'Updated todos', 
        detail: `${count} item${count !== 1 ? 's' : ''}`,
        expandedContent: { todos }
      };
    }
    case 'todoread': {
      return { 
        label: 'Read todos',
        expandedContent: { output: cleanOutput(output) }
      };
    }
    case 'task': {
      const description = input?.description;
      return { 
        label: 'Task', 
        detail: description,
        expandedContent: { output: cleanOutput(output) }
      };
    }
    case 'webfetch': {
      const url = input?.url;
      let hostname = 'URL';
      try {
        hostname = new URL(url).hostname;
      } catch {}
      return { 
        label: 'Fetched', 
        detail: hostname,
        expandedContent: { output: cleanOutput(output) }
      };
    }
    case 'websearch':
    case 'codesearch': {
      const query = input?.query;
      const shortQuery = query?.length > 35 ? query.substring(0, 32) + '...' : query;
      return { 
        label: 'Searched', 
        detail: shortQuery,
        expandedContent: { output: cleanOutput(output) }
      };
    }
    default:
      return { 
        label: toolName,
        expandedContent: { output: cleanOutput(output) }
      };
  }
}

function ToolBlock({ part, colors }: { part: any; colors: any }) {
  const [expanded, setExpanded] = useState(false);
  const stateObj = part.state;
  const status = typeof stateObj === 'object' ? stateObj?.status : stateObj;
  const isComplete = status === 'completed' || status === 'complete' || status === 'result';
  const toolName = part.tool || part.toolName || 'tool';
  
  const icon = getToolIcon(toolName);
  const details = getToolDetails(toolName, stateObj);
  const hasExpandedContent = details?.expandedContent && (
    details.expandedContent.output || 
    details.expandedContent.command || 
    details.expandedContent.filePath ||
    details.expandedContent.todos
  );
  
  const accentColor = isComplete ? colors.success : colors.warning;
  
  return (
    <View style={[styles.toolBlock, { borderLeftColor: accentColor }]}>
      <TouchableOpacity 
        style={styles.toolRow} 
        onPress={() => hasExpandedContent && setExpanded(!expanded)}
        activeOpacity={hasExpandedContent ? 0.7 : 1}
      >
        <Icon name={icon} size={16} color={colors.textSecondary} />
        <Text style={[styles.toolLabel, { color: colors.textSecondary }]}>
          {details?.label || toolName}
        </Text>
        {details?.detail && (
          <Text style={[styles.toolDetail, { color: colors.text }]} numberOfLines={1}>
            {details.detail}
          </Text>
        )}
        <View style={styles.toolRight}>
          <Icon 
            name="check" 
            size={14} 
            color={accentColor} 
          />
          {hasExpandedContent && (
            <Icon 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={colors.textMuted} 
            />
          )}
        </View>
      </TouchableOpacity>
      
      {expanded && details?.expandedContent && (
        <View style={styles.toolExpanded}>
          {details.expandedContent.filePath && (
            <View style={styles.expandedSection}>
              <Text style={[styles.expandedLabel, { color: colors.textMuted }]}>PATH</Text>
              <Text style={[styles.expandedPath, { color: colors.textSecondary }]} numberOfLines={2}>
                {details.expandedContent.filePath}
              </Text>
            </View>
          )}
          {details.expandedContent.command && (
            <View style={styles.expandedSection}>
              <Text style={[styles.expandedLabel, { color: colors.textMuted }]}>COMMAND</Text>
              <View style={[styles.codeBlock, { backgroundColor: colors.bg }]}>
                <Text style={[styles.codeText, { color: colors.accent }]}>
                  {details.expandedContent.command}
                </Text>
              </View>
            </View>
          )}
          {details.expandedContent.todos && (
            <View style={styles.expandedSection}>
              <Text style={[styles.expandedLabel, { color: colors.textMuted }]}>ITEMS</Text>
              <View style={styles.todoList}>
                {details.expandedContent.todos.slice(0, 6).map((todo: any, i: number) => (
                  <View key={i} style={styles.todoItem}>
                    <Icon 
                      name={todo.status === 'completed' ? 'check' : 'circle'} 
                      size={14} 
                      color={todo.status === 'completed' ? colors.success : colors.textMuted} 
                    />
                    <Text style={[styles.todoText, { color: colors.text }]} numberOfLines={1}>
                      {todo.content}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {details.expandedContent.output && !details.expandedContent.todos && (
            <View style={styles.expandedSection}>
              <Text style={[styles.expandedLabel, { color: colors.textMuted }]}>OUTPUT</Text>
              <Text style={[styles.outputText, { color: colors.textSecondary }]}>
                {details.expandedContent.output}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Helper to check if a message has displayable content
function hasDisplayableContent(message: MessageWithParts): boolean {
  const textContent = message.parts
    .filter(p => p.type === 'text' && (p as any).text?.trim())
    .map(p => (p as any).text)
    .join('');
  
  const toolParts = message.parts.filter(
    p => p.type === 'tool' || p.type === 'tool-invocation' || p.type === 'tool-result'
  );
  
  return textContent.length > 0 || toolParts.length > 0;
}

function MessageBlock({ message, colors }: { 
  message: MessageWithParts; 
  colors: any;
}) {
  const isUser = message.info.role === 'user';
  
  // Combine all text parts
  const textContent = message.parts
    .filter(p => p.type === 'text' && (p as any).text?.trim())
    .map(p => (p as any).text)
    .join('\n\n');
  
  // Get tool parts
  const toolParts = message.parts.filter(
    p => p.type === 'tool' || p.type === 'tool-invocation' || p.type === 'tool-result'
  );

  // Don't render if no displayable content
  if (!textContent && toolParts.length === 0) {
    return null;
  }

  const hasText = textContent.length > 0;
  const hasTools = toolParts.length > 0;

  // User messages - always show with card
  if (isUser) {
    return (
      <View style={styles.messageContainer}>
        <View style={styles.roleRow}>
          <Icon name="user" size={16} color={colors.accent} />
          <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>You</Text>
        </View>
        <View style={[styles.userMessageBlock, { backgroundColor: colors.userMessage }]}>
          <Markdown isUser={true}>{textContent}</Markdown>
        </View>
      </View>
    );
  }

  // Assistant message with text - text in card, tools always separate
  if (hasText) {
    return (
      <View style={styles.messageContainer}>
        <View style={styles.roleRow}>
          <Icon name="bot" size={16} color={colors.textSecondary} />
          <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>Assistant</Text>
        </View>
        <View style={[styles.assistantMessageBlock, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Markdown isUser={false}>{textContent}</Markdown>
        </View>
        {hasTools && (
          <View style={styles.toolsAfterText}>
            {toolParts.map((part, index) => (
              <ToolBlock key={index} part={part} colors={colors} />
            ))}
          </View>
        )}
      </View>
    );
  }

  // Tool-only message - flat, no card, no "Assistant" label
  return (
    <View style={styles.toolOnlyContainer}>
      {toolParts.map((part, index) => (
        <ToolBlock key={index} part={part} colors={colors} />
      ))}
    </View>
  );
}

export function ChatScreen({
  session,
  getSessionMessages,
  onBack,
}: ChatScreenProps) {
  const { theme, colors: c, isDark } = useTheme();
  const [messages, setMessages] = useState<MessageWithParts[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    const data = await getSessionMessages(session.id);
    setMessages(data);
    setLoading(false);
  }, [session.id, getSessionMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Scroll to bottom when messages are first loaded
  useEffect(() => {
    if (messages.length > 0 && !initialScrollDone) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setInitialScrollDone(true);
      }, 100);
    }
  }, [messages, initialScrollDone]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  return (
    <SafeAreaView style={theme.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <BlurView
          intensity={isDark ? 60 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.headerBlur, { borderBottomColor: c.border }]}
        >
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={24} color={c.accent} />
            <Text style={[styles.backText, { color: c.accent }]}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
              {session.title || 'Chat'}
            </Text>
          </View>
          
          <View style={styles.headerRight} />
        </BlurView>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.info.id || String(index)}
        renderItem={({ item }) => (
          <MessageBlock message={item} colors={c} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: c.accentSubtle }]}>
              <Icon name="message-square" size={32} color={c.accent} />
            </View>
            <Text style={[theme.subtitle, { marginTop: spacing.lg }]}>
              {loading ? 'Loading...' : 'No Messages'}
            </Text>
            <Text style={[theme.body, theme.textSecondary, styles.emptyText]}>
              {loading 
                ? 'Fetching messages' 
                : 'This session has no messages yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 100,
  },
  headerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    minHeight: 52,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    ...typography.body,
    marginLeft: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.bodyMedium,
  },
  headerRight: {
    width: 70,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  
  // Message containers
  messageContainer: {
    marginBottom: spacing.lg,
  },
  toolOnlyContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  roleLabel: {
    ...typography.smallMedium,
  },
  
  // User message
  userMessageBlock: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  
  // Assistant message with text
  assistantMessageBlock: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  toolsAfterText: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  
  // Tool block - flat design
  toolBlock: {
    borderLeftWidth: 2,
    paddingLeft: spacing.md,
    paddingVertical: spacing.xs,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 28,
  },
  toolLabel: {
    ...typography.small,
  },
  toolDetail: {
    ...typography.smallMedium,
    flex: 1,
  },
  toolRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: 'auto',
  },
  
  // Expanded content
  toolExpanded: {
    marginTop: spacing.sm,
    marginLeft: spacing.xl,
    gap: spacing.md,
  },
  expandedSection: {
    gap: spacing.xs,
  },
  expandedLabel: {
    ...typography.caption,
    letterSpacing: 0.5,
  },
  expandedPath: {
    ...typography.small,
  },
  codeBlock: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  codeText: {
    ...typography.mono,
    fontSize: 13,
  },
  outputText: {
    ...typography.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  
  // Todos
  todoList: {
    gap: spacing.xs,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todoText: {
    ...typography.small,
    flex: 1,
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: 100,
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
