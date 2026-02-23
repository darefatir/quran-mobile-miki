# 📖 Qur'an Mobile - Offline-First PWA

A lightweight web application for reading the Holy Qur'an on mobile devices. Built with a focus on a clean reading experience, seamless progress tracking, and accessibility.

## ✨ Features

* **📱 Progressive Web App (PWA):** Installable on iOS and Android. Looks and feels like a native app.
* **📶 Offline-First Architecture:** Powered by IndexedDB and Service Workers. Download a specific Juz or the entire Qur'an to read without an internet connection.
* **🎯 Smart Progress Tracking:** Simply tap the ayah marker (۝) to save your exact reading boundary. The app calculates your Juz and overall Khatam progress automatically.
* **🔥 Reading Streak:** Motivates you to read daily with a built-in streak counter.
* **🔍 Global Surah Search:** Instantly find and jump to any of the 114 Surahs without being limited by the current Juz selection.
* **🔤 Translations:** Toggle between Bahasa Indonesia and English (Sahih International).
* **🎨 Customizable UI:** Adjustable Arabic and Translation font sizes, and a highly contrasted Dark Mode for comfortable night reading.
* **Tajweed-Color Coded Waqf:** Stop signs are color-coded (Red for must stop, Pink for recommended stop, Yellow for recommended continue, Green for must continue).

## 🚀 Technologies Used

* **Frontend:** HTML5, JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
* **Fonts:** Amiri Quran (Google Fonts)
* **Storage:** LocalStorage (Settings & Progress) & IndexedDB (Offline Qur'an Data)
* **API:** [Alquran Cloud API](https://alquran.cloud/api)

## 🛠️ Installation & Hosting

This app is designed as a Single Page Application (SPA) and can be hosted statically for free.

1. Fork or clone this repository.
2. Ensure you have the following files in your root directory:
   - `index.html`
   - `service-worker.js`
   - `manifest.webmanifest`
   - `/icons/` (containing your 192x192 and 512x512 app icons)
3. Upload/Push to a static hosting service like **GitHub Pages**, Vercel, or Netlify.
4. Open the provided URL on your mobile browser and click "Add to Home Screen" to install it as an app.

## 💡 How to Save Reading Progress?

To keep the reading interface free of clutter, this app uses a hidden affordance.
1. Read the Qur'an as usual.
2. When you are ready to stop, tap the Arabic verse number at the end of the ayah (e.g., ۝١٠).
3. The symbol will turn **Gold**, and your progress is instantly saved locally!

---
*Created for Ramadan Target Khatam. May it be beneficial for everyone.*