import React, { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CN_CODES from "./data/cnCodes";
import { PHASE_IN_FACTORS, YEARS, PRODUCT_CATEGORIES, DEFAULT_EU_ETS_PRICE, DEFAULT_INDIA_CARBON_PRICE, getPrecursors, isComplexGood, EXEMPTION_THRESHOLD_TONNES } from "./data/constants";
import { calculateCBAM, aggregateBasket, generateBasketProjection, formatEuro, formatNumber } from "./utils/calculations";
import globalCbams from "./data/globalCbams.json";
const COLORS = ["#6366f1", "#a855f7", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316"];
const TOOLTIP_STYLE = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#111827', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: '0.8rem' };
const TICK_STYLE = { fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' };

/* ─── Product Search ─── */
function ProductSearch({ onSelect }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const filtered = useMemo(() => {
        let items = CN_CODES;
        if (category !== "All Categories") items = items.filter(p => p.cat === category);
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(p => p.cn.includes(q) || p.desc.toLowerCase().includes(q));
        }
        return items;
    }, [search, category]);

    return (
        <div className="card fade-in">
            <div className="card-title"><span className="icon">🔍</span> Select Product</div>
            <div className="category-filters">
                {PRODUCT_CATEGORIES.map(c => (
                    <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
            </div>
            <div className="search-container">
                <span className="search-icon">⌕</span>
                <input className="search-input" placeholder="Search by CN code or product description..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="product-list">
                {filtered.slice(0, 50).map((p, i) => (
                    <div key={i} className="product-item" onClick={() => { onSelect(p); setSearch(""); }}>
                        <span className="cn">{p.cn}</span>
                        <span className="desc">{p.desc}</span>
                        {p.route && <span className="route-badge">{p.route}</span>}
                        <span className={`good-type-badge ${isComplexGood(p.cn) ? 'complex' : 'simple'}`}>{isComplexGood(p.cn) ? '⛓ Complex' : '● Simple'}</span>
                    </div>
                ))}
                {filtered.length > 50 && <div style={{ padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 500 }}>Showing 50 of {filtered.length} results</div>}
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="es-icon">🔎</div>
                        <div className="es-title">No products found</div>
                        <div className="es-desc">Try a different search term or category filter</div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Configure Product ─── */
function ConfigureProduct({ product, onAdd, onCancel, globalYear, globalEuPrice, globalIndiaPrice, globalCountry }) {
    const countryData = globalCbams.countries[globalCountry];
    const productDVs = countryData ? countryData[product.cn] : null;
    const defaultDV = productDVs && productDVs.length > 0 ? productDVs[0] : null;
    const hasDefaults = defaultDV !== null;

    const [values, setValues] = useState({ quantity: 1000, direct: defaultDV?.direct || 0, indirect: defaultDV?.indirect || 0 });
    const [useDefault, setUseDefault] = useState(hasDefaults);
    const [precursorInputs, setPrecursorInputs] = useState([]);
    const complex = isComplexGood(product.cn);
    const precursors = getPrecursors(product.cn);

    const handlePrecursorChange = (index, data) => {
        setPrecursorInputs(prev => { const next = [...prev]; next[index] = data; return next; });
    };

    useEffect(() => {
        setUseDefault(hasDefaults);
        setValues(v => ({ ...v, direct: defaultDV?.direct || 0, indirect: defaultDV?.indirect || 0 }));

        if (precursors.length > 0) {
            const initial = precursors.map(pc => {
                const pcDVs = countryData ? countryData[pc.cn] : null;
                const pcDefault = pcDVs && pcDVs.length > 0 ? pcDVs[0] : null;
                const defaultSEE = pcDefault ? pcDefault.total : 0;
                return { massFraction: pc.defaultMass, specificEmissions: defaultSEE };
            });
            setPrecursorInputs(initial);
        } else {
            setPrecursorInputs([]);
        }
    }, [product, globalCountry]);

    const precursorContributions = precursors.map((pc, i) => ({
        name: pc.name,
        massFraction: precursorInputs[i]?.massFraction ?? pc.defaultMass,
        specificEmissions: precursorInputs[i]?.specificEmissions ?? 0,
    }));

    const result = useMemo(() => calculateCBAM({
        quantity: values.quantity, directEmissions: values.direct, indirectEmissions: values.indirect,
        euEtsPrice: globalEuPrice, indianCarbonPrice: globalIndiaPrice, year: globalYear,
        precursorContributions,
    }), [values, precursorContributions, globalYear, globalEuPrice, globalIndiaPrice]);

    return (
        <div className="card fade-in">
            <div className="card-title"><span className="icon">⚙️</span> Configure Product</div>
            <div className="selected-product">
                <span className="sp-cn">{product.cn}</span>
                <span className="sp-desc">
                    {product.desc}
                    {product.route && <span className="route-badge" style={{ marginLeft: 8 }}>{product.route}</span>}
                    {' '}
                    <span className={`good-type-badge ${complex ? 'complex' : 'simple'}`}>{complex ? '⛓ Complex' : '● Simple'}</span>
                </span>
            </div>

            {!hasDefaults && <div className="warning-banner">⚠️ No default emission values available in the EU registry for {globalCountry} — please enter actual verified data.</div>}
            {hasDefaults && (
                <div className="toggle-row">
                    <div className={`toggle ${useDefault ? 'active' : ''}`} onClick={() => {
                        const next = !useDefault;
                        setUseDefault(next);
                        if (next) setValues(v => ({ ...v, direct: defaultDV?.direct || 0, indirect: defaultDV?.indirect || 0 }));
                    }} />
                    <span className="toggle-label">
                        Use Default Values ({globalCountry})
                        {useDefault && <span style={{ color: 'var(--accent-600)', fontWeight: 600 }}> — Direct: {defaultDV.direct} | Indirect: {defaultDV.indirect ?? 0} tCO₂/t</span>}
                    </span>
                </div>
            )}

            <div className="form-grid">
                <div className="field">
                    <label>Quantity (Tonnes)</label>
                    <input type="number" value={values.quantity} onChange={e => setValues({ ...values, quantity: e.target.value })} min="0" />
                </div>
                {(!useDefault || !hasDefaults) && (<>
                    <div className="field">
                        <label>Direct Emissions (tCO₂/t)</label>
                        <input type="number" step="0.01" value={values.direct} onChange={e => setValues({ ...values, direct: e.target.value })} min="0" />
                    </div>
                    <div className="field">
                        <label>Indirect Emissions (tCO₂/t)</label>
                        <input type="number" step="0.01" value={values.indirect} onChange={e => setValues({ ...values, indirect: e.target.value })} min="0" />
                    </div>
                </>)}
            </div>

            {complex && precursors.length > 0 && (
                <div className="precursor-section">
                    <div className="ps-title">⛓ {precursors.length} Precursor{precursors.length > 1 ? 's' : ''} — Annex II</div>
                    <div className="info-banner" style={{ background: 'var(--purple-bg)', borderColor: 'var(--purple-border)', color: 'var(--purple-600)' }}>
                        Precursor emissions required per Article 7. Adjust mass fractions with verified supplier data.
                    </div>
                    {precursors.map((pc, i) => {
                        const inp = precursorInputs[i] || { massFraction: pc.defaultMass, specificEmissions: 0 };
                        return (
                            <div className="precursor-item" key={i}>
                                <div>
                                    <div className="pi-name">{pc.name}</div>
                                    <div className="pi-cn">CN {pc.cn}</div>
                                    {pc.note && <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 3, fontStyle: 'italic' }}>{pc.note}</div>}
                                </div>
                                <div className="field">
                                    <label>Mass Fraction (t/t)</label>
                                    <input type="number" step="0.01" value={inp.massFraction} onChange={e => handlePrecursorChange(i, { ...inp, massFraction: e.target.value })} min="0" />
                                </div>
                                <div className="field">
                                    <label>SEE (tCO₂/t)</label>
                                    <input type="number" step="0.01" value={inp.specificEmissions} onChange={e => handlePrecursorChange(i, { ...inp, specificEmissions: e.target.value })} min="0" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {result.totalEmissions > 0 && (
                <div className="preview-bar">
                    <div className="pv-summary">
                        {formatNumber(result.totalEmissions)} tCO₂ → {formatNumber(result.certificatesRequired)} certificates
                    </div>
                    <div>
                        <span className="pv-cost">{formatEuro(result.netPayable)}</span>
                        <span className="pv-unit" style={{ marginLeft: 8 }}>{formatEuro(result.costPerTonne)}/t</span>
                    </div>
                </div>
            )}

            <div className="action-bar" style={{ marginTop: 20 }}>
                <button className="btn btn-success" onClick={() => {
                    onAdd({
                        product, precursorContributions, result,
                        params: {
                            quantity: values.quantity, directEmissions: values.direct, indirectEmissions: values.indirect,
                            euEtsPrice: globalEuPrice, indianCarbonPrice: globalIndiaPrice, year: globalYear
                        },
                    });
                }}>✓ Add to Basket</button>
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

/* ─── Basket ─── */
function BasketView({ items, onRemove, totals }) {
    if (items.length === 0) return (
        <div className="card">
            <div className="card-title"><span className="icon">🛒</span> Product Basket</div>
            <div className="empty-state">
                <div className="es-icon">📦</div>
                <div className="es-title">Basket is empty</div>
                <div className="es-desc">Select products from the catalog to calculate your CBAM financial exposure</div>
            </div>
        </div>
    );

    const belowExemption = totals.totalQuantity <= EXEMPTION_THRESHOLD_TONNES;

    return (
        <div className="card fade-in">
            <div className="card-title"><span className="icon">🛒</span> Product Basket <span className="good-type-badge simple" style={{ marginLeft: 'auto' }}>{items.length} item{items.length > 1 ? 's' : ''}</span></div>
            {belowExemption && (
                <div className="info-banner">ℹ️ Total quantity ({formatNumber(totals.totalQuantity, 0)} t) ≤ {EXEMPTION_THRESHOLD_TONNES}t — may qualify for CBAM exemption (excluding hydrogen & electricity).</div>
            )}
            <div className="basket-grid">
                {items.map((item, i) => (
                    <div className="basket-item slide-in" key={i} style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="bi-product">
                            <div className="bi-cn">{item.product.cn}</div>
                            <div className="bi-desc">{item.product.desc}</div>
                        </div>
                        <div className="bi-val"><div className="bv-num">{formatNumber(item.result.quantity, 0)} t</div><div className="bv-label">Quantity</div></div>
                        <div className="bi-val"><div className="bv-num">{formatNumber(item.result.totalEmissions, 1)}</div><div className="bv-label">tCO₂</div></div>
                        <div className="bi-val"><div className="bv-num">{formatNumber(item.result.certificatesRequired, 1)}</div><div className="bv-label">Certificates</div></div>
                        <div className="bi-val"><div className="bv-num" style={{ color: 'var(--accent-600)' }}>{formatEuro(item.result.netPayable)}</div><div className="bv-label">Net Cost</div></div>
                        <button className="bi-remove" onClick={() => onRemove(i)}>✕ Remove</button>
                    </div>
                ))}
                <div className="basket-totals">
                    <div style={{ fontWeight: 800, color: 'var(--accent-600)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>TOTAL</div>
                    <div className="bi-val"><div className="bv-num">{formatNumber(totals.totalQuantity, 0)} t</div><div className="bv-label">Quantity</div></div>
                    <div className="bi-val"><div className="bv-num">{formatNumber(totals.totalEmissions, 1)}</div><div className="bv-label">tCO₂</div></div>
                    <div className="bi-val"><div className="bv-num">{formatNumber(totals.totalCertificates, 1)}</div><div className="bv-label">Certificates</div></div>
                    <div className="bi-val"><div className="bv-num" style={{ color: 'var(--accent-600)', fontSize: '1rem' }}>{formatEuro(totals.totalNetPayable)}</div><div className="bv-label">Net Cost</div></div>
                </div>
            </div>
        </div>
    );
}

/* ─── Dashboard ─── */
function Dashboard({ items, totals }) {
    if (items.length === 0) return null;
    const projection = useMemo(() => generateBasketProjection(items), [items]);
    const yr = items[0]?.result?.year || 2026;

    const pieData = items.map((item) => ({
        name: item.product.cn + ' ' + item.product.desc.slice(0, 18), value: item.result.netPayable,
    })).filter(d => d.value > 0);

    return (
        <div className="fade-in">
            <div className="metrics-grid">
                <div className="metric-card"><div className="mc-label">Total Quantity</div><div className="mc-value">{formatNumber(totals.totalQuantity, 0)}</div><div className="mc-unit">tonnes</div></div>
                <div className="metric-card"><div className="mc-label">Embedded Emissions</div><div className="mc-value">{formatNumber(totals.totalEmissions)}</div><div className="mc-unit">tCO₂</div></div>
                <div className="metric-card"><div className="mc-label">Certificates Required</div><div className="mc-value">{formatNumber(totals.totalCertificates)}</div><div className="mc-unit">CBAM certificates</div></div>
                <div className="metric-card highlight"><div className="mc-label">Net Payable</div><div className="mc-value">{formatEuro(totals.totalNetPayable)}</div><div className="mc-unit">After carbon price deduction</div></div>
                <div className="metric-card green"><div className="mc-label">Avg Cost / Tonne</div><div className="mc-value">{formatEuro(totals.avgCostPerTonne)}</div><div className="mc-unit">Across all products</div></div>
            </div>

            {items.map((item, idx) => {
                const r = item.result;
                const complex = isComplexGood(item.product.cn);
                return (
                    <div className="card" key={idx}>
                        <div className="card-title">
                            <span className="icon">📊</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.product.cn}</span>
                            <span style={{ textTransform: 'none', fontWeight: 500, letterSpacing: 0, fontSize: '0.82rem' }}>— {item.product.desc}</span>
                            <span className={`good-type-badge ${complex ? 'complex' : 'simple'}`} style={{ marginLeft: 'auto' }}>{complex ? '⛓ Complex' : '● Simple'}</span>
                        </div>
                        <table className="breakdown-table">
                            <thead><tr><th>Parameter</th><th>Value</th><th>Method</th></tr></thead>
                            <tbody>
                                <tr><td>Direct Emissions</td><td>{formatNumber(r.directEmissions, 3)} tCO₂/t</td><td>{complex ? 'Process only' : 'Total direct'}</td></tr>
                                <tr><td>Indirect Emissions</td><td>{formatNumber(r.indirectEmissions, 3)} tCO₂/t</td><td>Electricity consumed</td></tr>
                                {complex && r.precursorDetails.map((pd, i) => (
                                    <tr key={i} className="precursor-row"><td>↳ {pd.name}</td><td>+{formatNumber(pd.contribution, 3)} tCO₂/t</td><td>{pd.massFraction} × {pd.specificEmissions}</td></tr>
                                ))}
                                <tr><td>Specific Embedded Emissions</td><td>{formatNumber(r.specificEmbedded, 3)} tCO₂/t</td><td>D + I{complex ? ' + Precursors' : ''}</td></tr>
                                <tr><td>Total Emissions ({formatNumber(r.quantity, 0)} × {formatNumber(r.specificEmbedded, 3)})</td><td>{formatNumber(r.totalEmissions)} tCO₂</td><td>Quantity × SEE</td></tr>
                                <tr><td>Certificates at {(r.phaseFactor * 100).toFixed(1)}% phase-in</td><td>{formatNumber(r.certificatesRequired)}</td><td>Emissions × Phase-in factor</td></tr>
                                <tr><td><strong>Net CBAM Payable</strong></td><td><strong>{formatEuro(r.netPayable)}</strong></td><td><strong>{formatEuro(r.costPerTonne)}/tonne</strong></td></tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}

            <div className="charts-grid">
                <div className="card">
                    <div className="card-title"><span className="icon">📈</span> Cost Projection 2026–2034</div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <AreaChart data={projection}>
                                <defs>
                                    <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="year" tick={TICK_STYLE} />
                                <YAxis tick={TICK_STYLE} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600 }} />
                                <Area type="monotone" dataKey="grossCost" name="Gross Cost (€)" stroke="#6366f1" strokeWidth={2} fill="url(#gradGross)" dot={{ r: 3, fill: '#6366f1' }} />
                                <Area type="monotone" dataKey="netPayable" name="Net Payable (€)" stroke="#10b981" strokeWidth={2} fill="url(#gradNet)" dot={{ r: 3, fill: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {pieData.length > 1 && (
                    <div className="card">
                        <div className="card-title"><span className="icon">🥧</span> Cost Distribution</div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} dataKey="value" strokeWidth={2} stroke="#fff"
                                        label={({ name, percent }) => `${name.slice(0, 14)}… ${(percent * 100).toFixed(0)}%`}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatEuro(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                {pieData.length === 1 && (
                    <div className="card">
                        <div className="card-title"><span className="icon">📊</span> Certificate Projection</div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <BarChart data={projection}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="year" tick={TICK_STYLE} />
                                    <YAxis tick={TICK_STYLE} />
                                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                                    <Bar dataKey="certificates" name="Certificates" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-title"><span className="icon">📅</span> Phase-in Schedule</div>
                <div className="phase-timeline">
                    {YEARS.map(y => (
                        <div key={y} className={`phase-bar ${y === parseInt(yr) ? 'active' : ''}`} style={{ height: `${24 + (PHASE_IN_FACTORS[y] ?? 1) * 80}px` }}>
                            <div className="pb-year">{y}</div><div className="pb-pct">{((PHASE_IN_FACTORS[y] ?? 1) * 100).toFixed(1)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-title"><span className="icon">📋</span> CBAM 2026 Requirements</div>
                <div className="reg-info">
                    <div className="reg-item"><div className="ri-label">Period</div><div className="ri-value">Definitive Phase — Jan 1, 2026</div></div>
                    <div className="reg-item"><div className="ri-label">Declaration</div><div className="ri-value">Annual by Sep 30 of following year</div></div>
                    <div className="reg-item"><div className="ri-label">Certificate Price</div><div className="ri-value">Quarterly average EU ETS price</div></div>
                    <div className="reg-item"><div className="ri-label">Verification</div><div className="ri-value">Mandatory third-party verification</div></div>
                    <div className="reg-item"><div className="ri-label">De Minimis</div><div className="ri-value">≤ 50 tonnes/year (excl. hydrogen)</div></div>
                    <div className="reg-item"><div className="ri-label">Certificate Validity</div><div className="ri-value">2 years — 100% repurchase by EU</div></div>
                </div>
            </div>
        </div>
    );
}

/* ─── PDF Report ─── */
function PDFReport({ items, totals, exporterInfo, projection }) {
    if (items.length === 0) return null;
    const yr = items[0]?.result?.year || 2026;
    return (
        <div className="pdf-report" id="pdf-report">
            <h1>CBAM Financial Impact Report</h1>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 4 }}>Generated {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} | EU Regulation 2023/956</p>

            {(exporterInfo.company || exporterInfo.importer) && (
                <div className="exporter-info">
                    <div>{exporterInfo.company && <><span className="label">Exporter: </span>{exporterInfo.company}<br /></>}{exporterInfo.address && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{exporterInfo.address}</span>}</div>
                    <div>{exporterInfo.importer && <><span className="label">EU Importer: </span>{exporterInfo.importer}<br /></>}{exporterInfo.eori && <><span className="label">EORI: </span>{exporterInfo.eori}</>}</div>
                </div>
            )}

            <h2>Summary — {items.length} Product{items.length > 1 ? 's' : ''}</h2>
            <div className="pdf-metric-grid">
                <div className="pdf-metric"><div className="val">{formatNumber(totals.totalQuantity, 0)}</div><div className="lbl">Tonnes</div></div>
                <div className="pdf-metric"><div className="val">{formatNumber(totals.totalEmissions)}</div><div className="lbl">tCO₂</div></div>
                <div className="pdf-metric"><div className="val">{formatNumber(totals.totalCertificates)}</div><div className="lbl">Certificates</div></div>
                <div className="pdf-metric"><div className="val">{formatEuro(totals.totalGrossCost)}</div><div className="lbl">Gross Cost</div></div>
                <div className="pdf-metric"><div className="val" style={{ color: '#059669' }}>{formatEuro(totals.totalNetPayable)}</div><div className="lbl">Net Payable</div></div>
            </div>

            <table>
                <thead><tr><th>CN Code</th><th>Product</th><th>Qty (t)</th><th>tCO₂</th><th>Certs</th><th>Net Cost</th><th>€/t</th></tr></thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.product.cn}</td>
                            <td>{item.product.desc}</td>
                            <td>{formatNumber(item.result.quantity, 0)}</td>
                            <td>{formatNumber(item.result.totalEmissions)}</td>
                            <td>{formatNumber(item.result.certificatesRequired)}</td>
                            <td style={{ fontWeight: 700 }}>{formatEuro(item.result.netPayable)}</td>
                            <td>{formatEuro(item.result.costPerTonne)}</td>
                        </tr>
                    ))}
                    <tr className="highlight-row">
                        <td colSpan={2}><strong>TOTAL</strong></td>
                        <td><strong>{formatNumber(totals.totalQuantity, 0)}</strong></td>
                        <td><strong>{formatNumber(totals.totalEmissions)}</strong></td>
                        <td><strong>{formatNumber(totals.totalCertificates)}</strong></td>
                        <td><strong>{formatEuro(totals.totalNetPayable)}</strong></td>
                        <td><strong>{formatEuro(totals.avgCostPerTonne)}</strong></td>
                    </tr>
                </tbody>
            </table>

            {items.map((item, idx) => {
                const r = item.result; const complex = isComplexGood(item.product.cn);
                return (
                    <div key={idx}>
                        <h3>({idx + 1}) {item.product.cn} — {item.product.desc} {item.product.route ? `[${item.product.route}]` : ''} {complex ? '[Complex Good]' : '[Simple Good]'}</h3>
                        <table>
                            <thead><tr><th>Parameter</th><th>Value</th><th>Notes</th></tr></thead>
                            <tbody>
                                <tr><td>Quantity</td><td>{formatNumber(r.quantity, 0)} tonnes</td><td></td></tr>
                                <tr><td>Direct Emissions</td><td>{formatNumber(r.directEmissions, 3)} tCO₂/t</td><td>{complex ? 'Process' : 'Total direct'}</td></tr>
                                <tr><td>Indirect Emissions</td><td>{formatNumber(r.indirectEmissions, 3)} tCO₂/t</td><td>Electricity</td></tr>
                                {complex && r.precursorDetails.map((pd, i) => (
                                    <tr key={i} style={{ color: '#7c3aed', fontStyle: 'italic' }}><td>↳ {pd.name}</td><td>+{formatNumber(pd.contribution, 3)} tCO₂/t</td><td>{pd.massFraction} t/t × {pd.specificEmissions} tCO₂/t</td></tr>
                                ))}
                                <tr><td>Specific Embedded Emissions</td><td>{formatNumber(r.specificEmbedded, 3)} tCO₂/t</td><td></td></tr>
                                <tr><td>Phase-in ({r.year})</td><td>{(r.phaseFactor * 100).toFixed(1)}%</td><td>EU Reg. 2023/956 Art. 36(3)(b)</td></tr>
                                <tr className="highlight-row"><td><strong>Net CBAM Payable</strong></td><td><strong>{formatEuro(r.netPayable)}</strong></td><td>{formatEuro(r.costPerTonne)}/tonne</td></tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}

            <h2>Year-over-Year Projection</h2>
            <table>
                <thead><tr><th>Year</th><th>Phase-in</th><th>Certificates</th><th>Gross Cost</th><th>Net Payable</th></tr></thead>
                <tbody>
                    {projection.map(p => (
                        <tr key={p.year} className={p.year === yr ? 'highlight-row' : ''}>
                            <td>{p.year}</td><td>{p.phaseIn}</td><td>{formatNumber(p.certificates)}</td><td>{formatEuro(p.grossCost)}</td><td>{formatEuro(p.netPayable)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pdf-chart" id="pdf-chart-container">
                <ResponsiveContainer>
                    <BarChart data={projection}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip />
                        <Bar dataKey="netPayable" name="Net Payable (€)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="footer">
                <p><strong>CBAM Financial Impact Calculator</strong></p>
                <p>EU Regulation (EU) 2023/956 • Implementing Regulation (EU) 2023/1773 • Annex II Precursors • Article 36(3)(b) Phase-in</p>
                <p>This report is for estimation purposes only. Final CBAM liability is determined by the authorized CBAM declarant after mandatory third-party verification.</p>
                <p style={{ marginTop: 8 }}>{new Date().toLocaleString('en-US')}</p>
            </div>
        </div>
    );
}

/* ─── Main App ─── */
export default function App() {
    const [tab, setTab] = useState('configure');
    const [basket, setBasket] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [exporterInfo, setExporterInfo] = useState({ company: '', address: '', importer: '', eori: '' });
    const [globalCountry, setGlobalCountry] = useState('India');
    const [globalYear, setGlobalYear] = useState(2026);
    const [globalEuPrice, setGlobalEuPrice] = useState(DEFAULT_EU_ETS_PRICE);
    const [globalIndiaPrice, setGlobalIndiaPrice] = useState(DEFAULT_INDIA_CARBON_PRICE);
    const [generating, setGenerating] = useState(false);

    const countriesList = useMemo(() => Object.keys(globalCbams.countries).sort(), []);

    const totals = useMemo(() => aggregateBasket(basket), [basket]);
    const projection = useMemo(() => generateBasketProjection(basket), [basket]);

    const handleAddToBasket = (item) => { setBasket(prev => [...prev, item]); setSelectedProduct(null); setTab('basket'); };
    const handleRemove = (i) => setBasket(prev => prev.filter((_, idx) => idx !== i));

    const generatePDF = async () => {
        setGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 500));
            const el = document.getElementById("pdf-report");
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgW = pageW - 20;
            const imgH = (canvas.height * imgW) / canvas.width;
            let heightLeft = imgH, position = 10;
            pdf.addImage(imgData, "PNG", 10, position, imgW, imgH);
            heightLeft -= (pageH - 20);
            while (heightLeft > 0) { position = heightLeft - imgH + 10; pdf.addPage(); pdf.addImage(imgData, "PNG", 10, position, imgW, imgH); heightLeft -= (pageH - 20); }
            pdf.save(`CBAM_Report_${basket.length}products_${globalYear}.pdf`);
        } catch (err) { console.error("PDF error:", err); }
        setGenerating(false);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>CBAM Financial Impact Calculator</h1>
                <p className="subtitle">Compliance Tool for Exporters to the European Union</p>
                <span className="badge-count">255 CN Codes · Multi-Product Basket · Precursor Emissions · 2026–2034</span>
            </header>

            <div className="card">
                <div className="card-title"><span className="icon">🏢</span> Exporter & Importer Details</div>
                <div className="exporter-grid">
                    <div className="field"><label>Exporter Company</label><input value={exporterInfo.company} onChange={e => setExporterInfo({ ...exporterInfo, company: e.target.value })} placeholder="e.g. Tata Steel Ltd." /></div>
                    <div className="field"><label>EU Importer</label><input value={exporterInfo.importer} onChange={e => setExporterInfo({ ...exporterInfo, importer: e.target.value })} placeholder="e.g. ThyssenKrupp AG" /></div>
                    <div className="field"><label>Address</label><input value={exporterInfo.address} onChange={e => setExporterInfo({ ...exporterInfo, address: e.target.value })} placeholder="City, Country" /></div>
                    <div className="field"><label>EORI Number</label><input value={exporterInfo.eori} onChange={e => setExporterInfo({ ...exporterInfo, eori: e.target.value })} placeholder="EU EORI" /></div>
                </div>
                <div className="form-grid" style={{ marginTop: 18 }}>
                    <div className="field">
                        <label>Country of Origin</label>
                        <select value={globalCountry} onChange={e => setGlobalCountry(e.target.value)}>
                            {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label>Import Year</label>
                        <select value={globalYear} onChange={e => setGlobalYear(parseInt(e.target.value))}>
                            {YEARS.map(y => <option key={y} value={y}>{y} — {(PHASE_IN_FACTORS[y] * 100).toFixed(1)}% phase-in</option>)}
                        </select>
                    </div>
                    <div className="field"><label>EU ETS Price (€/tCO₂)</label><input type="number" value={globalEuPrice} onChange={e => setGlobalEuPrice(e.target.value)} min="0" /></div>
                    <div className="field"><label>Carbon Price Paid in {globalCountry} (€/tCO₂)</label><input type="number" value={globalIndiaPrice} onChange={e => setGlobalIndiaPrice(e.target.value)} min="0" /></div>
                </div>
            </div>

            <div className="tab-bar">
                <button className={`tab-btn ${tab === 'configure' ? 'active' : ''}`} onClick={() => setTab('configure')}>
                    ➕ Add Products
                </button>
                <button className={`tab-btn ${tab === 'basket' ? 'active' : ''}`} onClick={() => setTab('basket')}>
                    📊 Basket & Report {basket.length > 0 && <span className="tab-count">{basket.length}</span>}
                </button>
            </div>

            {tab === 'configure' && (
                <>
                    {!selectedProduct && <ProductSearch onSelect={setSelectedProduct} />}
                    {selectedProduct && (
                        <ConfigureProduct product={selectedProduct} onAdd={handleAddToBasket} onCancel={() => setSelectedProduct(null)}
                            globalYear={globalYear} globalEuPrice={globalEuPrice} globalIndiaPrice={globalIndiaPrice} globalCountry={globalCountry} />
                    )}
                </>
            )}

            {tab === 'basket' && (
                <>
                    <BasketView items={basket} onRemove={handleRemove} totals={totals} />
                    <Dashboard items={basket} totals={totals} />
                    {basket.length > 0 && (
                        <div className="action-bar">
                            <button className="btn btn-primary" onClick={generatePDF} disabled={generating}>
                                {generating ? '⏳ Generating PDF...' : '📄 Download PDF Report'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setTab('configure')}>➕ Add Another Product</button>
                        </div>
                    )}
                </>
            )}

            <PDFReport items={basket} totals={totals} exporterInfo={exporterInfo} projection={projection} />
        </div>
    );
}
