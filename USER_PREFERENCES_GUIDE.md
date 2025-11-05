# User Preferences System - Complete Guide

## Overview

A comprehensive User Preferences system built with **Zustand** that provides persistent settings for layout, sorting, display options, and filtering. The system includes localStorage persistence, Redux DevTools integration, and optimized selector hooks to prevent unnecessary re-renders.

---

## ✨ Features Implemented

### 1. **Zustand Store with Middleware**

- ✅ **Persist Middleware**: All preferences automatically saved to localStorage
- ✅ **DevTools Middleware**: Full debugging support with Redux DevTools
- ✅ **Type-safe**: Fully typed with TypeScript

### 2. **Preferences Available**

#### Grid Layout

- **Grid Columns**: Choose from 2, 3, 4, 5, or 6 columns
- **Responsive**: Automatically adjusts for different screen sizes

#### Sorting Options

- **ID (Default)**: Sort by Pokémon ID
- **Name (A-Z)**: Alphabetical ascending
- **Name (Z-A)**: Alphabetical descending

#### Display Options

- **Show Stats**: Toggle stats display (future feature)
- **Show Types**: Toggle type badges display (future feature)
- **Compact View**: Toggle compact card layout (future feature)

#### Type Filter

- **18 Pokémon Types**: Filter by any type (fire, water, grass, etc.)
- **API Integration**: Fetches filtered results from PokéAPI
- **Visual Feedback**: Shows active filter with count

---

## 📁 Files Created/Modified

### New Files

1. **`src/store/preferencesStore.ts`**

   - Zustand store with all preference state and actions
   - Includes selector hooks for optimized re-renders

2. **`src/components/SettingsModal.tsx`**

   - Beautiful settings UI with all preference controls
   - Organized sections for each preference type
   - Reset to defaults functionality

3. **`USER_PREFERENCES_GUIDE.md`**
   - This documentation file

### Modified Files

1. **`src/routes/__root.tsx`**

   - Added gear icon to header for Settings access
   - Integrated theme system with dark mode support
   - System theme preference detection

2. **`src/routes/index.tsx`**

   - Integrated type filter with API calls
   - Shows filter indicator when active
   - Loading states for filtered results

3. **`src/components/PokemonGrid.tsx`**

   - Uses grid column preference for layout
   - Implements sorting preference
   - Memoized for performance

4. **`package.json`**
   - Added Zustand dependency

---

## 🎯 How to Use

### Accessing Settings

1. Click the **⚙️ gear icon** in the top-right corner of the navigation bar
2. The Settings modal will open with all available preferences

### Adjusting Grid Layout

1. Open Settings
2. Click on desired number of columns (2-6)
3. Grid updates immediately on all pages

### Sorting Pokémon

1. Open Settings
2. Choose sorting preference:
   - **ID (Default)**: Original order
   - **Name (A-Z)**: Alphabetical
   - **Name (Z-A)**: Reverse alphabetical
3. Grid re-sorts automatically

### Filtering by Type

1. Open Settings
2. Scroll to **Filter by Type** section
3. Click on any Pokémon type (fire, water, etc.)
4. Click **All** to clear filter
5. Page shows loading indicator while fetching
6. Blue banner appears showing active filter and count

### Display Options

1. Open Settings
2. Toggle checkboxes for:
   - Show Stats
   - Show Types
   - Compact View
3. Changes save automatically

### Reset Preferences

1. Open Settings
2. Click **Reset to Defaults** button at bottom
3. Confirm the reset
4. All preferences return to initial values

---

## 🔧 Technical Details

### Store Structure

```typescript
interface PreferencesState {
  // State
  theme: 'light' | 'dark' | 'system';
  gridColumns: 2 | 3 | 4 | 5 | 6;
  sortBy: 'id' | 'name' | 'nameDesc';
  displayOptions: {
    showStats: boolean;
    showTypes: boolean;
    compactView: boolean;
  };
  filterByType: PokemonType | null;

  // Actions
  setTheme: (theme: Theme) => void;
  setGridColumns: (columns: GridColumns) => void;
  setSortPreference: (sortBy: SortOption) => void;
  toggleDisplayOption: (option: keyof DisplayOptions) => void;
  setFilterByType: (type: PokemonType | null) => void;
  resetPreferences: () => void;
}
```

### Selector Hooks (Performance Optimization)

These hooks prevent unnecessary re-renders by subscribing only to specific state slices:

```typescript
// Only re-renders when grid columns change
const gridColumns = useGridColumns();

// Only re-renders when sort preference changes
const sortBy = useSortBy();

// Only re-renders when display options change
const displayOptions = useDisplayOptions();

// Only re-renders when filter changes
const filterByType = useFilterByType();
```

**⚠️ Important:** Always use individual primitive selectors (like `useGridColumns()`, `useSortBy()`) instead of object-returning selectors to prevent unnecessary re-renders caused by reference changes.

### Middleware Configuration

**Persist Middleware:**

```typescript
persist(
  (set) => ({
    /* state */
  }),
  {
    name: 'pokemon-preferences', // localStorage key
    version: 2 // Incremented to clear old theme data
  }
);
```

**DevTools Middleware:**

```typescript
devtools(
  (set) => ({
    /* state */
  }),
  {
    name: 'Pokemon Preferences Store',
    enabled: true
  }
);
```

---

## 🚀 Testing the Implementation

### Quick Test Checklist

1. **Grid Layout**

   - [ ] Change columns from 2 to 6
   - [ ] Grid updates immediately
   - [ ] Resize browser window → Responsive behavior works

2. **Sorting**

   - [ ] Switch between ID, Name A-Z, Name Z-A
   - [ ] Pokémon reorder correctly

3. **Type Filter**

   - [ ] Select "fire" type
   - [ ] Loading indicator appears
   - [ ] Blue banner shows "Filtering by fire type"
   - [ ] Only fire Pokémon display
   - [ ] Click "All" → Shows all Pokémon again

4. **Persistence**

   - [ ] Change multiple preferences
   - [ ] Close browser tab
   - [ ] Reopen → All preferences retained

5. **DevTools**
   - [ ] Open Redux DevTools
   - [ ] See "Pokemon Preferences Store"
   - [ ] Actions logged when preferences change

---

## 🔍 Debugging

### Check localStorage

Open browser console and run:

```javascript
localStorage.getItem('pokemon-preferences');
```

You should see your saved preferences in JSON format.

### Clear Preferences

To reset manually:

```javascript
localStorage.removeItem('pokemon-preferences');
```

Then refresh the page.

### Redux DevTools

1. Install Redux DevTools browser extension
2. Open DevTools
3. Select "Pokemon Preferences Store" from dropdown
4. View actions, state changes, and time-travel debug

---

## 📊 Performance Optimizations

### 1. Selector Hooks

Individual selector hooks prevent re-renders when unrelated state changes.

### 2. Memoization

Grid classes and sorted Pokémon are memoized:

```typescript
const sortedPokemons = useMemo(() => {
  // sorting logic
}, [pokemons, sortBy]);

const gridClasses = useMemo(() => {
  // grid class generation
}, [gridColumns]);
```

### 3. Zustand's Minimal Re-renders

Zustand only triggers re-renders for components using changed state slices.

---

## 🎁 Bonus Features

### Visual Feedback

- Smooth transitions on theme changes
- Active state highlighting in Settings
- Loading indicators for async operations

### User Experience

- Confirmation dialog before resetting preferences
- Filter indicator with Pokémon count
- Responsive design for all screen sizes

### Developer Experience

- Full TypeScript support
- Redux DevTools integration
- Clean, maintainable code structure

---

## 📝 Future Enhancements

Consider implementing:

1. **Display Options**: Wire up showStats, showTypes, compactView to actual UI changes
2. **More Filters**: Add generation, stat-based filtering
3. **Saved Filter Presets**: Let users save favorite filter combinations
4. **Export/Import Settings**: Share preferences across devices

---

## 🎉 Summary

You now have a fully functional User Preferences system with:

- ✅ Persistent storage (localStorage)
- ✅ Debug tools (Redux DevTools)
- ✅ Performance optimization (selector hooks)
- ✅ Beautiful UI (Settings modal)
- ✅ Type-safe implementation (TypeScript)
- ✅ Real-time updates across the app
- ✅ Grid layout customization (2-6 columns)
- ✅ Sorting options (ID, Name A-Z, Z-A)
- ✅ Display toggles (Stats, Types, Compact View)
- ✅ Type filtering (18 Pokémon types + All)

All preferences are automatically saved and restored on page reload!

---

**Enjoy your enhanced Pokémon Battle app! 🎮⚡**
