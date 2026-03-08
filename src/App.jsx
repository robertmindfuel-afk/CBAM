import { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell, PieChart, Pie } from 'recharts';
import { CN_CODES, SECTORS, getCNCodesBySector, searchCNCodes } from './data/cnCodes.js';
import { COUNTRIES, DEFAULT_VALUES, getDefaultValue, getIndirectDefault, MARKUP_SCHEDULE } from './data/defaultValues.js';
import { BENCHMARKS, PHASE_OUT, getETSPrice, DE_MINIMIS_THRESHOLD } from './data/benchmarks.js';
import { calculateCBAM, calculateMultiYearProjection, formatCurrency, formatNumber } from './utils/calculator.js';

// ═══════════════════════════════════════════════════════════
// ICONS (inline SVG components)
// ═══════════════════════════════════════════════════════════
const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>
);
const ChevronRight = (p) => <Icon d="M9 18l6-6-6-6" {...p} />;
const Search = (p) => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" {...p} />;
const Calculator = (p) => <Icon d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zM8 6h8M8 10h8M8 14h3M8 18h3" {...p} />;
const FileText = (p) => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" {...p} />;
const Globe = (p) => <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20z M2 12h20 M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" {...p} />;
const TrendUp = (p) => <Icon d="M23 6l-9.5 9.5-5-5L1 18" {...p} />;
const Info = (p) => <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 16v-4 M12 8h.01" {...p} />;
const Check = (p) => <Icon d="M20 6L9 17l-5-5" {...p} />;
const Download = (p) => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" {...p} />;

// ═══════════════════════════════════════════════════════════
// NAVIGATION TABS
// ═══════════════════════════════════════════════════════════
const TABS = [
  { id: 'calculator', label: 'Calculator', icon: '⚡' },
  { id: 'cn-codes', label: 'CN Codes', icon: '📋' },
  { id: 'defaults', label: 'Default Values', icon: '🌍' },
  { id: 'benchmarks', label: 'Benchmarks', icon: '📊' },
  { id: 'timeline', label: 'Compliance', icon: '📅' },
  { id: 'projections', label: 'Projections', icon: '📈' },
];

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)' }}>
                <span style={{ fontSize: '18px' }}>◈</span>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>CBAM Compass</h1>
                <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>EU Carbon Border Adjustment</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'var(--accent-dim)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                    border: activeTab === tab.id ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                  }}
                >
                  <span className="mr-1.5">{tab.icon}</span>{tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 flex flex-wrap gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'var(--accent-dim)' : 'rgba(255,255,255,0.03)',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'calculator' && <CalculatorView />}
        {activeTab === 'cn-codes' && <CNCodesView />}
        {activeTab === 'defaults' && <DefaultValuesView />}
        {activeTab === 'benchmarks' && <BenchmarksView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'projections' && <ProjectionsView />}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-6 text-center" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <p className="text-xs">
          CBAM Compass — Based on Regulation (EU) 2023/956 and Implementing Regulations 2025/2547–2621.
          Data for informational purposes. Verify with official EU CBAM Registry for compliance.
        </p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 1. CALCULATOR VIEW — Main CBAM Calculator
// ═══════════════════════════════════════════════════════════
function CalculatorView() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    sector: 'iron_steel', cnCode: '', product: '', country: 'CN',
    quantity: 1000, year: 2026, benchmark: 1.370,
    useActual: false, actualDirect: '', actualIndirect: '',
    productionRoute: 'BF-BOF integrated',
  });
  const [result, setResult] = useState(null);

  const sectorCodes = useMemo(() => getCNCodesBySector(form.sector), [form.sector]);
  const nonExemptCountries = useMemo(() => COUNTRIES.filter(c => !c.exempt), []);

  const handleCalculate = useCallback(() => {
    const r = calculateCBAM({
      quantity: parseFloat(form.quantity) || 0,
      product: form.product,
      countryCode: form.country,
      year: parseInt(form.year),
      benchmark: parseFloat(form.benchmark) || 0,
      sector: form.sector,
      useActualEmissions: form.useActual,
      actualDirectEmissions: form.useActual ? parseFloat(form.actualDirect) || 0 : null,
      actualIndirectEmissions: form.useActual ? parseFloat(form.actualIndirect) || 0 : null,
    });
    setResult(r);
    setStep(4);
  }, [form]);

  const projection = useMemo(() => {
    if (!result) return [];
    return calculateMultiYearProjection({
      quantity: parseFloat(form.quantity) || 0,
      product: form.product,
      countryCode: form.country,
      benchmark: parseFloat(form.benchmark) || 0,
      sector: form.sector,
      useActualEmissions: form.useActual,
      actualDirectEmissions: form.useActual ? parseFloat(form.actualDirect) || 0 : null,
      actualIndirectEmissions: form.useActual ? parseFloat(form.actualIndirect) || 0 : null,
    });
  }, [result, form]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="glass-card p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))' }}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          <span className="gradient-text">CBAM Calculator</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm max-w-2xl">
          Calculate your embedded emissions, CBAM certificate requirements, carbon price deductions, and total financial liability under the EU CBAM definitive period (2026–2034).
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
        {['Product', 'Origin & Volume', 'Emissions', 'Results'].map((label, i) => (
          <button key={i} onClick={() => setStep(i + 1)} className="flex items-center gap-2 flex-shrink-0">
            <div className={`step-dot ${step === i + 1 ? 'step-dot-active' : step > i + 1 ? 'step-dot-complete' : 'step-dot-pending'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: step === i + 1 ? 'var(--accent)' : 'var(--text-muted)' }}>{label}</span>
            {i < 3 && <div className="w-8 h-px mx-1" style={{ background: 'var(--border-subtle)' }} />}
          </button>
        ))}
      </div>

      {/* Step 1: Product Selection */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <h3 className="text-lg font-semibold">Select CBAM Sector & Product</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.values(SECTORS).map(s => (
              <button key={s.id} onClick={() => { updateForm('sector', s.id); updateForm('product', ''); updateForm('cnCode', ''); }}
                className="p-4 rounded-xl text-center transition-all"
                style={{
                  background: form.sector === s.id ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                  border: form.sector === s.id ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                }}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-xs font-semibold" style={{ color: form.sector === s.id ? 'var(--accent)' : 'var(--text-secondary)' }}>{s.name}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>CN Code / Product</label>
            <select className="cbam-select" value={form.cnCode}
              onChange={e => {
                const code = sectorCodes.find(c => c.cn === e.target.value);
                updateForm('cnCode', e.target.value);
                if (code) updateForm('product', code.aggregated);
              }}>
              <option value="">Select CN code...</option>
              {sectorCodes.map(c => (
                <option key={c.cn} value={c.cn}>{c.cn} — {c.desc}</option>
              ))}
            </select>
          </div>

          {form.product && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-active)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Selected product category</div>
              <div className="text-lg font-bold mt-1" style={{ color: 'var(--accent)' }}>{form.product}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                GHG covered: {SECTORS[form.sector.toUpperCase()]?.ghg?.join(', ') || 'CO₂'} • 
                {form.sector === 'electricity' || form.sector === 'hydrogen' ? ' No de minimis exemption' : ` De minimis: ${DE_MINIMIS_THRESHOLD}t/year`}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => form.product && setStep(2)}
              disabled={!form.product}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Next: Origin & Volume →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Origin & Volume */}
      {step === 2 && (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <h3 className="text-lg font-semibold">Origin Country & Import Volume</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Country of Origin</label>
              <select className="cbam-select" value={form.country} onChange={e => updateForm('country', e.target.value)}>
                {nonExemptCountries.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
              {(() => {
                const ctry = COUNTRIES.find(c => c.code === form.country);
                return ctry && (
                  <div className="mt-2 text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                    <div>Carbon pricing: {ctry.mechanism}</div>
                    <div>Effective price: €{ctry.effectivePrice}/tCO₂</div>
                  </div>
                );
              })()}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Import Quantity ({form.sector === 'electricity' ? 'MWh' : 'tonnes'})</label>
              <input type="number" className="cbam-input" value={form.quantity} onChange={e => updateForm('quantity', e.target.value)} min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Compliance Year</label>
              <select className="cbam-select" value={form.year} onChange={e => updateForm('year', e.target.value)}>
                {[2026,2027,2028,2029,2030,2031,2032,2033,2034].map(y => (
                  <option key={y} value={y}>{y} — {PHASE_OUT.find(p=>p.year===y)?.label || ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>← Back</button>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#000' }}>Next: Emissions →</button>
          </div>
        </div>
      )}

      {/* Step 3: Emissions Data */}
      {step === 3 && (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <h3 className="text-lg font-semibold">Emissions & Benchmark Data</h3>

          {/* Toggle actual vs default */}
          <div className="flex gap-3">
            {[false, true].map(isActual => (
              <button key={String(isActual)} onClick={() => updateForm('useActual', isActual)}
                className="flex-1 p-4 rounded-xl text-left transition-all"
                style={{
                  background: form.useActual === isActual ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                  border: form.useActual === isActual ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                }}>
                <div className="text-sm font-semibold" style={{ color: form.useActual === isActual ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {isActual ? 'Actual (Verified)' : 'Default Values'}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {isActual ? 'Verified installation data — no markup' : `EU default + ${(MARKUP_SCHEDULE[form.year]?.standard || 0.3)*100}% markup (${form.year})`}
                </div>
              </button>
            ))}
          </div>

          {form.useActual ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Direct Emissions (tCO₂e/t)</label>
                <input type="number" step="0.001" className="cbam-input" value={form.actualDirect} onChange={e => updateForm('actualDirect', e.target.value)} placeholder="e.g. 1.90" />
              </div>
              {['cement','fertilizers','hydrogen'].includes(form.sector) && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Indirect Emissions (tCO₂e/t)</label>
                  <input type="number" step="0.001" className="cbam-input" value={form.actualIndirect} onChange={e => updateForm('actualIndirect', e.target.value)} placeholder="e.g. 0.15" />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Default value applied</div>
              <div className="text-xl font-bold number-display" style={{ color: 'var(--accent)' }}>
                {formatNumber(getDefaultValue(form.product, form.country, parseInt(form.year)) || 0, 3)} tCO₂e/t
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Base: {formatNumber((getDefaultValue(form.product, form.country, parseInt(form.year)) || 0) / (1 + (MARKUP_SCHEDULE[form.year]?.standard || 0.3)), 3)} + 
                {((MARKUP_SCHEDULE[form.year]?.standard || 0.3)*100)}% markup
              </div>
            </div>
          )}

          {/* Benchmark selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Applicable Benchmark (tCO₂e/t)</label>
            <div className="grid sm:grid-cols-2 gap-3">
              <select className="cbam-select" value={form.productionRoute}
                onChange={e => {
                  updateForm('productionRoute', e.target.value);
                  const bm = BENCHMARKS[form.sector]?.find(b => b.route === e.target.value);
                  if (bm) updateForm('benchmark', form.useActual ? bm.benchA : bm.benchB);
                }}>
                {(BENCHMARKS[form.sector] || []).map((b, i) => (
                  <option key={i} value={b.route}>{b.product} — {b.route}</option>
                ))}
              </select>
              <input type="number" step="0.001" className="cbam-input" value={form.benchmark} onChange={e => updateForm('benchmark', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>← Back</button>
            <button onClick={handleCalculate} className="px-8 py-2.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000' }}>
              ⚡ Calculate CBAM Liability
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div className="space-y-5 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Embedded', value: `${formatNumber(result.emissions.totalEmbedded, 1)} tCO₂e`, sub: `${formatNumber(result.emissions.specificTotal, 3)}/t`, color: '#60a5fa' },
              { label: 'Net Certificates', value: formatNumber(result.netCertificates, 1), sub: `@ €${result.etsPrice}/cert`, color: '#fbbf24' },
              { label: 'Total CBAM Cost', value: formatCurrency(result.totalCost), sub: `${formatCurrency(result.costPerTonne)}/tonne`, color: '#22c55e' },
              { label: 'Phase-out', value: `${(result.phaseOut.obligation * 100).toFixed(1)}%`, sub: result.phaseOut.label, color: '#a78bfa' },
            ].map((kpi, i) => (
              <div key={i} className="glass-card p-5 glow-green">
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
                <div className="text-xl sm:text-2xl font-bold number-display" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs mt-1 number-display" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="glass-card p-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Calculation Breakdown</h4>
              <div className="space-y-3">
                {[
                  ['Gross Embedded Emissions', `${formatNumber(result.emissions.totalEmbedded, 2)} tCO₂e`],
                  ['Free Allocation (SEFA)', `− ${formatNumber(result.freeAllocation.sefa, 2)} tCO₂e`],
                  ['Gross Certificates', `= ${formatNumber(result.grossCertificates, 2)}`],
                  ['Carbon Price Deduction', `− ${formatNumber(result.carbonPriceDeduction.deductionTonnes, 2)} equiv.`],
                  ['Net Certificates Required', `= ${formatNumber(result.netCertificates, 2)}`],
                  ['Certificate Price', `× €${result.etsPrice}`],
                  ['Total CBAM Cost', formatCurrency(result.totalCost)],
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: i < 6 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <span className="text-sm" style={{ color: i === 6 ? 'var(--accent)' : 'var(--text-secondary)' }}>{label}</span>
                    <span className={`text-sm font-semibold number-display ${i === 6 ? 'text-lg' : ''}`}
                      style={{ color: i === 6 ? 'var(--accent)' : 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-year chart */}
            <div className="glass-card p-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Cost Projection 2026–2034</h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={projection.map(p => ({ year: p.input.year, cost: Math.round(p.totalCost), certs: Math.round(p.netCertificates) }))}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [`€${v.toLocaleString()}`, 'Total Cost']} />
                  <Area type="monotone" dataKey="cost" stroke="#22c55e" fill="url(#costGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Parameters summary */}
          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Parameters Used</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                ['Product', form.product],
                ['CN Code', form.cnCode],
                ['Origin', result.country?.name || form.country],
                ['Quantity', `${formatNumber(form.quantity, 0)} t`],
                ['Year', form.year],
                ['Benchmark', `${form.benchmark} tCO₂e/t`],
              ].map(([l, v], i) => (
                <div key={i}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{l}</div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setStep(1); setResult(null); }} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            ← New Calculation
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. CN CODES BROWSER
// ═══════════════════════════════════════════════════════════
function CNCodesView() {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  const filtered = useMemo(() => {
    let codes = search ? searchCNCodes(search) : CN_CODES;
    if (selectedSector !== 'all') codes = codes.filter(c => c.sector === selectedSector);
    return codes;
  }, [search, selectedSector]);

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-1"><span className="gradient-text">CBAM CN Codes Database</span></h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {CN_CODES.length} CN codes across {Object.keys(SECTORS).length} sectors — per Annex I of Regulation (EU) 2023/956
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="cbam-input pl-10" placeholder="Search CN code, product name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="cbam-select sm:w-48" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}>
            <option value="all">All Sectors ({CN_CODES.length})</option>
            {Object.values(SECTORS).map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name} ({getCNCodesBySector(s.id).length})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
          <table className="cbam-table">
            <thead>
              <tr>
                <th>CN Code</th>
                <th>Description</th>
                <th>Sector</th>
                <th>Category</th>
                <th>Unit</th>
                <th>De Minimis</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((code, i) => (
                <tr key={i}>
                  <td className="font-mono font-semibold text-sm" style={{ color: 'var(--accent)' }}>{code.cn}</td>
                  <td className="max-w-xs">{code.desc}</td>
                  <td><span className={`badge ${code.sector === 'cement' ? 'badge-slate' : code.sector === 'iron_steel' ? 'badge-blue' : code.sector === 'aluminium' ? 'badge-purple' : code.sector === 'fertilizers' ? 'badge-green' : 'badge-amber'}`}>
                    {SECTORS[code.sector.toUpperCase()]?.name || code.sector}
                  </span></td>
                  <td className="text-sm">{code.aggregated}</td>
                  <td className="text-sm">{code.unit}</td>
                  <td>{code.deMinimis ? <span className="badge badge-green">50t</span> : <span className="badge badge-red">None</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <div className="p-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Showing first 200 of {filtered.length} results</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. DEFAULT VALUES EXPLORER
// ═══════════════════════════════════════════════════════════
function DefaultValuesView() {
  const [selectedProduct, setSelectedProduct] = useState('Crude steel');
  const [selectedYear, setSelectedYear] = useState(2026);
  const products = Object.keys(DEFAULT_VALUES);

  const countryData = useMemo(() => {
    const vals = DEFAULT_VALUES[selectedProduct];
    if (!vals) return [];
    return Object.entries(vals)
      .filter(([code]) => code !== 'OTHER')
      .map(([code, base]) => {
        const isFert = ['Ammonia', 'Urea', 'Nitric acid', 'Ammonium nitrate', 'CAN', 'UAN solution', 'DAP', 'MAP', 'NPK', 'Potassium nitrate'].includes(selectedProduct);
        const markup = MARKUP_SCHEDULE[Math.min(selectedYear, 2030)] || MARKUP_SCHEDULE[2028];
        const rate = isFert ? markup.fertilizer : markup.standard;
        const country = COUNTRIES.find(c => c.code === code);
        return {
          code, name: country?.name || code, base, withMarkup: base * (1 + rate),
          markup: rate * 100, effectiveCP: country?.effectivePrice || 0,
        };
      })
      .sort((a, b) => b.withMarkup - a.withMarkup);
  }, [selectedProduct, selectedYear]);

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-1"><span className="gradient-text">Country Default Emission Values</span></h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Per Implementing Regulation (EU) 2025/2621 — values include year-specific mark-ups
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="cbam-select flex-1" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="cbam-select sm:w-36" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y} (+{(MARKUP_SCHEDULE[y]?.standard || 0.3)*100}%)</option>)}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <ResponsiveContainer width="100%" height={Math.max(300, countryData.length * 28)}>
          <BarChart data={countryData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={75} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v, name) => [formatNumber(v, 3) + ' tCO₂e/t', name === 'base' ? 'Base value' : 'With markup']} />
            <Bar dataKey="base" fill="rgba(59,130,246,0.4)" radius={[0, 2, 2, 0]} />
            <Bar dataKey="withMarkup" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cbam-table">
            <thead>
              <tr><th>Country</th><th>Base Value</th><th>Markup</th><th>With Markup</th><th>Carbon Price Deduction</th></tr>
            </thead>
            <tbody>
              {countryData.map((row, i) => (
                <tr key={i}>
                  <td className="font-semibold">{row.name} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({row.code})</span></td>
                  <td className="number-display">{formatNumber(row.base, 3)}</td>
                  <td><span className="badge badge-amber">+{row.markup}%</span></td>
                  <td className="number-display font-semibold" style={{ color: '#60a5fa' }}>{formatNumber(row.withMarkup, 3)}</td>
                  <td className="number-display">{row.effectiveCP > 0 ? `€${formatNumber(row.effectiveCP, 2)}/t` : '—'}</td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(239,68,68,0.05)' }}>
                <td className="font-semibold" style={{ color: '#f87171' }}>Fallback (OTHER)</td>
                <td className="number-display">{formatNumber(DEFAULT_VALUES[selectedProduct]?.OTHER || 0, 3)}</td>
                <td><span className="badge badge-red">+{((MARKUP_SCHEDULE[Math.min(selectedYear,2030)]?.standard||0.3)*100)}%</span></td>
                <td className="number-display font-semibold" style={{ color: '#f87171' }}>{formatNumber(getDefaultValue(selectedProduct, 'OTHER', selectedYear) || 0, 3)}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. BENCHMARKS VIEW
// ═══════════════════════════════════════════════════════════
function BenchmarksView() {
  const [selectedSector, setSelectedSector] = useState('iron_steel');

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-1"><span className="gradient-text">EU CBAM Benchmark Values</span></h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Per Implementing Regulation (EU) 2025/2620 — based on top 10% most efficient EU installations
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BENCHMARKS).map(([key, vals]) => (
            <button key={key} onClick={() => setSelectedSector(key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: selectedSector === key ? 'var(--accent-dim)' : 'rgba(255,255,255,0.03)',
                border: selectedSector === key ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                color: selectedSector === key ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
              {SECTORS[key.toUpperCase()]?.icon} {SECTORS[key.toUpperCase()]?.name || key} ({vals.length})
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="cbam-table">
          <thead>
            <tr><th>Product</th><th>Production Route</th><th>Benchmark A (Actual)</th><th>Benchmark B (Default)</th><th>Unit</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {(BENCHMARKS[selectedSector] || []).map((bm, i) => (
              <tr key={i}>
                <td className="font-semibold">{bm.product}</td>
                <td>{bm.route}</td>
                <td className="number-display font-semibold" style={{ color: '#22c55e' }}>{bm.benchA !== null ? formatNumber(bm.benchA, 3) : '—'}</td>
                <td className="number-display font-semibold" style={{ color: '#60a5fa' }}>{bm.benchB !== null ? formatNumber(bm.benchB, 3) : '—'}</td>
                <td className="text-xs">{bm.unit}</td>
                <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{bm.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phase-out chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Free Allocation Phase-Out Schedule</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={PHASE_OUT.filter(p => p.year >= 2026)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v*100).toFixed(0)}%`} domain={[0, 1]} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v, name) => [`${(v*100).toFixed(1)}%`, name === 'obligation' ? 'CBAM Liability' : 'Free Allocation']} />
            <Bar dataKey="cbamFactor" fill="rgba(59,130,246,0.4)" name="Free Allocation" radius={[4, 4, 0, 0]} />
            <Bar dataKey="obligation" fill="#22c55e" name="CBAM Liability" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. COMPLIANCE TIMELINE VIEW
// ═══════════════════════════════════════════════════════════
function TimelineView() {
  const milestones = [
    { date: 'Oct 1, 2023', event: 'Transitional period began', desc: 'Quarterly reporting obligations for importers of CBAM goods. No financial obligations.', status: 'complete' },
    { date: 'Dec 31, 2025', event: 'Transitional period ended', desc: 'Last quarter of reporting-only obligations.', status: 'complete' },
    { date: 'Jan 1, 2026', event: 'Definitive period begins', desc: 'Financial obligations commence. CBAM certificates required for 2.5% of emissions above benchmark.', status: 'active' },
    { date: 'Mar 31, 2026', event: 'Authorization deadline', desc: 'Importers must apply for Authorized CBAM Declarant status via EUCTP. Pending applications allow continued imports.', status: 'upcoming' },
    { date: 'Feb 1, 2027', event: 'Certificate sales begin', desc: 'CBAM certificates available for purchase through the Common Central Platform. Priced at quarterly EU ETS average.', status: 'upcoming' },
    { date: 'Sep 30, 2027', event: 'First annual declaration', desc: 'Surrender certificates covering 2026 imports. Verified CBAM declarations due.', status: 'upcoming' },
    { date: '2028', event: '10% CBAM obligation', desc: 'Free allocation drops to 90%. Mark-up on default values rises to +30%.', status: 'future' },
    { date: '2030', event: '48.5% CBAM obligation', desc: 'Major inflection point — nearly half of free allocation eliminated.', status: 'future' },
    { date: 'Jan 1, 2028', event: 'Scope expansion (proposed)', desc: '~180 downstream steel/aluminium products added if COM(2025) 989 adopted.', status: 'future' },
    { date: '2034', event: 'Full CBAM — 100%', desc: 'EU ETS free allocation fully phased out. All embedded emissions subject to CBAM.', status: 'future' },
  ];

  const reqData = [
    { category: 'Registration', items: ['EORI number', 'Authorized CBAM Declarant application via EUCTP', 'Financial guarantee (if <2 years established)', 'Clean compliance record (3–5 years)'] },
    { category: 'Reporting', items: ['Annual CBAM declaration by September 30', 'CN codes (8-digit) for all imports', 'Quantity in tonnes or MWh', 'Country of origin per consignment', 'Installation-level emissions data', 'Production route identification', 'Third-party verification (for actual emissions)'] },
    { category: 'Financial', items: ['Purchase CBAM certificates (from Feb 2027)', 'Hold ≥50% certificates by end of each quarter', 'Surrender certificates annually by Sep 30', 'Re-purchase surplus by Oct 31', 'Certificates cancelled after 2 years'] },
    { category: 'Verification', items: ['ISO/IEC 17029-accredited verifier required', 'Physical site visit (first period mandatory)', 'Verification of actual emissions data', 'Review of production process categorization', 'Independent verification report filed'] },
  ];

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-1"><span className="gradient-text">Compliance Timeline & Requirements</span></h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Key dates, milestones, and compliance obligations under the EU CBAM</p>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6">
        <div className="space-y-0">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-4 pb-6 relative">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${m.status === 'complete' ? 'bg-green-500' : m.status === 'active' ? 'bg-yellow-400 animate-pulse-slow' : m.status === 'upcoming' ? 'bg-blue-400' : 'bg-gray-600'}`} />
                {i < milestones.length - 1 && <div className="w-px flex-1 min-h-[20px]" style={{ background: 'var(--border-subtle)' }} />}
              </div>
              <div className="pb-2">
                <div className="text-xs font-mono font-semibold" style={{ color: m.status === 'active' ? '#fbbf24' : 'var(--text-muted)' }}>{m.date}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{m.event}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {reqData.map((req, i) => (
          <div key={i} className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
              {req.category}
            </h3>
            <div className="space-y-2.5">
              {req.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Penalty info */}
      <div className="glass-card p-6" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#f87171' }}>⚠ Penalties for Non-Compliance</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Missing certificates</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>€100/tCO₂ penalty (adjusted for inflation) for each unsurrendered certificate, plus obligation to acquire and surrender the missing certificates</div>
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Unauthorized imports</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>3× penalty (up to €300/tCO₂) for importing without authorized declarant status. Repeated violations may lead to deregistration.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. PROJECTIONS VIEW
// ═══════════════════════════════════════════════════════════
function ProjectionsView() {
  const [product, setProduct] = useState('HR flat ≥600mm');
  const [country, setCountry] = useState('CN');
  const [qty, setQty] = useState(10000);
  const [bm, setBm] = useState(1.370);
  const [sector, setSector] = useState('iron_steel');

  const projection = useMemo(() => {
    return calculateMultiYearProjection({
      quantity: qty, product, countryCode: country, benchmark: bm, sector,
    });
  }, [product, country, qty, bm, sector]);

  const chartData = projection.map(p => ({
    year: p.input.year,
    cost: Math.round(p.totalCost),
    certificates: Math.round(p.netCertificates),
    etsPrice: p.etsPrice,
    obligation: (p.phaseOut.obligation * 100),
    costPerT: Math.round(p.costPerTonne),
  }));

  const totalCost = projection.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-1"><span className="gradient-text">Multi-Year Cost Projections</span></h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Project your CBAM costs from 2026–2034 based on phase-out schedule and EU ETS price projections
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <select className="cbam-select" value={product} onChange={e => setProduct(e.target.value)}>
            {Object.keys(DEFAULT_VALUES).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="cbam-select" value={country} onChange={e => setCountry(e.target.value)}>
            {COUNTRIES.filter(c => !c.exempt).map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <input type="number" className="cbam-input" value={qty} onChange={e => setQty(parseFloat(e.target.value) || 0)} placeholder="Quantity (t)" />
          <input type="number" step="0.001" className="cbam-input" value={bm} onChange={e => setBm(parseFloat(e.target.value) || 0)} placeholder="Benchmark" />
          <select className="cbam-select" value={sector} onChange={e => setSector(e.target.value)}>
            {Object.values(SECTORS).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cumulative Cost (2026–2034)</div>
          <div className="text-xl font-bold number-display mt-2" style={{ color: '#22c55e' }}>{formatCurrency(totalCost)}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>2026 Cost</div>
          <div className="text-xl font-bold number-display mt-2" style={{ color: '#60a5fa' }}>{formatCurrency(projection[0]?.totalCost || 0)}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>2034 Cost (Full CBAM)</div>
          <div className="text-xl font-bold number-display mt-2" style={{ color: '#fbbf24' }}>{formatCurrency(projection[projection.length-1]?.totalCost || 0)}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cost Increase (2026→2034)</div>
          <div className="text-xl font-bold number-display mt-2" style={{ color: '#f87171' }}>
            {projection[0]?.totalCost > 0 ? `${Math.round((projection[projection.length-1]?.totalCost || 0) / projection[0].totalCost)}×` : '—'}
          </div>
        </div>
      </div>

      {/* Cost chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Annual CBAM Cost & Certificate Price</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis yAxisId="cost" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
            <YAxis yAxisId="price" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `€${v}`} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v, name) => [name === 'cost' ? formatCurrency(v) : name === 'etsPrice' ? `€${v}` : `${v}%`, name === 'cost' ? 'CBAM Cost' : name === 'etsPrice' ? 'ETS Price' : 'Obligation']} />
            <Bar yAxisId="cost" dataKey="cost" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="price" type="monotone" dataKey="etsPrice" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 3 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      <div className="glass-card overflow-hidden">
        <table className="cbam-table">
          <thead>
            <tr><th>Year</th><th>Obligation</th><th>ETS Price</th><th>Certificates</th><th>Cost/Tonne</th><th>Total Cost</th></tr>
          </thead>
          <tbody>
            {projection.map((p, i) => (
              <tr key={i}>
                <td className="font-semibold">{p.input.year}</td>
                <td><span className="badge badge-blue">{(p.phaseOut.obligation * 100).toFixed(1)}%</span></td>
                <td className="number-display">€{p.etsPrice}</td>
                <td className="number-display">{formatNumber(p.netCertificates, 0)}</td>
                <td className="number-display">{formatCurrency(p.costPerTonne)}</td>
                <td className="number-display font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(p.totalCost)}</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(34,197,94,0.05)' }}>
              <td className="font-bold" colSpan={5}>Cumulative Total (2026–2034)</td>
              <td className="number-display font-bold text-lg" style={{ color: 'var(--accent)' }}>{formatCurrency(totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
