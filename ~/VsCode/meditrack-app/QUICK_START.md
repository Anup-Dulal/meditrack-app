# MediTrack Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd ~/VsCode/meditrack-app/desktop
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:5173
```

### 4. You're Ready!
- Dashboard shows metrics
- Inventory displays medicines
- Sales shows transactions

## 📁 Project Structure

```
meditrack-app/
├── .kiro/specs/           # Specifications & docs
├── desktop/               # Main app
│   └── src/
│       ├── pages/         # Dashboard, Inventory, Sales
│       ├── store/         # Redux state management
│       └── App.tsx        # Main component
├── README.md              # Overview
└── DEVELOPMENT_GUIDE.md   # Full setup guide
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `MEDITRACK_SPEC.md` | Complete 8-phase specification |
| `PHASE_1_FOUNDATION.md` | Current phase details |
| `DEVELOPMENT_GUIDE.md` | Setup & coding standards |
| `WORKFLOW.md` | Git workflow & processes |
| `PHASE_1_SUMMARY.md` | Phase 1 completion summary |

## 🌿 Git Branches

```
main (production)
  └── feature/phase-1-foundation (current)
```

## 📝 Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm test          # Run tests
npm run lint      # Check code quality
```

## 🔧 Tech Stack

- React 18 + TypeScript
- Redux Toolkit
- Vite
- Tailwind CSS
- Vitest

## 🎯 Current Status

✅ Phase 1: Foundation Complete
- Project structure set up
- React & Redux configured
- Basic pages created
- Documentation written

⏳ Next: Phase 2 - Inventory Management

## 🚨 Troubleshooting

### Port Already in Use
```bash
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npx tsc --noEmit
```

## 📖 Learn More

1. Read `DEVELOPMENT_GUIDE.md` for detailed setup
2. Check `MEDITRACK_SPEC.md` for project overview
3. Review `PHASE_1_FOUNDATION.md` for current work
4. See `WORKFLOW.md` for git workflow

## 🎓 Key Concepts

### Redux Store
- `medicineSlice` - Medicine state
- `transactionSlice` - Transaction state

### Pages
- `Dashboard` - Metrics & overview
- `Inventory` - Medicine management
- `Sales` - Transaction history

### Styling
- Tailwind CSS classes
- Mobile-first approach
- Consistent spacing

## 🔗 Useful Links

- [React Docs](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## ✨ Next Steps

1. ✅ Install dependencies
2. ✅ Start dev server
3. ✅ Explore the app
4. ⏳ Read Phase 1 spec
5. ⏳ Start Phase 2 development

## 💡 Tips

- Use Redux DevTools for debugging
- Use React DevTools for component inspection
- Keep commits small and focused
- Test locally before pushing
- Update documentation as you go

## 🆘 Need Help?

1. Check `DEVELOPMENT_GUIDE.md`
2. Review relevant spec document
3. Check git log for similar changes
4. Create GitHub issue if stuck

---

**Ready to build? Start with `npm install` and `npm run dev`! 🚀**
