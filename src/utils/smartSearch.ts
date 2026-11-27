import type { Book } from '../types';

/**
 * Compact bilingual Bangla <-> English phonetic & semantic synonym groups.
 * Searching any term in a group also matches books/categories containing its equivalents.
 */
const BILINGUAL_GROUPS: string[][] = [
  // Genres & Categories
  ['uponnas', 'upanyas', 'upannyas', 'novel', 'novels', 'উপন্যাস', 'উপন্যাস সমগ্র'],
  ['golpo', 'galpo', 'story', 'stories', 'short story', 'গল্প', 'ছোটগল্প', 'গল্পসমগ্র'],
  ['kobita', 'kabita', 'poem', 'poems', 'poetry', 'কবিতা', 'কাব্য', 'কাব্যগ্রন্থ'],
  ['natok', 'drama', 'play', 'নাটক'],
  ['probondho', 'prabandha', 'essay', 'essays', 'প্রবন্ধ'],
  ['itihas', 'itihash', 'history', 'historical', 'ইতিহাস'],
  ['biggan', 'bigyan', 'science', 'scientific', 'বিজ্ঞান'],
  ['kalpabiggan', 'sci-fi', 'science fiction', 'কল্পবিজ্ঞান', 'সায়েন্স ফিকশন'],
  ['darshan', 'philosophy', 'দর্শন'],
  ['bhromon', 'vromon', 'travel', 'travelogue', 'ভ্রমণ', 'ভ্রমণকাহিনী'],
  ['jiboni', 'jibani', 'biography', 'autobiography', 'জীবনী', 'আত্মজীবনী'],
  ['shishu', 'sishu', 'kids', 'children', 'kishor', 'শিশু', 'কিশোর', 'শিশু-কিশোর'],
  ['rohosso', 'rahosso', 'goyenda', 'mystery', 'thriller', 'detective', 'রহস্য', 'গোয়েন্দা', 'গোয়েন্দা'],
  ['bhoutik', 'bhoot', 'horror', 'ghost', 'ভৌতিক', 'ভূত'],
  ['muktijuddho', 'liberation', 'freedom', '1971', 'মুক্তিযুদ্ধ'],
  ['onubad', 'anubad', 'translated', 'translation', 'অনুবাদ'],
  ['sahitto', 'sahitya', 'literature', 'সাহিত্য'],
  ['rochonaboli', 'rachanabali', 'somogro', 'samagra', 'complete works', 'রচনাবলী', 'সমগ্র'],
  ['dictionary', 'ovidhan', 'abhidhan', 'অভিধান'],
  ['grammar', 'byakaran', 'bakoron', 'ব্যাকরণ'],

  // Famous Authors & Series (Bangla <-> English)
  ['humayun', 'humayun ahmed', 'হুমায়ূন', 'হুমায়ূন', 'হুমায়ূন আহমেদ', 'হুমায়ূন আহমেদ'],
  ['himu', 'হিমু'],
  ['misir ali', 'misir', 'মিসির আলি', 'মিসির আলী'],
  ['shuvro', 'শুভ্র'],
  ['rabindranath', 'tagore', 'robi thakur', 'রবীন্দ্রনাথ', 'রবীন্দ্রনাথ ঠাকুর'],
  ['nazrul', 'kazi nazrul', 'নজরুল', 'কাজী নজরুল', 'কাজী নজরুল ইসলাম'],
  ['zafar iqbal', 'jafor iqbal', 'jafar iqbal', 'মুহম্মদ জাফর ইকবাল', 'জাফর ইকবাল'],
  ['sunil', 'sunil gangopadhyay', 'সুনীল', 'সুনীল গঙ্গোপাধ্যায়'],
  ['samaresh', 'somoresh', 'samaresh majumdar', 'সমরেশ', 'সমরেশ মজুমদার'],
  ['sharat', 'sarat', 'sharat chandra', 'sarat chandra', 'শরৎচন্দ্র', 'শরৎচন্দ্র চট্টোপাধ্যায়'],
  ['bankim', 'bankimchandra', 'বঙ্কিমচন্দ্র', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়'],
  ['bibhutibhushan', 'bibhuti', 'বিভূতিভূষণ'],
  ['manik', 'manik bandopadhyay', 'মানিক বন্দ্যোপাধ্যায়'],
  ['satyajit', 'satyajit ray', 'সত্যজিৎ', 'সত্যজিৎ রায়', 'সত্যজিৎ রায়'],
  ['feluda', 'ফেলুদা'],
  ['shanku', 'shonku', 'শঙ্কু'],
  ['shirshendu', 'শীর্ষেন্দু'],
  ['tin goyenda', 'teen goyenda', 'তিন গোয়েন্দা', 'তিন গোয়েন্দা'],
  ['masud rana', 'মাসুদ রানা'],
  ['anisul', 'anisul hoque', 'আনিসুল হক'],
  ['jasimuddin', 'জসীমউদ্দীন'],
  ['jibanananda', 'জীবনানন্দ'],
  ['begum rokeya', 'rokeya', 'বেগম রোকেয়া'],

  // Education & Classes
  ['class 1', 'class one', 'প্রথম শ্রেণী', 'প্রথম শ্রেণি', '১ম শ্রেণী', '১ম শ্রেণি'],
  ['class 2', 'class two', 'দ্বিতীয় শ্রেণী', 'দ্বিতীয় শ্রেণি', '২য় শ্রেণী', '২য় শ্রেণি'],
  ['class 3', 'class three', 'তৃতীয় শ্রেণী', 'তৃতীয় শ্রেণি', '৩য় শ্রেণী', '৩য় শ্রেণি'],
  ['class 4', 'class four', 'চতুর্থ শ্রেণী', 'চতুর্থ শ্রেণি', '৪র্থ শ্রেণী', '৪র্থ শ্রেণি'],
  ['class 5', 'class five', 'পঞ্চম শ্রেণী', 'পঞ্চম শ্রেণি', '৫ম শ্রেণী', '৫ম শ্রেণি'],
  ['class 6', 'class six', 'ষষ্ঠ শ্রেণী', 'ষষ্ঠ শ্রেণি', '৬ষ্ঠ'],
  ['class 7', 'class seven', 'সপ্তম শ্রেণী', 'সপ্তম শ্রেণি', '৭ম'],
  ['class 8', 'class eight', 'অষ্টম শ্রেণী', 'অষ্টম শ্রেণি', '৮ম'],
  ['class 9', 'class nine', 'নবম শ্রেণী', 'নবম শ্রেণি', '৯ম'],
  ['class 10', 'class ten', 'দশম শ্রেণী', 'দশম শ্রেণি', '১০ম'],
  ['class 11', 'hsc', 'একাদশ'],
  ['class 12', 'hsc', 'দ্বাদশ'],
  ['madrasa', 'madrasah', 'qawmi', 'alia', 'মাদ্রাসা', 'কওমি', 'আলিয়া'],
  ['bcs', 'job', 'চাকরি', 'বিসিএস'],
  ['math', 'mathematics', 'gonit', 'ganit', 'গণিত', 'অংক'],
  ['bangla', 'bengali', 'বাংলা'],
  ['english', 'ইংরেজি'],

  // Religion
  ['quran', 'koran', 'quraan', 'কুরআন', 'কোরআন'],
  ['hadith', 'hadis', 'হাদিস', 'হাদীস'],
  ['islamic', 'islam', 'ইসলাম', 'ইসলামিক', 'ইসলামী'],
  ['sirat', 'seerat', 'সীরাত', 'সীরাতে'],
  ['tafsir', 'tafseer', 'তাফসীর', 'তাফসির'],
  ['fiqh', 'fikah', 'ফিকহ'],
  ['dua', 'doa', 'দোয়া', 'দোয়া'],
  ['namaz', 'salat', 'নামাজ', 'সালাত'],
];

// Build fast lookup map: normalized term -> all sibling terms in its group(s)
const SYNONYM_MAP = new Map<string, string[]>();
for (const group of BILINGUAL_GROUPS) {
  const normGroup = group.map((g) => g.normalize('NFC').toLowerCase());
  for (const term of normGroup) {
    const existing = SYNONYM_MAP.get(term) || [];
    for (const sib of normGroup) {
      if (!existing.includes(sib)) existing.push(sib);
    }
    SYNONYM_MAP.set(term, existing);
  }
}

export function normalizeSearchText(text: string): string {
  return (text || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/\u09DF/g, '\u09AF\u09BC') // Normalize য়
    .trim();
}

/**
 * Given a raw search query, returns groups of alternative terms for each token/phrase.
 * Every group must have at least one match in the target text.
 */
export function buildQueryTermGroups(rawQuery: string): string[][] {
  const clean = normalizeSearchText(rawQuery);
  if (!clean) return [];

  // Check if the entire query matches a multi-word bilingual phrase (e.g. "class 5", "humayun ahmed")
  const wholeSynonyms = SYNONYM_MAP.get(clean);
  if (wholeSynonyms && wholeSynonyms.length > 1) {
    return [wholeSynonyms];
  }

  const rawTokens = clean.split(/\s+/).filter(Boolean);
  const groups: string[][] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    // Check 2-word phrase first (e.g. "class 5", "tin goyenda")
    if (i + 1 < rawTokens.length) {
      const bigram = `${rawTokens[i]} ${rawTokens[i + 1]}`;
      const biSyn = SYNONYM_MAP.get(bigram);
      if (biSyn) {
        groups.push(biSyn);
        i++; // skip next token
        continue;
      }
    }

    const tok = rawTokens[i];
    const alts = new Set<string>([tok]);
    const syn = SYNONYM_MAP.get(tok);
    if (syn) {
      for (const s of syn) alts.add(s);
    } else if (tok.length >= 3) {
      // Prefix-match bilingual keys for partial typing (e.g. "uponn" -> "uponnas" -> "উপন্যাস")
      for (const [k, list] of SYNONYM_MAP.entries()) {
        if (k.startsWith(tok) && k.length <= tok.length + 4) {
          for (const s of list) alts.add(s);
        }
      }
    }
    groups.push(Array.from(alts));
  }

  return groups;
}

export function matchesTermGroups(haystackLower: string, groups: string[][]): boolean {
  if (groups.length === 0) return false;
  for (const alts of groups) {
    let hit = false;
    for (const alt of alts) {
      if (haystackLower.includes(alt)) {
        hit = true;
        break;
      }
    }
    if (!hit) return false;
  }
  return true;
}

export function scoreBookForQuery(book: Book, rawQuery: string, groups: string[][]): number {
  const hay = book.searchBlob;
  if (!matchesTermGroups(hay, groups)) return -1;

  const q = normalizeSearchText(rawQuery);
  const title = book.title.toLowerCase();
  const author = book.author.toLowerCase();
  let score = 1;

  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 50;
  else if (title.includes(q)) score += 30;

  if (author.includes(q)) score += 20;
  if (book.coverId) score += 8;
  if (book.sub.toLowerCase().includes(q)) score += 10;

  return score;
}

const BAD_TITLE_RE =
  /^(\d{4,}|img_|dsc_|scan|untitled|document|book\d+|file\d+|new\s*doc)/i;
const BAD_SUBSTR_RE = /(_compressed|_ocred|\.pdf$|\.epub$|\.mobi$|\[scanned\])/i;

export function hasGoodCover(book: Book): boolean {
  return Boolean(book.coverId && book.coverId.trim().length > 8);
}

export function hasGoodBookTitle(title: string): boolean {
  const t = (title || '').trim();
  if (t.length < 3 || t.length > 68) return false;
  if (BAD_TITLE_RE.test(t) || BAD_SUBSTR_RE.test(t)) return false;
  // Avoid titles that are mostly underscores or digits
  const underscores = (t.match(/_/g) || []).length;
  if (underscores >= 3) return false;
  return true;
}

const FAMOUS_AUTHOR_KEYWORDS = [
  'হুমায়ূন',
  'হুমায়ূন',
  'রবীন্দ্রনাথ',
  'নজরুল',
  'সুনীল',
  'সমরেশ',
  'শরৎচন্দ্র',
  'বঙ্কিমচন্দ্র',
  'বিভূতিভূষণ',
  'মানিক',
  'জাফর ইকবাল',
  'সত্যজিৎ',
  'শীর্ষেন্দু',
  'জসীমউদ্দীন',
  'জীবনানন্দ',
  'humayun',
  'rabindranath',
  'tagore',
  'nazrul',
  'sunil',
  'samaresh',
  'satyajit',
  'zafar iqbal',
  'orwell',
  'coelho',
  'murakami',
  'agatha',
  'dostoevsky',
];

export function isUponnasOrFamous(book: Book): boolean {
  const sub = (book.sub || '').toLowerCase();
  const cat = (book.cat || '').toLowerCase();
  const author = (book.author || '').toLowerCase();
  const series = (book.series || '').toLowerCase();

  if (
    sub.includes('উপন্যাস') ||
    sub.includes('novel') ||
    sub.includes('literature') ||
    series.includes('হিমু') ||
    series.includes('মিসির') ||
    series.includes('ফেলুদা') ||
    series.includes('তিন গোয়েন্দা')
  ) {
    return true;
  }

  for (const kw of FAMOUS_AUTHOR_KEYWORDS) {
    if (author.includes(kw) || sub.includes(kw)) return true;
  }

  return cat === 'bangla books' && Boolean(book.coverId) && book.author !== 'Unknown';
}
