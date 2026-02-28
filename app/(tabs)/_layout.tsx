import { DynamicColorIOS } from 'react-native';
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';
import { Icon } from '../../src/components/Icon';

export default function TabLayout() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge
      labelStyle={{
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: '#22d3ee',
        light: '#0891b2',
      })}
    >
      <NativeTabs.Trigger name="workspaces">
        <Icon name="folder-open" />
        <Label>Workspaces</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="sessions">
        <Icon name="message-square" />
        <Label>Sessions</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="settings">
        <Icon name="settings" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}