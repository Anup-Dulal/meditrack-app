# MediTrack iOS Testing Guide

## Prerequisites

### System Requirements
- macOS 12.0 or later
- Xcode 14.0 or later
- iOS 13.0 or later (target device)
- Rust toolchain with iOS targets
- 10GB free disk space

### Installation Steps

#### 1. Install Xcode Command Line Tools
```bash
xcode-select --install
```

#### 2. Install Rust and iOS Targets
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios

# Verify installation
rustup target list | grep ios
```

#### 3. Install Tauri CLI
```bash
cargo install tauri-cli
```

#### 4. Verify Installation
```bash
# Check Xcode
xcode-select -p

# Check Rust
rustc --version
cargo --version

# Check iOS targets
rustup target list | grep ios
```

---

## Building for iOS

### Step 1: Navigate to Project Directory
```bash
cd ~/VsCode/meditrack-app/desktop
```

### Step 2: Initialize iOS Project (First Time Only)
```bash
cargo tauri ios init
```

This will:
- Create iOS project structure
- Generate Xcode project files
- Set up signing configuration
- Create necessary certificates

### Step 3: Build for iOS Simulator
```bash
# Build for iOS Simulator (x86_64)
cargo tauri ios build --simulator

# Or with verbose output
cargo tauri ios build --simulator --verbose
```

**Build Output Location**:
```
src-tauri/target/aarch64-apple-ios/release/
```

### Step 4: Build for iOS Device
```bash
# Build for physical iOS device (ARM64)
cargo tauri ios build

# With verbose output
cargo tauri ios build --verbose
```

---

## Running on iOS Simulator

### Option 1: Using Xcode
```bash
# Open Xcode project
open src-tauri/ios/App.xcworkspace

# Or
open src-tauri/ios/App.xcodeproj
```

Then:
1. Select target device (iPhone 15, iPhone 14, etc.)
2. Click "Run" button or press Cmd+R
3. Wait for build and simulator launch

### Option 2: Using Command Line
```bash
# Build and run on simulator
cargo tauri ios dev

# This will:
# - Build the app
# - Launch iOS Simulator
# - Install and run the app
# - Enable hot reload
```

### Option 3: Using Xcode Command Line
```bash
# Build
xcodebuild -workspace src-tauri/ios/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath build

# Run on simulator
xcrun simctl install booted build/Release-iphonesimulator/App.app
xcrun simctl launch booted com.meditrack.app
```

---

## Running on Physical iOS Device

### Prerequisites
- Apple Developer Account
- Provisioning Profile
- Development Certificate
- Physical iOS device connected via USB

### Step 1: Configure Signing
```bash
# Open Xcode project
open src-tauri/ios/App.xcworkspace
```

In Xcode:
1. Select "App" target
2. Go to "Signing & Capabilities"
3. Select your team
4. Update bundle identifier if needed
5. Ensure provisioning profile is selected

### Step 2: Build for Device
```bash
cargo tauri ios build
```

### Step 3: Install and Run
```bash
# Using Xcode
xcodebuild -workspace src-tauri/ios/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination generic/platform=iOS \
  -derivedDataPath build

# Then install on device
xcrun -sdk iphoneos cp -r build/Release-iphoneos/App.app /var/mobile/Containers/Bundle/Application/
```

---

## Testing Checklist

### Authentication
- [ ] Login with demo credentials (admin/admin123)
- [ ] Verify login success
- [ ] Check user profile display
- [ ] Test logout functionality
- [ ] Verify redirect to login after logout

### Inventory Management
- [ ] View inventory list
- [ ] Search medicines
- [ ] Filter by stock level
- [ ] Add new medicine
- [ ] Edit medicine details
- [ ] Delete medicine
- [ ] Check low stock alerts
- [ ] Verify expiry date tracking

### Sales & POS
- [ ] Open sales page
- [ ] Add items to cart
- [ ] Modify quantities
- [ ] Apply discounts
- [ ] Select payment method
- [ ] Generate receipt
- [ ] Print receipt
- [ ] View transaction history

### Customers
- [ ] View customer list
- [ ] Search customers
- [ ] Add new customer
- [ ] Edit customer details
- [ ] View loyalty points
- [ ] Check purchase history
- [ ] Delete customer

### Reports
- [ ] Generate sales report
- [ ] Generate inventory report
- [ ] Generate financial report
- [ ] Export to CSV
- [ ] View statistics
- [ ] Check date range filtering

### Barcode Scanning
- [ ] Open barcode scanner
- [ ] Scan/enter barcode
- [ ] Verify medicine lookup
- [ ] Add scanned item to cart
- [ ] Test batch scanning

### Admin Features
- [ ] Access admin dashboard
- [ ] View user management
- [ ] Check audit logs
- [ ] View system settings
- [ ] Verify role-based access

### Performance
- [ ] Check app startup time (< 3 seconds)
- [ ] Verify page load time (< 2 seconds)
- [ ] Test database queries (< 100ms)
- [ ] Check memory usage
- [ ] Verify battery consumption

### UI/UX
- [ ] Check responsive design
- [ ] Verify touch interactions
- [ ] Test navigation
- [ ] Check font sizes
- [ ] Verify color contrast
- [ ] Test landscape orientation
- [ ] Check keyboard handling

### Offline Functionality
- [ ] Enable airplane mode
- [ ] Verify app still works
- [ ] Check data persistence
- [ ] Test sync when online

### Error Handling
- [ ] Test invalid login
- [ ] Try duplicate entries
- [ ] Test network errors
- [ ] Verify error messages
- [ ] Check recovery options

---

## Debugging

### Enable Debug Logging
```bash
# Build with debug symbols
cargo tauri ios build --verbose

# Or set environment variable
RUST_LOG=debug cargo tauri ios build
```

### View Console Output
```bash
# In Xcode
# Window > Devices and Simulators > Select device > View Device Logs

# Or via command line
xcrun simctl spawn booted log stream --predicate 'process == "App"'
```

### Common Issues

#### Issue: Build Fails with "iOS target not found"
```bash
# Solution: Install iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios
```

#### Issue: Simulator Not Starting
```bash
# Solution: Reset simulator
xcrun simctl erase all

# Or restart simulator
killall "Simulator"
open -a Simulator
```

#### Issue: App Crashes on Launch
```bash
# Check logs
xcrun simctl spawn booted log stream --predicate 'process == "App"'

# Check Xcode console for error messages
```

#### Issue: Database Not Persisting
```bash
# Verify database path
# iOS: ~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Documents/

# Check file permissions
ls -la ~/Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Documents/
```

---

## Performance Testing

### Memory Profiling
1. Open Xcode
2. Product > Profile
3. Select "Memory" instrument
4. Run app and interact with features
5. Check memory usage

### CPU Profiling
1. Open Xcode
2. Product > Profile
3. Select "System Trace" instrument
4. Monitor CPU usage during operations

### Network Profiling
1. Open Xcode
2. Product > Profile
3. Select "Network" instrument
4. Monitor network activity

---

## Testing on Different iOS Versions

### Available Simulators
```bash
# List available simulators
xcrun simctl list devices

# Create new simulator
xcrun simctl create "iPhone 15" com.apple.CoreSimulator.SimDeviceType.iPhone-15 com.apple.CoreSimulator.SimRuntime.iOS-17-2
```

### Test on Multiple Versions
```bash
# iOS 13
cargo tauri ios build --target x86_64-apple-ios

# iOS 14
cargo tauri ios build --target x86_64-apple-ios

# iOS 15+
cargo tauri ios build --target aarch64-apple-ios
```

---

## Submitting to App Store

### Prerequisites
- Apple Developer Account ($99/year)
- App Store Connect access
- Signing certificates
- Provisioning profiles

### Steps
1. Create App ID in App Store Connect
2. Configure signing in Xcode
3. Build release version
4. Archive app
5. Upload to App Store Connect
6. Submit for review

```bash
# Build release version
cargo tauri ios build --release

# Archive
xcodebuild -workspace src-tauri/ios/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/App.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

---

## Troubleshooting

### Build Issues
- Clear build cache: `cargo clean`
- Update Rust: `rustup update`
- Reinstall iOS targets: `rustup target add aarch64-apple-ios`

### Runtime Issues
- Check console logs in Xcode
- Enable debug logging
- Test on different iOS versions
- Check device storage

### Performance Issues
- Profile with Xcode instruments
- Check memory leaks
- Optimize database queries
- Reduce bundle size

---

## Resources

- [Tauri iOS Documentation](https://tauri.app/v1/guides/getting-started/setup/ios)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [iOS Development Guide](https://developer.apple.com/ios/)
- [Swift Documentation](https://developer.apple.com/swift/)

---

## Support

For issues or questions:
1. Check this guide
2. Review Tauri documentation
3. Check GitHub issues
4. Contact support team

---

**Last Updated**: February 8, 2026
**MediTrack Version**: 1.0.0
**iOS Target**: iOS 13.0+
