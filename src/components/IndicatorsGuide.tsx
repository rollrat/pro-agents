import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  ComposedChart, Bar, Legend,
} from 'recharts';
import { useThemeContext } from '../context/ThemeContext';

// --- 시뮬레이션 데이터 생성 ---

function generatePriceData(days: number, start: number, volatility: number) {
  const data: { day: number; price: number }[] = [];
  let price = start;
  for (let i = 0; i < days; i++) {
    price += (Math.random() - 0.48) * volatility;
    price = Math.max(price, start * 0.7);
    data.push({ day: i + 1, price: Math.round(price) });
  }
  return data;
}

function calcMA(data: { day: number; price: number }[], period: number) {
  return data.map((d, i) => {
    if (i < period - 1) return { ...d, [`ma${period}`]: null };
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, v) => s + v.price, 0) / period;
    return { ...d, [`ma${period}`]: Math.round(avg) };
  });
}

function calcEMA(prices: number[], period: number) {
  const k = 2 / (period + 1);
  const ema: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      const avg = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
      ema.push(avg);
    } else {
      ema.push(prices[i] * k + (ema[i - 1] ?? prices[i]) * (1 - k));
    }
  }
  return ema;
}

function calcRSI(prices: number[], period = 14) {
  const rsi: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) { rsi.push(null); continue; }
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = prices[j] - prices[j - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(Math.round(100 - 100 / (1 + rs)));
  }
  return rsi;
}

function calcBollinger(data: { day: number; price: number }[], period = 20, mult = 2) {
  return data.map((d, i) => {
    if (i < period - 1) return { ...d, upper: null, middle: null, lower: null };
    const slice = data.slice(i - period + 1, i + 1).map((v) => v.price);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    return {
      ...d,
      upper: Math.round(mean + mult * std),
      middle: Math.round(mean),
      lower: Math.round(mean - mult * std),
    };
  });
}

// 고정 시드 데이터
const basePriceData = generatePriceData(100, 50000, 800);
const prices = basePriceData.map((d) => d.price);

// --- 차트 색상 타입 ---

interface ChartColors {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  price: string;
}

// --- 지표 정의 ---

interface Indicator {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  summary: string;
  description: string[];
  interpretation: string[];
  chart: (colors: ChartColors) => React.ReactNode;
}

const indicators: Indicator[] = [
  {
    id: 'ma',
    name: '이동평균선',
    nameEn: 'Moving Average (MA)',
    category: '추세',
    summary: '일정 기간 동안의 평균 가격을 연결한 선으로, 추세의 방향과 지지/저항을 파악합니다.',
    description: [
      '이동평균선은 일정 기간(5일, 20일, 60일, 120일 등) 동안의 종가 평균을 계산하여 매일 연결한 선입니다.',
      '단기 이동평균선(5일, 20일)은 최근 추세를, 장기 이동평균선(60일, 120일)은 큰 추세를 나타냅니다.',
      '골든크로스: 단기선이 장기선을 상향 돌파 → 매수 시그널',
      '데드크로스: 단기선이 장기선을 하향 돌파 → 매도 시그널',
    ],
    interpretation: [
      '주가가 이동평균선 위에 있으면 상승 추세',
      '주가가 이동평균선 아래에 있으면 하락 추세',
      '이동평균선이 수렴하면 큰 움직임이 올 수 있음',
    ],
    chart: (colors) => {
      let merged = basePriceData.map((d) => ({ ...d }));
      const ma5data = calcMA(basePriceData, 5);
      const ma20data = calcMA(basePriceData, 20);
      const ma60data = calcMA(basePriceData, 60);
      merged = merged.map((d, i) => ({
        ...d,
        ma5: (ma5data[i] as Record<string, unknown>).ma5 as number | null,
        ma20: (ma20data[i] as Record<string, unknown>).ma20 as number | null,
        ma60: (ma60data[i] as Record<string, unknown>).ma60 as number | null,
      }));
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={merged} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} stroke={colors.axis} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8 }}
              labelStyle={{ color: colors.axis }}
            />
            <Legend />
            <Line type="monotone" dataKey="price" stroke={colors.price} dot={false} strokeWidth={1} name="주가" />
            <Line type="monotone" dataKey="ma5" stroke="#f59e0b" dot={false} strokeWidth={2} name="MA5" connectNulls />
            <Line type="monotone" dataKey="ma20" stroke="#3b82f6" dot={false} strokeWidth={2} name="MA20" connectNulls />
            <Line type="monotone" dataKey="ma60" stroke="#ef4444" dot={false} strokeWidth={2} name="MA60" connectNulls />
          </LineChart>
        </ResponsiveContainer>
      );
    },
  },
  {
    id: 'macd',
    name: 'MACD',
    nameEn: 'Moving Average Convergence Divergence',
    category: '모멘텀',
    summary: '두 이동평균선의 차이를 이용해 추세의 방향, 강도, 전환점을 파악합니다.',
    description: [
      'MACD = 12일 EMA - 26일 EMA',
      'Signal = MACD의 9일 EMA',
      'Histogram = MACD - Signal (막대그래프로 표시)',
      'EMA(지수이동평균)는 최근 가격에 더 큰 가중치를 부여하여 단순이동평균보다 민감합니다.',
    ],
    interpretation: [
      'MACD가 Signal 위로 교차 → 매수 시그널',
      'MACD가 Signal 아래로 교차 → 매도 시그널',
      'Histogram이 0선 위에서 커지면 상승 모멘텀 강화',
      '다이버전스: 가격은 신고가인데 MACD가 안 따라가면 추세 약화 신호',
    ],
    chart: (colors) => {
      const ema12 = calcEMA(prices, 12);
      const ema26 = calcEMA(prices, 26);
      const macdLine = ema12.map((v, i) =>
        v !== null && ema26[i] !== null ? Math.round(v - ema26[i]!) : null
      );
      const macdValues = macdLine.filter((v): v is number => v !== null);
      const signalRaw = calcEMA(macdValues, 9);
      let sIdx = 0;
      const signal = macdLine.map((v) => {
        if (v === null) return null;
        const s = signalRaw[sIdx++];
        return s !== null ? Math.round(s) : null;
      });
      const chartData = basePriceData.map((d, i) => ({
        day: d.day,
        price: d.price,
        macd: macdLine[i],
        signal: signal[i],
        histogram: macdLine[i] !== null && signal[i] !== null
          ? macdLine[i]! - signal[i]! : null,
      }));

      const tooltipStyle = { backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8 };

      return (
        <div className="space-y-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} stroke={colors.axis} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="price" stroke={colors.price} dot={false} strokeWidth={1} name="주가" />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={chartData} margin={{ top: 0, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={colors.axis} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <ReferenceLine y={0} stroke={colors.tooltipBorder} />
              <Bar dataKey="histogram" name="Histogram" fill="#3b82f6" opacity={0.6} />
              <Line type="monotone" dataKey="macd" stroke="#f59e0b" dot={false} strokeWidth={2} name="MACD" connectNulls />
              <Line type="monotone" dataKey="signal" stroke="#ef4444" dot={false} strokeWidth={2} name="Signal" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    },
  },
  {
    id: 'rsi',
    name: 'RSI',
    nameEn: 'Relative Strength Index',
    category: '모멘텀',
    summary: '과매수/과매도 상태를 0~100 사이 수치로 나타내는 지표입니다.',
    description: [
      'RSI = 100 - (100 / (1 + RS)), RS = 평균 상승폭 / 평균 하락폭',
      '일반적으로 14일 기간을 사용합니다.',
      '0~100 사이의 값을 가지며, 중심선은 50입니다.',
    ],
    interpretation: [
      'RSI > 70: 과매수 구간 → 가격 조정 가능성',
      'RSI < 30: 과매도 구간 → 반등 가능성',
      'RSI 50 돌파: 추세 전환 시그널',
      '다이버전스: 가격과 RSI 방향이 다르면 추세 전환 임박',
    ],
    chart: (colors) => {
      const rsi = calcRSI(prices, 14);
      const chartData = basePriceData.map((d, i) => ({
        day: d.day,
        price: d.price,
        rsi: rsi[i],
      }));
      const tooltipStyle = { backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8 };
      return (
        <div className="space-y-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} stroke={colors.axis} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="price" stroke={colors.price} dot={false} strokeWidth={1} name="주가" />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 0, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke={colors.axis} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '과매수 70', position: 'right', fill: '#ef4444', fontSize: 11 }} />
              <ReferenceLine y={30} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: '과매도 30', position: 'right', fill: '#3b82f6', fontSize: 11 }} />
              <ReferenceLine y={50} stroke={colors.tooltipBorder} />
              <Line type="monotone" dataKey="rsi" stroke="#a855f7" dot={false} strokeWidth={2} name="RSI" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    },
  },
  {
    id: 'bollinger',
    name: '볼린저 밴드',
    nameEn: 'Bollinger Bands',
    category: '변동성',
    summary: '이동평균선을 중심으로 표준편차를 이용해 상하 밴드를 그려 변동성을 시각화합니다.',
    description: [
      '중심선 = 20일 단순이동평균(SMA)',
      '상단밴드 = 중심선 + (2 × 표준편차)',
      '하단밴드 = 중심선 - (2 × 표준편차)',
      '밴드 폭이 좁아지면(스퀴즈) 큰 변동이 올 수 있음을 의미합니다.',
    ],
    interpretation: [
      '주가가 상단밴드에 닿으면 과매수, 하단밴드에 닿으면 과매도',
      '밴드 폭이 좁아지면(스퀴즈) → 곧 큰 움직임 예상',
      '밴드 폭이 넓어지면 → 변동성 확대 구간',
      '주가가 밴드 바깥으로 나가면 추세가 강하다는 의미일 수도 있음',
    ],
    chart: (colors) => {
      const bollinger = calcBollinger(basePriceData, 20, 2);
      return (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={bollinger} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} stroke={colors.axis} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8 }} />
            <Legend />
            <Area type="monotone" dataKey="upper" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={1} name="상단밴드" connectNulls />
            <Area type="monotone" dataKey="lower" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={1} name="하단밴드" connectNulls />
            <Line type="monotone" dataKey="middle" stroke="#3b82f6" dot={false} strokeWidth={1.5} strokeDasharray="5 5" name="중심선(MA20)" connectNulls />
            <Line type="monotone" dataKey="price" stroke="#f59e0b" dot={false} strokeWidth={2} name="주가" />
          </AreaChart>
        </ResponsiveContainer>
      );
    },
  },
  {
    id: 'elliott',
    name: '엘리어트 파동',
    nameEn: 'Elliott Wave Theory',
    category: '패턴',
    summary: '시장이 5개의 상승 파동과 3개의 조정 파동(5-3 패턴)으로 움직인다는 이론입니다.',
    description: [
      '상승 5파: 1파(상승) → 2파(조정) → 3파(가장 강한 상승) → 4파(조정) → 5파(마지막 상승)',
      '하락 3파: A파(하락) → B파(반등) → C파(하락)',
      '각 파동은 더 작은 파동으로 세분화될 수 있습니다 (프랙탈 구조).',
      '피보나치 비율(0.382, 0.5, 0.618, 1.618)과 함께 사용하여 목표가를 예측합니다.',
    ],
    interpretation: [
      '3파가 가장 길고 강력 → 주요 매수 구간',
      '2파는 1파의 61.8% 이상 되돌리지 않음',
      '4파는 1파의 고점 아래로 내려가지 않음',
      'A-B-C 조정 이후 새로운 상승 사이클 시작 가능',
    ],
    chart: (colors) => {
      const wave = [
        ...Array.from({ length: 12 }, (_, i) => ({
          day: i + 1,
          price: 45000 + i * 500 + Math.random() * 200,
          label: i === 0 ? '시작' : i === 11 ? '1파' : '',
        })),
        ...Array.from({ length: 7 }, (_, i) => ({
          day: 13 + i,
          price: 51000 - i * 400 + Math.random() * 200,
          label: i === 6 ? '2파' : '',
        })),
        ...Array.from({ length: 18 }, (_, i) => ({
          day: 20 + i,
          price: 48200 + i * 600 + Math.random() * 300,
          label: i === 17 ? '3파' : '',
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
          day: 38 + i,
          price: 59000 - i * 350 + Math.random() * 200,
          label: i === 7 ? '4파' : '',
        })),
        ...Array.from({ length: 10 }, (_, i) => ({
          day: 46 + i,
          price: 56200 + i * 450 + Math.random() * 250,
          label: i === 9 ? '5파' : '',
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
          day: 56 + i,
          price: 60700 - i * 500 + Math.random() * 200,
          label: i === 7 ? 'A파' : '',
        })),
        ...Array.from({ length: 6 }, (_, i) => ({
          day: 64 + i,
          price: 56700 + i * 350 + Math.random() * 200,
          label: i === 5 ? 'B파' : '',
        })),
        ...Array.from({ length: 10 }, (_, i) => ({
          day: 70 + i,
          price: 58800 - i * 500 + Math.random() * 200,
          label: i === 9 ? 'C파' : '',
        })),
      ].map((d) => ({ ...d, price: Math.round(d.price) }));

      const CustomLabel = (props: Record<string, unknown>) => {
        const { x, y, value } = props as { x: number; y: number; value: string };
        if (!value) return null;
        const isCorrection = ['2파', '4파', 'A파', 'C파'].includes(value);
        return (
          <text x={x} y={y - 15} textAnchor="middle" fill={isCorrection ? '#3b82f6' : '#ef4444'} fontSize={12} fontWeight="bold">
            {value}
          </text>
        );
      };

      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={wave} margin={{ top: 25, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} stroke={colors.axis} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8 }} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="주가"
              label={<CustomLabel />}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    },
  },
];

// --- 컴포넌트 ---

export default function IndicatorsGuide() {
  const [activeId, setActiveId] = useState(indicators[0].id);
  const active = indicators.find((i) => i.id === activeId)!;
  const { theme } = useThemeContext();

  const categories = [...new Set(indicators.map((i) => i.category))];

  const chartColors: ChartColors = theme === 'dark'
    ? { grid: '#1f2937', axis: '#6b7280', tooltipBg: '#111827', tooltipBorder: '#374151', price: '#6b7280' }
    : { grid: '#e5e7eb', axis: '#9ca3af', tooltipBg: '#ffffff', tooltipBorder: '#d1d5db', price: '#9ca3af' };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <nav className="lg:w-56 shrink-0">
        <div className="sticky top-20 space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {cat}
              </div>
              <div className="space-y-0.5">
                {indicators
                  .filter((i) => i.category === cat)
                  .map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => setActiveId(ind.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                        activeId === ind.id
                          ? 'bg-blue-600/20 text-blue-500 dark:text-blue-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      {ind.name}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{active.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{active.nameEn}</p>
            <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{active.summary}</p>
          </div>

          {/* Chart */}
          <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">시각화 (시뮬레이션 데이터)</div>
            {active.chart(chartColors)}
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">개념 설명</h3>
            <ul className="space-y-2">
              {active.description.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0">•</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Interpretation */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">해석 방법</h3>
            <ul className="space-y-2">
              {active.interpretation.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0">→</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
