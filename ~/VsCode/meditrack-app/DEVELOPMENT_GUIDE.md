# MediTrack Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Anup-Dulal/meditrack-app.git
cd meditrack-app
```

2. **Install dependencies**
```bash
cd desktop
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
meditrack-app/
├── .kiro/
│   └── specs/                 # Project specifications
│       ├── MEDITRACK_SPEC.md  # Main specification
│       └── PHASE_1_FOUNDATION.md
├── desktop/                   # Main Electron + React app
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store
│   │   │   └── slices/        # Redux slices
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── package.json           # Dependencies
│   ├── tsconfig.json          # TypeScript config
│   └── vite.config.ts         # Vite config
├── README.md                  # Project overview
└── DEVELOPMENT_GUIDE.md       # This file
```

## Available Scripts

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Git Workflow

### Creating a Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Committing Changes
```bash
git add .
git commit -m "feat: description of your feature"
git push origin feature/your-feature-name
```

### Creating a Pull Request
1. Push your feature branch
2. Go to GitHub
3. Create a Pull Request to `develop` branch
4. Add description and link to issues
5. Request review

### Merging to Main
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

## Coding Standards

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use proper type annotations

### React
- Use functional components
- Use hooks for state management
- Keep components small and focused
- Use proper prop types

### Redux
- Keep reducers pure
- Use Redux Toolkit for slices
- Normalize state shape
- Use selectors for accessing state

### Styling
- Use Tailwind CSS classes
- Follow mobile-first approach
- Use consistent spacing
- Maintain color scheme

## Component Structure

### Page Component Example
```tsx
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default function MyPage() {
  const data = useSelector((state: RootState) => state.mySlice.data)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Page</h1>
      {/* Content */}
    </div>
  )
}
```

### Redux Slice Example
```tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MyState {
  items: any[]
  loading: boolean
  error: string | null
}

const initialState: MyState = {
  items: [],
  loading: false,
  error: null,
}

const mySlice = createSlice({
  name: 'mySlice',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<any>) => {
      state.items.push(action.payload)
    },
  },
})

export const { addItem } = mySlice.actions
export default mySlice.reducer
```

## Testing

### Unit Tests
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Debugging

### Browser DevTools
- Open DevTools: F12 or Cmd+Option+I
- Use React DevTools extension
- Use Redux DevTools extension

### Console Logging
```tsx
console.log('Debug:', data)
console.error('Error:', error)
console.warn('Warning:', warning)
```

## Performance Tips

1. Use React.memo for expensive components
2. Use useCallback for event handlers
3. Use useMemo for expensive calculations
4. Lazy load routes with React.lazy
5. Optimize images and assets
6. Use production build for testing

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

## Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Create a new issue with details
3. Contact the development team

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Read Phase 1 spec: `.kiro/specs/PHASE_1_FOUNDATION.md`
4. Begin development on feature branch
