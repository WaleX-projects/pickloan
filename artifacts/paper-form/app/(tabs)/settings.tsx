import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ConnectionPill, ui } from '@/components/AppUi';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[ui.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[ui.scrollContent, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <AppHeader eyebrow="Workspace" title="Settings" />
        <ConnectionPill />
        <View style={[styles.profile, { backgroundColor: colors.primary }]}>
          <View style={styles.avatar}><Text style={[styles.avatarText, { color: colors.primary }]}>{'LO'}</Text></View>
          <View><Text style={styles.profileName}>Loan Officer</Text><Text style={styles.profileRole}>Field operations</Text></View>
        </View>
        <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>APP PREFERENCES</Text>
        <SettingRow icon="hard-drive" title="Storage" detail="Scans stay on this device until synced" />
        <SettingRow icon="wifi-off" title="Offline mode" detail="Always allow scanning without internet" />
        <SettingRow icon="shield" title="Privacy & security" detail="Original documents are kept private" />
        <Text style={[styles.groupLabel, { color: colors.mutedForeground, marginTop: 22 }]}>ABOUT</Text>
        <SettingRow icon="help-circle" title="Help & support" detail="Learn how the scan and review flow works" />
        <SettingRow icon="info" title="About Paper Form" detail="Version 1.0 · Offline-first workspace" />
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, title, detail }: { icon: keyof typeof Feather.glyphMap; title: string; detail: string }) {
  const colors = useColors();
  return <Pressable style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={17} color={colors.primary} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.rowDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

const styles = StyleSheet.create({
  profile: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 27 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#E1EEE9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  profileName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  profileRole: { color: '#B9D8D2', fontSize: 12, fontFamily: 'Inter_400Regular' },
  groupLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 9 },
  row: { minHeight: 70, borderRadius: 15, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  rowCopy: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  rowDetail: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  pressed: { opacity: 0.78 },
});