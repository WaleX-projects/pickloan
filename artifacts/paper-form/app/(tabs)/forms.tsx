import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ConnectionPill, EmptyState, FormCard, ui } from '@/components/AppUi';
import { type FormStatus, useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/useColors';

type Filter = 'ALL' | FormStatus;
const filters: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEEDS_REVIEW', label: 'Needs review' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'SYNC_PENDING', label: 'Pending sync' },
  { key: 'FAILED', label: 'Failed' },
];

export default function FormsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { forms } = useApp();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const visibleForms = useMemo(() => forms.filter((form) => {
    const matchesFilter = filter === 'ALL' || form.status === filter;
    const name = form.fields.fullName.value.toLowerCase();
    return matchesFilter && name.includes(search.toLowerCase());
  }), [filter, forms, search]);

  return (
    <View style={[ui.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[ui.scrollContent, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <AppHeader eyebrow="Your records" title="Forms" />
        <ConnectionPill />
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by applicant name" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((item) => {
            const active = filter === item.key;
            return <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}><Text style={[styles.filterText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>{item.label}</Text></Pressable>;
          })}
        </ScrollView>
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>{visibleForms.length} {visibleForms.length === 1 ? 'form' : 'forms'}</Text>
        {visibleForms.length ? visibleForms.map((form) => <FormCard key={form.id} form={form} onPress={() => router.push(`/review?id=${form.id}`)} />) : <EmptyState icon="file-text" title="No forms here" body="Try another filter or scan a new paper form to get started." />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: { height: 48, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', marginLeft: 9 },
  filterRow: { gap: 8, paddingBottom: 14 },
  filter: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  resultCount: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 12 },
});