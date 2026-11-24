# 📖 AnaBook — Offline Android eBook Reader

<div align="center">
  <img src="./assets/icon.png" width="100" height="100" alt="AnaBook Logo" style="border-radius: 20px;" />
  <h3>Read 29,178+ Bangla, English & NCTB Academic Books Offline</h3>
  <p>Free, open-source Android reader powered by React Native, Expo, and Google Drive.</p>
</div>

---

## ✨ Features

- **🚀 Offline First:** 150+ bundled starter catalog books cached locally on first launch, with silent background sync for the full 29,178+ book library.
- **🔄 In-App Updater:** Automatic version check against remote release manifests with in-app APK download progress, one-tap installation, and post-installation cache cleanup.
- **🎨 5 Reader Themes:** Light & Dark modes for Espresso, Matcha, Midnight, Sepia, and Rosewood palettes.
- **🛡️ Full-Screen Mistouch Lock:** Edge scroll rail paired with an accidental tap lock toggle while reading.
- **📚 Rich Navigation:** Pinterest-style curved floating navbar, horizontal swipe tab transitions, Class 1–12 NCTB chips, author portraits, and search filters.
- **📦 Multi-Format Support:** PDF, EPUB, MOBI, and document reading with integrated preview and external viewer dispatch.

---

## 🛠️ Development & Building

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run TypeScript checks
npx tsc --noEmit

# Start development server
npx expo start

# Prebuild native Android project
npx expo prebuild --platform android

# Assemble release APK locally
cd android && ./gradlew assembleRelease
```

---

## 🤖 Automated GitHub Actions CI/CD

This repository includes automated Android APK builds via [`.github/workflows/build-android-apk.yml`](.github/workflows/build-android-apk.yml).
Whenever a release tag (e.g. `v1.1.2`) is pushed or manually dispatched, GitHub Actions automatically builds the release APK and uploads it to GitHub Releases.

---

## 👤 Author

- **Developer:** Salman Anik (CSE, East West University, Dhaka)
- **Portfolio:** [salmananik.vercel.app](https://salmananik.vercel.app/)
- **License:** MIT
