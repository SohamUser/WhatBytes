# GigFlow

GigFlow is a sticky-note task manager built with Expo SDK 54 and React Native. Tasks are written on a paper-style composer, torn from the pad, and animated into a two-column task board. Firebase Authentication and Cloud Firestore provide persistent accounts and real-time, per-user task synchronization.

## Features

- Email/password registration, sign-in, persistent sessions, and easy account access from the Create tab
- Separate task title and optional description fields
- Button and upward tear-handle submission gestures
- Jagged paper tear, curved fly-to-tab animation, Task-tab pulse, and optimistic badge updates
- FIFO submission queue with duplicate protection and failed-write recovery
- Two-column sticky-note board with stable per-task colors and rotations
- Animated completion checkmark and layout reflow
- Collapsible completed-task stack with task restoration
- Sticky-note editor for title, description, due date, and priority
- Real-time Firestore synchronization across devices
- System-aware reduced-motion behavior
- Persistent sound preference and a bundled, attribution-free paper-tear effect
- Keyboard-aware bottom tabs, warm paper UI, and accessible controls

## Tech stack

- Expo Router and React Navigation
- React Native and NativeWind
- React Native Reanimated and Gesture Handler
- React Native SVG
- Expo Audio
- Firebase Authentication and Cloud Firestore
- AsyncStorage for Firebase auth persistence and local sound preference only
- Kalam from Expo Google Fonts

Firestore is the canonical source of task data. The project does not use a second local task store.

## Firebase setup

1. Create or select a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web app** and copy its Firebase configuration values.
3. Enable **Email/Password** under **Authentication → Sign-in method**.
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

6. Publish `firestore.rules` with the Firebase Console or Firebase CLI. The included rules require authentication and scope each task to the UID in its `userId` field.

Firebase Web API keys identify the Firebase project; access control is enforced by Authentication and Firestore Security Rules. `.env.local` is ignored by Git so each developer can use their own configuration.

## Install and run

```bash
npm install
npx expo start
```

From the Expo terminal, press `a` for Android, `i` for iOS on macOS, or `w` for web. Authentication and Firestore work in Expo Go for the APIs used by this project.

## How it works

### Creating a task

Enter a required title and an optional description. Submit with **Add task** or pull upward from the perforated tear handle. The composer clears immediately so another task can be entered while previous submissions are processed in order.

Each accepted draft receives its Firestore document ID before animation. The root animation coordinator flies its snapshot toward the measured Tasks tab icon, updates the optimistic badge on arrival, and then writes the exact reserved ID to Firestore. Failed writes expose retry and draft-restoration actions without silently losing the task.

### Managing tasks

The Tasks tab displays active notes using deterministic paper colors and rotations, so their appearance remains stable across reloads. Cards show only the title, creation time, and completion control. Tap a task to edit it, or long-press it for task actions.

Completing a note draws its checkmark, dismisses it from the active board, and persists `completed: true`. Completed notes remain in Firestore inside a collapsed stack and can be restored later.

### Motion and sound

Animation frames run on Reanimated shared values and worklets. If the operating system requests reduced motion, the physical tear and long flight are replaced with a short, low-distance transition. Tear audio is preloaded once with Expo Audio; it can be muted from the account menu on the Create screen, and that preference is persisted locally.

The bundled `assets/sounds/tear.wav` is an original generated effect and requires no attribution.

## Quality checks

```bash
npm test
npx tsc --noEmit
npm run lint
npx expo export --platform web
npx expo export --platform android
```

For final animation acceptance, test on physical mid-range Android and iOS devices. Confirm keyboard behavior, safe areas, rapid submissions, backgrounding during flight, audio synchronization, and the device reduced-motion setting.

## Project structure

- `app/` — Expo Router authentication, protected tabs, and modal editor routes
- `screens/` — sticky composer, task board, editor, sign-in, and registration screens
- `components/` — sticky notes, torn edges, fly overlay, tab icon, action sheets, and paper texture
- `components/ui/` — shared paper-themed inputs, buttons, feedback, and form controls
- `context/` — authentication, task subscription, toast, and animation coordination
- `hooks/` — reusable tear-sound playback
- `services/` — Firebase initialization and authentication/task operations
- `utils/` — stable sticky-note presentation, dates, and submission-queue helpers
- `types/` — typed users, tasks, task inputs, priorities, and filters
- `__tests__/` — sticky-note and submission-queue unit tests
- `assets/` — images, fonts, and the owned paper-tear sound

## Data model

Existing Firestore task documents remain compatible. Task presentation values such as paper color and rotation are derived from a stable hash of the task ID and are not stored. Quick-created tasks use medium priority and today's normalized due date; the editor can change both values.
