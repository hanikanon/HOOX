# Cryptvora — merged app (chat + settings)

## What I did

**Base app:** `cryptvora-chat` (your v10 upload) — already a full multi-page app
(chat list, channels, groups, courses, feed, profile, notifications, search)
with its own real, app-wide theme engine (`src/hooks/use-theme.tsx` +
`src/lib/themes.ts`) that writes CSS variables onto `<html>`, and already had
polished spring/fade page-transition animations in `src/routes/__root.tsx`
using framer-motion. That animation system is what now drives the whole app,
including the settings screens.

**Settings screens:** all 11 files from your permatar upload
(`SettingsApp`, `ProfileHeader`, `AppearanceScreen`, `EditProfileScreen`,
`AvatarSheet`, `QRScreen`, `SettingGroup`, `SettingItem`, `Toggle`,
`BottomSheet`, `SettingsContext`) copied in as-is under
`src/components/settings/` — same screens, same internal slide/fade
transitions between sub-screens (Account → Privacy → Appearance → etc.),
untouched.

**The link:**
- `src/routes/settings.tsx` now renders `<SettingsApp />` (previously a
  separate, simpler theme-swatch page).
- `src/routes/profile.tsx`'s gear icon (top-right of the cover photo) is now
  a real `<Link to="/settings">` — tapping it opens the full settings app,
  with the same page-transition animation every other route in the app uses.

**The color bridge (this was the important part):** permatar's
`AppearanceScreen` used to pick from its *own* local theme/accent list and
apply it only inside its own subtree via inline CSS variables — so a color
change there stayed inside the settings screen. I rewired it to call the
chat app's real `useTheme()` / `setTheme()` instead, and stripped the local
color override out of `themeStyle()` (kept only the non-color knobs: corner
radius, font size, blur — those stay local/cosmetic on purpose). Now picking
a theme swatch anywhere writes CSS variables onto `<html>`, the single shared
source every screen in the app reads from — so it changes colors everywhere,
immediately, not just on the settings page.

**Capacitor / SSR:** same situation as before — this was TanStack Start
(server-rendered). I converted it to a plain client-rendered TanStack Router
SPA (kept all the file-based routes, kept the router, just dropped the Nitro
server layer), which is what Capacitor needs. No server-function usage was
found anywhere in the actual app code, so nothing was lost.

## In-place updates (no more uninstall-before-install)

GitHub Actions runs on a fresh machine every build, so by default Android's
debug signing key was different every time — that's why Android was forcing
you to uninstall the old app before installing the new one. I generated a
fixed debug keystore (`android-keystore/debug.keystore.b64`, committed to the
repo) and added a step to the workflow that installs it before every build.
From now on, every APK is signed with the same key, so `adb install` /
tapping the new APK will just update the app in place.

**One-time catch:** the very first APK you install from this new keystore
still needs a clean install (old one on your phone was signed with a
different, throwaway key). After that first install, every future build from
this repo updates in place.

## Build it (same routine as before)

Since this is a fairly large restructuring (new files, removed old
`start.ts`/`server.ts`, different `package.json`/`vite.config.ts`), **replace**
the project folder rather than overlaying on top of it:

```bash
cd ~/cryptvora-mobile/cryptvora-android
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +
cd ~/storage/downloads
unzip -o cryptvora-app.zip -d ~/cryptvora-mobile/cryptvora-android
cd ~/cryptvora-mobile/cryptvora-android
git add . && git commit -m "merge chat app with permatar settings" && git push
gh workflow run build-android.yml
sleep 30
gh run watch
gh run download --name cryptvora-debug-apk --dir ~/storage/downloads/ --clobber
cd ~/storage/downloads && termux-open --view app-debug.apk
```
