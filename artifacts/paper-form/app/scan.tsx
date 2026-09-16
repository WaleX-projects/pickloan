
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  const [isStartingAI, setIsStartingAI] = useState(false);

  /**
   * Capture a page.
   *
   * Native:
   *   Camera
   *
   * Web:
   *   Image picker
   */
  const capturePage = async () => {
    if (isCapturing || isStartingAI) return;

    try {
      setIsCapturing(true);

      const result =
        Platform.OS === 'web'
          ? await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 0.85,
              mediaTypes: ['images'],
            })
          : await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.85,
              mediaTypes: ['images'],
            });

      if (!result.canceled && result.assets[0]?.uri) {
        setPages((current) => [
          ...current,
          result.assets[0].uri,
        ]);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Remove a single page.
   */
  const removePage = (index: number) => {
    setPages((current) =>
      current.filter((_, pageIndex) => pageIndex !== index),
    );
  };

  /**
   * Start the form generation process.
   *
   * addForm() creates the FormRecord with:
   *
   * status: PROCESSING
   *
   * The actual AI extraction should then happen
   * from your processing/review flow.
   */
  const generateForm = async () => {
    if (!pages.length || isStartingAI) return;

    try {
      setIsStartingAI(true);

      const form = await addForm({
        documentUri: pages[0],
        pageCount: pages.length,
      });

      // The context now owns the PROCESSING state.
      router.replace(`/review?id=${form.id}`);
    } catch (error) {
      console.error('Failed to start AI processing:', error);
    } finally {
      setIsStartingAI(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Text
              style={[
                styles.backText,
                { color: colors.foreground },
              ]}
            >
              ‹
            </Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text
              style={[
                styles.topTitle,
                { color: colors.foreground },
              ]}
            >
              New form
            </Text>

            <Text
              style={[
                styles.stepText,
                { color: colors.mutedForeground },
              ]}
            >
              Step 1 of 2
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* INTRO */}
        <View style={styles.intro}>
          <View
            style={[
              styles.eyebrow,
              { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.eyebrowText,
                { color: colors.accentForeground },
              ]}
            >
              DOCUMENT INTAKE
            </Text>
          </View>

          <Text
            style={[
              styles.introTitle,
              { color: colors.foreground },
            ]}
          >
            Capture the paper form
          </Text>

          <Text
            style={[
              styles.introBody,
              { color: colors.mutedForeground },
            ]}
          >
            Take clear photos of every page. AI will read the
            document and turn it into an editable digital form.
          </Text>
        </View>

        {/* SCANNER / PREVIEW */}
        {pages.length === 0 ? (
          <Pressable
            onPress={capturePage}
            disabled={isCapturing}
            style={({ pressed }) => [
              styles.cameraFrame,
              {
                borderColor: colors.primary,
                backgroundColor: colors.card,
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.frameCorners}>
              <View
                style={[
                  styles.corner,
                  styles.cornerTL,
                  { borderColor: colors.primary },
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.cornerTR,
                  { borderColor: colors.primary },
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.cornerBL,
                  { borderColor: colors.primary },
                ]}
              />

              <View
                style={[
                  styles.corner,
                  styles.cornerBR,
                  { borderColor: colors.primary },
                ]}
              />
            </View>

            <DocumentPreview compact />

            <View style={styles.cameraOverlay}>
              <View
                style={[
                  styles.cameraIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.cameraIconText}>+</Text>
              </View>

              <Text
                style={[
                  styles.cameraTitle,
                  { color: colors.foreground },
                ]}
              >
                {isCapturing
                  ? 'Opening camera...'
                  : 'Tap to capture'}
              </Text>

              <Text
                style={[
                  styles.cameraSubtitle,
                  { color: colors.mutedForeground },
                ]}
              >
                Keep the entire page visible
              </Text>
            </View>
          </Pressable>
        ) : (
          <View
            style={[
              styles.previewContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <Image
              source={{ uri: pages[pages.length - 1] }}
              style={styles.capturedImage}
              resizeMode="cover"
            />

            <View style={styles.previewGradient} />

            <View style={styles.previewTop}>
              <View style={styles.pageBadge}>
                <Text style={styles.pageBadgeText}>
                  Page {pages.length}
                </Text>
              </View>

              <View style={styles.readyBadge}>
                <View style={styles.readyDot} />

                <Text style={styles.readyText}>
                  Captured
                </Text>
              </View>
            </View>

            <View style={styles.previewBottom}>
              <Text style={styles.previewTitle}>
                {pages.length === 1
                  ? 'First page captured'
                  : `${pages.length} pages captured`}
              </Text>

              <Text style={styles.previewSubtitle}>
                Add another page if the form continues.
              </Text>
            </View>
          </View>
        )}

        {/* CAPTURE BUTTON */}
        {pages.length > 0 && (
          <Pressable
            onPress={capturePage}
            disabled={isCapturing || isStartingAI}
            style={({ pressed }) => [
              styles.addPageButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.addIcon,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.addIconText,
                  { color: colors.accentForeground },
                ]}
              >
                +
              </Text>
            </View>

            <View style={styles.addPageCopy}>
              <Text
                style={[
                  styles.addPageTitle,
                  { color: colors.foreground },
                ]}
              >
                Add another page
              </Text>

              <Text
                style={[
                  styles.addPageSubtitle,
                  { color: colors.mutedForeground },
                ]}
              >
                Capture the next page of this form
              </Text>
            </View>

            <Text
              style={[
                styles.chevron,
                { color: colors.mutedForeground },
              ]}
            >
              ›
            </Text>
          </Pressable>
        )}

        {/* TIPS */}
        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.tipIcon,
              { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.tipIconText,
                { color: colors.accentForeground },
              ]}
            >
              i
            </Text>
          </View>

          <View style={styles.tipCopy}>
            <Text
              style={[
                styles.tipTitle,
                { color: colors.foreground },
              ]}
            >
              Better photos = better extraction
            </Text>

            <Text
              style={[
                styles.tipText,
                { color: colors.mutedForeground },
              ]}
            >
              Use good lighting, avoid shadows, and keep the
              paper flat. Make sure all handwriting is visible.
            </Text>
          </View>
        </View>

        {/* PAGE LIST */}
        {pages.length > 0 && (
          <View style={styles.pagesSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.foreground },
                  ]}
                >
                  Pages
                </Text>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {pages.length}{' '}
                  {pages.length === 1 ? 'page' : 'pages'} ready
                </Text>
              </View>

              <Pressable
                onPress={() => setPages([])}
                disabled={isStartingAI}
              >
                <Text
                  style={[
                    styles.clearText,
                    { color: colors.destructive },
                  ]}
                >
                  Clear all
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbs}
            >
              {pages.map((page, index) => (
                <View
                  key={`${page}-${index}`}
                  style={[
                    styles.thumb,
                    { borderColor: colors.border },
                  ]}
                >
                  <Image
                    source={{ uri: page }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />

                  <View style={styles.thumbNumber}>
                    <Text style={styles.thumbNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => removePage(index)}
                    style={styles.removePage}
                    hitSlop={8}
                  >
                    <Text style={styles.removePageText}>
                      ×
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* AI EXPLANATION */}
        {pages.length > 0 && (
          <View
            style={[
              styles.aiCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.aiIcon,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.aiIconText}>AI</Text>
            </View>

            <View style={styles.aiCopy}>
              <Text
                style={[
                  styles.aiTitle,
                  { color: colors.foreground },
                ]}
              >
                What happens next?
              </Text>

              <Text
                style={[
                  styles.aiText,
                  { color: colors.mutedForeground },
                ]}
              >
                Your document will be processed and the
                extracted information will appear in the review
                screen. You can correct anything before
                confirming the form.
              </Text>
            </View>
          </View>
        )}

        {/* MAIN ACTION */}
        <View style={styles.actionArea}>
          <PrimaryButton
            label={
              isStartingAI
                ? 'Starting AI...'
                : pages.length
                  ? 'Generate digital form'
                  : 'Capture a page first'
            }
            icon="save"
            onPress={generateForm}
            disabled={!pages.length || isStartingAI}
          />

          {isStartingAI && (
            <View style={styles.processingRow}>
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />

              <Text
                style={[
                  styles.processingText,
                  { color: colors.mutedForeground },
                ]}
              >
                Preparing your document...
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.safeText,
              { color: colors.mutedForeground },
            ]}
          >
            Your document stays on this device until you start
            processing.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
  },

  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 34,
    lineHeight: 36,
    fontFamily: 'Inter_400Regular',
  },

  headerCenter: {
    alignItems: 'center',
  },

  topTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },

  stepText: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },

  headerSpacer: {
    width: 42,
  },

  intro: {
    marginBottom: 22,
  },

  eyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginBottom: 11,
  },

  eyebrowText: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: 'Inter_700Bold',
  },

  introTitle: {
    fontSize: 27,
    lineHeight: 32,
    letterSpacing: -0.7,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },

  introBody: {
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 350,
    fontFamily: 'Inter_400Regular',
  },

  cameraFrame: {
    height: 330,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  frameCorners: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },

  corner: {
    width: 30,
    height: 30,
    position: 'absolute',
    borderWidth: 3,
  },

  cornerTL: {
    top: 17,
    left: 17,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 5,
  },

  cornerTR: {
    top: 17,
    right: 17,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 5,
  },

  cornerBL: {
    bottom: 17,
    left: 17,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderRadius: 5,
  },

  cornerBR: {
    bottom: 17,
    right: 17,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRadius: 5,
  },

  cameraOverlay: {
    alignItems: 'center',
    marginTop: 15,
  },

  cameraIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  cameraIconText: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },

  cameraTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },

  cameraSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },

  previewContainer: {
    height: 330,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },

  capturedImage: {
    width: '100%',
    height: '100%',
  },

  previewGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },

  previewTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(20,30,35,0.82)',
  },

  pageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },

  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: '#2E8B57',
  },

  readyText: {
    color: '#17212B',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },

  previewBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },

  previewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 3,
  },

  previewSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },

  addPageButton: {
    minHeight: 67,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  addIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  addIconText: {
    fontSize: 22,
    lineHeight: 24,
    fontFamily: 'Inter_500Medium',
  },

  addPageCopy: {
    flex: 1,
  },

  addPageTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    marginBottom: 3,
  },

  addPageSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },

  chevron: {
    fontSize: 23,
    fontFamily: 'Inter_400Regular',
  },

  tipCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
    marginTop: 14,
  },

  tipIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tipIconText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },

  tipCopy: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginBottom: 3,
  },

  tipText: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },

  pagesSection: {
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },

  sectionSubtitle: {
    fontSize: 10,
    marginTop: 3,
    fontFamily: 'Inter_400Regular',
  },

  clearText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },

  thumbs: {
    gap: 10,
    paddingRight: 10,
  },

  thumb: {
    width: 76,
    height: 96,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },

  thumbImage: {
    width: '100%',
    height: '100%',
  },

  thumbNumber: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,30,35,0.82)',
  },

  thumbNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },

  removePage: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: 'rgba(20,30,35,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removePageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 17,
    fontFamily: 'Inter_400Regular',
  },

  aiCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
    marginTop: 20,
  },

  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },

  aiCopy: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },

  aiText: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },

  actionArea: {
    marginTop: 24,
  },

  processingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },

  processingText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },

  safeText: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
    marginTop: 10,
    paddingHorizontal: 20,
  },

  pressed: {
    opacity: 0.72,
  },
});
