# Risk for iPhone

This Capacitor iOS project uses the desktop app's existing `index.html`, `styles.css`, artwork, and player scripts, so the iPhone app opens the same Risk interface. `mobile.css` only adjusts iPhone safe areas, touch input, and compact-screen placement.

## Build the native app

From this folder on macOS, run `npm ci` and `npm run cap:sync`, then open `ios/App/App.xcworkspace` in Xcode. Select your Apple signing team to run it on your iPhone or archive for distribution.

The `iOS IPA` GitHub Actions workflow can export a signed Ad Hoc IPA. Add these repository Actions secrets: `IOS_CERTIFICATE_P12_BASE64`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `KEYCHAIN_PASSWORD`, and `APPLE_TEAM_ID`. The certificate and provisioning profile must match `com.risk.musicplayer.mobile` and include the iPhones that will install an Ad Hoc IPA. Keep those signing files private; never commit them.

## Mobile functionality status

The same screens and styling are included, and the local library can import, play, and remove audio files selected from the iPhone Files app. Search and online streaming still call the desktop app's bundled Node service, which depends on Electron and desktop downloader binaries and cannot run as-is on iPhone. A mobile-compatible music service is still needed for those desktop features.
