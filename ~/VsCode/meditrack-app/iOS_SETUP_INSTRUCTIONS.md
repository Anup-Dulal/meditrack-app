# MediTrack iOS Setup Instructions

## Prerequisites Check

Before proceeding with iOS development, ensure you have the following installed:

### 1. Xcode
```bash
# Check if Xcode is installed
xcode-select -p

# If not installed, install Xcode Command Line Tools
xcode-select --install

# Or install full Xcode from App Store
```

### 2. Rust Toolchain
```bash
# Check if Rust is installed
rustc --version
cargo --version

# If not installed, install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios

# Verify iOS targets
rustup target list | grep ios
```

### 3. Tauri CLI
```bash
# Install Tauri CLI
cargo install tauri-cli

# Verify installation
cargo tauri --version
```

### 4. Node.js and npm
```bash
# Check Node.js version (should be 16+)
node --version
npm --version
```

---

## iOS Project Initialization

Once all prerequisites are installed, follow these steps:

### Step 1: Navigate to Project Directory
```bash
cd ~/VsCode/meditrack-app/desktop
```

### Step 2: Initialize iOS Project
```bash
# This creates the iOS project structure
cargo tauri ios init

# This will:
# - Create src-tauri/ios/ directory
# - Generate Xcode project files (App.xcworkspace)
# - Set up signing configuration
# - Create necessary certificates
```

### Step 3: Verify iOS Project Structure
After initialization, you should see:
```
desktop/src-tauri/ios/
├── App.xcworkspace
├── App.xcodeproj
├── App/
│   ├── Assets.xcassets/
│   ├── Info.plist
│   └── [iOS app files]
└── Pods/
```

---

## Building for iOS

### Build for iOS Simulator
```bash
# Build for iOS Simulator (x86_64)
cargo tauri ios build --simulator

# With verbose output for debugging
cargo tauri ios build --simulator --verbose
```

### Build for Physical Device
```bash
# Build for physical iOS device (ARM64)
cargo tauri ios build

# With verbose output
cargo tauri ios build --verbose
```

---

## Running on iOS Simulator

### Option 1: Using Xcode GUI
```bash
# Open Xcode project
open desktop/src-tauri/ios/App.xcworkspace

# Then:
# 1. Select target device (iPhone 15, iPhone 14, etc.)
# 2. Click "Run" button or press Cmd+R
# 3. Wait for build and simulator launch
```

### Option 2: Using Command Line
```bash
# Build and run on simulator with hot reload
cargo tauri ios dev

# This will:
# - Build the app
# - Launch iOS Simulator
# - Install and run the app
# - Enable hot reload for development
```

### Option 3: Using Xcode Command Line Tools
```bash
# Build for simulator
xcodebuild -workspace desktop/src-tauri/ios/App.xcworkspace \
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

### Step 1: Configure Signing in Xcode
```bash
# Open Xcode project
open desktop/src-tauri/ios/App.xcworkspace
```

In Xcode:
1. Select "App" target
2. Go to "Signing & Capabilities" tab
3. Select your Apple Developer Team
4. Update bundle identifier if needed (currently: com.meditrack.app)
5. Ensure provisioning profile is selected

### Step 2: Build for Device
```bash
cargo tauri ios build
```

### Step 3: Install and Run
```bash
# Using Xcode
xcodebuild -workspace desktop/src-tauri/ios/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination generic/platform=iOS \
  -derivedDataPath build
```

---

## Testing Checklist

### Authentication & Login
- [ ] App launches successfully
- [ ] Login page displays correctly
- [ ] Login with demo credentials (admin/admin123)
- [ ] Verify successful login
- [ ] Check user profile display
- [ ] Test logout functionality
- [ ] Verify redirect to login after logout

### Inventory Management
- [ ] View inventory list
- [ ] Search medicines by name
- [ ] Filter by stock level
- [ ] Add new medicine
- [ ] Edit medicine details
- [ ] Delete medicine
- [ ] Check low stock alerts
- [ ] Verify expiry date tracking
- [ ] Test barcode lookup

### Sales & POS
- [ ] Open sales page
- [ ] Add items to cart
- [ ] Modify quantities
- [ ] Apply discounts
- [ ] Select payment method
- [ ] Generate receipt
- [ ] Print receipt (if available)
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
- [ ] App startup time (target: < 3 seconds)
- [ ] Page load time (target: < 2 seconds)
- [ ] Database queries (target: < 100ms)
- [ ] Memory usage (monitor in Xcode)
- [ ] Battery consumption (monitor in Xcode)

### UI/UX
- [ ] Responsive design on different screen sizes
- [ ] Touch interactions work smoothly
- [ ] Navigation is intuitive
- [ ] Font sizes are readable
- [ ] Color contrast is sufficient
- [ ] Landscape orientation works
- [ ] Keyboard handling is correct

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

### Common Issues & Solutions

#### Issue: "iOS target not found"
```bash
# Solution: Install iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios
```

#### Issue: Simulator Not Starting
```bash
# Reset simulator
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
xcodebuild -workspace desktop/src-tauri/ios/App.xcworkspace \
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

## Resources

- [Tauri iOS Documentation](https://tauri.app/v1/guides/getting-started/setup/ios)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [iOS Development Guide](https://developer.apple.com/ios/)
- [Swift Documentation](https://developer.apple.com/swift/)
- [App Store Connect](https://appstoreconnect.apple.com/)

---

## Next Steps

1. Install all prerequisites (Xcode, Rust, iOS targets)
2. Run `cargo tauri ios init` to create iOS project
3. Build for simulator: `cargo tauri ios build --simulator`
4. Run on simulator: `cargo tauri ios dev`
5. Follow the testing checklist
6. Document any issues found
7. Create test report

---

**Last Updated**: February 8, 2026
**MediTrack Version**: 1.0.0
**iOS Target**: iOS 13.0+
**Status**: Ready for iOS Testing Setup
