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
        <Icon sf="folder" />
        <Label>Workspaces</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="sessions">
        <Icon sf="message" />
        <Label>Sessions</Label>
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}