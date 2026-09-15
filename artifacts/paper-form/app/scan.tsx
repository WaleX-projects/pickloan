import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentPreview, PrimaryButton } from '@/components/AppUi';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addForm } = useApp();
  const [pages, setPages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePage = async () => {
    setIsCapturing(true);
    const result = Platform.OS === 'web'
      ? await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85 })
      : await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85 });
    setIsCapturing(false);
    if (!result.canceled && result.assets[0]?.uri) setPages((current) => [...current, result.assets[0].uri]);
  };

  const saveForm = async () => {
    const form = await addForm({ documentUri: pages[0], pageCount: Math.max(pages.length, 1) });
    router.replace(`/review?id=${form.id}`);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 26 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Text style={[styles.backText, { color: colors.foreground }]}>‹</Text></Pressable><Text style={[styles.topTitle, { color: colors.foreground }]}>Scan form</Text><View style={styles.step}><Text style={[styles.stepText, { color: colors.mutedForeground }]}>1 of 2</Text></View></View>
        <Text style={[styles.introTitle, { color: colors.foreground }]}>Capture the paper form</Text>
        <Text style={[styles.introBody, { color: colors.mutedForeground }]}>Place the full page inside the frame. You can add more pages before saving.</Text>
        {pages.length ? <View style={styles.capturedWrap}><Image source={{ uri: pages[pages.length - 1] }} style={styles.capturedImage} resizeMode="cover" /><View style={styles.capturedBadge}><Text style={styles.capturedBadgeText}>Page {pages.length} captured</Text></View></View> : <View style={[styles.cameraFrame, { borderColor: colors.primary, backgroundColor: '#E7EFED' }]}><View style={styles.frameCornerTopLeft} /><View style={styles.frameCornerTopRight} /><View style={styles.frameCornerBottomLeft} /><View style={styles.frameCornerBottomRight} /><DocumentPreview compact /></View>}
        <View style={styles.tip}><View style={[styles.tipIcon, { backgroundColor: colors.accent }]}><Text style={[styles.tipIconText, { color: colors.accentForeground }]}>i</Text></View><Text style={[styles.tipText, { color: colors.mutedForeground }]}>Good light and a flat surface make handwriting easier to read.</Text></View>
        <Pressable onPress={capturePage} disabled={isCapturing} style={({ pressed }) => [styles.captureButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
          <View style={styles.captureRing}><View style={styles.captureDot} /></View><Text style={styles.captureText}>{isCapturing ? 'Opening camera…' : pages.length ? 'Add another page' : 'Capture page'}</Text>
        </Pressable>
        <View style={styles.pageRow}><Text style={[styles.pageCount, { color: colors.foreground }]}>{pages.length || 0} {pages.length === 1 ? 'page' : 'pages'} captured</Text>{pages.length > 0 ? <Pressable onPress={() => setPages([])}><Text style={[styles.clearText, { color: colors.destructive }]}>Clear all</Text></Pressable> : null}</View>
        {pages.length ? <View style={styles.thumbs}>{pages.map((page, index) => <View key={`${page}-${index}`} style={[styles.thumb, { borderColor: colors.primary }]}><Image source={{ uri: page }} style={styles.thumbImage} /><Text style={styles.thumbNumber}>{index + 1}</Text></View>)}</View> : null}
        <PrimaryButton label="Save form on this device" icon="save" onPress={saveForm} />
        <Text style={[styles.safeText, { color: colors.mutedForeground }]}>Saved locally before anything is uploaded.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 31 },
  backButton: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  backText: { fontSize: 33, lineHeight: 33, fontFamily: 'Inter_400Regular' },
  topTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  step: { width: 52, alignItems: 'flex-end' },
  stepText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  introTitle: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.4, marginBottom: 8 },
  introBody: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular', marginBottom: 23, maxWidth: 320 },
  cameraFrame: { height: 320, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  capturedWrap: { height: 320, borderRadius: 20, overflow: 'hidden', backgroundColor: '#E7EFED', position: 'relative' },
  capturedImage: { width: '100%', height: '100%' },
  capturedBadge: { position: 'absolute', bottom: 12, left: 12, borderRadius: 12, backgroundColor: 'rgba(23,33,43,0.82)', paddingHorizontal: 10, paddingVertical: 7 },
  capturedBadgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  frameCornerTopLeft: { position: 'absolute', top: 18, left: 18, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#0D5C63', zIndex: 3 },
  frameCornerTopRight: { position: 'absolute', top: 18, right: 18, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#0D5C63', zIndex: 3 },
  frameCornerBottomLeft: { position: 'absolute', bottom: 18, left: 18, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#0D5C63', zIndex: 3 },
  frameCornerBottomRight: { position: 'absolute', bottom: 18, right: 18, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#0D5C63', zIndex: 3 },
  tip: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 2 },
  tipIcon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  tipIconText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  tipText: { flex: 1, fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  captureButton: { minHeight: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11, marginBottom: 15 },
  captureRing: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  captureDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#FFFFFF' },
  captureText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  pageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  pageCount: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  clearText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  thumbs: { flexDirection: 'row', gap: 10, marginBottom: 19 },
  thumb: { width: 58, height: 73, borderWidth: 2, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  thumbImage: { width: '100%', height: '100%' },
  thumbNumber: { position: 'absolute', bottom: 4, left: 4, color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_700Bold', backgroundColor: 'rgba(23,33,43,0.75)', paddingHorizontal: 4, borderRadius: 4 },
  pressed: { opacity: 0.78 },
  safeText: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 10 },
});