# Dark/Light Mode Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 헤더에 Sun/Moon 토글 버튼을 추가하고 앱 전체에 다크/라이트 모드 전환 기능을 구현한다.

**Architecture:** Tailwind v4의 class-based dark mode (`@variant dark`)를 사용. `useTheme` 훅이 `localStorage`에 상태를 저장하고 `<html>` 엘리먼트에 `dark` 클래스를 토글. 차트는 `useTheme`에서 제공하는 색상 객체를 IndicatorsGuide에서 받아 적용.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, lucide-react

---

### Task 1: Tailwind v4 dark mode 클래스 전략 설정

**Files:**
- Modify: `src/index.css`

**Step 1: index.css에 dark variant 추가**

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

**Step 2: 커밋**

```bash
git add src/index.css
git commit -m "feat: configure Tailwind v4 class-based dark mode"
```

---

### Task 2: useTheme 훅 생성

**Files:**
- Create: `src/hooks/useTheme.ts`

**Step 1: 훅 작성**

```typescript
import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
```

**Step 2: 커밋**

```bash
git add src/hooks/useTheme.ts
git commit -m "feat: add useTheme hook with localStorage persistence"
```

---

### Task 3: ThemeContext 생성 (하위 컴포넌트 공유용)

**Files:**
- Create: `src/context/ThemeContext.tsx`

**Step 1: Context 작성**

```typescript
import { createContext, useContext } from 'react';
import type { Theme } from '../hooks/useTheme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
```

**Step 2: 커밋**

```bash
git add src/context/ThemeContext.tsx
git commit -m "feat: add ThemeContext for child component access"
```

---

### Task 4: App.tsx — 토글 버튼 추가 + 전체 배경 라이트모드 클래스 적용

**Files:**
- Modify: `src/App.tsx`

**Step 1: 수정된 App.tsx 전체 내용**

```tsx
import { Sun, Moon, BarChart3, BookOpen } from 'lucide-react';
import { useState } from 'react';
import StockExplorer from './components/StockExplorer';
import IndicatorsGuide from './components/IndicatorsGuide';
import { useTheme } from './hooks/useTheme';
import { ThemeContext } from './context/ThemeContext';

type Tab = 'stocks' | 'indicators';

export default function App() {
  const [tab, setTab] = useState<Tab>('stocks');
  const { theme, toggle } = useTheme();

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-blue-500 dark:text-blue-400">KOSPI</span> 종목 탐색기
            </h1>
            <div className="flex items-center gap-2">
              <nav className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setTab('stocks')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    tab === 'stocks'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <BarChart3 size={16} />
                  종목 탐색
                </button>
                <button
                  onClick={() => setTab('indicators')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    tab === 'indicators'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <BookOpen size={16} />
                  기술적 지표
                </button>
              </nav>
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                aria-label="테마 전환"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 py-6">
          {tab === 'stocks' ? <StockExplorer /> : <IndicatorsGuide />}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
```

**Step 2: 커밋**

```bash
git add src/App.tsx
git commit -m "feat: add dark/light mode toggle button in header"
```

---

### Task 5: StockExplorer.tsx — 라이트모드 클래스 적용

**Files:**
- Modify: `src/components/StockExplorer.tsx`

**색상 변환 규칙:**
- `bg-gray-900` → `bg-gray-100 dark:bg-gray-900`
- `bg-gray-900/50` → `bg-gray-50 dark:bg-gray-900/50`
- `bg-gray-800` → `bg-gray-200 dark:bg-gray-800`
- `bg-gray-800/50` → `bg-gray-200/50 dark:bg-gray-800/50`
- `border-gray-800` → `border-gray-200 dark:border-gray-800`
- `border-gray-700` → `border-gray-300 dark:border-gray-700`
- `text-gray-100` → `text-gray-900 dark:text-gray-100`
- `text-gray-200` → `text-gray-800 dark:text-gray-200`
- `text-gray-300` → `text-gray-700 dark:text-gray-300`
- `text-gray-400` → `text-gray-600 dark:text-gray-400`
- `text-gray-500` → `text-gray-500` (유지)
- `text-gray-600` → `text-gray-400 dark:text-gray-600`
- `placeholder-gray-600` → `placeholder-gray-400 dark:placeholder-gray-600`
- `bg-gray-950` (modal 배경 없음, black/60 유지)

**Step 1: 수정된 StockExplorer.tsx 전체 내용**

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Stock, StockData } from '../types';

export default function StockExplorer() {
  const [data, setData] = useState<StockData | null>(null);
  const [search, setSearch] = useState('');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  useEffect(() => {
    fetch('/data/kospi-stocks.json')
      .then((r) => r.json())
      .then((d: StockData) => {
        setData(d);
        const keys = Object.keys(d.sectors).slice(0, 3);
        setExpandedSectors(new Set(keys));
      });
  }, []);

  const filteredSectors = useMemo(() => {
    if (!data) return {};
    if (!search.trim()) return data.sectors;

    const q = search.trim().toLowerCase();
    const result: Record<string, Stock[]> = {};
    for (const [sector, stocks] of Object.entries(data.sectors)) {
      const filtered = stocks.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.includes(q)
      );
      if (filtered.length > 0) result[sector] = filtered;
    }
    return result;
  }, [data, search]);

  const toggleSector = (sector: string) => {
    setExpandedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  const sectorEntries = Object.entries(filteredSectors).sort((a, b) =>
    b[1].length - a[1].length
  );

  return (
    <div className="relative">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="종목명 또는 코드로 검색 (예: 삼성전자, 005930)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6 text-sm text-gray-500">
        <span>{data.totalCount}개 종목</span>
        <span>{Object.keys(data.sectors).length}개 섹터</span>
        <span>업데이트: {new Date(data.updatedAt).toLocaleDateString('ko-KR')}</span>
      </div>

      {/* Sector list */}
      <div className="space-y-2">
        {sectorEntries.map(([sector, stocks]) => {
          const isExpanded = expandedSectors.has(sector) || search.trim().length > 0;
          return (
            <div key={sector} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
              {/* Sector header */}
              <button
                onClick={() => toggleSector(sector)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-blue-500 dark:text-blue-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400 dark:text-gray-600" />
                  )}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{sector}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {stocks.length}
                  </span>
                </div>
              </button>

              {/* Stock list */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-800">
                    {stocks.map((stock) => {
                      const rate = parseFloat(stock.changeRate);
                      const isUp = rate > 0;
                      const isDown = rate < 0;
                      return (
                        <button
                          key={stock.code}
                          onClick={() => setSelectedStock(stock)}
                          className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{stock.name}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-600">{stock.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">{stock.close}원</div>
                            <div
                              className={`flex items-center gap-1 text-xs font-mono ${
                                isUp ? 'text-red-500 dark:text-red-400' : isDown ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500'
                              }`}
                            >
                              {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : null}
                              {isUp ? '+' : ''}{stock.changeRate}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sectorEntries.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          검색 결과가 없습니다
        </div>
      )}

      {/* Stock detail modal */}
      {selectedStock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedStock(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedStock.name}</h2>
                <p className="text-sm text-gray-500">{selectedStock.code} · KOSPI</p>
              </div>
              <button
                onClick={() => setSelectedStock(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500 text-sm">종가</span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {selectedStock.close}원
                </span>
              </div>

              {(() => {
                const rate = parseFloat(selectedStock.changeRate);
                const isUp = rate > 0;
                const isDown = rate < 0;
                return (
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500 text-sm">전일 대비</span>
                    <span
                      className={`text-lg font-mono font-semibold ${
                        isUp ? 'text-red-500 dark:text-red-400' : isDown ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500'
                      }`}
                    >
                      {isUp ? '+' : ''}{selectedStock.change} ({isUp ? '+' : ''}{selectedStock.changeRate}%)
                    </span>
                  </div>
                );
              })()}

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">거래량</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{selectedStock.volume}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">섹터</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedStock.sector}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add src/components/StockExplorer.tsx
git commit -m "feat: apply light mode classes to StockExplorer"
```

---

### Task 6: IndicatorsGuide.tsx — 라이트모드 클래스 + 차트 테마 색상 적용

**Files:**
- Modify: `src/components/IndicatorsGuide.tsx`

**변경 포인트:**
- 사이드바/컨텐츠 배경 색상 → 라이트모드 클래스 추가
- 차트 내부 하드코딩 색상 (CartesianGrid stroke, axis stroke, Tooltip contentStyle) → 테마별 변수 사용
- `chart` 함수 시그니처: `() => React.ReactNode` → `(colors: ChartColors) => React.ReactNode`
- IndicatorsGuide 컴포넌트에서 `useThemeContext()`로 테마 감지 후 색상 객체 생성

**Step 1: 수정된 IndicatorsGuide.tsx 전체 내용**

- 파일 상단에 ChartColors 타입 정의 추가:
```tsx
interface ChartColors {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  price: string;
}
```

- `indicators` 배열의 `chart` 타입을 `(colors: ChartColors) => React.ReactNode`로 변경

- 모든 차트 함수에서 `stroke="#1f2937"` → `colors.grid`, `stroke="#6b7280"` → `colors.axis`, Tooltip contentStyle → `{ backgroundColor: colors.tooltipBg, border: \`1px solid \${colors.tooltipBorder}\`, borderRadius: 8 }`, `stroke="#6b7280"` (price line) → `colors.price` 로 교체

- IndicatorsGuide 컴포넌트 내부:
```tsx
const { theme } = useThemeContext();

const chartColors: ChartColors = theme === 'dark'
  ? { grid: '#1f2937', axis: '#6b7280', tooltipBg: '#111827', tooltipBorder: '#374151', price: '#6b7280' }
  : { grid: '#e5e7eb', axis: '#9ca3af', tooltipBg: '#ffffff', tooltipBorder: '#d1d5db', price: '#9ca3af' };
```

- 렌더링 시 `active.chart()` → `active.chart(chartColors)`

- UI 클래스:
  - `text-gray-500 uppercase` → 유지
  - `bg-blue-600/20 text-blue-400` → 유지 (active 탭)
  - `text-gray-400 hover:text-gray-200 hover:bg-gray-800/50` → `text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50`
  - `text-gray-100` → `text-gray-900 dark:text-gray-100`
  - `text-gray-300` → `text-gray-700 dark:text-gray-300`
  - `text-gray-400` → `text-gray-600 dark:text-gray-400`
  - `bg-gray-900 border-gray-800` → `bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800`
  - `bg-gray-900/50 border-gray-800` → `bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800`

- Elliott wave `CustomLabel`의 색상은 테마 무관 빨강/파랑이라 유지

**Step 2: 커밋**

```bash
git add src/components/IndicatorsGuide.tsx
git commit -m "feat: apply light mode classes and chart theme colors to IndicatorsGuide"
```

---

### Task 7: 초기 html 클래스 설정 (main.tsx)

**Files:**
- Modify: `src/main.tsx`

**Step 1: main.tsx 읽기 후 확인**

현재 main.tsx를 읽어서 `<React.StrictMode>` 등 구조 확인. useTheme 훅이 이미 html 클래스를 관리하므로 main.tsx는 수정 불필요할 가능성이 높음. 단, 초기 렌더링 전 FOUC(Flash of Unstyled Content) 방지를 위해 필요시 아래 스크립트를 index.html `<head>`에 추가:

```html
<script>
  (function() {
    var theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  })();
</script>
```

**Step 2: index.html 수정 (FOUC 방지)**

`public/index.html` 또는 루트 `index.html`의 `<head>` 내 `</head>` 직전에 위 인라인 스크립트 삽입.

**Step 3: 커밋**

```bash
git add index.html
git commit -m "feat: prevent FOUC by applying theme class before React renders"
```
