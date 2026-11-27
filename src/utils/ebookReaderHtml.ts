export type EbookReaderTheme = 'dark' | 'sepia' | 'light';

interface ReaderThemeColors {
  bg: string;
  fg: string;
  muted: string;
  bar: string;
  border: string;
  accent: string;
}

const COLORS: Record<EbookReaderTheme, ReaderThemeColors> = {
  dark: {
    bg: '#141210',
    fg: '#EAE3DA',
    muted: '#9E9590',
    bar: '#1F1B18',
    border: '#38302B',
    accent: '#C6927A',
  },
  sepia: {
    bg: '#F4ECD8',
    fg: '#3B2E20',
    muted: '#7A6855',
    bar: '#EAE0C8',
    border: '#D4C3A3',
    accent: '#8B5A2B',
  },
  light: {
    bg: '#FFFFFF',
    fg: '#1A1817',
    muted: '#6E6560',
    bar: '#F5F2EE',
    border: '#E5DDD5',
    accent: '#B56E52',
  },
};

/**
 * Generates a self-contained HTML5 EPUB & MOBI reader for react-native-webview.
 * Works 100% offline using browser-native DecompressionStream('deflate-raw') for EPUB ZIPs
 * and a pure-JS PalmDOC/LZ77 decompressor for MOBI files.
 */
export function buildEbookReaderHtml(params: {
  format: 'EPUB' | 'MOBI';
  base64Data: string;
  title: string;
  initialTheme: EbookReaderTheme;
  initialFontSize?: number;
}): string {
  const { format, base64Data, title, initialTheme, initialFontSize = 17 } = params;
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes" />
<title>${safeTitle}</title>
<style>
  :root {
    --bg: ${COLORS[initialTheme].bg};
    --fg: ${COLORS[initialTheme].fg};
    --muted: ${COLORS[initialTheme].muted};
    --bar: ${COLORS[initialTheme].bar};
    --border: ${COLORS[initialTheme].border};
    --accent: ${COLORS[initialTheme].accent};
    --fs: ${initialFontSize}px;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Noto Sans Bengali", "Segoe UI", Roboto, Georgia, serif;
    line-height: 1.75;
    -webkit-font-smoothing: antialiased;
  }
  #toolbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bar);
    border-bottom: 1px solid var(--border);
  }
  .tb-group { display: flex; align-items: center; gap: 6px; }
  .tb-btn {
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--fg);
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .tb-btn.active {
    border-color: var(--accent);
    color: var(--accent);
  }
  #chapterSelect {
    max-width: 140px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--fg);
    border-radius: 8px;
    padding: 5px 6px;
    font-size: 12px;
  }
  #content {
    max-width: 720px;
    margin: 0 auto;
    padding: 20px 18px 80px 18px;
    font-size: var(--fs);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  #content img { max-width: 100%; height: auto; display: block; margin: 12px auto; border-radius: 6px; }
  #content h1, #content h2, #content h3 { line-height: 1.35; margin-top: 1.3em; }
  #content p { margin: 0 0 1em 0; text-align: justify; }
  #content a { color: var(--accent); }
  #status {
    padding: 40px 20px;
    text-align: center;
    color: var(--muted);
    font-size: 14px;
  }
  #navFooter {
    display: flex;
    justify-content: space-between;
    max-width: 720px;
    margin: 0 auto 48px auto;
    padding: 0 18px;
    gap: 12px;
  }
</style>
</head>
<body>
  <div id="toolbar">
    <div class="tb-group">
      <button class="tb-btn" onclick="changeFont(-1)">A-</button>
      <button class="tb-btn" onclick="changeFont(1)">A+</button>
    </div>
    <select id="chapterSelect" style="display:none" onchange="goChapter(Number(this.value))"></select>
    <div class="tb-group">
      <button class="tb-btn ${initialTheme === 'light' ? 'active' : ''}" data-t="light" onclick="setTheme('light')">Light</button>
      <button class="tb-btn ${initialTheme === 'sepia' ? 'active' : ''}" data-t="sepia" onclick="setTheme('sepia')">Sepia</button>
      <button class="tb-btn ${initialTheme === 'dark' ? 'active' : ''}" data-t="dark" onclick="setTheme('dark')">Dark</button>
    </div>
  </div>

  <div id="status">Opening ${format} book…</div>
  <div id="content"></div>
  <div id="navFooter" style="display:none">
    <button class="tb-btn" id="prevBtn" onclick="prevChapter()">← Previous</button>
    <button class="tb-btn" id="nextBtn" onclick="nextChapter()">Next →</button>
  </div>

<script>
(function() {
  var THEMES = ${JSON.stringify(COLORS)};
  var fontSize = ${initialFontSize};
  var chapters = [];
  var currentIdx = 0;

  window.setTheme = function(name) {
    var t = THEMES[name] || THEMES.dark;
    var r = document.documentElement.style;
    r.setProperty('--bg', t.bg);
    r.setProperty('--fg', t.fg);
    r.setProperty('--muted', t.muted);
    r.setProperty('--bar', t.bar);
    r.setProperty('--border', t.border);
    r.setProperty('--accent', t.accent);
    document.querySelectorAll('[data-t]').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-t') === name);
    });
  };

  window.changeFont = function(delta) {
    fontSize = Math.max(12, Math.min(28, fontSize + delta));
    document.documentElement.style.setProperty('--fs', fontSize + 'px');
  };

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function renderChapter(idx) {
    if (!chapters.length) return;
    currentIdx = Math.max(0, Math.min(chapters.length - 1, idx));
    var ch = chapters[currentIdx];
    document.getElementById('content').innerHTML = ch.html;
    var sel = document.getElementById('chapterSelect');
    if (sel.options.length > currentIdx) sel.selectedIndex = currentIdx;
    document.getElementById('prevBtn').disabled = currentIdx === 0;
    document.getElementById('nextBtn').disabled = currentIdx >= chapters.length - 1;
    window.scrollTo(0, 0);
  }

  window.goChapter = function(idx) { renderChapter(idx); };
  window.prevChapter = function() { if (currentIdx > 0) renderChapter(currentIdx - 1); };
  window.nextChapter = function() { if (currentIdx < chapters.length - 1) renderChapter(currentIdx + 1); };

  function sanitizeHtml(rawHtml) {
    var doc = new DOMParser().parseFromString(rawHtml, 'text/html');
    doc.querySelectorAll('script, style, link').forEach(function(el) { el.remove(); });
    return doc.body ? doc.body.innerHTML : rawHtml;
  }

  // ---- EPUB (ZIP + OPF) ----
  async function inflateZipEntry(compBytes, method) {
    if (method === 0) return compBytes;
    if (method === 8 && typeof DecompressionStream !== 'undefined') {
      var ds = new DecompressionStream('deflate-raw');
      var writer = ds.writable.getWriter();
      writer.write(compBytes);
      writer.close();
      var buf = await new Response(ds.readable).arrayBuffer();
      return new Uint8Array(buf);
    }
    throw new Error('Unsupported ZIP compression method: ' + method);
  }

  function parseZipCentralDirectory(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var eocdOffset = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocdOffset = i; break; }
    }
    if (eocdOffset < 0) throw new Error('Invalid EPUB archive (EOCD not found)');
    var cdOffset = view.getUint32(eocdOffset + 16, true);
    var totalEntries = view.getUint16(eocdOffset + 10, true);
    var entries = new Map();
    var dec = new TextDecoder('utf-8');
    var pos = cdOffset;
    for (var e = 0; e < totalEntries; e++) {
      if (view.getUint32(pos, true) !== 0x02014b50) break;
      var method = view.getUint16(pos + 10, true);
      var compSize = view.getUint32(pos + 20, true);
      var fnameLen = view.getUint16(pos + 28, true);
      var extraLen = view.getUint16(pos + 30, true);
      var commentLen = view.getUint16(pos + 32, true);
      var localHeaderOffset = view.getUint32(pos + 42, true);
      var name = dec.decode(bytes.subarray(pos + 46, pos + 46 + fnameLen));
      pos += 46 + fnameLen + extraLen + commentLen;

      var lhNameLen = view.getUint16(localHeaderOffset + 26, true);
      var lhExtraLen = view.getUint16(localHeaderOffset + 28, true);
      var dataStart = localHeaderOffset + 30 + lhNameLen + lhExtraLen;
      entries.set(name, {
        method: method,
        data: bytes.subarray(dataStart, dataStart + compSize)
      });
    }
    return entries;
  }

  async function openEpub(bytes) {
    var entries = parseZipCentralDirectory(bytes);
    var dec = new TextDecoder('utf-8');

    async function readText(path) {
      var ent = entries.get(path);
      if (!ent) return null;
      var raw = await inflateZipEntry(ent.data, ent.method);
      return dec.decode(raw);
    }

    var containerXml = await readText('META-INF/container.xml');
    if (!containerXml) throw new Error('Missing container.xml');
    var opfMatch = containerXml.match(/full-path=["']([^"']+)["']/i);
    var opfPath = opfMatch ? opfMatch[1] : '';
    var opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
    var opfXml = await readText(opfPath);
    if (!opfXml) throw new Error('Missing OPF package');

    var opfDoc = new DOMParser().parseFromString(opfXml, 'application/xml');
    var manifest = new Map();
    opfDoc.querySelectorAll('manifest > item').forEach(function(item) {
      var id = item.getAttribute('id');
      var href = item.getAttribute('href');
      var media = item.getAttribute('media-type') || '';
      if (id && href) manifest.set(id, { href: decodeURIComponent(href), media: media });
    });

    var spineHrefs = [];
    opfDoc.querySelectorAll('spine > itemref').forEach(function(ref) {
      var idref = ref.getAttribute('idref');
      var m = manifest.get(idref);
      if (m && (m.media.includes('html') || /\.(x?html?|htm)$/i.test(m.href))) {
        spineHrefs.push(opfDir + m.href);
      }
    });

    if (spineHrefs.length === 0) {
      for (var k of entries.keys()) {
        if (/\.(x?html?|htm)$/i.test(k)) spineHrefs.push(k);
      }
      spineHrefs.sort();
    }

    for (var i = 0; i < spineHrefs.length; i++) {
      var htmlText = await readText(spineHrefs[i]);
      if (!htmlText) continue;
      var cleaned = sanitizeHtml(htmlText);
      if (cleaned.replace(/<[^>]+>/g, '').trim().length > 0 || cleaned.includes('<img')) {
        chapters.push({ title: 'Chapter ' + (chapters.length + 1), html: cleaned });
      }
    }
  }

  // ---- MOBI (PalmDB + PalmDOC LZ77) ----
  function decompressPalmDoc(src) {
    var out = [];
    var i = 0;
    while (i < src.length) {
      var b = src[i++];
      if (b === 0) {
        out.push(0);
      } else if (b >= 1 && b <= 8) {
        for (var j = 0; j < b && i < src.length; j++) out.push(src[i++]);
      } else if (b <= 0x7f) {
        out.push(b);
      } else if (b >= 0xc0) {
        out.push(0x20, b ^ 0x80);
      } else {
        if (i >= src.length) break;
        var b2 = src[i++];
        var pair = (b << 8) | b2;
        var dist = (pair >> 3) & 0x7ff;
        var len = (pair & 0x7) + 3;
        if (dist === 0 || dist > out.length) continue;
        for (var k = 0; k < len; k++) {
          out.push(out[out.length - dist]);
        }
      }
    }
    return new Uint8Array(out);
  }

  function openMobi(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var numRecords = view.getUint16(76, false);
    if (numRecords < 2) throw new Error('Invalid MOBI file');

    var offsets = [];
    for (var i = 0; i < numRecords; i++) {
      offsets.push(view.getUint32(78 + i * 8, false));
    }
    offsets.push(bytes.length);

    var rec0 = bytes.subarray(offsets[0], offsets[1]);
    var r0View = new DataView(rec0.buffer, rec0.byteOffset, rec0.byteLength);
    var compression = r0View.getUint16(0, false);
    var textRecordCount = r0View.getUint16(8, false);
    var encoding = r0View.byteLength >= 32 ? r0View.getUint32(28, false) : 65001;

    var chunks = [];
    var totalLen = 0;
    var limit = Math.min(numRecords - 1, textRecordCount);
    for (var r = 1; r <= limit; r++) {
      var slice = bytes.subarray(offsets[r], offsets[r + 1]);
      var decSlice = compression === 2 ? decompressPalmDoc(slice) : slice;
      chunks.push(decSlice);
      totalLen += decSlice.length;
    }

    var merged = new Uint8Array(totalLen);
    var off = 0;
    for (var c = 0; c < chunks.length; c++) {
      merged.set(chunks[c], off);
      off += chunks[c].length;
    }

    var charset = encoding === 1252 ? 'windows-1252' : 'utf-8';
    var fullHtml = new TextDecoder(charset).decode(merged);
    var parts = fullHtml.split(/<mbp:pagebreak[^>]*>/i);
    if (parts.length > 1) {
      // Group into readable chunks of ~3 pagebreaks if tiny
      var buf = '';
      for (var p = 0; p < parts.length; p++) {
        buf += parts[p];
        if (buf.length > 12000 || p === parts.length - 1) {
          var cleaned = sanitizeHtml(buf);
          if (cleaned.trim()) chapters.push({ title: 'Section ' + (chapters.length + 1), html: cleaned });
          buf = '';
        }
      }
    } else {
      chapters.push({ title: 'Book', html: sanitizeHtml(fullHtml) });
    }
  }

  async function init() {
    try {
      var bytes = b64ToBytes('${base64Data}');
      if ('${format}' === 'EPUB') {
        await openEpub(bytes);
      } else {
        openMobi(bytes);
      }
      if (!chapters.length) throw new Error('No readable text found in this file.');
      document.getElementById('status').style.display = 'none';
      if (chapters.length > 1) {
        var sel = document.getElementById('chapterSelect');
        sel.style.display = 'inline-block';
        chapters.forEach(function(ch, idx) {
          var opt = document.createElement('option');
          opt.value = String(idx);
          opt.textContent = ch.title;
          sel.appendChild(opt);
        });
        document.getElementById('navFooter').style.display = 'flex';
      }
      renderChapter(0);
    } catch (err) {
      document.getElementById('status').textContent = 'Unable to open ${format}: ' + (err && err.message ? err.message : String(err));
    }
  }

  init();
})();
</script>
</body>
</html>`;
}
