import { useState } from 'react';
import { BarChart3, BookOpen } from 'lucide-react';
import StockExplorer from './components/StockExplorer';
import IndicatorsGuide from './components/IndicatorsGuide';

type Tab = 'stocks' | 'indicators';

export default function App() {
  const [tab, setTab] = useState<Tab>('stocks');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-blue-400">KOSPI</span> 종목 탐색기
          </h1>
          <nav className="flex gap-1 bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setTab('stocks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                tab === 'stocks'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BookOpen size={16} />
              기술적 지표
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'stocks' ? <StockExplorer /> : <IndicatorsGuide />}
      </main>
    </div>
  );
}
