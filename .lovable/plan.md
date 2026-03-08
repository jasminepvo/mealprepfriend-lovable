

# React Native is Not Supported

Lovable projects are built on **React + Vite + Tailwind CSS** running in the browser. It cannot run React Native, which requires a completely different runtime (no DOM, no CSS, native components).

## Your Options for a Mobile App

**Option 1: Installable Web App (PWA)** — Recommended
- Your app can be installed from the browser to the home screen like a real app
- Works on all phones (iPhone and Android)
- No app store submission needed
- Faster to set up and share
- Limitation: Some advanced phone features (camera, push notifications) may be limited

**Option 2: True Native Mobile App (via Capacitor)**
- Wraps your existing React web app in a native shell
- Can be published to Apple App Store and Google Play Store
- Full access to phone features
- Limitation: Requires developer tools (Xcode for iOS, Android Studio for Android) on your local machine

Both options use the same React codebase you already have. The current MealPrepFriend app is already designed mobile-first, so it will look and feel great as either a PWA or a Capacitor-wrapped native app.

**Which approach would work best for you?** A PWA is simpler and works great for most apps. A Capacitor native app gives you full phone features but requires more local setup.

