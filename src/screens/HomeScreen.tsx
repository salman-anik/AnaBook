import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BookCover } from '../components/BookCover';
import {
  BookOpenIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  FlameIcon,
  OfflineIcon,
} from '../components/Icons';
import { useAppTheme } from '../context/ThemeContext';
import { QUOTES } from '../theme';
import type { Book, BookProgress, OfflineBookEntry, ReadingStreak } from '../types';
import { hasGoodBookTitle, hasGoodCover, isUponnasOrFamous } from '../utils/smartSearch';

interface Props {
  books: Book[];
  currentlyReading: Book | null;
  progressById: Record<string, BookProgress>;
  offlineById: Record<string, OfflineBookEntry>;
  savedIds: string[];
  streak: ReadingStreak;
  downloadingMap: Record<string, number>;
  onContinueReading: (book: Book) => void;
  onOpenBookDetail: (book: Book) => void;
  onMakeOffline: (book: Book) => void;
  onExplorePath: (path: string[]) => void;
  onBrowseLibrary: () => void;
  onRemoveFromReading: (bookId: string) => void;
  onHorizontalTouchLock?: (locked: boolean) => void;
}

const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HomeScreen = React.memo(function HomeScreen({
  books,
  currentlyReading,
  progressById,
  offlineById,
  savedIds,
  streak,
  downloadingMap,
  onContinueReading,
  onOpenBookDetail,
  onMakeOffline,
  onExplorePath,
  onBrowseLibrary,
  onRemoveFromReading,
  onHorizontalTouchLock,
}: Props) {
  const { theme, fs } = useAppTheme();
  const [quoteIdx, setQuoteIdx] = useState(0);

  const dateLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Today';
    }
  }, []);

  const offlineCount = Object.keys(offlineById).length;
  const featuredBook = currentlyReading;

  const featuredProg = featuredBook ? progressById[featuredBook.id] : undefined;
  const featuredOffline = featuredBook ? offlineById[featuredBook.id] : undefined;
  const featuredDlPct = featuredBook ? downloadingMap[featuredBook.id] : undefined;
  const featuredPct = featuredProg?.progressPct ?? (featuredOffline ? 100 : 0);

  // Curated Discover: Uponnas & Famous books only, with good covers and clean titles
  const discoverBooks = useMemo(() => {
    const picked: Book[] = [];
    const seen = new Set<string>(featuredBook ? [featuredBook.id] : []);

    for (const b of books) {
      if (seen.has(b.id)) continue;
      if (!hasGoodCover(b) || !hasGoodBookTitle(b.title)) continue;
      if (isUponnasOrFamous(b)) {
        seen.add(b.id);
        picked.push(b);
      }
      if (picked.length >= 9) break;
    }

    if (picked.length < 9) {
      for (const b of books) {
        if (seen.has(b.id)) continue;
        if (hasGoodCover(b) && hasGoodBookTitle(b.title)) {
          seen.add(b.id);
          picked.push(b);
        }
        if (picked.length >= 9) break;
      }
    }
    return picked;
  }, [books, featuredBook]);

  const quote = QUOTES[quoteIdx % QUOTES.length];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Single Clean Masthead Row */}
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image source={require('../../assets/icon.png')} style={styles.brandLogo} />
          <Text style={[styles.heading, { color: theme.ink, fontSize: fs(21) }]} numberOfLines={1}>
            ANABOOK
          </Text>
        </View>
        <View style={[styles.datePill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.dateText, { color: theme.accent, fontSize: fs(11) }]}>{dateLabel}</Text>
        </View>
      </View>

      {/* Featured / Continue Reading Card */}
      {featuredBook ? (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: theme.ink, fontSize: fs(17) }]}>Continue reading</Text>
            <TouchableOpacity style={styles.moreLinkBtn} onPress={onBrowseLibrary}>
              <Text style={[styles.sectionAction, { color: theme.accent, fontSize: fs(12) }]}>All</Text>
              <ChevronRightIcon size={15} color={theme.accent} />
            </TouchableOpacity>
          </View>

          <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => onOpenBookDetail(featuredBook)}
              activeOpacity={0.88}
            >
              <BookCover
                book={featuredBook}
                localCoverUri={featuredOffline?.coverLocalUri}
                width={102}
                height={150}
                borderRadius={10}
                isOffline={Boolean(featuredOffline)}
              />
            </TouchableOpacity>

            <View style={styles.heroDetails}>
              <View style={styles.heroTopMetaRow}>
                <View style={[styles.heroCatPill, { backgroundColor: theme.accentSoft }]}>
                  <Text style={[styles.heroCategory, { color: theme.accent, fontSize: fs(10) }]} numberOfLines={1}>
                    {(featuredBook.sub || featuredBook.cat).split('/').pop()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.heroDismissBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                  onPress={() => onRemoveFromReading(featuredBook.id)}
                  accessibilityLabel="Remove from Continue Reading"
                >
                  <CloseIcon size={13} color={theme.muted} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => onOpenBookDetail(featuredBook)} activeOpacity={0.85}>
                <Text style={[styles.heroTitle, { color: theme.ink, fontSize: fs(17) }]} numberOfLines={2}>
                  {featuredBook.title}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.heroAuthor, { color: theme.muted, fontSize: fs(11.5) }]} numberOfLines={1}>
                {featuredBook.author} · {featuredBook.fmt}
              </Text>

              <View style={styles.heroProgWrap}>
                <View style={[styles.heroProgTrack, { backgroundColor: theme.surfaceAlt }]}>
                  <View
                    style={[
                      styles.heroProgFill,
                      { width: `${Math.max(featuredPct > 0 ? 5 : 2, Math.min(100, Math.round(featuredPct)))}%`, backgroundColor: theme.accent },
                    ]}
                  />
                </View>
                <Text style={[styles.heroProgPct, { color: theme.accent, fontSize: fs(11) }]}>
                  {Math.round(featuredPct)}%
                </Text>
              </View>

              <View style={styles.heroBtnRow}>
                <TouchableOpacity
                  style={[styles.continueBtn, { backgroundColor: theme.cream }]}
                  onPress={() => onContinueReading(featuredBook)}
                  activeOpacity={0.88}
                >
                  <BookOpenIcon size={15} color={theme.creamInk} />
                  <Text style={[styles.continueBtnText, { color: theme.creamInk, fontSize: fs(12) }]}>
                    {featuredOffline ? 'Read Offline' : 'Continue'}
                  </Text>
                </TouchableOpacity>

                {featuredOffline ? (
                  <View
                    style={[styles.heroIconBtn, { backgroundColor: theme.sage, borderColor: theme.sage }]}
                    accessibilityLabel="Available offline"
                  >
                    <OfflineIcon size={16} color={theme.ink} />
                  </View>
                ) : featuredDlPct !== undefined ? (
                  <View style={[styles.heroIconBtn, { borderColor: theme.accent }]}>
                    <Text style={[styles.dlPctSmall, { color: theme.accent }]}>{featuredDlPct}%</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.heroIconBtn, { borderColor: theme.accent }]}
                    onPress={() => onMakeOffline(featuredBook)}
                    accessibilityLabel="Download offline"
                  >
                    <DownloadIcon size={16} color={theme.accent} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {/* Curated Discover: Uponnas & Famous Books with Good Covers */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: theme.ink, fontSize: fs(17) }]}>
            Discover Novels & Classics
          </Text>
          <TouchableOpacity style={styles.moreLinkBtn} onPress={() => onExplorePath(['Bangla Books'])}>
            <Text style={[styles.sectionAction, { color: theme.accent, fontSize: fs(12) }]}>Explore</Text>
            <ChevronRightIcon size={15} color={theme.accent} />
          </TouchableOpacity>
        </View>
        <View style={styles.discoverGrid}>
          {discoverBooks.map((item) => {
            const offline = offlineById[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.discoverTile}
                onPress={() => onOpenBookDetail(item)}
                activeOpacity={0.86}
              >
                <BookCover
                  book={item}
                  localCoverUri={offline?.coverLocalUri}
                  width={96}
                  height={140}
                  borderRadius={9}
                  isOffline={Boolean(offline)}
                />
                <Text style={[styles.discoverTitle, { color: theme.ink, fontSize: fs(11.5) }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.discoverAuthor, { color: theme.muted, fontSize: fs(10) }]} numberOfLines={1}>
                  {item.author}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Compact Streak + Quote Companion Card */}
      <View style={[styles.companionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.streakRow}>
          <View style={styles.streakLeft}>
            <View style={styles.streakInline}>
              <FlameIcon size={20} color={theme.accent} />
              <Text style={[styles.streakNum, { color: theme.ink, fontSize: fs(21) }]}>{streak.days}</Text>
            </View>
            <Text style={[styles.streakLabel, { color: theme.cream, fontSize: fs(11) }]}>day streak</Text>
          </View>
          <View style={styles.weekDots}>
            {WEEK_LETTERS.map((l, i) => {
              const active = streak.weekDaysActive.includes(i);
              return (
                <View key={`${l}-${i}`} style={styles.dayCol}>
                  <Text style={[styles.weekLetter, { color: theme.muted }]}>{l}</Text>
                  <View
                    style={[
                      styles.dayCircle,
                      active
                        ? { backgroundColor: theme.sage }
                        : { borderWidth: 1.2, borderStyle: 'dashed', borderColor: theme.muted },
                    ]}
                  >
                    {active ? <View style={[styles.dayInnerDot, { backgroundColor: theme.creamInk }]} /> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.quoteDivider, { backgroundColor: theme.border }]} />

        <Text style={[styles.quoteBody, { color: theme.cream, fontSize: fs(13) }]}>“{quote.text}”</Text>
        <View style={styles.quoteFooter}>
          <Text style={[styles.quoteAuthor, { color: theme.muted, fontSize: fs(11) }]} numberOfLines={1}>
            — {quote.author}
          </Text>
          <TouchableOpacity onPress={() => setQuoteIdx((n) => n + 1)}>
            <ChevronRightIcon size={16} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 112, gap: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandLogo: { width: 32, height: 32, borderRadius: 9 },
  heading: { fontWeight: '800', letterSpacing: 0.3 },
  datePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateText: { fontWeight: '700' },
  sectionBlock: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontWeight: '700' },
  moreLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionAction: { fontWeight: '700' },
  heroCard: {
    borderRadius: 22,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: 14,
  },
  heroDetails: { flex: 1, gap: 5 },
  heroTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroCatPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 1,
  },
  heroDismissBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCategory: { fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  heroTitle: { fontWeight: '800', lineHeight: 22 },
  heroAuthor: {},
  heroProgWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  heroProgTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  heroProgFill: { height: '100%', borderRadius: 3 },
  heroProgPct: { fontWeight: '800', minWidth: 30, textAlign: 'right' },
  heroBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  continueBtnText: { fontWeight: '800' },
  heroIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dlPctSmall: { fontSize: 10, fontWeight: '800' },
  recScroll: { gap: 12, paddingRight: 8 },
  recCard: {
    width: 126,
    borderRadius: 16,
    borderWidth: 1,
    padding: 9,
    gap: 6,
  },
  reasonPill: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  reasonText: { fontWeight: '700' },
  recTitle: { fontWeight: '700', lineHeight: 16 },
  recAuthor: {},
  authorsScroll: { gap: 12, paddingRight: 8 },
  authorItem: { width: 82, alignItems: 'center', gap: 5 },
  authorChipName: { fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  authorChipCount: { fontWeight: '600' },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    rowGap: 16,
  },
  discoverTile: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
  },
  discoverTitle: {
    fontWeight: '700',
    lineHeight: 15.5,
    alignSelf: 'stretch',
  },
  discoverAuthor: {
    alignSelf: 'stretch',
  },
  companionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  streakLeft: { gap: 2 },
  streakInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakNum: { fontWeight: '800' },
  streakLabel: { fontWeight: '500' },
  weekDots: { flexDirection: 'row', gap: 6 },
  dayCol: { alignItems: 'center', gap: 4 },
  weekLetter: { fontSize: 10, fontWeight: '600' },
  dayCircle: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  dayInnerDot: { width: 4, height: 4, borderRadius: 2 },
  quoteDivider: { height: StyleSheet.hairlineWidth },
  quoteBody: { lineHeight: 19 },
  quoteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quoteAuthor: { flex: 1, marginRight: 8 },
});
