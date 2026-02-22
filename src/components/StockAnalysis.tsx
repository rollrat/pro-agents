import { useState } from 'react';
import {
  TrendingUp,
  ChevronUp,
  Shield,
  Target,
  AlertTriangle,
  Zap,
  BarChart3,
  Activity,
  Star,
  CircleDollarSign,
  Eye,
} from 'lucide-react';

/* ──────────────────────────── DATA ──────────────────────────── */

const STOCK = {
  code: '000660',
  name: 'SK하이닉스',
  nameEn: 'SK hynix Inc.',
  sector: '반도체',
  market: 'KOSPI',
  price: '949,000',
  priceNum: 949000,
  change: '+53,000',
  changeRate: '+5.93',
  date: '2026.02.20',
  marketCap: '691조',
  per: '17.8배',
  pbr: '6.18배',
  divYield: '0.32%',
  perSub: 'Forward(26E) 12.3배',
  pbrSub: 'BPS 153,530원 기준',
  divSub: 'DPS 3,000원 (2025)',
};

const ISSUES = [
  { tag: '속보', tagType: 'negative' as const, title: '52주 신고가 955,000원 돌파! 블랙록 5% 지분 신규 취득', desc: 'SK하이닉스가 2/20 종가 949,000원(+5.93%)으로 52주 신고가 경신. 장중 955,000원까지 상승. 세계 최대 자산운용사 블랙록이 SK하이닉스 주식 3,640만주를 보유하며 지분 5%를 넘긴 것으로 보고.', date: '2026.02.20' },
  { tag: '핵심', tagType: 'important' as const, title: '2025년 매출 97조·영업이익 47조 — 연간·분기 모두 사상 최대', desc: '연결 매출 97조 1,467억원(+47% YoY), 영업이익 47조 2,063억원(+101% YoY), 순이익 42조 9,479억원. 영업이익률 49%. 4분기만 매출 32.8조, 영업이익 19.2조(영업이익률 58%)로 분기 사상 최대 기록.', date: '2026.01.23' },
  { tag: '호재', tagType: 'positive' as const, title: '자기주식 1,530만주(12.2조원) 전량 소각 + 역대 최대 배당', desc: '보유 자기주식 1,530만주(지분율 2.1%, 약 12.2조원 규모)를 전량 소각하여 주당 가치 제고. 주당 배당금 3,000원(총 2.1조원) 지급으로 역대 최대 주주환원 단행.', date: '2026.01.23' },
  { tag: '호재', tagType: 'positive' as const, title: 'HBM 매출 전년비 2배 이상 성장 — HBM3E 12단 본격 양산', desc: 'HBM3E 12단 판매 확대로 HBM 매출이 전년 대비 2배 이상 성장. 엔비디아 내 HBM 물량 기준 점유율 63%로 독보적 1위 유지. 1c DDR5 본격 양산으로 원가 경쟁력도 확보.', date: '2026.01.23' },
  { tag: '전략', tagType: 'important' as const, title: '2026년 영업이익 100조원 시대 전망 — 매출 166조원', desc: '하나증권 영업이익 112조, 키움증권 103조, 대신증권 101조 전망. 매출 166조원(+72% YoY), 영업이익률 62% 예상. HBM4 출시와 AI 인프라 투자 확대가 핵심 성장 동력.', date: '2026.01.14' },
  { tag: '시장', tagType: 'positive' as const, title: '증권사 목표주가 최고 112만원 — 컨센서스 평균 113만원', desc: '하나증권 112만원, SK증권 100만원, 키움증권·노무라·NH투자 88만원. 34명 애널리스트 중 대부분 매수 추천. 12개월 평균 목표주가 112.7만원으로 현재가 대비 +18.8% 상승여력.', date: '2026.02' },
];

const FINANCIALS = {
  headers: ['항목', '2022', '2023', '2024', '2025', '2026E'],
  rows: [
    { label: '매출 (조원)', values: ['44.6', '32.8', '66.2', '97.1', '166.0'], highlight: 3 },
    { label: '영업이익 (조원)', values: ['7.0', '-7.7', '23.5', '47.2', '103.0'], highlight: 3 },
    { label: '순이익 (조원)', values: ['2.4', '-9.1', '19.8', '42.9', '56.3'], highlight: 3 },
    { label: '영업이익률 (%)', values: ['15.7', '적자', '35.5', '48.6', '62.0'], highlight: 3 },
    { label: 'EPS (원)', values: ['3,350', '적자', '27,182', '53,308', '77,324'], highlight: 3 },
    { label: 'BPS (원)', values: ['-', '-', '101,515', '153,530', '229,368'], highlight: 3 },
    { label: 'ROE (%)', values: ['-', '적자', '31.1', '41.8', '40.4'], highlight: 3 },
    { label: 'DPS (원)', values: ['-', '0', '1,500', '3,000', '-'], highlight: 3 },
  ],
};

const TARGETS = [
  { broker: '하나증권', price: '1,120,000원', upside: '+18.0% 상승여력', date: '2026.01.14 리포트', highlight: false },
  { broker: 'SK증권', price: '1,000,000원', upside: '+5.4% 상승여력', date: '2025.11 리포트', highlight: false },
  { broker: '키움증권', price: '880,000원', upside: '목표가 초과 달성!', date: '2026.01.07 리포트', exceeded: true, highlight: false },
  { broker: '컨센서스 평균', price: '1,127,000원', upside: '+18.8% 상승여력', date: '34명 애널리스트 평균', highlight: true },
];

const PEERS = {
  headers: ['기업', '매출(조원)', 'PER(배)', 'PBR(배)', '영업이익률(%)', 'HBM 점유율'],
  rows: [
    { cells: ['삼성전자(반도체)', '~80', '9.5', '2.1', '~20', '~35%'], highlight: false },
    { cells: ['SK하이닉스', '97.1', '17.8', '6.18', '48.6', '~57%'], highlight: true },
    { cells: ['마이크론(Micron)', '~38', '13.3', '5.4', '~32', '~8%'], highlight: false },
  ],
};

const INVESTORS = [
  {
    name: '가치투자자',
    style: '벤저민 그레이엄 스타일',
    avatar: 'V',
    avatarBg: 'bg-blue-100 dark:bg-blue-900/50',
    avatarColor: 'text-blue-600 dark:text-blue-400',
    verdict: '보유',
    verdictStyle: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    points: [
      { type: '-', text: 'PBR 6.18배 — BPS 153,530원 대비 6배 이상, 전통 가치지표 과열' },
      { type: '-', text: 'Trailing PER 17.8배 — 반도체 사이클 피크 수준의 밸류에이션' },
      { type: '+', text: 'Forward PER 12.3배(2026E EPS 77,324원) — 이익 성장 감안 시 합리적' },
      { type: '!', text: '자사주 12.2조 소각 + DPS 3,000원으로 주주환원 의지 강력' },
    ],
    buyPrice: '690,000원',
    buyPct: '현재가 대비 -27.3%',
    sellPrice: '950,000원',
    sellPct: '현 수준이 매도 검토 구간',
    reasoning: 'BPS 153,530원 × 적정PBR 4.5배(과거 5년 평균) = 690,885원을 안전마진 확보 매수가로 산정. 현재 PBR 6.18배는 그레이엄 기준 과열 구간. 이익이 뒷받침되더라도 사이클 피크 위험 존재.',
    score: 40,
    scoreColor: 'bg-red-500',
    scoreLabelColor: 'text-red-500',
  },
  {
    name: '성장투자자',
    style: '피터 린치 스타일',
    avatar: 'G',
    avatarBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    avatarColor: 'text-emerald-600 dark:text-emerald-400',
    verdict: '매수',
    verdictStyle: 'bg-red-50 dark:bg-red-900/30 text-red-500',
    points: [
      { type: '+', text: '2026E 영업이익 103조원(+118% YoY) — 폭발적 이익 성장' },
      { type: '+', text: 'HBM 매출 2배 이상 성장, 엔비디아 물량 점유율 63%' },
      { type: '+', text: 'Forward PER 12.3배 × 이익성장률 118% = PEG 0.10, 극단적 저평가' },
      { type: '-', text: '매출 166조원 전망은 AI 투자가 유지된다는 전제' },
    ],
    buyPrice: '850,000원',
    buyPct: '현재가 대비 -10.4%',
    sellPrice: '1,400,000원',
    sellPct: '현재가 대비 +47.5%',
    reasoning: '2026E EPS 77,324원 × Target PER 11배(이익성장 118% 기반 PEG≈0.1) = 850,564원 매수가. 2027E EPS ~100,000원 × PER 14배 = 1,400,000원 목표가. HBM4 양산이 핵심 카탈리스트.',
    score: 78,
    scoreColor: 'bg-emerald-500',
    scoreLabelColor: 'text-emerald-500',
  },
  {
    name: '모멘텀 투자자',
    style: '추세추종 스타일',
    avatar: 'M',
    avatarBg: 'bg-amber-100 dark:bg-amber-900/50',
    avatarColor: 'text-amber-600 dark:text-amber-400',
    verdict: '매수',
    verdictStyle: 'bg-red-50 dark:bg-red-900/30 text-red-500',
    points: [
      { type: '+', text: '52주 신고가 955,000원 돌파! 1년 수익률 +280% 초강력 추세' },
      { type: '+', text: '블랙록 5% 지분 취득 — 글로벌 기관 자금 유입 지속' },
      { type: '+', text: 'AI 반도체 슈퍼사이클 모멘텀 지속 중' },
      { type: '-', text: '100만원 심리적 저항선 접근, 단기 차익실현 매물 출회 가능' },
    ],
    buyPrice: '900,000원',
    buyPct: '20일선 부근 눌림목',
    sellPrice: '1,000,000원 / 1,130,000원',
    sellPct: '1차: 심리적 저항 / 2차: 컨센서스',
    reasoning: '20일 이동평균선(약 900,000원) 지지 확인 후 분할매수. 100만원 심리적 저항선 돌파 시 컨센서스 113만원까지 추세 연장. 60일선 이탈(약 800,000원) 시 손절.',
    score: 72,
    scoreColor: 'bg-amber-500',
    scoreLabelColor: 'text-amber-500',
  },
  {
    name: '역발상 투자자',
    style: '하워드 막스 스타일',
    avatar: 'C',
    avatarBg: 'bg-violet-100 dark:bg-violet-900/50',
    avatarColor: 'text-violet-600 dark:text-violet-400',
    verdict: '경계',
    verdictStyle: 'bg-red-50 dark:bg-red-900/30 text-red-500',
    points: [
      { type: '-', text: 'PBR 6.18배 — 역사적 최고 수준, 과거 평균(1.6배)의 4배' },
      { type: '-', text: '1년 +280% 급등 — 모두가 낙관할 때가 가장 위험한 시점' },
      { type: '-', text: 'AI 인프라 과잉투자 버블 가능성, 반도체 사이클 피크 우려' },
      { type: '+', text: '다만 이익 성장이 실제로 동반되고 있어 단순 버블은 아님' },
    ],
    buyPrice: '450,000원',
    buyPct: '현재가 대비 -52.6%',
    sellPrice: '949,000원',
    sellPct: '현 수준이 매도 구간',
    reasoning: '과거 다운사이클 평균 PBR 1.6배 × BPS 229,368원(2026E) = 366,989원. 안전마진 감안 450,000원을 역발상 매수가로 산정. 현재 시장은 "이번엔 다르다"는 낙관이 지배적 — 막스의 2차적 사고가 필요한 시점.',
    score: 25,
    scoreColor: 'bg-red-500',
    scoreLabelColor: 'text-red-500',
  },
  {
    name: '기관투자자',
    style: '포트폴리오 매니저 스타일',
    avatar: 'I',
    avatarBg: 'bg-slate-200 dark:bg-slate-700',
    avatarColor: 'text-slate-600 dark:text-slate-300',
    verdict: '비중유지',
    verdictStyle: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    points: [
      { type: '+', text: 'KOSPI 시총 상위 — 벤치마크 대비 언더웨이트 불가' },
      { type: '+', text: 'AI 테마 핵심 수혜주, 블랙록 등 글로벌 자금 유입 지속' },
      { type: '!', text: '2026E 영업이익 100조+ — 실적 뒷받침 시 추가 상승 가능' },
      { type: '-', text: 'PBR 6배대 부담, 조정 시 비중확대 기회 모색' },
    ],
    buyPrice: '750,000원',
    buyPct: '현재가 대비 -21.0%',
    sellPrice: '1,200,000원',
    sellPct: '현재가 대비 +26.4%',
    reasoning: 'Forward PER 15배(업종 상단) × 2026E EPS 77,324원 = 1,159,860원. PBR 밴드 상단(8배) × BPS 153,530원 = 1,228,240원. 현재가는 적정 밸류에이션 구간 내. 조정 시 Forward PER 10배(750,000원) 수준에서 비중 확대.',
    score: 60,
    scoreColor: 'bg-amber-500',
    scoreLabelColor: 'text-amber-500',
  },
];

const SWOT = {
  strengths: [
    'HBM 시장점유율 57~63%로 독보적 글로벌 1위',
    '2025년 영업이익률 49% — 메모리 업체 중 최고 수익성',
    '1c DDR5 양산으로 원가 경쟁력 확보, 6세대 10nm급 선도',
    'NVIDIA 등 주요 AI칩 업체와 안정적 공급 관계 구축',
    '자사주 12.2조원 전량 소각 등 적극적 주주환원 정책',
  ],
  weaknesses: [
    'PBR 6.18배로 역사적 최고 수준, 밸류에이션 부담',
    'NAND 부문 삼성전자 대비 경쟁력 열위',
    '대규모 설비투자 지속 필요 (HBM·첨단공정)',
    'HBM 매출 의존도 심화 → 특정 제품 집중 리스크',
    '1년 +280% 급등 후 단기 조정 가능성',
  ],
  opportunities: [
    '2026E 영업이익 100조원+ — AI 슈퍼사이클 본격화',
    'HBM4 출시로 ASP 및 마진 추가 개선 기대',
    '글로벌 데이터센터 투자 확대 (AWS·Azure·GCP 경쟁)',
    '온디바이스 AI → 모바일 LPDDR5X 고사양화 트렌드',
    '블랙록 등 글로벌 기관투자자 비중 확대 지속',
  ],
  threats: [
    '미-중 반도체 규제 → 중국향 수출 제한 리스크',
    '삼성전자 HBM3E 양품률 개선 → 경쟁 격화',
    'AI 투자 사이클 둔화 시 HBM 수요 급감 가능',
    'DRAM 공급과잉 전환 시 범용 제품 가격 하락',
    '글로벌 경기침체 시 IT 설비투자 축소',
  ],
};

const RISKS = [
  { name: '사이클 리스크', level: '중간', pct: 50, color: 'bg-amber-500' },
  { name: '지정학 리스크', level: '높음', pct: 70, color: 'bg-red-500' },
  { name: '밸류에이션 리스크', level: '높음', pct: 75, color: 'bg-red-500' },
  { name: '경쟁 리스크', level: '중간', pct: 45, color: 'bg-amber-500' },
];

const MONITORS = [
  { title: 'AI 인프라 투자 지속 여부', desc: 'AWS·Azure·GCP 등 클라우드 빅3의 AI 설비투자(CAPEX) 추이 모니터링. 투자 둔화 시 HBM 수요에 직접 영향.', level: 'warn' as const },
  { title: '미-중 반도체 규제 동향', desc: '미국의 대중국 첨단 반도체 수출 규제 확대 여부. SK하이닉스 중국 다롄/우시 공장 운영 영향.', level: 'warn' as const },
  { title: 'HBM 수요-공급 밸런스', desc: 'HBM3E/HBM4 공급 확대(삼성·마이크론 추격) 속도 vs AI 수요 증가 속도. 공급과잉 전환 시점 주시.', level: 'info' as const },
  { title: 'DRAM 범용 가격 추이', desc: 'DDR4/DDR5 범용 DRAM 계약가 동향. HBM 외 범용 제품 가격 하락 시 전체 수익성 영향.', level: 'info' as const },
];

/* ──────────────────────────── HELPERS ──────────────────────────── */

const tagStyles = {
  negative: 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  positive: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  important: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

/* ──────────────────────────── SECTIONS ──────────────────────────── */

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white overflow-hidden">
      <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-10 pb-14">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-[13px] mb-4">
              {STOCK.market} &middot; {STOCK.code} &middot; {STOCK.sector}
            </div>
            <h1 className="text-4xl sm:text-[42px] font-black tracking-tight mb-1">{STOCK.name}</h1>
            <p className="text-white/60 mb-5">{STOCK.nameEn}</p>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-4xl sm:text-[48px] font-black tracking-tighter">{STOCK.price}원</span>
              <span className="flex items-center gap-1.5 text-red-300 text-xl font-bold">
                <ChevronUp size={20} />
                {STOCK.change} ({STOCK.changeRate}%)
              </span>
            </div>
            <p className="text-white/40 text-[13px] mb-5">{STOCK.date} 종가 기준</p>
            <div className="flex flex-wrap gap-2">
              {[
                { text: '52주 신고가 돌파!', hot: true },
                { text: '1년 +280% 상승', hot: true },
                { text: 'HBM 점유율 63%', hot: false },
                { text: '영업이익 47조(사상 최대)', hot: false },
                { text: '자사주 12.2조 소각', hot: false },
                { text: '블랙록 5% 취득', hot: false },
              ].map((t) => (
                <span
                  key={t.text}
                  className={`px-3 py-1 rounded-full text-[13px] font-semibold border ${
                    t.hot
                      ? 'bg-red-500/20 border-red-400/30 text-red-200'
                      : 'bg-white/10 border-white/15 text-white/80'
                  }`}
                >
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right — stat grid */}
          <div className="grid grid-cols-2 gap-3 min-w-[380px]">
            {[
              { label: '시가총액', value: STOCK.marketCap, sub: 'KOSPI 상위' },
              { label: 'PER (Trailing)', value: STOCK.per, sub: STOCK.perSub },
              { label: 'PBR', value: STOCK.pbr, sub: STOCK.pbrSub },
              { label: '배당수익률', value: STOCK.divYield, sub: STOCK.divSub, green: true },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/[0.08] backdrop-blur border border-white/10 rounded-2xl p-5 text-center"
              >
                <div className="text-[12px] uppercase tracking-wider text-white/50 mb-1">{s.label}</div>
                <div className={`text-2xl font-extrabold ${s.green ? 'text-emerald-400' : ''}`}>{s.value}</div>
                <div className="text-[12px] text-white/40 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalBar() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 -mt-7 relative z-20 mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl px-7 py-5 flex items-center justify-between gap-6 flex-wrap shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800">
        {[
          { icon: <Zap size={18} />, iconBg: 'bg-red-50 dark:bg-red-900/30 text-red-500', label: 'AI 종합 투자의견', value: '매수', valueColor: 'text-red-500' },
          { icon: <Target size={18} />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', label: '컨센서스 목표가', value: '1,127,000원', valueColor: '' },
          { icon: <TrendingUp size={18} />, iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', label: '상승여력', value: '+18.8%', valueColor: 'text-emerald-600 dark:text-emerald-400' },
          { icon: <Activity size={18} />, iconBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', label: '52주 수익률', value: '+280%', valueColor: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${s.iconBg}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-[12px] text-gray-400 dark:text-gray-500">{s.label}</div>
              <div className={`text-base font-bold ${s.valueColor || 'text-gray-800 dark:text-gray-200'}`}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueSection() {
  return (
    <Section icon={<AlertTriangle size={16} />} title="AI 이슈 포착" badge="실시간 분석">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {ISSUES.map((issue, i) => (
          <div
            key={i}
            className={`flex gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
              i === 0 ? 'bg-gradient-to-r from-red-50 dark:from-red-900/10 to-transparent' : ''
            }`}
          >
            <span
              className={`inline-block px-3 py-0.5 rounded-md text-[11px] font-bold shrink-0 h-fit mt-0.5 ${tagStyles[issue.tagType]}`}
            >
              {issue.tag}
            </span>
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 mb-1">{issue.title}</h4>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{issue.desc}</p>
              <span className="text-[12px] text-gray-400 dark:text-gray-600 mt-1.5 inline-block">{issue.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FinancialSection() {
  return (
    <Section icon={<CircleDollarSign size={16} />} title="재무제표 핵심 요약" badge="연결 기준">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {FINANCIALS.headers.map((h, i) => (
                <th
                  key={h}
                  className={`bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-[13px] font-semibold border-b-2 border-gray-200 dark:border-gray-700 ${
                    i === 0
                      ? 'text-left text-gray-600 dark:text-gray-400'
                      : 'text-right text-gray-500 dark:text-gray-400'
                  } ${i === FINANCIALS.headers.length - 1 ? 'text-blue-500 italic' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FINANCIALS.rows.map((row) => (
              <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`px-4 py-3.5 text-sm text-right tabular-nums border-b border-gray-100 dark:border-gray-800 ${
                      i === row.highlight
                        ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-gray-900 dark:text-gray-100'
                        : i === row.values.length - 1
                          ? 'text-blue-500 dark:text-blue-400 italic'
                          : 'text-gray-600 dark:text-gray-400'
                    } ${v.startsWith('-') && v !== '-' ? 'text-blue-500 dark:text-blue-400' : ''} ${v === '적자' ? 'text-blue-500 dark:text-blue-400 italic' : ''}`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function ChartsSection() {
  const opsData = [
    { year: '2022', label: '7.0조', pct: 7, color: 'bg-blue-400 dark:bg-blue-500', negative: false },
    { year: '2023', label: '-7.7조', pct: 0, color: '', negative: true },
    { year: '2024', label: '23.5조', pct: 23, color: 'bg-blue-500', negative: false },
    { year: '2025', label: '47.2조', pct: 46, color: 'bg-blue-600', negative: false },
    { year: '2026E', label: '103조', pct: 100, color: 'bg-gradient-to-t from-blue-700 to-blue-500', negative: false },
  ];

  const revenueData = [
    { year: '2022', value: '44.6조', pct: 27, color: 'bg-slate-400' },
    { year: '2023', value: '32.8조', pct: 20, color: 'bg-slate-400' },
    { year: '2024', value: '66.2조', pct: 40, color: 'bg-amber-500' },
    { year: '2025', value: '97.1조', pct: 59, color: 'bg-emerald-500', bold: true },
    { year: '2026E', value: '166조', pct: 100, color: 'bg-gradient-to-t from-blue-600 to-emerald-400', bold: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      {/* Operating Profit */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5">영업이익 추이</h3>
        <div className="flex items-end gap-3 h-[200px] pb-5">
          {opsData.map((d) => (
            <div key={d.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className={`text-[12px] font-bold ${d.negative ? 'text-blue-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {d.label}
              </div>
              {d.negative ? (
                <div className="w-full max-w-[60px] h-[15%] bg-blue-100 dark:bg-blue-900/30 rounded-t-lg flex items-center justify-center text-[10px] text-blue-500 font-bold">
                  적자
                </div>
              ) : (
                <div className={`w-full max-w-[60px] rounded-t-lg ${d.color}`} style={{ height: `${d.pct}%`, minHeight: d.pct > 0 ? '12px' : '0' }} />
              )}
              <div className={`text-[12px] font-medium ${d.year === '2026E' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
                {d.year}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-gray-400 text-center mt-2">* 2026E는 증권사 컨센서스 추정치 (키움 103조, 하나 112조)</p>
      </div>

      {/* Revenue */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5">매출 추이</h3>
        <div className="flex items-end gap-3 h-[200px] pb-5">
          {revenueData.map((d) => (
            <div key={d.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className={`text-[12px] font-bold ${d.bold ? 'text-emerald-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {d.value}
              </div>
              <div className={`w-full max-w-[60px] rounded-t-lg ${d.color}`} style={{ height: `${d.pct}%`, minHeight: '12px' }} />
              <div className={`text-[12px] font-medium ${d.bold ? 'font-bold' : ''} ${d.year === '2026E' ? 'text-blue-500' : 'text-gray-400'}`}>
                {d.year}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-gray-400 text-center mt-2">* HBM·DDR5·eSSD 등 AI 메모리 수요가 핵심 성장 동력</p>
      </div>
    </div>
  );
}

function TargetSection() {
  return (
    <Section icon={<Target size={16} />} title="증권사 목표주가" badge="최근 리포트 기준">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TARGETS.map((t) => (
          <div
            key={t.broker}
            className={`rounded-2xl p-5 text-center border transition-all hover:shadow-lg ${
              t.highlight
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : t.exceeded
                  ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <div className={`text-sm font-semibold mb-2 ${t.highlight ? 'text-blue-600 dark:text-blue-400' : t.exceeded ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {t.broker}
            </div>
            <div className={`text-2xl font-black mb-1 ${t.highlight ? 'text-blue-700 dark:text-blue-300' : t.exceeded ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {t.price}
            </div>
            <div className={`text-[13px] font-semibold ${t.exceeded ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{t.upside}</div>
            <div className="text-[11px] text-gray-400 mt-2">{t.date}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PeerSection() {
  return (
    <Section icon={<BarChart3 size={16} />} title="동종업체 비교 (글로벌 메모리)" badge="2025 연간 기준">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {PEERS.headers.map((h, i) => (
                <th
                  key={h}
                  className={`bg-blue-600 text-white px-4 py-3.5 text-[13px] font-semibold ${
                    i === 0 ? 'text-left rounded-tl-2xl' : 'text-center'
                  } ${i === PEERS.headers.length - 1 ? 'rounded-tr-2xl' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PEERS.rows.map((row, ri) => (
              <tr
                key={ri}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  row.highlight ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {row.cells.map((c, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3.5 text-sm border-b border-gray-100 dark:border-gray-800 ${
                      ci === 0 ? 'text-left font-semibold' : 'text-center'
                    } ${row.highlight ? 'font-bold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function InvestorSection() {
  return (
    <Section icon={<Eye size={16} />} title="다중 투자자 관점 분석" badge="">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {INVESTORS.map((inv) => (
          <div
            key={inv.name}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="px-6 pt-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold ${inv.avatarBg} ${inv.avatarColor}`}>
                {inv.avatar}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{inv.name}</div>
                <div className="text-[12px] text-gray-400">{inv.style}</div>
              </div>
            </div>
            <div className="px-6 py-5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold mb-4 ${inv.verdictStyle}`}>
                {inv.verdict}
              </span>
              <ul className="space-y-0">
                {inv.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-gray-800 last:border-b-0"
                  >
                    <span className={`font-bold shrink-0 mt-px ${p.type === '+' ? 'text-blue-500' : p.type === '-' ? 'text-red-400' : 'text-amber-500'}`}>
                      {p.type}
                    </span>
                    <span className="leading-relaxed">{p.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target size={12} /> 목표 매수가 / 매도가
                </div>
                <div className="flex gap-2.5 mb-3">
                  <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-center">
                    <div className="text-[11px] font-semibold text-blue-500 mb-1">매수 목표가</div>
                    <div className="text-lg font-black text-blue-700 dark:text-blue-300">{inv.buyPrice}</div>
                    <div className="text-[11px] font-semibold text-blue-400 mt-0.5">{inv.buyPct}</div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-center">
                    <div className="text-[11px] font-semibold text-red-500 mb-1">매도 목표가</div>
                    <div className="text-lg font-black text-red-600 dark:text-red-400">{inv.sellPrice}</div>
                    <div className="text-[11px] font-semibold text-red-400 mt-0.5">{inv.sellPct}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{inv.reasoning}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[12px] text-gray-400">매력도</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${inv.scoreColor}`} style={{ width: `${inv.score}%` }} />
                </div>
                <span className={`text-[13px] font-bold min-w-[32px] text-right ${inv.scoreLabelColor}`}>{inv.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SwotSection() {
  const cards = [
    { key: 'S', label: '강점 (Strengths)', items: SWOT.strengths, bg: 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/10', border: 'border-emerald-200 dark:border-emerald-800', titleColor: 'text-emerald-600 dark:text-emerald-400', bullet: '✓', bulletColor: 'text-emerald-500' },
    { key: 'W', label: '약점 (Weaknesses)', items: SWOT.weaknesses, bg: 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/10', border: 'border-red-200 dark:border-red-800', titleColor: 'text-red-600 dark:text-red-400', bullet: '✗', bulletColor: 'text-red-500' },
    { key: 'O', label: '기회 (Opportunities)', items: SWOT.opportunities, bg: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10', border: 'border-blue-200 dark:border-blue-800', titleColor: 'text-blue-600 dark:text-blue-400', bullet: '★', bulletColor: 'text-blue-500' },
    { key: 'T', label: '위협 (Threats)', items: SWOT.threats, bg: 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/10', border: 'border-amber-200 dark:border-amber-800', titleColor: 'text-amber-600 dark:text-amber-400', bullet: '⚠', bulletColor: 'text-amber-500' },
  ];

  return (
    <Section icon={<Shield size={16} />} title="SWOT 분석" badge="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.key} className={`rounded-2xl p-6 border ${c.bg} ${c.border}`}>
            <div className={`text-base font-extrabold mb-3 flex items-center gap-2 ${c.titleColor}`}>
              {c.key} — {c.label}
            </div>
            <ul className="space-y-0">
              {c.items.map((item, i) => (
                <li key={i} className="flex gap-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className={`shrink-0 ${c.bulletColor}`}>{c.bullet}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RiskSection() {
  return (
    <Section icon={<AlertTriangle size={16} />} title="리스크 분석" badge="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">종합 리스크 레벨</h3>
          <div className="flex items-center gap-1 mb-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2.5 rounded-full ${
                  i < 2 ? 'bg-emerald-500' : i < 4 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-5">
            <span>매우 낮음</span>
            <span>낮음</span>
            <span>중간</span>
            <span className="font-bold text-amber-500">중간-높음</span>
            <span>매우 높음</span>
          </div>
          <div className="space-y-3">
            {RISKS.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">{r.name}</span>
                  <span className={`text-[13px] font-semibold ${r.pct >= 60 ? 'text-red-500' : 'text-amber-500'}`}>{r.level}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">주요 모니터링 포인트</h3>
          <div className="space-y-4">
            {MONITORS.map((m, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    m.level === 'warn'
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{m.title}</div>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function VerdictSection() {
  return (
    <section className="mb-8">
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 rounded-[20px] p-10 text-white overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-[13px] mb-5">
            <Star size={14} /> AI 종합 분석 리포트
          </div>
          <h2 className="text-2xl sm:text-[28px] font-black mb-4">종합 의견: 매수 (Buy) — 단, 밸류에이션 부담 인지 필요</h2>
          <p className="text-[15px] leading-loose text-white/85 max-w-[800px]">
            SK하이닉스는 <strong>2025년 영업이익 47.2조원(+101% YoY)</strong>으로 사상 최대 실적을 기록했으며,
            <strong> 2026년에는 영업이익 100조원 시대</strong>가 전망됩니다.
            HBM 시장점유율 57~63%로 AI 반도체 시대의 핵심 수혜주이며, 컨센서스 목표가 1,127,000원 대비 <strong>+18.8%</strong>의 상승여력이 있습니다.
            다만, <strong>PBR 6.18배(역사적 최고), 1년 +280% 급등</strong>으로 밸류에이션 부담이 존재하며,
            반도체 사이클 피크 우려와 미-중 지정학 리스크에 유의해야 합니다.
            <strong> 신규 진입보다는 조정 시 분할매수</strong> 전략이 바람직하며, 기존 보유자는 2026E 실적 확인까지 보유 유지가 적절합니다.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7">
            {[
              { value: '78/100', label: '성장 매력도' },
              { value: '40/100', label: '가치 매력도' },
              { value: '72/100', label: '모멘텀 매력도' },
              { value: '중간-높음', label: '리스크 레벨', amber: true },
            ].map((m) => (
              <div key={m.label} className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
                <div className={`text-2xl font-black ${m.amber ? 'text-amber-300' : ''}`}>{m.value}</div>
                <div className="text-[12px] text-white/60 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="text-center text-[13px] text-gray-400 dark:text-gray-500 leading-loose py-8 border-t border-gray-200 dark:border-gray-800">
      <p>
        <strong className="text-gray-500 dark:text-gray-400">면책 조항:</strong> 본 분석은 AI가 공개된 정보를 기반으로 자동 생성한 것이며, 투자 권유가 아닙니다.
        <br />
        투자 결정은 반드시 본인의 판단과 책임 하에 이루어져야 합니다.
      </p>
      <p className="mt-3 text-[12px]">
        데이터 출처: SK하이닉스 뉴스룸 &middot; FnGuide &middot; 한경 컨센서스 &middot; Investing.com &middot; 각 증권사 리포트
      </p>
      <p className="mt-2 text-gray-400/60">Generated by AI Analysis Engine &middot; 2026.02.22</p>
    </footer>
  );
}

/* ──────────── Section wrapper ──────────── */

function Section({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-blue-500">
        <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center">{icon}</div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-200">{title}</h2>
        {badge && (
          <span className="ml-auto text-[12px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/* ──────────────────────────── MAIN ──────────────────────────── */

export default function StockAnalysis() {
  const [_tab, setTab] = useState('overview');
  const navItems = [
    { id: 'overview', label: '개요' },
    { id: 'financials', label: '재무분석' },
    { id: 'investors', label: '투자자관점' },
    { id: 'target', label: '목표주가' },
    { id: 'news', label: '이슈포착' },
  ];

  return (
    <div className="-mx-4 -mt-6">
      <nav className="sticky top-[57px] z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1280px] mx-auto px-6 flex gap-1 overflow-x-auto">
          {navItems.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => setTab(n.id)}
              className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <HeroSection />
      <SignalBar />

      <div className="max-w-[1280px] mx-auto px-6">
        <div id="news">
          <IssueSection />
        </div>
        <div id="financials">
          <FinancialSection />
          <ChartsSection />
        </div>
        <div id="target">
          <TargetSection />
          <PeerSection />
        </div>
        <div id="investors">
          <InvestorSection />
        </div>
        <SwotSection />
        <RiskSection />
        <VerdictSection />
        <Footer />
      </div>
    </div>
  );
}
