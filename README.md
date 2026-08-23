# Task Manager

An Expo SDK 54 / React Native task manager using Firebase Authentication and Cloud Firestore as its only backend. The app supports email/password accounts, persistent sessions, per-user real-time tasks, CRUD, completion tracking, search, priority/status filters, due-date sections, and swipe-to-delete actions.

## Firebase setup

1. Create or select a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web app** to obtain the Firebase JS configuration values.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. Create a **Cloud Firestore** database.
5. Copy `.env.example` to `.env.local` and replace each placeholder:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```

6. Publish the rules in `firestore.rules` through the Firebase Console or Firebase CLI. The rules require authentication and scope every task to the UID stored in its `userId` field.

Firebase Web API keys identify the Firebase project; access is enforced by Authentication and Firestore Security Rules. `.env.local` is ignored so each developer can use their own project configuration.

## Run and verify

```bash
npm install
npx expo start
```

Use `a` for Android, `i` for iOS on macOS, or `w` for web. The Firebase JS SDK works in Expo Go for the Authentication and Firestore features used here.

Quality checks:

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

## Project structure

- `app/` — Expo Router route groups and stack presentation
- `screens/` — login, registration, task list, and reusable create/edit form screens
- `components/ui/` — NativeWind-styled primitives and feedback states
- `context/` — lightweight authentication, task, and toast state
- `services/` — Firebase initialization plus auth/task operations
- `types/` — strongly typed users, tasks, inputs, priorities, and filters

