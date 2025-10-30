# FindomContext Optimization Guide

This document explains the performance optimizations made to the FindomContext and how to use the new hooks.

## Problem

The original `FindomContext` had a single context that provided all app data, loading state, and actions. This caused performance issues:

1. **Unnecessary re-renders**: When ANY part of the context changed (data, loading, or actions), ALL components using `useFindom()` would re-render
2. **Value recreation**: The context value object was recreated on every render
3. **No memoization**: Data and callbacks weren't memoized
4. **Duplicate code**: Realtime subscription handlers duplicated service transformation logic

## Solution

The context has been split into three separate contexts:

```typescript
// Data-only context
const AppDataContext = createContext<AppData | undefined>(undefined);

// Loading-only context
const AppLoadingContext = createContext<boolean>(true);

// Actions-only context
const AppActionsContext = createContext<...>(undefined);
```

## New Hooks

### 1. `useAppData()` - For read-only data access

Use this when you only need to read app data and don't need actions or loading state.

```typescript
import { useAppData } from '@/context/FindomContext';

const MyComponent = () => {
  const appData = useAppData();

  return <div>{appData.subs.length} subs</div>;
};
```

**Benefits:**
- Component won't re-render when actions change
- Component won't re-render when loading state changes
- Only re-renders when actual data changes

**Best for:** Dashboard displays, analytics, charts, read-only lists

### 2. `useAppLoading()` - For loading state only

Use this when you only need to know if data is loading.

```typescript
import { useAppLoading } from '@/context/FindomContext';

const LoadingIndicator = () => {
  const loading = useAppLoading();

  if (!loading) return null;
  return <Spinner />;
};
```

**Benefits:**
- Component won't re-render when data changes
- Component won't re-render when actions change
- Only re-renders when loading state changes

**Best for:** Loading indicators, skeleton screens

### 3. `useAppActions()` - For actions only

Use this when you only need to call action functions.

```typescript
import { useAppActions } from '@/context/FindomContext';

const MigrationButton = () => {
  const { migrateFromLocalStorage } = useAppActions();

  return (
    <button onClick={migrateFromLocalStorage}>
      Migrate Data
    </button>
  );
};
```

**Benefits:**
- Component won't re-render when data changes
- Component won't re-render when loading state changes
- Only re-renders when action functions change (rarely)

**Best for:** Buttons, forms, action triggers

### 4. `useFindom()` - Legacy hook (still supported)

Use this when you need multiple pieces (data + actions, data + loading, etc.).

```typescript
import { useFindom } from '@/context/FindomContext';

const SubTracker = () => {
  const { appData, createSub, updateSub, loading } = useFindom();

  // Component needs both data and actions
  return (
    <div>
      {loading ? <Spinner /> : <SubList subs={appData.subs} />}
      <button onClick={() => createSub(...)}>Add Sub</button>
    </div>
  );
};
```

**When to use:**
- Component genuinely needs both data and actions
- Component needs both data and loading state
- Quick prototyping (optimize later)

## Migration Guide

### Step 1: Identify what your component uses

Look at your component's `useFindom()` call:

```typescript
// Example 1: Only uses data
const { appData } = useFindom();
// ✅ Optimize to: const appData = useAppData();

// Example 2: Only uses loading
const { loading } = useFindom();
// ✅ Optimize to: const loading = useAppLoading();

// Example 3: Only uses actions
const { createSub, updateSub } = useFindom();
// ✅ Optimize to: const { createSub, updateSub } = useAppActions();

// Example 4: Uses multiple pieces
const { appData, createSub, loading } = useFindom();
// ✅ Keep as is (or use multiple hooks if preferred)
```

### Step 2: Update imports and usage

**Before:**
```typescript
import { useFindom } from '@/context/FindomContext';

const MyComponent = () => {
  const { appData } = useFindom();
  // ...
};
```

**After:**
```typescript
import { useAppData } from '@/context/FindomContext';

const MyComponent = () => {
  const appData = useAppData();
  // ...
};
```

## Components Already Optimized

The following components have been optimized to use specific hooks:

### Using `useAppData` (read-only):
- ✅ `DashboardPage.tsx`
- ✅ `Index.tsx`
- ✅ `AnalyticsPage.tsx`
- ✅ `AIInsightsDashboard.tsx`

### Using `useAppActions` (actions-only):
- ✅ `MigrationHelper.tsx`

### Still using `useFindom` (need multiple pieces):
- `SubTrackerPage.tsx` (needs data + loading + actions)
- `TributeTrackerPage.tsx` (needs data + loading + actions)
- `ChecklistPage.tsx` (needs data + multiple actions)
- `CalendarPage.tsx` (needs data + actions)
- `SettingsPage.tsx` (needs data + actions)
- And others that genuinely need multiple pieces

## Performance Impact

### Before Optimization:
- **Every component** using `useFindom()` re-renders when:
  - Any data changes (subs, tributes, profile, etc.)
  - Loading state changes
  - Actions are recreated

### After Optimization:
- **Components using `useAppData()`** only re-render when data changes
- **Components using `useAppLoading()`** only re-render when loading changes
- **Components using `useAppActions()`** rarely re-render (only when actions change)

### Example Impact:

A dashboard with 10 components:
- **Before**: All 10 components re-render when you add a sub
- **After**: Only components using `useAppData()` re-render (maybe 3-4 components)
- **Savings**: 60-70% fewer re-renders

## Additional Optimizations Made

### 1. Memoization
All context values are now memoized:

```typescript
const appDataValue = useMemo(() => appData, [appData]);
const actionsValue = useMemo(() => actions, [actions]);
```

### 2. Service Transformers
Realtime subscription handlers now use existing service transformers instead of duplicating mapping logic:

**Before:**
```typescript
const mapSubRow = (row: any): Sub => {
  // 20+ lines of mapping logic duplicated from service
  return { ... };
};
```

**After:**
```typescript
const transformSubRow = (row: any): Sub => {
  const transformed = subsService['transformFromDB']([row]);
  return transformed[0];
};
```

### 3. Type Safety
Removed type assertions:
- Removed `(checklist as any)`
- Removed `(settings as any)`
- Added proper default values

## Best Practices

### ✅ DO:
- Use `useAppData()` for read-only components
- Use `useAppActions()` for action-only components
- Use `useAppLoading()` for loading indicators
- Use `useFindom()` when you need multiple pieces

### ❌ DON'T:
- Use `useFindom()` when you only need one piece
- Destructure unused values: `const { appData, loading } = useFindom()` when you only use `appData`
- Call hooks conditionally or in loops

## Testing

After optimization, verify:

1. ✅ Components still receive correct data
2. ✅ Actions still work correctly
3. ✅ Loading states still display
4. ✅ Realtime updates still work
5. ✅ No console errors

## Future Optimizations

Consider these additional optimizations:

1. **Selector hooks** for specific data slices:
   ```typescript
   const subs = useAppDataSelector(data => data.subs);
   ```

2. **Action splitting** if action object becomes large:
   ```typescript
   const useSubActions = () => useAppActions().subActions;
   ```

3. **Computed values** with `useMemo` in consuming components:
   ```typescript
   const totalTributes = useMemo(
     () => appData.tributes.reduce((sum, t) => sum + t.amount, 0),
     [appData.tributes]
   );
   ```

## Questions?

If you're unsure which hook to use:
1. Start with `useFindom()` (always works)
2. Profile your component's re-renders
3. Optimize to specific hooks if re-renders are excessive

---

**Last Updated:** 2025-10-30
**Version:** 2.0
**Author:** Claude Code Optimization
