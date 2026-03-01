import React, { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CN_CODES from "./data/cnCodes";
import { PHASE_IN_FACTORS, YEARS, PRODUCT_CATEGORIES, DEFAULT_EU_ETS_PRICE, DEFAULT_INDIA_CARBON_PRICE, getPrecursors, isComplexGood, EXEMPTION_THRESHOLD_TONNES } from "./data/constants";
import { calculateCBAM, aggregateBasket, generateBasketProjection, formatEuro, formatNumber } from "./utils/calculations";

const COLORS = ["#4f46e5", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#db2777", "#0d9488", "#ea580c"];
const TT = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };
const TICK = { fill: '#64748b', fontSize: 11 };

// ─── Product Search ───────────────────────────────────────────
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
            <div className="card-title"><span className="icon">🔍</span> Select Product (CN Code)</div>
            <div className="category-filters">
                {PRODUCT_CATEGORIES.map(c => (
                    <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
            </div>
            <div className="search-container">
                <span className="search-icon">⌕</span>
                <input className="search-input" placeholder="Search by CN code or description..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="product-list">
                {filtered.slice(0, 50).map((p, i) => (
                    <div key={i} className="product-item" onClick={() => { onSelect(p); setSearch(""); }}>
                        <span className="cn">{p.cn}</span>
                        <span className="desc">{p.desc}</span>
                        {p.route && <span className="route-badge">{p.route}</span>}
                        <span className={`good-type-badge ${isComplexGood(p.cn) ? 'complex' : 'simple'}`}>{isComplexGood(p.cn) ? '🔗' : '●'}</span>
                    </div>
                ))}
                {filtered.length > 50 && <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>Showing 50 of {filtered.length}</div>}
                {filtered.length === 0 && <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>No products found</div>}
            </div>
        </div>
    );
}

// ─── Configure Product ────────────────────────────────────────
function ConfigureProduct({ product, onAdd, onCancel, globalYear, globalEuPrice, globalIndiaPrice }) {
    const [values, setValues] = useState({
        quantity: 1000, direct: product.d || 0, indirect: product.i || 0,
    });
    const [useDefault, setUseDefault] = useState(product.d !== null);
    const [precursorInputs, setPrecursorInputs] = useState([]);
    const complex = isComplexGood(product.cn);
    const precursors = getPrecursors(product.cn);
    const hasDefaults = product.d !== null;

    // Get year-appropriate default value with markup
    const getYearDefault = () => {
        const yr = parseInt(globalYear);
        if (yr <= 2026 && product.dv26 != null) return product.dv26;
        if (yr === 2027 && product.dv27 != null) return product.dv27;
        if (yr >= 2028 && product.dv28 != null) return product.dv28;
        return product.t ?? ((product.d || 0) + (product.i || 0));
    };

    const handlePrecursorChange = (index, data) => {
        setPrecursorInputs(prev => { const next = [...prev]; next[index] = data; return next; });
    };

    // Auto-fill precursor SEE from CN_CODES
    useEffect(() => {
        if (precursors.length > 0 && precursorInputs.length === 0) {
            const initial = precursors.map(pc => {
                const pcProduct = CN_CODES.find(p => p.cn === pc.cn);
                const defaultSEE = pcProduct ? (pcProduct.t ?? ((pcProduct.d || 0) + (pcProduct.i || 0))) : 0;
                return { massFraction: pc.defaultMass, specificEmissions: defaultSEE };
            });
            setPrecursorInputs(initial);
        }
    }, [product]);

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

    const handleAdd = () => {
        onAdd({
            product,
            params: {
                quantity: values.quantity, directEmissions: values.direct, indirectEmissions: values.indirect,
                euEtsPrice: globalEuPrice, indianCarbonPrice: globalIndiaPrice, year: globalYear,
            },
            precursorContributions,
            result,
        });
    };

    return (
        <div className="card fade-in">
            <div className="card-title"><span className="icon">⚙️</span> Configure: {product.desc}</div>
            <div className="selected-product">
                <span className="sp-cn">{product.cn}</span>
                <span className="sp-desc">
                    {product.desc}
                    {product.route && <span className="route-badge" style={{ marginLeft: 6 }}>{product.route}</span>}
                    {' '}
                    <span className={`good-type-badge ${complex ? 'complex' : 'simple'}`}>{complex ? '🔗 Complex' : '● Simple'}</span>
                </span>
            </div>

            {!hasDefaults && <div className="warning-banner">⚠️ No default emission values — enter actual emission data.</div>}
            {hasDefaults && (
                <div className="toggle-row">
                    <div className={`toggle ${useDefault ? 'active' : ''}`} onClick={() => {
                        const next = !useDefault;
                        setUseDefault(next);
                        if (next) setValues(v => ({ ...v, direct: product.d, indirect: product.i || 0 }));
                    }} />
                    <span className="toggle-label">Use EU Default Values {useDefault ? `(Direct: ${product.d} | Indirect: ${product.i ?? 0} tCO₂/t)` : ''}</span>
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
                    <div className="ps-title">🔗 {precursors.length} Precursor{precursors.length > 1 ? 's' : ''} (Annex II)</div>
                    <div className="info-banner" style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
                        Precursor emissions must be included per Article 7. Adjust mass fractions with actual supplier data.
                    </div>
                    {precursors.map((pc, i) => {
                        const inp = precursorInputs[i] || { massFraction: pc.defaultMass, specificEmissions: 0 };
                        return (
                            <div className="precursor-item" key={i}>
                                <div>
                                    <div className="pi-name">{pc.name}</div>
                                    <div className="pi-cn">CN: {pc.cn}</div>
                                    {pc.note && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>{pc.note}</div>}
                                </div>
                                <div className="field">
                                    <label>Mass (t/t)</label>
                                    <input type="number" step="0.01" value={inp.massFraction}
                                        onChange={e => handlePrecursorChange(i, { ...inp, massFraction: e.target.value })} min="0" />
                                </div>
                                <div className="field">
                                    <label>SEE (tCO₂/t)</label>
                                    <input type="number" step="0.01" value={inp.specificEmissions}
                                        onChange={e => handlePrecursorChange(i, { ...inp, specificEmissions: e.target.value })} min="0" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Live preview */}
            {result.totalEmissions > 0 && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Preview: {formatNumber(result.totalEmissions)} tCO₂ → {formatNumber(result.certificatesRequired)} certificates → <strong style={{ color: 'var(--accent-light)' }}>{formatEuro(result.netPayable)}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>{formatEuro(result.costPerTonne)}/tonne</span>
                    </div>
                </div>
            )}

            <div className="action-bar" style={{ marginTop: 16 }}>
                <button className="btn btn-success btn-sm" onClick={handleAdd}>✓ Add to Basket</button>
                <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

// ─── Basket View ──────────────────────────────────────────────
function BasketView({ items, onRemove, totals }) {
    if (items.length === 0) return (
        <div className="card">
            <div className="card-title"><span className="icon">🛒</span> Product Basket</div>
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No products added yet. Select a product above to get started.
            </div>
        </div>
    );

    const totalQty = totals.totalQuantity;
    const belowExemption = totalQty <= EXEMPTION_THRESHOLD_TONNES;

    return (
        <div className="card fade-in">
            <div className="card-title"><span className="icon">🛒</span> Product Basket ({items.length} product{items.length > 1 ? 's' : ''})</div>
            {belowExemption && (
                <div className="info-banner">ℹ️ Total quantity ({formatNumber(totalQty, 0)} t) is ≤ {EXEMPTION_THRESHOLD_TONNES}t — may qualify for CBAM exemption (excl. H₂ & electricity).</div>
            )}
            <div className="basket-grid">
                {items.map((item, i) => (
                    <div className="basket-item" key={i}>
                        <div className="bi-product">
                            <div className="bi-cn">{item.product.cn}</div>
                            <div className="bi-desc">{item.product.desc}</div>
                        </div>
                        <div className="bi-val"><div className="bv-num">{formatNumber(item.result.quantity, 0)} t</div><div className="bv-label">Quantity</div></div>
                        <div className="bi-val"><div className="bv-num">{formatNumber(item.result.totalEmissions, 1)}</div><div className="bv-label">tCO₂</div></div>
                        <div className="bi-val"><div className="bv-num">{formatNumber(item.result.certificatesRequired, 1)}</div><div className="bv-label">Certificates</div></div>
                        <div className="bi-val"><div className="bv-num">{formatEuro(item.result.netPayable)}</div><div className="bv-label">Net Cost</div></div>
                        <button className="bi-remove" onClick={() => onRemove(i)}>✕</button>
                    </div>
                ))}
                <div className="basket-totals">
                    <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>TOTAL</div>
                    <div className="bi-val"><div className="bv-num">{formatNumber(totals.totalQuantity, 0)} t</div><div className="bv-label">Quantity</div></div>
                    <div className="bi-val"><div className="bv-num">{formatNumber(totals.totalEmissions, 1)}</div><div className="bv-label">tCO₂</div></div>
                    <div className="bi-val"><div className="bv-num">{formatNumber(totals.totalCertificates, 1)}</div><div className="bv-label">Certificates</div></div>
                    <div className="bi-val"><div className="bv-num" style={{ color: 'var(--accent-light)' }}>{formatEuro(totals.totalNetPayable)}</div><div className="bv-label">Net Cost</div></div>
                </div>
            </div>
        </div>
    );
}

// ─── Aggregate Dashboard ──────────────────────────────────────
function Dashboard({ items, totals }) {
    if (items.length === 0) return null;
    const projection = useMemo(() => generateBasketProjection(items), [items]);
    const yr = items[0]?.result?.year || 2026;

    const pieData = items.map((item, i) => ({
        name: item.product.cn + ' ' + item.product.desc.slice(0, 20), value: item.result.netPayable,
    })).filter(d => d.value > 0);

    return (
        <div className="fade-in">
            <div className="metrics-grid">
                <div className="metric-card"><div className="mc-label">Total Quantity</div><div className="mc-value">{formatNumber(totals.totalQuantity, 0)}</div><div className="mc-unit">tonnes</div></div>
                <div className="metric-card"><div className="mc-label">Total Emissions</div><div className="mc-value">{formatNumber(totals.totalEmissions)}</div><div className="mc-unit">tCO₂</div></div>
                <div className="metric-card"><div className="mc-label">Certificates</div><div className="mc-value">{formatNumber(totals.totalCertificates)}</div><div className="mc-unit">CBAM Certificates</div></div>
                <div className="metric-card highlight"><div className="mc-label">Total Net Payable</div><div className="mc-value">{formatEuro(totals.totalNetPayable)}</div><div className="mc-unit">After deductions</div></div>
                <div className="metric-card green"><div className="mc-label">Avg Cost / Tonne</div><div className="mc-value">{formatEuro(totals.avgCostPerTonne)}</div><div className="mc-unit">Across all products</div></div>
            </div>

            {/* Per-product breakdowns */}
            {items.map((item, idx) => {
                const r = item.result;
                const complex = isComplexGood(item.product.cn);
                return (
                    <div className="card" key={idx}>
                        <div className="card-title"><span className="icon">📊</span> {item.product.cn} — {item.product.desc}</div>
                        <table className="breakdown-table">
                            <thead><tr><th>Parameter</th><th>Value</th><th>Formula</th></tr></thead>
                            <tbody>
                                <tr><td>Direct Emissions</td><td>{formatNumber(r.directEmissions, 3)} tCO₂/t</td><td>{complex ? 'Process only' : 'Total direct'}</td></tr>
                                <tr><td>Indirect Emissions</td><td>{formatNumber(r.indirectEmissions, 3)} tCO₂/t</td><td>Electricity</td></tr>
                                {complex && r.precursorDetails.map((pd, i) => (
                                    <tr key={i} className="precursor-row"><td>↳ {pd.name}</td><td>+{formatNumber(pd.contribution, 3)} tCO₂/t</td><td>{pd.massFraction} × {pd.specificEmissions}</td></tr>
                                ))}
                                <tr><td>SEE</td><td>{formatNumber(r.specificEmbedded, 3)} tCO₂/t</td><td>D + I{complex ? ' + Precursors' : ''}</td></tr>
                                <tr><td>Quantity × SEE</td><td>{formatNumber(r.totalEmissions)} tCO₂</td><td>{formatNumber(r.quantity, 0)} × {formatNumber(r.specificEmbedded, 3)}</td></tr>
                                <tr><td>Certificates ({(r.phaseFactor * 100).toFixed(1)}%)</td><td>{formatNumber(r.certificatesRequired)}</td><td>Emissions × Phase-in</td></tr>
                                <tr><td><strong>Net Payable</strong></td><td><strong>{formatEuro(r.netPayable)}</strong></td><td>{formatEuro(r.costPerTonne)}/t</td></tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}

            {/* Charts */}
            <div className="charts-grid">
                <div className="card">
                    <div className="card-title"><span className="icon">📈</span> Cost Projection 2026–2034</div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <LineChart data={projection}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="year" tick={TICK} /><YAxis tick={TICK} />
                                <Tooltip contentStyle={TT} /><Legend />
                                <Line type="monotone" dataKey="grossCost" name="Gross (€)" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="netPayable" name="Net (€)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {pieData.length > 1 && (
                    <div className="card">
                        <div className="card-title"><span className="icon">🥧</span> Cost by Product</div>
                        <div className="chart-container">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value"
                                        label={({ name, percent }) => `${name.slice(0, 15)} ${(percent * 100).toFixed(0)}%`}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={TT} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Phase-in + Regulatory */}
            <div className="card">
                <div className="card-title"><span className="icon">📅</span> CBAM Phase-in Schedule</div>
                <div className="phase-timeline">
                    {YEARS.map(y => (
                        <div key={y} className={`phase-bar ${y === parseInt(yr) ? 'active' : ''}`} style={{ height: `${20 + PHASE_IN_FACTORS[y] * 80}px` }}>
                            <div className="pb-year">{y}</div><div className="pb-pct">{(PHASE_IN_FACTORS[y] * 100).toFixed(1)}%</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="card">
                <div className="card-title"><span className="icon">📋</span> CBAM 2026 Key Requirements</div>
                <div className="reg-info">
                    <div className="reg-item"><div className="ri-label">Period</div><div className="ri-value">Definitive Phase (Jan 1, 2026)</div></div>
                    <div className="reg-item"><div className="ri-label">Declaration</div><div className="ri-value">Annual — Sep 30 of next year</div></div>
                    <div className="reg-item"><div className="ri-label">Certificate Price</div><div className="ri-value">{yr <= 2026 ? 'Quarterly' : 'Weekly'} avg EU ETS</div></div>
                    <div className="reg-item"><div className="ri-label">Verification</div><div className="ri-value">Mandatory 3rd-party</div></div>
                    <div className="reg-item"><div className="ri-label">Exemption</div><div className="ri-value">≤ 50t/year (excl. H₂)</div></div>
                    <div className="reg-item"><div className="ri-label">Validity</div><div className="ri-value">2 years, 100% repurchase</div></div>
                </div>
            </div>
        </div>
    );
}

// ─── PDF Report ───────────────────────────────────────────────
function PDFReport({ items, totals, exporterInfo, projection }) {
    if (items.length === 0) return null;
    const yr = items[0]?.result?.year || 2026;
    return (
        <div className="pdf-report" id="pdf-report">
            <h1>CBAM Financial Impact Report</h1>
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} | EU Regulation 2023/956</p>

            {(exporterInfo.company || exporterInfo.address) && (
                <div className="exporter-info">
                    <div>{exporterInfo.company && <><span className="label">Exporter: </span>{exporterInfo.company}<br /></>}{exporterInfo.address && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{exporterInfo.address}</span>}</div>
                    <div>{exporterInfo.importer && <><span className="label">EU Importer: </span>{exporterInfo.importer}<br /></>}{exporterInfo.eori && <><span className="label">EORI: </span>{exporterInfo.eori}</>}</div>
                </div>
            )}

            <h2>Summary — {items.length} Product{items.length > 1 ? 's' : ''}</h2>
            <div className="pdf-metric-grid">
                <div className="pdf-metric"><div className="val">{formatNumber(totals.totalQuantity, 0)}</div><div className="lbl">Total Tonnes</div></div>
                <div className="pdf-metric"><div className="val">{formatNumber(totals.totalEmissions)}</div><div className="lbl">Total tCO₂</div></div>
                <div className="pdf-metric"><div className="val">{formatNumber(totals.totalCertificates)}</div><div className="lbl">Certificates</div></div>
                <div className="pdf-metric"><div className="val">{formatEuro(totals.totalGrossCost)}</div><div className="lbl">Gross Cost</div></div>
                <div className="pdf-metric"><div className="val" style={{ color: '#059669' }}>{formatEuro(totals.totalNetPayable)}</div><div className="lbl">Net Payable</div></div>
            </div>

            <table>
                <thead><tr><th>CN Code</th><th>Product</th><th>Qty (t)</th><th>Emissions (tCO₂)</th><th>Certificates</th><th>Net Cost (€)</th><th>€/t</th></tr></thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.product.cn}</td>
                            <td>{item.product.desc}</td>
                            <td>{formatNumber(item.result.quantity, 0)}</td>
                            <td>{formatNumber(item.result.totalEmissions)}</td>
                            <td>{formatNumber(item.result.certificatesRequired)}</td>
                            <td style={{ fontWeight: 600 }}>{formatEuro(item.result.netPayable)}</td>
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

            {/* Per-product detail */}
            {items.map((item, idx) => {
                const r = item.result;
                const complex = isComplexGood(item.product.cn);
                return (
                    <div key={idx}>
                        <h3>({idx + 1}) {item.product.cn} — {item.product.desc} {item.product.route ? `[${item.product.route}]` : ''} {complex ? '[Complex]' : '[Simple]'}</h3>
                        <table>
                            <thead><tr><th>Parameter</th><th>Value</th><th>Notes</th></tr></thead>
                            <tbody>
                                <tr><td>Quantity</td><td>{formatNumber(r.quantity, 0)} tonnes</td><td></td></tr>
                                <tr><td>Direct Emissions</td><td>{formatNumber(r.directEmissions, 3)} tCO₂/t</td><td>{complex ? 'Production process' : 'Total direct'}</td></tr>
                                <tr><td>Indirect Emissions</td><td>{formatNumber(r.indirectEmissions, 3)} tCO₂/t</td><td>Electricity</td></tr>
                                {complex && r.precursorDetails.map((pd, i) => (
                                    <tr key={i} style={{ color: '#7c3aed', fontStyle: 'italic' }}><td>↳ Precursor: {pd.name}</td><td>+{formatNumber(pd.contribution, 3)} tCO₂/t</td><td>{pd.massFraction} t/t × {pd.specificEmissions} tCO₂/t</td></tr>
                                ))}
                                <tr><td>Specific Embedded Emissions</td><td>{formatNumber(r.specificEmbedded, 3)} tCO₂/t</td><td></td></tr>
                                <tr><td>Phase-in Factor ({r.year})</td><td>{(r.phaseFactor * 100).toFixed(1)}%</td><td>EU Reg. 2023/956</td></tr>
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
                <p><strong>CBAM Financial Impact Calculator for Indian Exporters</strong></p>
                <p>Calculations based on EU Regulation (EU) 2023/956 (CBAM) and Implementing Regulation (EU) 2023/1773.</p>
                <p>Default emission values from EU Commission. Precursor mappings per Annex II. Phase-in per Article 36(3)(b).</p>
                <p>This report is for estimation purposes. Final CBAM liability is determined by the authorized CBAM declarant after third-party verification.</p>
                <p style={{ marginTop: 6 }}>{new Date().toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
    const [tab, setTab] = useState('configure'); // configure | basket
    const [basket, setBasket] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [exporterInfo, setExporterInfo] = useState({ company: '', address: '', importer: '', eori: '' });
    const [globalYear, setGlobalYear] = useState(2026);
    const [globalEuPrice, setGlobalEuPrice] = useState(DEFAULT_EU_ETS_PRICE);
    const [globalIndiaPrice, setGlobalIndiaPrice] = useState(DEFAULT_INDIA_CARBON_PRICE);
    const [generating, setGenerating] = useState(false);

    const totals = useMemo(() => aggregateBasket(basket), [basket]);
    const projection = useMemo(() => generateBasketProjection(basket), [basket]);

    const handleAddToBasket = (item) => {
        setBasket(prev => [...prev, item]);
        setSelectedProduct(null);
        setTab('basket');
    };
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
            while (heightLeft > 0) {
                position = heightLeft - imgH + 10;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgW, imgH);
                heightLeft -= (pageH - 20);
            }
            pdf.save(`CBAM_Report_${basket.length}products_${globalYear}.pdf`);
        } catch (err) {
            console.error("PDF error:", err);
            alert("Error generating PDF.");
        }
        setGenerating(false);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🇮🇳 CBAM Financial Impact Calculator</h1>
                <p>For Indian Exporters to the European Union</p>
                <span className="badge-count">255 CN Codes • Multi-Product • Precursors • Official EU Formulas • 2026–2034</span>
            </header>

            {/* Exporter Info + Global Settings */}
            <div className="card">
                <div className="card-title"><span className="icon">🏢</span> Exporter & Import Settings</div>
                <div className="exporter-grid">
                    <div className="field"><label>Exporter Company (optional)</label><input value={exporterInfo.company} onChange={e => setExporterInfo({ ...exporterInfo, company: e.target.value })} placeholder="Your company name" /></div>
                    <div className="field"><label>EU Importer (optional)</label><input value={exporterInfo.importer} onChange={e => setExporterInfo({ ...exporterInfo, importer: e.target.value })} placeholder="EU importer name" /></div>
                    <div className="field"><label>Address (optional)</label><input value={exporterInfo.address} onChange={e => setExporterInfo({ ...exporterInfo, address: e.target.value })} placeholder="City, Country" /></div>
                    <div className="field"><label>EORI Number (optional)</label><input value={exporterInfo.eori} onChange={e => setExporterInfo({ ...exporterInfo, eori: e.target.value })} placeholder="EU EORI number" /></div>
                </div>
                <div className="form-grid" style={{ marginTop: 16 }}>
                    <div className="field">
                        <label>Import Year</label>
                        <select value={globalYear} onChange={e => setGlobalYear(parseInt(e.target.value))}>
                            {YEARS.map(y => <option key={y} value={y}>{y} — {(PHASE_IN_FACTORS[y] * 100).toFixed(1)}% phase-in</option>)}
                        </select>
                    </div>
                    <div className="field"><label>EU ETS Price (€/tCO₂)</label><input type="number" value={globalEuPrice} onChange={e => setGlobalEuPrice(e.target.value)} min="0" /></div>
                    <div className="field"><label>Carbon Price Paid in India (€/tCO₂)</label><input type="number" value={globalIndiaPrice} onChange={e => setGlobalIndiaPrice(e.target.value)} min="0" /></div>
                </div>
            </div>

            {/* Tabs */}
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
                        <ConfigureProduct
                            product={selectedProduct}
                            onAdd={handleAddToBasket}
                            onCancel={() => setSelectedProduct(null)}
                            globalYear={globalYear}
                            globalEuPrice={globalEuPrice}
                            globalIndiaPrice={globalIndiaPrice}
                        />
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
                                {generating ? '⏳ Generating...' : '📄 Download PDF Report'}
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
