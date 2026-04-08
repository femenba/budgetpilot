# App Icon & Splash Screen Assets

Place your master source images here before running `capacitor-assets`.

## Required source files

| File | Size | Notes |
|------|------|-------|
| `icon.png` | 1024×1024 px | App icon master. No transparency/alpha channel. Background color: `#0f172a`. |
| `splash.png` | 2732×2732 px | Splash screen master. Place your logo centered. Background color: `#0f172a`. |

## Generate all sizes

Once both source files are in place, run from the project root:

```bash
npx capacitor-assets generate \
  --iconBackgroundColor '#0f172a' \
  --splashBackgroundColor '#0f172a'
```

This command outputs:
- `public/icons/icon-180.png` — apple-touch-icon
- `public/icons/icon-192.png` — PWA maskable
- `public/icons/icon-512.png` — PWA maskable
- `public/icons/icon-1024.png` — App Store Connect (no alpha)
- `public/splash/apple-splash-*.png` — one per iOS device class
- Icon sizes inside `ios/` for the native Xcode project (after `cap add ios`)

## Important: App Store Connect icon

The `icon-1024.png` must have **no alpha channel** (no transparency).
If your master `icon.png` has transparency, set `--iconBackgroundColor` to fill it.

## After generating

Run `npx cap sync ios` to copy the assets into the native iOS project.
