# ATS-UCE Tauri shell

This folder contains the Tauri v2 shell for building desktop installers and Android APK/AAB artifacts from the existing Vite frontend.

## Local requirements

- Rust stable with the platform toolchain for desktop builds.
- Node.js and npm.
- Android Studio, `JAVA_HOME`, `ANDROID_HOME`, and `NDK_HOME` for Android builds.

## Commands

Run these from `frontend/`.

```bash
npm run tauri:dev
npm run tauri:build
npm run tauri:android:init
npm run tauri:android:dev
npm run tauri:android:build
```

`tauri:android:init` creates `src-tauri/gen/android` the first time Android support is initialized.

## API target

The web deployment keeps using relative `/api` routes through Nginx. For APK or desktop builds that must call QA or production on AWS, build with a public API base URL:

```bash
VITE_API_BASE_URL=https://qa.example.edu.ec npm run tauri:android:build
VITE_API_BASE_URL=https://app.example.edu.ec npm run tauri:build
```

Do not point a mobile build at Docker-only hosts such as `api` or `localhost` unless the backend is actually reachable from the device.

## CI/CD note

The existing GitHub Actions workflows still run the normal frontend command, `npm run build`, and the AWS deploy workflows still use Docker Compose. Tauri builds are opt-in local/release commands and are not part of the dev -> qa -> main deployment path.
