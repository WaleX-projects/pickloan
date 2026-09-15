import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ConnectionPill, EmptyState, FormCard, PrimaryButton, ui } from '@/components/AppUi';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';

export default function SyncScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { forms, retryForm } = useApp();
  const pending = forms.filter((form) => form.status === 'SYNC_PENDING' || form.status === 'LOCAL');
  const failed = forms.filter((form) => form.status === 'FAILED');
  const confirmed = forms.filter((form) => form.status === 'CONFIRMED');

  return (
    <View style={[ui.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[ui.scrollContent, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <AppHeader eyebrow="Nothing gets lost" title="Sync" />
        <ConnectionPill />
        <View style={[styles.statusPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: '#FFF3D9' }]}><Feather name="wifi-off" size={21} color="#C88919" /></View>
          <View style={styles.statusCopy}><Text style={[styles.statusTitle, { color: colors.foreground }]}>Waiting for internet</Text><Text style={[styles.statusBody, { color: colors.mutedForeground }]}>Your scans stay safe on this device and will upload when you’re back online.</Text></View>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metricRow}>
            <SyncMetric value={String(confirmed.length)} label="Synced" icon="check-circle" color="#2B6A4A" bg="#E2F0E8" />
            <SyncMetric value="0" label="Uploading" icon="upload-cloud" color="#315D8F" bg="#E8F0FB" />
          </View>
          <View style={styles.metricRow}>
            <SyncMetric value={String(pending.length)} label="Waiting" icon="clock" color="#C88919" bg="#FFF3D9" />
            <SyncMetric value={String(failed.length)} label="Failed" icon="alert-circle" color="#9B3D3B" bg="#F8E2E1" />
          </View>
        </View>
        {failed.length ? <><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Needs another try</Text>{failed.map((form) => <View key={form.id} style={styles.failedRow}><FormCard form={form} onPress={() => router.push(`/review?id=${form.id}`)} /><Pressable onPress={() => retryForm(form.id)} style={[styles.retry, { borderColor: colors.primary }]}><Text style={[styles.retryText, { color: colors.primary }]}>Retry upload</Text></Pressable></View>)}</> : null}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Waiting to sync</Text>
        {pending.length ? pending.map((form) => <FormCard key={form.id} form={form} onPress={() => router.push(`/review?id=${form.id}`)} />) : <EmptyState icon="check" title="You’re all caught up" body="New scans will appear here until they can sync." />}
      </ScrollView>
    </View>
  );
}

function SyncMetric({ value, label, icon, color, bg }: { value: string; label: string; icon: keyof typeof Feather.glyphMap; color: string; bg: string }) {
  const colors = useColors();
  return <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: bg }]}><Feather name={icon} size={15} color={color} /></View><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  statusPanel: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', marginBottom: 18 },
  statusIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  statusCopy: { flex: 1 },
  statusTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 5 },
  statusBody: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  metrics: { marginBottom: 28 },
  metricRow: { flexDirection: 'row', marginBottom: 10 },
  metric: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, minHeight: 96 },
  metricIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  metricValue: { fontSize: 21, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  metricLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  failedRow: { marginBottom: 18 },
  retry: { alignSelf: 'flex-end', borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 8, marginTop: -3 },
  retryText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});