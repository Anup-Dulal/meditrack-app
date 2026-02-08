# MediTrack Cross-Platform Build Guide

This guide explains how to build MediTrack for iOS, Windows, macOS, and Android using Tauri.

## Architecture

MediTrack now uses **Tauri** for cross-platform support:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust (Tauri)
- **Database**: SQLite (via rusqlite for native, sql.js for web)
- **Platforms**: Windows, macOS, iOS, Android, Web

## Prerequisites

### For All Platforms
```bash
# Install Node.js (v18+)
node --version

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup --version
```

### For iOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios

# Install Tauri iOS dependencies
cargo install tauri-cli --version "^2.0"
```

### For Windows
```bash
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"

# Or use winget
winget install Microsoft.VisualStudio.2022.BuildTools
```

### For Android
```bash
# Install Android SDK
# Download Android Studio from: https://developer.android.com/studio

# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install Rust Android targets
rustup target add aarch64-linux-android armv7-linux-androideabi
```

## Project Structure

```
meditrack-app/
├── desktop/
│   ├── src/                    # React frontend
│   ├── src-tauri/              # Tauri backend (Rust)
│   │   ├── src/main.rs         # Tauri commands
│   │   ├── Cargo.toml          # Rust dependencies
│   │   └── tauri.conf.json     # Tauri configuration
│   ├── package.json            # Node dependencies
│   └── vite.config.ts          # Vite configuration
```

## Development

### Web Development (Browser)
```bash
cd desktop
npm run dev
# Opens at http://localhost:5173
```

### Desktop Development (Tauri)
```bash
cd desktop
npm run dev:tauri
# Launches native desktop app with hot reload
```

## Building for Production

### macOS
```bash
cd desktop
npm run build:tauri

# Output: src-tauri/target/release/bundle/macos/MediTrack.app
```

### Windows
```bash
cd desktop
npm run build:tauri

# Output: src-tauri/target/release/MediTrack.exe
```

### iOS
```bash
cd desktop

# Initialize iOS project
cargo tauri ios init

# Build for iOS
cargo tauri ios build

# Output: src-tauri/target/aarch64-apple-ios/release/
```

### Android
```bash
cd desktop

# Initialize Android project
cargo tauri android init

# Build for Android
cargo tauri android build

# Output: src-tauri/target/aarch64-linux-android/release/
```

## Configuration

### Tauri Configuration (src-tauri/tauri.conf.json)

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "MediTrack",
        "width": 1200,
        "height": 800,
        "resizable": true
      }
    ]
  },
  "tauri": {
    "bundle": {
      "targets": "all",
      "identifier": "com.meditrack.app"
    }
  }
}
```

## Database

### Web (Browser)
- Uses `sql.js` (JavaScript SQLite)
- Data stored in localStorage
- Automatically synced

### Native (Desktop/Mobile)
- Uses `rusqlite` (Rust SQLite)
- Data stored in local file system
- Full SQLite support

### Database Initialization
```typescript
import { initializeDatabase } from './services/database'

// Automatically detects platform and initializes appropriate database
await initializeDatabase()
```

## Platform-Specific Features

### iOS
- Native file system access
- Camera integration (for barcode scanning)
- Push notifications
- Offline support

### Windows
- System tray integration
- Windows notifications
- File associations
- Auto-update support

### Android
- Material Design UI
- Camera access
- Notification channels
- Background services

## Signing & Distribution

### iOS App Store
```bash
# Create Apple Developer account
# Generate certificates and provisioning profiles
# Update signing configuration in tauri.conf.json

cargo tauri ios build --release
# Submit to App Store Connect
```

### Google Play Store
```bash
# Create Google Play Developer account
# Generate signing key

cargo tauri android build --release
# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk alias_name

# Align APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
# Upload to Google Play Console
```

### Windows Store
```bash
# Create Microsoft Partner Center account
# Generate certificate

cargo tauri build --target x86_64-pc-windows-msvc
# Package as MSIX
# Upload to Microsoft Store
```

## Troubleshooting

### iOS Build Issues
```bash
# Clear build cache
rm -rf src-tauri/target

# Update Rust
rustup update

# Reinstall iOS targets
rustup target add aarch64-apple-ios
```

### Android Build Issues
```bash
# Ensure Android SDK is properly installed
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list

# Update Gradle
./gradlew wrapper --gradle-version latest
```

### Database Issues
```bash
# Clear database cache
localStorage.clear()  # For web
rm meditrack.db       # For desktop
```

## Performance Optimization

### Bundle Size
- Web: ~2.5MB (gzipped)
- Desktop: ~50MB
- Mobile: ~30MB

### Database Performance
- Indexes on frequently queried columns
- Connection pooling for concurrent access
- Batch operations for bulk inserts

## Security Considerations

1. **Database Encryption**
   - Use SQLCipher for encrypted databases
   - Implement key management

2. **API Security**
   - HTTPS only for network requests
   - Certificate pinning for mobile

3. **Authentication**
   - Secure token storage
   - Biometric authentication support

4. **Data Privacy**
   - GDPR compliance
   - Data export functionality
   - Secure deletion

## Continuous Integration

### GitHub Actions Example
```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: npm ci
      - run: npm run build:tauri
```

## Resources

- [Tauri Documentation](https://tauri.app)
- [Rust Book](https://doc.rust-lang.org/book/)
- [React Documentation](https://react.dev)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## Support

For issues and questions:
1. Check Tauri documentation
2. Review platform-specific guides
3. Check GitHub issues
4. Contact support team
