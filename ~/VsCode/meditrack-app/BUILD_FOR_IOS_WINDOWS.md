# Quick Start: Building MediTrack for iOS & Windows

## Overview
MediTrack now supports iOS, Windows, macOS, and Android using Tauri. This guide covers the quickest path to get your app running on iOS and Windows.

## Prerequisites

### macOS (for iOS development)
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios

# Install Tauri CLI
cargo install tauri-cli
```

### Windows
```bash
# Install Visual Studio Build Tools
# Download: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"

# Install Rust
https://rustup.rs/

# Install Tauri CLI
cargo install tauri-cli
```

## Quick Build Commands

### For iOS
```bash
cd ~/VsCode/meditrack-app/desktop

# Initialize iOS project (first time only)
cargo tauri ios init

# Build for iOS Simulator
cargo tauri ios build --simulator

# Build for iOS Device
cargo tauri ios build

# Output: src-tauri/target/aarch64-apple-ios/release/
```

### For Windows
```bash
cd ~/VsCode/meditrack-app/desktop

# Build for Windows
npm run build:tauri

# Output: src-tauri/target/release/MediTrack.exe
```

## Development Mode

### iOS Development
```bash
cd ~/VsCode/meditrack-app/desktop

# Run in development mode with hot reload
cargo tauri ios dev
```

### Windows Development
```bash
cd ~/VsCode/meditrack-app/desktop

# Run in development mode with hot reload
npm run dev:tauri
```

## Project Structure

```
desktop/
├── src/                    # React frontend (shared across all platforms)
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/main.rs         # Database and API commands
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Platform configuration
├── package.json            # Node dependencies
└── vite.config.ts          # Frontend build config
```

## Database

- **iOS/Windows**: Uses SQLite via Rust backend (rusqlite)
- **Web**: Uses sql.js (JavaScript SQLite)
- **Automatic**: Platform detection happens at runtime

## Key Features

✅ **Cross-Platform**: Single codebase for iOS, Windows, macOS, Android, Web
✅ **Native Performance**: Rust backend for speed
✅ **Offline Support**: Local SQLite database
✅ **Hot Reload**: Development mode with instant updates
✅ **Code Sharing**: React frontend works on all platforms

## Troubleshooting

### iOS Build Fails
```bash
# Clear cache
rm -rf src-tauri/target

# Update Rust
rustup update

# Reinstall iOS targets
rustup target add aarch64-apple-ios
```

### Windows Build Fails
```bash
# Ensure Visual Studio Build Tools are installed
# Check: Settings > Apps > Programs and Features

# Update Rust
rustup update

# Clear cache
cargo clean
```

### Database Issues
```bash
# Clear database
rm meditrack.db  # Desktop
localStorage.clear()  # Web
```

## Next Steps

1. **Test on Simulator/Emulator**
   - iOS: Xcode simulator
   - Windows: Native app

2. **Sign for Distribution**
   - iOS: Apple Developer account required
   - Windows: Code signing certificate

3. **Submit to App Stores**
   - iOS: App Store Connect
   - Windows: Microsoft Store

## Resources

- [Tauri Documentation](https://tauri.app)
- [iOS Development Guide](https://developer.apple.com/ios/)
- [Windows Development Guide](https://docs.microsoft.com/en-us/windows/apps/)
- [Rust Book](https://doc.rust-lang.org/book/)

## Support

For detailed information, see `CROSS_PLATFORM_GUIDE.md`
