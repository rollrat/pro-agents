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
        // 처음 3개 섹터 열기
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
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
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
            <div key={sector} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
              {/* Sector header */}
              <button
                onClick={() => toggleSector(sector)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-blue-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-600" />
                  )}
                  <span className="font-semibold text-gray-200">{sector}</span>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {stocks.length}
                  </span>
                </div>
              </button>

              {/* Stock list */}
              {isExpanded && (
                <div className="border-t border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800">
                    {stocks.map((stock) => {
                      const rate = parseFloat(stock.changeRate);
                      const isUp = rate > 0;
                      const isDown = rate < 0;
                      return (
                        <button
                          key={stock.code}
                          onClick={() => setSelectedStock(stock)}
                          className="flex items-center justify-between px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <div className="font-medium text-gray-200 text-sm">{stock.name}</div>
                            <div className="text-xs text-gray-600">{stock.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm text-gray-200">{stock.close}원</div>
                            <div
                              className={`flex items-center gap-1 text-xs font-mono ${
                                isUp ? 'text-red-400' : isDown ? 'text-blue-400' : 'text-gray-500'
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
        <div className="text-center text-gray-600 py-16">
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
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-100">{selectedStock.name}</h2>
                <p className="text-sm text-gray-500">{selectedStock.code} · KOSPI</p>
              </div>
              <button
                onClick={() => setSelectedStock(null)}
                className="text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500 text-sm">종가</span>
                <span className="text-2xl font-bold font-mono text-gray-100">
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
                        isUp ? 'text-red-400' : isDown ? 'text-blue-400' : 'text-gray-500'
                      }`}
                    >
                      {isUp ? '+' : ''}{selectedStock.change} ({isUp ? '+' : ''}{selectedStock.changeRate}%)
                    </span>
                  </div>
                );
              })()}

              <div className="border-t border-gray-800 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">거래량</span>
                  <span className="font-mono text-gray-300">{selectedStock.volume}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">섹터</span>
                  <span className="text-gray-300">{selectedStock.sector}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
