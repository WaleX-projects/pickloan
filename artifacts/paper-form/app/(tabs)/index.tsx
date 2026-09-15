import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ConnectionPill, FormCard, PrimaryButton, StatusPill, ui } from '@/components/AppUi';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { forms } = useApp();
  const reviewCount = forms.filter((form) => form.status === 'NEEDS_REVIEW').length;
  const pendingCount = forms.filter((form) => form.status === 'SYNC_PENDING' || form.status === 'LOCAL').length;
  const confirmedCount = forms.filter((form) => form.status === 'CONFIRMED').length;

  return (
    <View style={[ui.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[ui.scrollContent, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <AppHeader eyebrow="Loan desk" title="Good morning" />
        <ConnectionPill />
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Fast, even offline</Text>
            <Text style={styles.heroTitle}>Turn paper forms into ready-to-review records.</Text>
            <Text style={styles.heroBody}>Scan the paper form. We’ll keep it safe here until you’re ready to review.</Text>
          </View>
          <View style={styles.heroMark}><Feather name="file-text" size={30} color={colors.primary} /></View>
        </View>
        <Pressable onPress={() => router.push('/scan')} style={({ pressed }) => [styles.scanButton, { backgroundColor: colors.accent }, pressed && styles.pressed]}>
          <View style={[styles.scanIcon, { backgroundColor: colors.primary }]}><Feather name="camera" size={21} color={colors.primaryForeground} /></View>
          <View style={styles.scanCopy}>
            <Text style={[styles.scanTitle, { color: colors.foreground }]}>Scan a new form</Text>
            <Text style={[styles.scanBody, { color: colors.mutedForeground }]}>Save it to this device first</Text>
          </View>
          <Feather name="arrow-up-right" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today’s work</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>{forms.length} total forms</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard value={String(forms.length)} label="Total forms" icon="layers" tone="teal" />
          <StatCard value={String(confirmedCount)} label="Confirmed" icon="check-circle" tone="green" />
          <StatCard value={String(reviewCount)} label="Need review" icon="alert-circle" tone="amber" />
          <StatCard value={String(pendingCount)} label="Pending sync" icon="upload-cloud" tone="slate" />
        </View>
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent forms</Text>
          <Pressable onPress={() => router.push('/forms')}><Text style={[styles.viewAll, { color: colors.primary }]}>View all</Text></Pressable>
        </View>
        {forms.slice(0, 3).map((form) => <FormCard key={form.id} form={form} onPress={() => router.push(`/review?id=${form.id}`)} />)}
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label, icon, tone }: { value: string; label: string; icon: keyof typeof Feather.glyphMap; tone: 'teal' | 'green' | 'amber' | 'slate' }) {
  const colors = useColors();
  const tones = {
    teal: { bg: '#E4F0EE', icon: colors.primary },
    green: { bg: '#E2F0E8', icon: '#2B6A4A' },
    amber: { bg: '#FFF3D9', icon: '#C88919' },
    slate: { bg: '#EEF1EF', icon: '#647278' },
  };
  const item = tones[tone];
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: item.bg }]}><Feather name={icon} size={16} color={item.icon} /></View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, padding: 20, minHeight: 174, flexDirection: 'row', overflow: 'hidden', marginBottom: 14 },
  heroCopy: { flex: 1, paddingRight: 8 },
  heroEyebrow: { color: '#B9D8D2', fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 21, lineHeight: 27, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, marginBottom: 9 },
  heroBody: { color: '#D7EAE6', fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular', maxWidth: 230 },
  heroMark: { width: 62, height: 62, borderRadius: 20, backgroundColor: '#DCEBE7', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '8deg' }], marginTop: 5 },
  scanButton: { borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  scanIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  scanCopy: { flex: 1 },
  scanTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  scanBody: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  pressed: { opacity: 0.78 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  sectionHint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  viewAll: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: { width: '48.5%', borderRadius: 15, borderWidth: 1, padding: 13, minHeight: 106 },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});