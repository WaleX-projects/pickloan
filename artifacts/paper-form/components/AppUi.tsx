import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { FormRecord, FormStatus } from '@/contexts/AppContext';

export const statusLabel: Record<FormStatus, string> = {
  LOCAL: 'Saved on device',
  SYNC_PENDING: 'Pending sync',
  PROCESSING: 'Processing',
  NEEDS_REVIEW: 'Needs review',
  CONFIRMED: 'Confirmed',
  FAILED: 'Sync failed',
};

export function AppHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}>
          <Text style={[styles.headerActionText, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ConnectionPill({ offline = true }: { offline?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.connectionPill, { backgroundColor: offline ? '#FFF3D9' : colors.secondary }]}>
      <View style={[styles.connectionDot, { backgroundColor: offline ? '#C88919' : '#3E8D64' }]} />
      <Text style={[styles.connectionText, { color: offline ? '#765317' : '#2B6A4A' }]}>
        {offline ? 'Offline · saved on device' : 'Online'}
      </Text>
    </View>
  );
}

export function StatusPill({ status }: { status: FormStatus }) {
  const colors = useColors();
  const palette: Record<FormStatus, { background: string; text: string; icon: keyof typeof Feather.glyphMap }> = {
    LOCAL: { background: '#EEF1EF', text: '#536269', icon: 'smartphone' },
    SYNC_PENDING: { background: '#FFF3D9', text: '#765317', icon: 'upload-cloud' },
    PROCESSING: { background: '#E8F0FB', text: '#315D8F', icon: 'loader' },
    NEEDS_REVIEW: { background: '#F8E9D7', text: '#915B25', icon: 'alert-circle' },
    CONFIRMED: { background: '#E2F0E8', text: '#2B6A4A', icon: 'check-circle' },
    FAILED: { background: '#F8E2E1', text: '#9B3D3B', icon: 'x-circle' },
  };
  const item = palette[status];
  return (
    <View style={[styles.statusPill, { backgroundColor: item.background }]}>
      <Feather name={item.icon} size={13} color={item.text} />
      <Text style={[styles.statusText, { color: item.text }]}>{statusLabel[status]}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-right',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: disabled ? colors.border : colors.primary },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: disabled ? colors.mutedForeground : colors.primaryForeground }]}>
        {label}
      </Text>
      <Feather name={icon} size={18} color={disabled ? colors.mutedForeground : colors.primaryForeground} />
    </Pressable>
  );
}

export function FormCard({ form, onPress }: { form: FormRecord; onPress: () => void }) {
  const colors = useColors();
  const name = form.fields.fullName.value || 'New paper form';
  const date = new Date(form.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={styles.formCardTop}>
        <View style={[styles.documentIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="file-text" size={18} color={colors.primary} />
        </View>
        <View style={styles.formCardCopy}>
          <Text style={[styles.formCardName, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.formCardMeta, { color: colors.mutedForeground }]}>Loan application · {form.pageCount} {form.pageCount === 1 ? 'page' : 'pages'}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </View>
      <View style={styles.formCardBottom}>
        <Text style={[styles.formCardDate, { color: colors.mutedForeground }]}>Scanned {date}</Text>
        <StatusPill status={form.status} />
      </View>
    </Pressable>
  );
}

export function DocumentPreview({ uri, compact = false }: { uri?: string; compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.documentPreview, { backgroundColor: '#E9E2D5' }, compact && styles.documentPreviewCompact]}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <View style={[styles.paperSheet, { backgroundColor: '#FFFCF4', borderColor: '#D7CDBD' }, uri && styles.paperSheetOverlay]}>
        <View style={styles.paperLogoRow}>
          <View style={[styles.paperLogo, { backgroundColor: colors.primary }]} />
          <View style={styles.paperLines}>
            <View style={[styles.paperLine, { backgroundColor: colors.foreground, width: '45%' }]} />
            <View style={[styles.paperLine, { backgroundColor: colors.mutedForeground, width: '28%' }]} />
          </View>
        </View>
        <View style={[styles.paperHeading, { backgroundColor: colors.primary }]} />
        {[70, 88, 55, 82, 68, 92].map((width, index) => (
          <View key={index} style={styles.paperRow}>
            <View style={[styles.paperLine, { backgroundColor: '#B7B0A4', width: '27%' }]} />
            <View style={[styles.paperLine, { backgroundColor: '#D9D1C4', width: `${width}%` }]} />
          </View>
        ))}
        <View style={styles.paperSignature}>
          <View style={[styles.paperLine, { backgroundColor: '#B7B0A4', width: '32%' }]} />
          <View style={[styles.signatureLine, { borderBottomColor: '#B7B0A4' }]} />
        </View>
      </View>
      {!uri ? <Text style={[styles.previewCaption, { color: colors.mutedForeground }]}>Original paper form</Text> : null}
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof Feather.glyphMap; title: string; body: string }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

export const ui = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 118 },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerAction: { paddingTop: 8, paddingLeft: 16 },
  headerActionText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  connectionPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, marginBottom: 20 },
  connectionDot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 },
  connectionText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  primaryButton: { minHeight: 54, borderRadius: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryButtonText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  pressed: { opacity: 0.78 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  formCardTop: { flexDirection: 'row', alignItems: 'center' },
  documentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  formCardCopy: { flex: 1, marginRight: 10 },
  formCardName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  formCardMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  formCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: '#EDF0EE' },
  formCardDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  documentPreview: { height: 320, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  documentPreviewCompact: { height: 180 },
  paperSheet: { width: '66%', minHeight: '82%', borderRadius: 3, borderWidth: 1, padding: 15, shadowColor: '#4D4438', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  paperSheetOverlay: { opacity: 0.84 },
  paperLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  paperLogo: { width: 22, height: 22, borderRadius: 6, marginRight: 7 },
  paperLines: { flex: 1, gap: 4 },
  paperLine: { height: 4, borderRadius: 3 },
  paperHeading: { width: '55%', height: 7, borderRadius: 4, marginBottom: 19 },
  paperRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 8 },
  paperSignature: { marginTop: 10 },
  signatureLine: { width: '62%', borderBottomWidth: 1, height: 14 },
  previewCaption: { position: 'absolute', bottom: 15, fontSize: 11, fontFamily: 'Inter_500Medium' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 52, paddingHorizontal: 28 },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', marginBottom: 7 },
  emptyBody: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});