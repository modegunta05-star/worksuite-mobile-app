# Worksuite Mobile App Specification

## 1. Project Overview

Worksuite Mobile App is a Vue 3 and Framework7 mobile client for a Worksuite CRM backend. The app is packaged as both:

- A web/PWA build served from `www/`.
- A Cordova mobile app build served from `cordova/www/` for Android and iOS.

The app is a client-only frontend. It does not include the Worksuite backend. At runtime, the user enters a Worksuite domain, the app verifies the backend RestAPI module, stores the selected domain, then authenticates against that domain's `/api/v1` API.

## 2. Tech Stack

### Frontend

- Vue `^3.4.29`
- Framework7 `^8.3.3`
- Framework7 Vue `^8.3.3`
- Framework7 Icons `^5.0.5`
- Material Icons `^1.13.12`
- SCSS/Sass `^1.77.6`
- Swiper `^11.1.4`
- Skeleton Elements `^4.0.1`

### State, Data, and Utilities

- Vuex `^4.1.0` for app state, auth state, company data, translations, and UI flags.
- Axios `^1.7.2` for API requests.
- Moment `^2.30.1` and Moment Timezone `^0.5.45` for date/time formatting.
- Lodash `^4.17.21` for object lookup and collection helpers.
- jQuery `^3.7.1` and Dom7 for legacy/helper DOM usage.

### Build and Tooling

- Vite `^5.3.1`
- `@vitejs/plugin-vue`
- Rollup `^4.18.0`
- Workbox CLI `^7.1.0` for service worker generation.
- PostCSS Preset Env
- Framework7 CLI configuration in `framework7.json`

### Mobile Packaging

- Apache Cordova
- Cordova Android `^13.0.0`
- Cordova iOS `^7.1.0`
- Cordova plugins:
  - `cordova-plugin-statusbar`
  - `cordova-plugin-keyboard`
  - `cordova-plugin-splashscreen`
  - `cordova-plugin-camera`
  - `cordova-plugin-device`
  - `cordova-plugin-appversion`
  - `cordova-plugin-whitelist`
  - `cordova-plugin-inappbrowser`
  - `cordova-plugin-enable-cleartext-traffic`
  - `cordova-plugin-firebase-messaging`

## 3. Application Architecture

### High-Level Flow

1. `src/index.html` loads the root `<div id="app"></div>` and the Vite entry module `src/js/app.js`.
2. `src/js/app.js` creates the Vue application, installs Framework7 Vue, installs Vuex, registers global Framework7 components, registers app directives, and mounts `src/components/app.vue`.
3. `src/components/app.vue` configures Framework7, routing, service worker behavior, Cordova behavior, and Axios interceptors.
4. If the user is not authenticated, the app shows the domain screen and login screen.
5. If the user is authenticated, the app shows the side menu and main Framework7 view, initially routed to `/self/dashboard`.
6. Pages call the configured Axios client, which prefixes relative URLs with the selected domain's `/api/v1` base URL and adds the bearer token.

### Entry Points

- `src/index.html`: HTML shell used by Vite.
- `src/js/app.js`: JavaScript/Vue bootstrap.
- `src/components/app.vue`: Root Framework7 app component.
- `src/js/routes.js`: Framework7 route table.
- `src/js/vue/store/index.js`: Vuex store and persisted application state.
- `src/js/vue/boot/axiosHttp.js`: Axios instance.
- `src/js/cordova-app.js`: Cordova device integration helpers.

### Runtime Modes

The Vite config uses `TARGET` to switch output mode:

- `TARGET=web`: builds into `www/` and enables PWA manifest/service worker behavior.
- `TARGET=cordova`: builds into `cordova/www/`, injects `cordova.js`, and prepares assets for native packaging.

`vite.config.js` sets:

- Source root: `src/`
- Public assets: `public/`
- Web build output: `www/`
- Cordova build output: `cordova/www/`
- Alias: `@` maps to `src/`

## 4. Folder Structure

```text
.
|-- build/
|   `-- build-cordova.js
|-- cordova/
|   |-- config.xml
|   |-- package.json
|   |-- plugins/
|   |-- res/
|   `-- www/
|-- public/
|   |-- icons/
|   `-- images/
|-- src/
|   |-- components/
|   |-- css/
|   |-- fonts/
|   |-- js/
|   |   |-- app.js
|   |   |-- cordova-app.js
|   |   |-- routes.js
|   |   `-- vue/
|   |       |-- boot/
|   |       |-- directives/
|   |       |-- mixins/
|   |       |-- scripts/
|   |       `-- store/
|   |-- pages/
|   `-- manifest.json
|-- www/
|-- framework7.json
|-- package.json
|-- vite.config.js
`-- workbox-config.js
```

### Important Directories

- `src/pages/`: Feature screens grouped by domain area, such as projects, tasks, clients, employees, attendance, expenses, leaves, tickets, invoices, estimates, notices, events, login, and domain setup.
- `src/pages/*/mixin.vue`: Feature-specific shared logic for several modules.
- `src/pages/*/skeleton.vue`: Loading skeleton UI for list/detail screens.
- `src/js/vue/mixins/common.vue`: Shared UI/date/translation helpers.
- `src/js/vue/scripts/cache.js`: Session storage cache wrapper for API responses.
- `public/`: Static assets copied by Vite.
- `www/`: Generated production PWA/web output.
- `cordova/`: Native mobile wrapper, Cordova plugins, icons, splash screens, and generated Cordova web assets.

## 5. Feature Modules

The route table includes these main modules:

- Dashboard
- Projects
- Project tasks and project members
- Tasks, subtasks, comments, notes, files, and timesheets
- Clients
- Leads
- Employees
- Attendance
- Leaves
- Expenses
- Tickets
- Estimates
- Invoices
- Calendar and events
- Noticeboard
- Login and domain selection
- Side menu
- 404 fallback

Many modules have both admin and self-service paths. For example, `/tasks` is used for broader task access and `/self/tasks` is used for employee/self views.

## 6. State Management

State is managed in `src/js/vue/store/index.js` with Vuex.

Persisted local storage keys include:

- `crm_company`
- `crm_translations`
- `crm_company_translations`
- `crm_user`
- `crm_token`
- `crm_expire`
- `crm_api_key`
- `crm_domain_key`

Important state fields:

- `host`: Selected Worksuite domain.
- `api_url`: Selected domain plus `/api/v1`.
- `company`: Company/app metadata from `/app`.
- `user`: Authenticated user object.
- `translation`: Active translation data.
- `companyTranslation`: Default company translation data.
- `token`: Bearer token returned by `/auth/login`.
- `expires`: Token expiration timestamp.
- `error`: Last API/application error.
- `reload` and `cacheInvalidated`: Signals used by components to refresh data.

The `isLoggedIn` getter checks that a token exists and that `expires` is still in the future.

## 7. API and Authentication

The backend API base URL is dynamic. The user enters a domain URL in `src/pages/domain.vue`.

Domain setup flow:

1. Validate the URL format.
2. Normalize the domain by removing trailing `/login`.
3. Call `{domain}/api/v1/purchased-module`.
4. Confirm the `RestAPI` module is installed.
5. Fetch translations from `{domain}/api/v1/lang`.
6. Fetch app/company data from `{domain}/api/v1/app`.
7. Store the domain and API URL in Vuex/localStorage.

Login flow:

1. `src/pages/login.vue` posts credentials to `/auth/login`.
2. Axios prefixes the request with the stored API URL.
3. On success, the token, expiry, and user are committed to Vuex/localStorage.
4. If the user's locale is not English, `/lang` is fetched again.

Axios behavior is configured in `src/components/app.vue`:

- Adds `Authorization: Bearer <token>` when a token exists.
- Prefixes relative URLs with `store.state.api_url`.
- Handles connection errors.
- Logs the user out and navigates to `/` on API error code `401`.
- Shows Framework7 dialogs for validation errors and API errors.

## 8. PWA Architecture

The web build is a PWA:

- Manifest: `src/manifest.json`
- Service worker output: `www/service-worker.js`
- Workbox config: `workbox-config.js`
- Web output directory: `www/`

`npm run build` runs Vite, then generates a Workbox service worker that precaches web assets including fonts, JS, CSS, images, SVGs, and HTML.

During development, service worker behavior should be disabled or set to update on reload in browser dev tools to avoid stale assets.

## 9. Cordova Architecture

Cordova project files are under `cordova/`.

Important files:

- `cordova/config.xml`: Native app metadata, permissions, platform preferences, icons, splash screens, and Firebase config file references.
- `cordova/package.json`: Cordova platform/plugin dependencies.
- `build/build-cordova.js`: Post-build script that converts the generated JS bundle into an IIFE-style bundle and adjusts `cordova/www/index.html` for Cordova runtime compatibility.

Cordova app id:

- `com.froiden.worksuite`

Cordova version in `config.xml`:

- `2.0.4`

Cordova platforms:

- Android
- iOS

Native integrations:

- Android back button handling
- Splash screen handling
- Keyboard behavior
- Status bar handling
- Firebase Cloud Messaging push notifications
- Camera
- Device info
- In-app browser

Firebase mobile builds expect platform config files:

- Android: `cordova/google-services.json`
- iOS: `cordova/GoogleService-Info.plist`

These files are referenced in `cordova/config.xml` and must exist for Firebase-enabled native builds.

## 10. Push Notification Flow

Push notification handling is implemented in `src/components/app.vue` using `cordova-plugin-firebase-messaging`.

On `deviceready`, the app:

- Sets the status bar.
- Clears notification badges.
- Requests notification permission.
- Retrieves the Firebase registration token.
- Registers the device with `/device/register`.
- Subscribes to foreground and background message handlers.

Notification payloads are mapped to app routes based on type. Supported route destinations include tasks, projects, notices, expenses, and leaves.

## 11. Caching

`src/js/vue/scripts/cache.js` provides a session-storage-backed cache:

- Default cache lifetime: 3600 seconds.
- `httpGet(endpoint)` returns cached data when valid, otherwise fetches with Axios and stores the response.
- Cache can be cleared globally, removed by key, or removed by matching endpoint prefix.

Auth and company data use localStorage because they must survive app restarts. Short-lived API response cache uses sessionStorage.

## 12. How to Run

### Prerequisites

- Node.js and npm.
- For Android Cordova builds: Android Studio, Android SDK, Java/JDK compatible with Cordova Android 13.
- For iOS Cordova builds: macOS with Xcode and CocoaPods.
- A running Worksuite backend with the RestAPI module enabled.

### Install Dependencies

```bash
npm install
```

The `postinstall` script copies Framework7 and Material icon font files into `src/fonts/`.

### Run Development Server

```bash
npm run dev
```

or:

```bash
npm start
```

Vite serves the app from `src/`. The server is configured with `host: true`, so it can be reached from other devices on the network if the firewall allows it.

### Build Web/PWA App

```bash
npm run build
```

Output:

```text
www/
```

This command also generates:

```text
www/service-worker.js
```

### Build Cordova App

```bash
npm run build-cordova
```

This runs:

1. Vite production build with `TARGET=cordova`.
2. `node ./build/build-cordova.js`.
3. `cordova build` inside the `cordova/` folder.

### Build Android

```bash
npm run build-cordova-android
```

### Run Android

```bash
npm run cordova-android
```

### Build iOS

```bash
npm run build-cordova-ios
```

### Run iOS

```bash
npm run cordova-ios
```

## 13. Configuration

Default static config is in `src/js/vue/config.js`:

```js
export const DOMAIN = 'https://worksuite-new.test';
export const API_URL = `${ DOMAIN }/api/v1`;
export const DOMAIN_LOGO = '/images/worksuite-logo.png';
```

At runtime, the selected domain overrides the default API base URL through Vuex and localStorage.

PWA and Cordova target injection is controlled by `vite.config.js` and `src/index.html`.

## 14. Development Guidelines

- Work primarily inside `src/`.
- Do not manually edit generated build output in `www/` or `cordova/www/`; rebuild instead.
- Keep route definitions centralized in `src/js/routes.js`.
- Keep persistent auth/company state in Vuex mutations so localStorage stays synchronized.
- Use `axiosHttp` for authenticated API requests so token injection and API URL prefixing are applied.
- Use feature mixins for repeated module behavior when following existing module patterns.
- Use `cache.js` for short-lived GET response caching where the UI can tolerate cached data.

## 15. Known Notes and Risks

- This source bundle includes generated folders (`www/`, `cordova/www/`, `cordova/plugins/`) as well as source files.
- The root `package.json` version is `2.0.3`, while `cordova/config.xml` declares version `2.0.4`.
- The README references `npm run cordova-build-prod`, but the actual available scripts are `build-cordova`, `build-cordova-ios`, and `build-cordova-android`.
- No automated test script is defined in the root `package.json`.
- Firebase native builds require the correct Android and iOS Firebase config files in the Cordova project.
- The app requires a compatible Worksuite backend. It cannot authenticate or load business data without the backend RestAPI endpoints.
