import { Sun, Moon, BarChart3, BookOpen, Cpu } from 'lucide-react';
import { useState } from 'react';
import StockExplorer from './components/StockExplorer';
import IndicatorsGuide from './components/IndicatorsGuide';
import StockAnalysis from './components/StockAnalysis';
import { useTheme } from './hooks/useTheme';
import { ThemeContext } from './context/ThemeContext';

type Tab = 'stocks' | 'indicators' | 'analysis';

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
                <button
                  onClick={() => setTab('analysis')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    tab === 'analysis'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Cpu size={16} />
                  종목 분석
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
          {tab === 'stocks' ? <StockExplorer /> : tab === 'indicators' ? <IndicatorsGuide /> : <StockAnalysis />}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
