import { DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

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
        <Icon sf={{ default: 'folder', selected: 'folder.fill' }} />
        <Label>Workspaces</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="sessions">
        <Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
        <Label>Sessions</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: 'gear', selected: 'gear' }} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}