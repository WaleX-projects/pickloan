import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentPreview, PrimaryButton, StatusPill } from '@/components/AppUi';
import { type FormFieldKey, useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/useColors';

const fieldLabels: Record<FormFieldKey, string> = {
  fullName: 'Full name',
  gender: "Gender",
  maritalStatus: 'marital status',
  emailAddress: 'Email Address',
  residentialAddress: 'ResidentialAddress',
  
  phoneNumber: 'Phone number',
  address: 'Address',
  dateOfBirth: 'Date of birth',
  occupation: 'Occupation',
  employer: 'Employer',
  monthlyIncome: 'Monthly income',
  loanAmount: 'Loan amount',
  loanPurpose: 'Loan purpose',
  repaymentPeriod: 'Repayment period',
};

const orderedKeys: FormFieldKey[] = ['fullName', 'phoneNumber', 'address', 'dateOfBirth', 'occupation', 'employer', 'monthlyIncome', 'loanAmount', 'loanPurpose', 'repaymentPeriod'];

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { forms, updateField, confirmForm } = useApp();
  const form = forms.find((item) => item.id === params.id);
  const [view, setView] = useState<'original' | 'extracted'>('extracted');
  const [reviewed, setReviewed] = useState(false);

  const missingRequired = useMemo(() => form ? ['fullName', 'phoneNumber', 'loanAmount'].filter((key) => !form.fields[key as FormFieldKey].value.trim()) : [], [form]);

  if (!form) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.notFound, { color: colors.foreground }]}>Form not found</Text><Pressable onPress={() => router.back()}><Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text></Pressable></View>;
  }

  const confirm = async () => {
    if (!reviewed) {
      Alert.alert('Review the form first', 'Please confirm that you checked the extracted fields against the original paper form.');
      return;
    }
    if (missingRequired.length) {
      Alert.alert('A few details are missing', 'Add the applicant name, phone number, and loan amount before confirming this application.');
      return;
    }
    await confirmForm(form.id);
    Alert.alert('Application confirmed', 'The verified information has been saved on this device.', [{ text: 'Done', onPress: () => router.replace('/(tabs)') }]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Text style={[styles.backText, { color: colors.foreground }]}>‹</Text></Pressable><View style={styles.titleCopy}><Text style={[styles.topTitle, { color: colors.foreground }]}>Review application</Text><Text style={[styles.topSubtitle, { color: colors.mutedForeground }]}>Compare, correct, confirm</Text></View><StatusPill status={form.status} /></View>
        <View style={[styles.toggle, { backgroundColor: colors.secondary }]}>
          <Pressable onPress={() => setView('original')} style={[styles.toggleItem, view === 'original' && { backgroundColor: colors.card }]}><Text style={[styles.toggleText, { color: view === 'original' ? colors.foreground : colors.mutedForeground }]}>Original</Text></Pressable>
          <Pressable onPress={() => setView('extracted')} style={[styles.toggleItem, view === 'extracted' && { backgroundColor: colors.card }]}><Text style={[styles.toggleText, { color: view === 'extracted' ? colors.foreground : colors.mutedForeground }]}>Extracted</Text></Pressable>
        </View>
        {view === 'original' ? <><DocumentPreview uri={form.documentUri} /><View style={[styles.originalNote, { backgroundColor: colors.secondary }]}><Feather name="eye" size={15} color={colors.primary} /><Text style={[styles.originalNoteText, { color: colors.mutedForeground }]}>This is the original scan. Nothing has been changed.</Text></View></> : <><View style={styles.reviewIntro}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Extracted information</Text><Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>Check each field against the handwriting. Edit anything that needs correcting.</Text></View>{orderedKeys.map((key) => <FieldEditor key={key} fieldKey={key} label={fieldLabels[key]} value={form.fields[key].value} confidence={form.fields[key].confidence} onChange={(value) => updateField(form.id, key, value)} />)}</>}
        <Pressable onPress={() => setReviewed((current) => !current)} style={styles.checkRow}><View style={[styles.checkbox, { borderColor: reviewed ? colors.primary : colors.border, backgroundColor: reviewed ? colors.primary : colors.card }]}>{reviewed ? <Feather name="check" size={15} color={colors.primaryForeground} /> : null}</View><Text style={[styles.checkText, { color: colors.foreground }]}>I reviewed the extracted information against the original paper form.</Text></Pressable>
        <PrimaryButton label={form.status === 'CONFIRMED' ? 'Application confirmed' : 'Confirm & save'} onPress={confirm} icon={form.status === 'CONFIRMED' ? 'check' : 'check-circle'} disabled={form.status === 'CONFIRMED'} />
        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>Your original scan stays attached to this record for audit and reference.</Text>
      </ScrollView>
    </View>
  );
}

function FieldEditor({ fieldKey, label, value, confidence, onChange }: { fieldKey: FormFieldKey; label: string; value: string; confidence: number; onChange: (value: string) => void }) {
  const colors = useColors();
  const needsReview = confidence > 0 && confidence < 0.9;
  const missing = !value.trim();
  return <View style={styles.field}><View style={styles.fieldHeader}><Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}{fieldKey === 'fullName' || fieldKey === 'phoneNumber' || fieldKey === 'loanAmount' ? ' *' : ''}</Text>{missing ? <View style={[styles.fieldStatus, { backgroundColor: '#F8E2E1' }]}><Feather name="alert-circle" size={12} color="#9B3D3B" /><Text style={[styles.fieldStatusText, { color: '#9B3D3B' }]}>Missing</Text></View> : needsReview ? <View style={[styles.fieldStatus, { backgroundColor: '#FFF3D9' }]}><Feather name="alert-triangle" size={12} color="#C88919" /><Text style={[styles.fieldStatusText, { color: '#915B25' }]}>Check</Text></View> : <Feather name="check-circle" size={16} color="#3E8D64" />}</View><TextInput value={value} onChangeText={onChange} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: missing ? '#E7B8B6' : needsReview ? '#E5C982' : colors.border, backgroundColor: colors.card }]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  backButton: { width: 33, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  backText: { fontSize: 33, lineHeight: 33, fontFamily: 'Inter_400Regular' },
  titleCopy: { flex: 1, marginLeft: 2 },
  topTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  topSubtitle: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  toggle: { flexDirection: 'row', borderRadius: 13, padding: 4, marginBottom: 20 },
  toggleItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, minHeight: 36 },
  toggleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  originalNote: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginTop: 12, marginBottom: 24, gap: 8 },
  originalNoteText: { flex: 1, fontSize: 11, fontFamily: 'Inter_400Regular' },
  reviewIntro: { marginBottom: 20 },
  sectionTitle: { fontSize: 19, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  sectionBody: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  field: { marginBottom: 16 },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  fieldStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 },
  fieldStatusText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  input: { minHeight: 47, borderRadius: 12, borderWidth: 1, paddingHorizontal: 13, fontSize: 14, fontFamily: 'Inter_400Regular' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5, marginBottom: 17, gap: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 1.5, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium', paddingTop: 1 },
  footerNote: { textAlign: 'center', fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular', marginTop: 10, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFound: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 10 },
  backLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});