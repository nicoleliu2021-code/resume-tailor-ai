# Progressive Web App (PWA) Setup Guide

Your Resume AI app is now configured as a Progressive Web App! Users can install it on their devices for a native app-like experience.

## What's Been Added

### 1. PWA Configuration Files
- **`public/manifest.json`** - App metadata and installation settings
- **`public/service-worker.js`** - Offline functionality and caching
- **`public/offline.html`** - Fallback page when offline
- **`scripts/generate-icons.js`** - Icon generator script

### 2. Updated Files
- **`index.html`** - Added PWA meta tags, manifest link, and Apple/Microsoft tags
- **`src/main.tsx`** - Service worker registration and install prompt handling

## Next Steps

### 1. Generate App Icons

You need to create app icons for the PWA to display correctly on users' devices.

**Option A: Use the Icon Generator Script (Recommended)**

```bash
# Install sharp for image processing
npm install --save-dev sharp

# Create a source icon (512x512 PNG) and place it at:
# public/icon-source.png

# Generate all icon sizes
node scripts/generate-icons.js
```

**Option B: Manual Creation**

Create PNG icons with these sizes and place them in `public/icons/`:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

**Icon Design Tips:**
- Use your logo or a simple representation of your app
- Solid colors work best (indigo/purple gradient recommended)
- Keep important elements centered
- Ensure good contrast for visibility

### 2. Create Screenshots (Optional but Recommended)

Add screenshots to help users preview the app before installing:

```bash
mkdir -p public/screenshots

# Add screenshots:
# - desktop-1.png (1920x1080) - Desktop view
# - mobile-1.png (750x1334) - Mobile view
```

### 3. Test the PWA

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm run preview
```

**Test Installation:**
1. Open Chrome/Edge at `http://localhost:4173` (or your dev server)
2. Look for the install button in the address bar
3. Click install and test the app

**Test Offline Mode:**
1. Open DevTools (F12)
2. Go to Application > Service Workers
3. Check "Offline" to simulate no connection
4. Reload the page to see offline.html

### 4. PWA Features Available

✅ **Installable** - Users can install on desktop and mobile
✅ **Offline Support** - Basic caching for essential files
✅ **App Shortcuts** - Quick access to Optimizer and Format Advisor
✅ **Update Notifications** - Prompts users when new version available
✅ **Responsive** - Works on all screen sizes
✅ **Standalone Mode** - Runs like a native app

### 5. Deployment Checklist

Before deploying to production:

- [ ] Generate all required icons
- [ ] Add screenshots for app store listings
- [ ] Test installation on multiple devices
- [ ] Test offline functionality
- [ ] Verify service worker updates correctly
- [ ] Check manifest.json URLs are correct for your domain
- [ ] Enable HTTPS (required for service workers)
- [ ] Test on iOS Safari, Chrome, and Edge

### 6. Update Service Worker Cache

When you make changes to your app, update the cache version in `public/service-worker.js`:

```javascript
const CACHE_NAME = 'resume-ai-v2'; // Increment version number
```

This ensures users get the latest version.

## Testing in Production

### Chrome/Edge
1. Visit your deployed site
2. Click the install icon in the address bar (⊕ or 🖥️)
3. App installs and opens in standalone window

### Safari (iOS)
1. Visit your site in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. App icon appears on home screen

### Firefox
1. Visit your site
2. Click the three-dot menu
3. Select "Install"

## Customization

### Change App Colors
Edit `public/manifest.json`:
```json
{
  "theme_color": "#6366f1",      // Browser toolbar color
  "background_color": "#6366f1"  // Splash screen color
}
```

### Modify Caching Strategy
Edit `public/service-worker.js` to change which files are cached and how:
- **Network First**: Try network, fall back to cache (current)
- **Cache First**: Serve from cache, update in background
- **Cache Only**: Only use cached content

### Add Push Notifications
Service worker already includes push notification handlers. To enable:

1. Request permission in your app
2. Subscribe to push service
3. Send notifications from your backend

## Troubleshooting

**Service worker not registering:**
- Check browser console for errors
- Ensure HTTPS is enabled (localhost works too)
- Clear browser cache and try again

**Icons not showing:**
- Verify icons exist in `public/icons/`
- Check manifest.json paths are correct
- Clear site data in DevTools > Application

**Install prompt not appearing:**
- PWA criteria must be met (HTTPS, manifest, service worker, icons)
- Some browsers auto-hide prompt if dismissed previously
- Check DevTools > Application > Manifest for issues

**Offline page not showing:**
- Service worker must be active first
- Try visiting the site online, then go offline
- Check network tab is set to offline mode

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)

## Support

Your app now provides:
- Fast loading with service worker caching
- Offline access to previously viewed content
- Native app-like experience when installed
- Automatic updates in the background
- Lower data usage with smart caching

Test thoroughly before deploying to production!
