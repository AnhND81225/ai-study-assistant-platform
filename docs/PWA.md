# PWA

## Overview

The frontend is installable as a Progressive Web App with a manifest, standalone display mode, safe static caching, and offline fallback.

## Manifest Requirements

- App name and short name.
- Theme color and background color.
- `display: standalone`.
- `start_url: /`.
- App icons.

## Service Worker Strategy

Use Vite PWA plugin to generate a service worker. Cache static assets only.

## Safe Caching Strategy

Do not cache authenticated API responses, image URLs, submission data, grading results, or AI responses.

## Offline Fallback

Offline users see a fallback page. AI features, upload, login, and history require network access.

## Install Guide

Android Chrome:

1. Open the app.
2. Browser menu.
3. Install app.

iOS Safari:

1. Open the app.
2. Share.
3. Add to Home Screen.

## Limitations

- AI features require internet.
- Upload requires internet.
- iOS PWA install behavior depends on Safari.

## Testing Checklist

- Manifest loads.
- Service worker registers.
- App is installable on HTTPS or localhost.
- Offline fallback appears.
- Private API responses are not cached.
- Mobile layout has large tap targets.
