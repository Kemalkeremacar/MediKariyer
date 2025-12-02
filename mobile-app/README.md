# 🏥 MediKariyer Mobile App

Modern, feature-based architecture ile geliştirilmiş doktorlara özel mobil uygulama.

## 📁 Yeni Mimari Yapı

```
src/
├── api/                    # 🌐 API layer
│   ├── client.ts          # Axios instance with interceptors
│   ├── endpoints.ts       # API endpoint definitions
│   └── services/          # API service modules
│
├── features/              # 📦 Feature modules (self-contained)
│   ├── auth/             # Authentication feature
│   ├── jobs/             # Jobs feature
│   ├── applications/     # Applications feature
│   ├── profile/          # Profile feature
│   ├── notifications/    # Notifications feature
│   ├── dashboard/        # Dashboard feature
│   └── settings/         # Settings feature
│
├── components/            # 🧩 Global reusable components
│   ├── ui/               # Atomic UI components
│   ├── layout/           # Layout components
│   └── feedback/         # Feedback components
│
├── navigation/            # 🧭 Navigation configuration
│   ├── RootNavigator.tsx
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── TabNavigator.tsx
│
├── store/                 # 📊 Global state management
│   ├── authStore.ts      # Authentication state
│   ├── uiStore.ts        # UI state
│   ├── notificationStore.ts
│   └── queryClient.ts    # React Query config
│
├── theme/                 # 🎨 Theme system
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── shadows.ts
│
├── hooks/                 # 🪝 Global custom hooks
├── utils/                 # 🛠️ Global utilities
├── config/                # ⚙️ Configuration
├── types/                 # 📝 Global type definitions
└── contexts/              # 🔄 React contexts
```

## 🏗️ Feature-Based Architecture

Her feature modülü kendi içinde bağımsızdır:

```
features/jobs/
├── screens/          # Feature screens
├── components/       # Feature-specific components
├── hooks/           # Feature-specific hooks
├── services/        # Feature-specific services
├── utils/           # Feature-specific utilities
└── types/           # Feature-specific types
```

## 🚀 Başlat

```bash
npm install
npm start
```

## 💡 Kullanım

```typescript
// Global components
import { Button, Card, Text, Input } from '@/components/ui';
import { Screen, Container } from '@/components/layout';

// Theme
import { colors, spacing, typography } from '@/theme';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

// Store
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

// Feature-specific
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { JobCard } from '@/features/jobs/components/JobCard';

// Kullanım
const JobsScreen = () => {
  const { data, isLoading } = useJobs();
  const { showSuccess } = useToast();
  
  return (
    <Screen>
      <Container>
        {data?.jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </Container>
    </Screen>
  );
};
```

## 📦 Global Components

**UI Components (`@/components/ui`):**
- Button, Input, Card, Badge, Modal, Divider, Text, Avatar

**Layout Components (`@/components/layout`):**
- Screen, Container, Header

**Feedback Components (`@/components/feedback`):**
- ToastManager, Loader, ErrorBoundary, GlobalLoader, GlobalModalManager

## 🎨 Theme System

Centralized theme with:
- **Colors**: Primary, secondary, accent, success, warning, error, neutral
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- **Typography**: Font families, sizes, weights, line heights
- **Shadows**: Elevation system
- **Dark Mode**: Full dark mode support via ThemeContext

## 🔧 State Management

- **Zustand**: Global state (auth, UI, notifications)
- **React Query**: Server state with caching and automatic refetching
- **AsyncStorage**: Persistent storage for critical data

## 🛣️ Navigation

- **RootNavigator**: Top-level navigator (auth state routing)
- **AuthNavigator**: Unauthenticated flow
- **AppNavigator**: Authenticated flow
- **TabNavigator**: Main app navigation

## ⚙️ Configuration

- **env.ts**: Environment variables (type-safe)
- **constants.ts**: App constants
- **queryConfig.ts**: React Query configuration

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npx tsc --noEmit
```

## 📚 Documentation

- See `CLEANUP_SUMMARY.md` for migration details
- See `.kiro/specs/mobile-app-architecture-refactor/` for full specification
- Each feature has its own README with specific documentation

## ✅ Key Features

- ✨ Feature-based architecture for better scalability
- 🎨 Centralized theme system with dark mode
- 🔐 Secure authentication with token refresh
- 📱 Responsive and accessible UI
- 🚀 Optimized performance with React Query
- 📝 Full TypeScript support
- 🧪 Comprehensive error handling
- 🔄 Automatic token refresh
- 💾 Persistent state management

## 🔄 Migration from Old Structure

If you're migrating from the old structure:
1. Update imports from `@/constants/*` to `@/config/*` or `@/theme/*`
2. Update imports from `@/ui` to `@/components/ui/*`
3. Update imports from `@/layouts` to `@/components/layout/*`
4. Remove `@/animations` imports (not implemented in new structure)
5. Use `useToast` hook instead of `toastService`

See `CLEANUP_SUMMARY.md` for detailed migration guide.

## 📄 License

Private - MediKariyer
