# PWA

## Overview

The frontend is installable as a Progressive Web App with a manifest, standalone display mode, safe static caching, offline fallback, an install prompt banner when supported, and an online/offline status banner.

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

Authenticated screens also show an offline banner and disable upload, explanation, and grading actions while the browser is offline.

## Install Prompt UX

When the browser fires `beforeinstallprompt`, the app shows a lightweight install banner. Android Chrome commonly supports this prompt. iOS Safari does not expose the same event, so iOS users should install through the Share menu.

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

## Mobile Scanner Behavior

- Explain and grade flows use a shared scanner input.
- Mobile users can open the rear camera with `capture="environment"` when the browser supports it.
- Users can also choose from the gallery, preview the image, rotate it 90 degrees, or clear it before upload.
- Scanning is a frontend image-preparation step only; OpenAI is still called only by the Spring Boot backend.

## Testing Checklist

- Manifest loads.
- Service worker registers.
- App is installable on HTTPS or localhost.
- Install banner appears on supported browsers before installation.
- Offline fallback appears.
- Authenticated actions are blocked while offline.
- Private API responses are not cached.
- Mobile layout has large tap targets.
- Camera/gallery upload controls work on mobile browsers.
- Rotate keeps the selected image uploadable.
