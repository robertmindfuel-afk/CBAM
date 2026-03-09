import { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Area, AreaChart, ComposedChart } from 'recharts';
import { CN_CODES, SECTORS, getCNCodesBySector, searchCNCodes } from './data/cnCodes.js';
import { COUNTRIES, DEFAULT_VALUES, getDefaultValue, getIndirectDefault, MARKUP_SCHEDULE } from './data/defaultValues.js';
import { BENCHMARKS, PHASE_OUT, getETSPrice, DE_MINIMIS_THRESHOLD } from './data/benchmarks.js';
import { calculateCBAM, calculateMultiYearProjection, formatCurrency, formatNumber } from './utils/calculator.js';
import { generateCBAMReport } from './utils/pdfExport.js';

// ══════════ ICONS ══════════
const I=({d,size=18,cls=''})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d={d}/></svg>;
const ic={
  calc:p=><I d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zM8 6h8M8 10h8M8 14h3M8 18h3" {...p}/>,
  list:p=><I d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" {...p}/>,
  globe:p=><I d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z" {...p}/>,
  bar:p=><I d="M12 20V10M18 20V4M6 20v-4" {...p}/>,
  clock:p=><I d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" {...p}/>,
  trend:p=><I d="M23 6l-9.5 9.5-5-5L1 18" {...p}/>,
  info:p=><I d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01" {...p}/>,
  check:p=><I d="M20 6L9 17l-5-5" {...p}/>,
  dl:p=><I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" {...p}/>,
  search:p=><I d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" {...p}/>,
  bldg:p=><I d="M6 22V2l12 4v16M6 12h.01M6 16h.01M14 12h.01M14 16h.01M14 8h.01" {...p}/>,
  bolt:p=><I d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...p}/>,
  flask:p=><I d="M9 3h6M12 3v7.4a3 3 0 01-.6 1.8L6.3 19a2 2 0 001.7 3h8a2 2 0 001.7-3l-5.1-6.8a3 3 0 01-.6-1.8V3" {...p}/>,
  drop:p=><I d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" {...p}/>,
  layers:p=><I d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" {...p}/>,
  shield:p=><I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/>,
  file:p=><I d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" {...p}/>,
  alert:p=><I d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" {...p}/>,
  arR:p=><I d="M5 12h14M12 5l7 7-7 7" {...p}/>,
  arL:p=><I d="M19 12H5M12 19l-7-7 7-7" {...p}/>,
  menu:p=><I d="M3 12h18M3 6h18M3 18h18" {...p}/>,
};
const SI={cement:ic.bldg,iron_steel:ic.layers,aluminium:ic.shield,fertilizers:ic.flask,electricity:ic.bolt,hydrogen:ic.drop};

const Tip=({text,children})=><span className="tip">{children}<span className="tt">{text}</span></span>;
const InfoTip=({text})=><Tip text={text}><span style={{color:'var(--ink-4)',display:'inline-flex'}}>{ic.info({size:13})}</span></Tip>;

const TABS=[
  {id:'calculator',label:'Calculator',icon:ic.calc},{id:'cn-codes',label:'CN Codes',icon:ic.list},
  {id:'defaults',label:'Default Values',icon:ic.globe},{id:'benchmarks',label:'Benchmarks',icon:ic.bar},
  {id:'timeline',label:'Compliance',icon:ic.clock},{id:'projections',label:'Projections',icon:ic.trend},
];

const chartStyle={background:'var(--bg-card)',border:'1px solid var(--line)',borderRadius:8,fontSize:12};

// ══════════ APP ══════════
export default function App(){
  const[tab,setTab]=useState('calculator');
  const[mob,setMob]=useState(false);
  return(
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <header style={{position:'sticky',top:0,zIndex:50,background:'rgba(246,243,238,0.88)',backdropFilter:'blur(16px) saturate(160%)',borderBottom:'1px solid var(--line)'}}>
        <div style={{maxWidth:1240,margin:'0 auto',padding:'0 28px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:54}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:28,height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--olive)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fefdfb" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{fontSize:15,fontWeight:700,color:'var(--ink)',letterSpacing:'-0.02em'}}>CBAM Compass</span>
              <span style={{fontSize:11,color:'var(--ink-4)',fontWeight:500,marginLeft:4}}>EU Carbon Border Adjustment</span>
            </div>
            <nav className="hidden lg:flex" style={{gap:2}}>
              {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 13px',borderRadius:'var(--r-sm)',fontSize:13,fontWeight:tab===t.id?600:500,background:tab===t.id?'var(--olive-soft)':'transparent',color:tab===t.id?'var(--olive)':'var(--ink-3)',border:tab===t.id?'1px solid var(--olive-ring)':'1px solid transparent',cursor:'pointer',transition:'all .15s'}}>{t.icon({size:14})}{t.label}</button>)}
            </nav>
            <button className="lg:hidden" style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)'}} onClick={()=>setMob(!mob)}>{ic.menu({size:22})}</button>
          </div>
          {mob&&<nav style={{paddingBottom:14,display:'flex',flexWrap:'wrap',gap:6}}>
            {TABS.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setMob(false)}} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:'var(--r-sm)',fontSize:13,fontWeight:500,background:tab===t.id?'var(--olive-soft)':'var(--bg-warm)',color:tab===t.id?'var(--olive)':'var(--ink-3)',border:'none',cursor:'pointer'}}>{t.icon({size:13})}{t.label}</button>)}
          </nav>}
        </div>
      </header>
      <main style={{maxWidth:1240,margin:'0 auto',padding:'28px 28px 64px'}}>
        {tab==='calculator'&&<CalcView/>}{tab==='cn-codes'&&<CodesView/>}{tab==='defaults'&&<DefaultsView/>}
        {tab==='benchmarks'&&<BenchView/>}{tab==='timeline'&&<TimelineView/>}{tab==='projections'&&<ProjView/>}
      </main>
      <footer style={{padding:'20px 28px',textAlign:'center',borderTop:'1px solid var(--line)',background:'var(--bg-card)'}}>
        <p style={{fontSize:12,color:'var(--ink-4)'}}>CBAM Compass — Based on Regulation (EU) 2023/956 and Implementing Regulations 2025/2547–2621. For informational purposes only.</p>
      </footer>
    </div>
  );
}

// ══════════ CALCULATOR ══════════
function CalcView(){
  const[step,setStep]=useState(1);
  const[form,setForm]=useState({sector:'iron_steel',cn:'',prod:'',cc:'CN',qty:1000,yr:2026,bm:1.370,useActual:false,actDir:'',actInd:'',route:'BF-BOF integrated'});
  const[res,setRes]=useState(null);
  const codes=useMemo(()=>getCNCodesBySector(form.sector),[form.sector]);
  const countries=useMemo(()=>COUNTRIES.filter(c=>!c.exempt),[]);
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const doCalc=useCallback(()=>{
    const r=calculateCBAM({quantity:+form.qty||0,product:form.prod,countryCode:form.cc,year:+form.yr,benchmark:+form.bm||0,sector:form.sector,useActualEmissions:form.useActual,actualDirectEmissions:form.useActual?+form.actDir||0:null,actualIndirectEmissions:form.useActual?+form.actInd||0:null});
    setRes(r);setStep(4);
  },[form]);
  const proj=useMemo(()=>res?calculateMultiYearProjection({quantity:+form.qty||0,product:form.prod,countryCode:form.cc,benchmark:+form.bm||0,sector:form.sector,useActualEmissions:form.useActual,actualDirectEmissions:form.useActual?+form.actDir||0:null,actualIndirectEmissions:form.useActual?+form.actInd||0:null}):[],[res,form]);
  const doPdf=()=>{if(res)generateCBAMReport(res,proj)};
  const SL=['Product','Origin & Volume','Emissions','Results'];

  return(<div style={{display:'flex',flexDirection:'column',gap:22}}>
    {/* Hero */}
    <div className="card-accent" style={{padding:'26px 30px'}}>
      <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:16,alignItems:'flex-start'}}>
        <div>
          <h2 style={{fontSize:23,fontWeight:700,letterSpacing:'-0.03em',color:'var(--ink)'}}>CBAM Liability Calculator</h2>
          <p style={{fontSize:14.5,marginTop:6,color:'var(--ink-3)',maxWidth:540,lineHeight:1.6}}>Calculate embedded emissions, certificate requirements, and total financial exposure under the EU CBAM definitive period <span style={{fontFamily:'Literata,serif',fontStyle:'italic',color:'var(--ink-4)'}}>(2026–2034)</span>.</p>
        </div>
        {res&&<button className="btn btn-secondary" onClick={doPdf}>{ic.dl({size:14})} Export PDF</button>}
      </div>
    </div>
    {/* Steps */}
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      {SL.map((l,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
        <button onClick={()=>(i+1<=(res?4:step))&&setStep(i+1)} className={`ring ${step===i+1?'ring-on':step>i+1?'ring-done':'ring-off'}`} style={{border:'none',cursor:'pointer'}}>
          {step>i+1?ic.check({size:12}):i+1}
        </button>
        <span style={{fontSize:13,fontWeight:step===i+1?600:500,color:step>=i+1?'var(--olive)':'var(--ink-4)'}}>{l}</span>
        {i<3&&<div className="sline" style={{background:step>i+1?'var(--olive-med)':'var(--line)'}}/>}
      </div>)}
    </div>

    {/* Step 1 */}
    {step===1&&<div className="card anim" style={{padding:26}}>
      <h3 style={{fontSize:17,fontWeight:700,letterSpacing:'-0.02em',marginBottom:18}}>Select Sector & Product</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10}}>
        {Object.values(SECTORS).map(sec=>{const SIcon=SI[sec.id];return(
          <Tip key={sec.id} text={`GHG: ${sec.ghg.join(', ')} — ${sec.emissionTypes.join(' + ')} emissions`}>
            <button onClick={()=>{s('sector',sec.id);s('prod','');s('cn','')}} className={`sector${form.sector===sec.id?' on':''}`} style={{width:'100%'}}>
              <div style={{marginBottom:8,display:'flex',justifyContent:'center',color:form.sector===sec.id?'var(--olive)':'var(--ink-4)'}}>{SIcon&&<SIcon size={20}/>}</div>
              <div style={{fontSize:12,fontWeight:600,color:form.sector===sec.id?'var(--olive)':'var(--ink-3)'}}>{sec.name}</div>
            </button>
          </Tip>
        )})}
      </div>
      <div style={{marginTop:18}}>
        <div className="label">CN Code / Product <InfoTip text="Combined Nomenclature codes from Annex I of Regulation (EU) 2023/956"/></div>
        <select className="select" value={form.cn} onChange={e=>{const c=codes.find(x=>x.cn===e.target.value);s('cn',e.target.value);if(c)s('prod',c.aggregated)}}>
          <option value="">Select a CN code…</option>
          {codes.map(c=><option key={c.cn} value={c.cn}>{c.cn} — {c.desc}</option>)}
        </select>
      </div>
      {form.prod&&<div style={{marginTop:14,padding:'14px 18px',borderRadius:'var(--r-sm)',background:'var(--olive-soft)',border:'1px solid var(--olive-ring)'}}>
        <div style={{fontSize:11,fontWeight:600,color:'var(--ink-4)',letterSpacing:'.03em',textTransform:'uppercase'}}>Selected category</div>
        <div style={{fontSize:17,fontWeight:700,marginTop:3,color:'var(--olive)'}}>{form.prod}</div>
        <div style={{fontSize:12.5,marginTop:3,color:'var(--ink-3)'}}>{form.sector==='electricity'||form.sector==='hydrogen'?'No de minimis exemption':`De minimis: ${DE_MINIMIS_THRESHOLD} t/year`}</div>
      </div>}
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
        <button className="btn btn-primary" disabled={!form.prod} onClick={()=>form.prod&&setStep(2)}>Next {ic.arR({size:14})}</button>
      </div>
    </div>}

    {/* Step 2 */}
    {step===2&&<div className="card anim" style={{padding:26}}>
      <h3 style={{fontSize:17,fontWeight:700,letterSpacing:'-0.02em',marginBottom:18}}>Origin Country & Import Volume</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18}}>
        <div>
          <div className="label">Country of origin <InfoTip text="Where goods were produced. EEA/Swiss imports are exempt."/></div>
          <select className="select" value={form.cc} onChange={e=>s('cc',e.target.value)}>
            {countries.map(c=><option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
          </select>
          {(()=>{const c=COUNTRIES.find(x=>x.code===form.cc);return c&&<div style={{marginTop:10,padding:10,borderRadius:'var(--r-sm)',background:'var(--bg-warm)',fontSize:12,color:'var(--ink-3)'}}>
            <div><span style={{fontWeight:600,color:'var(--ink-2)'}}>Mechanism:</span> {c.mechanism}</div>
            <div style={{marginTop:3}}><span style={{fontWeight:600,color:'var(--ink-2)'}}>Effective deduction:</span> €{c.effectivePrice}/tCO₂</div>
          </div>})()}
        </div>
        <div>
          <div className="label">Quantity ({form.sector==='electricity'?'MWh':'tonnes'}) <InfoTip text="Net mass of imported goods for the compliance year"/></div>
          <input type="number" className="input" value={form.qty} onChange={e=>s('qty',e.target.value)} min="0"/>
        </div>
        <div>
          <div className="label">Compliance year <InfoTip text="Obligation rises each year as free allocation phases out (2.5% in 2026 to 100% in 2034)"/></div>
          <select className="select" value={form.yr} onChange={e=>s('yr',e.target.value)}>
            {PHASE_OUT.filter(p=>p.year>=2026).map(p=><option key={p.year} value={p.year}>{p.year} — {p.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18}}>
        <button className="btn btn-secondary" onClick={()=>setStep(1)}>{ic.arL({size:14})} Back</button>
        <button className="btn btn-primary" onClick={()=>setStep(3)}>Next {ic.arR({size:14})}</button>
      </div>
    </div>}

    {/* Step 3 */}
    {step===3&&<div className="card anim" style={{padding:26}}>
      <h3 style={{fontSize:17,fontWeight:700,letterSpacing:'-0.02em',marginBottom:18}}>Emissions Data & Benchmark</h3>
      <div style={{display:'flex',gap:12}}>
        {[false,true].map(isA=><button key={String(isA)} onClick={()=>s('useActual',isA)} style={{flex:1,padding:16,borderRadius:'var(--r)',textAlign:'left',cursor:'pointer',background:form.useActual===isA?(isA?'var(--slate-soft)':'var(--olive-soft)'):'var(--bg-card)',border:form.useActual===isA?`1px solid ${isA?'rgba(92,107,126,.2)':'var(--olive-ring)'}` :'1px solid var(--line)',transition:'all .15s'}}>
          <div style={{fontSize:14,fontWeight:600,color:form.useActual===isA?(isA?'var(--slate)':'var(--olive)'):'var(--ink)'}}>{isA?'Actual (Verified)':'Default Values'}</div>
          <div style={{fontSize:12.5,marginTop:4,color:'var(--ink-4)'}}>{isA?'Verified installation data — no markup':'EU defaults + '+(MARKUP_SCHEDULE[form.yr]?.standard||0.3)*100+'% markup ('+form.yr+')'}</div>
        </button>)}
      </div>
      {form.useActual?<div style={{display:'grid',gridTemplateColumns:['cement','fertilizers','hydrogen'].includes(form.sector)?'1fr 1fr':'1fr',gap:14,marginTop:16}}>
        <div><div className="label">Direct emissions (tCO₂e/t) <InfoTip text="Verified direct GHG emissions per tonne at the installation"/></div><input type="number" step="0.001" className="input num" value={form.actDir} onChange={e=>s('actDir',e.target.value)} placeholder="e.g. 1.900"/></div>
        {['cement','fertilizers','hydrogen'].includes(form.sector)&&<div><div className="label">Indirect emissions (tCO₂e/t) <InfoTip text="Emissions from electricity consumed during production"/></div><input type="number" step="0.001" className="input num" value={form.actInd} onChange={e=>s('actInd',e.target.value)} placeholder="e.g. 0.150"/></div>}
      </div>
      :<div style={{marginTop:16,padding:'18px 20px',borderRadius:'var(--r-sm)',background:'var(--bg-warm)',border:'1px solid var(--line)'}}>
        <div style={{fontSize:11,fontWeight:600,color:'var(--ink-4)',letterSpacing:'.03em',textTransform:'uppercase'}}>Applied default value (with markup)</div>
        <div className="num" style={{fontSize:26,fontWeight:700,marginTop:8,color:'var(--olive)'}}>{formatNumber(getDefaultValue(form.prod,form.cc,+form.yr)||0,3)} <span style={{fontSize:13,fontWeight:400,color:'var(--ink-4)'}}>tCO₂e/t</span></div>
        <div style={{fontSize:12.5,marginTop:6,color:'var(--ink-4)'}}>Base: {formatNumber((getDefaultValue(form.prod,form.cc,+form.yr)||0)/(1+(MARKUP_SCHEDULE[form.yr]?.standard||0.3)),3)} · Markup per Reg. 2025/2621</div>
      </div>}
      <div style={{marginTop:16}}>
        <div className="label">Benchmark & production route <InfoTip text="From Reg. 2025/2620 — based on 10% most efficient EU installations"/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <select className="select" value={form.route} onChange={e=>{s('route',e.target.value);const bm=BENCHMARKS[form.sector]?.find(b=>b.route===e.target.value);if(bm)s('bm',form.useActual?bm.benchA:bm.benchB)}}>
            {(BENCHMARKS[form.sector]||[]).map((b,i)=><option key={i} value={b.route}>{b.product} — {b.route}</option>)}
          </select>
          <input type="number" step="0.001" className="input num" value={form.bm} onChange={e=>s('bm',e.target.value)}/>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18}}>
        <button className="btn btn-secondary" onClick={()=>setStep(2)}>{ic.arL({size:14})} Back</button>
        <button className="btn btn-primary" onClick={doCalc}>{ic.bolt({size:14})} Calculate Liability</button>
      </div>
    </div>}

    {/* Step 4: Results */}
    {step===4&&res&&<div className="anim" style={{display:'flex',flexDirection:'column',gap:18}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[{l:'Total Embedded Emissions',v:`${formatNumber(res.emissions.totalEmbedded,1)}`,u:`tCO₂e · ${formatNumber(res.emissions.specificTotal,3)}/t`,c:'var(--slate)',t:'Total direct + indirect emissions for full import quantity'},
          {l:'Net Certificates Required',v:formatNumber(res.netCertificates,1),u:`@ €${res.etsPrice}/cert`,c:'var(--ochre)',t:'Certificates after free allocation and carbon price deductions'},
          {l:'Total CBAM Cost',v:formatCurrency(res.totalCost),u:`${formatCurrency(res.costPerTonne,2)}/tonne`,c:'var(--olive)',t:'Net certificates × EU ETS certificate price'},
          {l:'Obligation Rate',v:`${(res.phaseOut.obligation*100).toFixed(1)}%`,u:res.phaseOut.label,c:'var(--clay)',t:'% of emissions above benchmark requiring certificates'},
        ].map((k,i)=><Tip key={i} text={k.t}><div className="kpi"><div className="kpi-bar" style={{background:k.c}}/><div style={{fontSize:12,fontWeight:600,color:'var(--ink-4)'}}>{k.l}</div><div className="num" style={{fontSize:27,fontWeight:700,marginTop:10,color:k.c==='var(--olive)'?k.c:'var(--ink)',letterSpacing:'-0.02em'}}>{k.v}</div><div className="num" style={{fontSize:12,marginTop:4,color:'var(--ink-4)'}}>{k.u}</div></div></Tip>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="card" style={{padding:'22px 26px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
            <h4 style={{fontSize:13,fontWeight:700,color:'var(--ink-3)'}}>Calculation Breakdown</h4>
            <button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={doPdf}>{ic.dl({size:12})} PDF</button>
          </div>
          {[{l:'Gross embedded emissions',v:`${formatNumber(res.emissions.totalEmbedded,2)} tCO₂e`},
            {l:'Free allocation (SEFA)',v:`− ${formatNumber(res.freeAllocation.sefa,2)} tCO₂e`,vc:'var(--olive)'},
            {l:'Gross certificates',v:`= ${formatNumber(res.grossCertificates,2)}`},
            {l:'Carbon price deduction',v:`− ${formatNumber(res.carbonPriceDeduction.deductionTonnes,2)} equiv.`},
            {l:'Net certificates',v:`= ${formatNumber(res.netCertificates,2)}`},
            {l:'Certificate price',v:`× €${res.etsPrice}`},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--line)'}}>
            <span style={{fontSize:14,color:'var(--ink-3)'}}>{r.l}</span>
            <span className="num" style={{fontSize:14,fontWeight:600,color:r.vc||'var(--ink)'}}>{r.v}</span>
          </div>)}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8,padding:'13px 16px',background:'var(--olive-soft)',borderRadius:'var(--r-sm)'}}>
            <span style={{fontSize:15,fontWeight:700,color:'var(--olive)'}}>Total CBAM cost</span>
            <span className="num" style={{fontSize:22,fontWeight:700,color:'var(--olive)'}}>{formatCurrency(res.totalCost)}</span>
          </div>
        </div>

        <div className="card" style={{padding:'22px 26px'}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'var(--ink-3)',marginBottom:16}}>Cost Projection <span style={{fontFamily:'Literata,serif',fontStyle:'italic',fontWeight:400,color:'var(--ink-4)'}}>2026–2034</span></h4>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={proj.map(p=>({year:p.input.year,cost:Math.round(p.totalCost)}))}>
              <defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4a6741" stopOpacity={.2}/><stop offset="95%" stopColor="#4a6741" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,23,20,.06)"/>
              <XAxis dataKey="year" tick={{fill:'#a59d90',fontSize:11,fontFamily:'DM Mono'}}/>
              <YAxis tick={{fill:'#a59d90',fontSize:11,fontFamily:'DM Mono'}} tickFormatter={v=>`€${(v/1000).toFixed(0)}k`}/>
              <RTooltip contentStyle={chartStyle} formatter={v=>[`€${v.toLocaleString()}`,'Annual Cost']}/>
              <Area type="monotone" dataKey="cost" stroke="#4a6741" fill="url(#og)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{padding:'16px 22px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:14}}>
          {[['Product',form.prod],['CN Code',form.cn||'—'],['Origin',res.country?.name||form.cc],['Quantity',`${formatNumber(form.qty,0)} t`],['Year',form.yr],['Benchmark',`${form.bm} tCO₂e/t`]].map(([l,v],i)=><div key={i}>
            <div style={{fontSize:10.5,fontWeight:600,color:'var(--ink-4)',textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div>
            <div style={{fontSize:14,fontWeight:600,marginTop:2,color:'var(--ink)'}}>{v}</div>
          </div>)}
        </div>
      </div>

      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-secondary" onClick={()=>{setStep(1);setRes(null)}}>{ic.arL({size:14})} New Calculation</button>
        <button className="btn btn-primary" onClick={doPdf}>{ic.dl({size:14})} Download Full Report</button>
      </div>
    </div>}
  </div>);
}

// ══════════ CN CODES ══════════
function CodesView(){
  const[q,setQ]=useState('');const[sec,setSec]=useState('all');
  const f=useMemo(()=>{let c=q?searchCNCodes(q):CN_CODES;if(sec!=='all')c=c.filter(x=>x.sector===sec);return c},[q,sec]);
  const sectorBadge=s=>s==='iron_steel'?'badge-slate':s==='aluminium'?'badge-plum':s==='fertilizers'?'badge-olive':s==='electricity'?'badge-ochre':'badge-neutral';
  return(<div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div className="card" style={{padding:24}}>
      <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-0.02em'}}>CBAM CN Codes Database</h2>
      <p style={{fontSize:14,color:'var(--ink-3)',marginTop:4,marginBottom:18}}>{CN_CODES.length} codes across {Object.keys(SECTORS).length} sectors per Annex I, Regulation (EU) 2023/956</p>
      <div style={{display:'flex',gap:12}}>
        <div style={{position:'relative',flex:1}}><div style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--ink-4)'}}>{ic.search({size:14})}</div><input className="input" style={{paddingLeft:34,boxShadow:'none'}} placeholder="Search CN code, product name…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <select className="select" style={{width:190,boxShadow:'none'}} value={sec} onChange={e=>setSec(e.target.value)}>
          <option value="all">All sectors ({CN_CODES.length})</option>
          {Object.values(SECTORS).map(s=><option key={s.id} value={s.id}>{s.name} ({getCNCodesBySector(s.id).length})</option>)}
        </select>
      </div>
    </div>
    <div className="card" style={{overflow:'hidden'}}><div style={{overflowX:'auto',maxHeight:'68vh'}}>
      <table className="tbl"><thead><tr><th>CN Code</th><th>Description</th><th>Sector</th><th>Category</th><th>De Minimis</th></tr></thead>
      <tbody>{f.slice(0,200).map((c,i)=><tr key={i}>
        <td className="num" style={{fontWeight:600,color:'var(--olive)'}}>{c.cn}</td><td>{c.desc}</td>
        <td><span className={`badge ${sectorBadge(c.sector)}`}>{SECTORS[c.sector.toUpperCase()]?.name||c.sector}</span></td>
        <td>{c.aggregated}</td>
        <td><Tip text={c.deMinimis?'Imports below 50t/yr exempt from CBAM':'No de minimis exemption for this product'}>{c.deMinimis?<span className="badge badge-olive">50t</span>:<span className="badge badge-rose">None</span>}</Tip></td>
      </tr>)}</tbody></table>
    </div>{f.length>200&&<div style={{padding:10,textAlign:'center',fontSize:12,color:'var(--ink-4)'}}>Showing 200 of {f.length}</div>}</div>
  </div>);
}

// ══════════ DEFAULT VALUES ══════════
function DefaultsView(){
  const[prod,setProd]=useState('Crude steel');const[yr,setYr]=useState(2026);
  const prods=Object.keys(DEFAULT_VALUES);
  const data=useMemo(()=>{const v=DEFAULT_VALUES[prod];if(!v)return[];const isFert=['Ammonia','Urea','Nitric acid','Ammonium nitrate','CAN','UAN solution','DAP','MAP','NPK','Potassium nitrate'].includes(prod);const m=MARKUP_SCHEDULE[Math.min(yr,2030)]||MARKUP_SCHEDULE[2028];const rate=isFert?m.fertilizer:m.standard;return Object.entries(v).filter(([c])=>c!=='OTHER').map(([code,base])=>{const ctry=COUNTRIES.find(c=>c.code===code);return{code,name:ctry?.name||code,base,marked:base*(1+rate),pct:rate*100,cp:ctry?.effectivePrice||0}}).sort((a,b)=>b.marked-a.marked)},[prod,yr]);
  return(<div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div className="card" style={{padding:24}}>
      <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-0.02em'}}>Country Default Emission Values</h2>
      <p style={{fontSize:14,color:'var(--ink-3)',marginTop:4,marginBottom:18}}>Per Implementing Regulation (EU) 2025/2621 — includes year-specific punitive mark-ups</p>
      <div style={{display:'flex',gap:12}}>
        <select className="select" style={{flex:1}} value={prod} onChange={e=>setProd(e.target.value)}>{prods.map(p=><option key={p} value={p}>{p}</option>)}</select>
        <select className="select" style={{width:180}} value={yr} onChange={e=>setYr(+e.target.value)}>{[2026,2027,2028,2029,2030].map(y=><option key={y} value={y}>{y} (+{(MARKUP_SCHEDULE[y]?.standard||0.3)*100}%)</option>)}</select>
      </div>
    </div>
    <div className="card" style={{padding:24}}>
      <ResponsiveContainer width="100%" height={Math.max(260,data.length*28)}>
        <BarChart data={data} layout="vertical" margin={{left:90}}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,23,20,.05)"/>
          <XAxis type="number" tick={{fill:'#a59d90',fontSize:11,fontFamily:'DM Mono'}}/>
          <YAxis type="category" dataKey="name" tick={{fill:'#7a7265',fontSize:11}} width={85}/>
          <RTooltip contentStyle={chartStyle} formatter={(v,n)=>[formatNumber(v,3)+' tCO₂e/t',n==='base'?'Base':'With markup']}/>
          <Bar dataKey="base" fill="rgba(74,103,65,.15)" radius={[0,2,2,0]}/><Bar dataKey="marked" fill="#4a6741" radius={[0,4,4,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>Country</th><th>Base Value</th><th>Markup</th><th>With Markup</th><th>Carbon Price Deduction</th></tr></thead>
    <tbody>{data.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.name} <span style={{fontSize:11,color:'var(--ink-4)'}}>({r.code})</span></td><td className="num">{formatNumber(r.base,3)}</td><td><span className="badge badge-ochre">+{r.pct}%</span></td><td className="num" style={{fontWeight:600,color:'var(--olive)'}}>{formatNumber(r.marked,3)}</td><td className="num">{r.cp>0?`€${formatNumber(r.cp,2)}/t`:<span style={{color:'var(--ink-5)'}}>—</span>}</td></tr>)}
    <tr style={{background:'var(--rose-soft)'}}><td style={{fontWeight:600,color:'var(--rose)'}}>Fallback (other countries)</td><td className="num">{formatNumber(DEFAULT_VALUES[prod]?.OTHER||0,3)}</td><td><span className="badge badge-rose">+{((MARKUP_SCHEDULE[Math.min(yr,2030)]?.standard||0.3)*100)}%</span></td><td className="num" style={{fontWeight:600,color:'var(--rose)'}}>{formatNumber(getDefaultValue(prod,'OTHER',yr)||0,3)}</td><td style={{color:'var(--ink-5)'}}>—</td></tr>
    </tbody></table></div>
  </div>);
}

// ══════════ BENCHMARKS ══════════
function BenchView(){
  const[sec,setSec]=useState('iron_steel');
  return(<div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div className="card" style={{padding:24}}>
      <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-0.02em'}}>EU CBAM Benchmark Values</h2>
      <p style={{fontSize:14,color:'var(--ink-3)',marginTop:4,marginBottom:18}}>Per Reg. 2025/2620 — derived from top 10% most efficient EU installations</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        {Object.entries(BENCHMARKS).map(([k,v])=>{const SIcon=SI[k];return(
          <button key={k} onClick={()=>setSec(k)} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:'var(--r-sm)',fontSize:13,fontWeight:sec===k?600:500,background:sec===k?'var(--olive-soft)':'var(--bg-card)',border:sec===k?'1px solid var(--olive-ring)':'1px solid var(--line)',color:sec===k?'var(--olive)':'var(--ink-3)',cursor:'pointer',transition:'all .15s'}}>
            {SIcon&&<SIcon size={13}/>}{SECTORS[k.toUpperCase()]?.name||k} ({v.length})
          </button>
        )})}
      </div>
    </div>
    <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>Product</th><th>Production Route</th>
      <th><Tip text="Benchmark for verified actual emissions data">Column A <span style={{fontFamily:'Literata,serif',fontStyle:'italic',textTransform:'none',letterSpacing:0,fontSize:10}}>(Actual)</span></Tip></th>
      <th><Tip text="Benchmark for default values — generally higher for uncertainty">Column B <span style={{fontFamily:'Literata,serif',fontStyle:'italic',textTransform:'none',letterSpacing:0,fontSize:10}}>(Default)</span></Tip></th>
      <th>Unit</th><th>Notes</th></tr></thead>
    <tbody>{(BENCHMARKS[sec]||[]).map((b,i)=><tr key={i}><td style={{fontWeight:600}}>{b.product}</td><td>{b.route}</td>
      <td className="num" style={{fontWeight:600,color:'var(--olive)'}}>{b.benchA!==null?formatNumber(b.benchA,3):'—'}</td>
      <td className="num" style={{fontWeight:600,color:'var(--slate)'}}>{b.benchB!==null?formatNumber(b.benchB,3):'—'}</td>
      <td style={{fontSize:12,color:'var(--ink-4)'}}>{b.unit}</td><td style={{fontSize:12,color:'var(--ink-4)'}}>{b.note||''}</td></tr>)}</tbody></table></div>
    <div className="card" style={{padding:24}}>
      <h3 style={{fontSize:13,fontWeight:700,color:'var(--ink-3)',marginBottom:16}}>Free Allocation Phase-Out <span style={{fontFamily:'Literata,serif',fontStyle:'italic',fontWeight:400,color:'var(--ink-4)'}}>2026–2034</span> <InfoTip text="As EU ETS free allocation phases out, CBAM obligation increases. By 2034, 100% of emissions above benchmark require certificates."/></h3>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={PHASE_OUT.filter(p=>p.year>=2026).map(p=>({year:p.year,free:p.cbamFactor,cbam:p.obligation}))}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,23,20,.05)"/>
          <XAxis dataKey="year" tick={{fill:'#a59d90',fontSize:12,fontFamily:'DM Mono'}}/>
          <YAxis tick={{fill:'#a59d90',fontSize:11,fontFamily:'DM Mono'}} tickFormatter={v=>`${(v*100).toFixed(0)}%`} domain={[0,1]}/>
          <RTooltip contentStyle={chartStyle} formatter={(v,n)=>[`${(v*100).toFixed(1)}%`,n==='cbam'?'CBAM Obligation':'Free Allocation']}/>
          <Bar dataKey="free" fill="rgba(92,107,126,.2)" name="Free Allocation" radius={[4,4,0,0]}/>
          <Bar dataKey="cbam" fill="#4a6741" name="CBAM Obligation" radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>);
}

// ══════════ TIMELINE ══════════
function TimelineView(){
  const ms=[
    {d:'Oct 1, 2023',e:'Transitional period began',t:'Quarterly reporting for importers. No financial obligations.',s:'done'},
    {d:'Dec 31, 2025',e:'Transitional period ended',t:'Last quarter of reporting-only phase.',s:'done'},
    {d:'Jan 1, 2026',e:'Definitive period begins',t:'Financial obligations commence. 2.5% of emissions above benchmark require certificates.',s:'active'},
    {d:'Mar 31, 2026',e:'Authorization deadline',t:'Apply for Authorized CBAM Declarant status via EU Customs Trader Portal.',s:'next'},
    {d:'Feb 1, 2027',e:'Certificate sales begin',t:'CBAM certificates via Common Central Platform at quarterly EU ETS average.',s:'future'},
    {d:'Sep 30, 2027',e:'First annual declaration',t:'Surrender certificates covering 2026 imports. Verified declarations required.',s:'future'},
    {d:'2028',e:'10% obligation',t:'Free allocation drops to 90%. Default value mark-up increases to +30%.',s:'future'},
    {d:'2030',e:'48.5% obligation',t:'Critical inflection — nearly half of free allocation eliminated.',s:'future'},
    {d:'2034',e:'Full CBAM — 100%',t:'EU ETS free allocation fully phased out. All emissions require certificates.',s:'future'},
  ];
  const reqs=[
    {title:'Registration',icon:ic.shield,items:['EORI number required','Authorized CBAM Declarant via EUCTP','Financial guarantee (if established <2 years)','Clean compliance record (3–5 years)','Processing time: 120 days']},
    {title:'Reporting',icon:ic.file,items:['Annual declaration by September 30','CN codes (8-digit) for all imports','Quantity per consignment by origin','Installation-level emissions data','Production route identification','Third-party verification for actual data']},
    {title:'Financial',icon:ic.bar,items:['Purchase certificates from Feb 2027','Hold ≥50% estimated liability quarterly','Surrender certificates by Sep 30 annually','Repurchase surplus by Oct 31','Certificates cancelled after 2 years']},
    {title:'Verification',icon:ic.check,items:['ISO/IEC 17029-accredited verifier','Physical site visit in first period','Production process review','Default values: no verification but +10–30% markup']},
  ];
  return(<div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div className="card" style={{padding:24}}>
      <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-0.02em'}}>Compliance Timeline & Requirements</h2>
      <p style={{fontSize:14,color:'var(--ink-3)',marginTop:4}}>Key milestones and obligations under the EU CBAM</p>
    </div>
    <div className="card" style={{padding:26}}>
      {ms.map((m,i)=><div key={i} style={{display:'flex',gap:16,marginBottom:i<ms.length-1?20:0}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,marginTop:6,background:m.s==='done'?'var(--olive)':m.s==='active'?'var(--olive)':m.s==='next'?'var(--slate)':'var(--ink-5)'}} className={m.s==='active'?'pulse':''}/>
          {i<ms.length-1&&<div style={{width:2,flex:1,minHeight:12,background:'var(--line)',borderRadius:1}}/>}
        </div>
        <div>
          <div className="num" style={{fontSize:12,fontWeight:600,color:m.s==='active'?'var(--olive)':'var(--ink-4)'}}>{m.d}</div>
          <div style={{fontSize:14.5,fontWeight:700,marginTop:2,color:'var(--ink)'}}>{m.e}</div>
          <div style={{fontSize:13.5,marginTop:4,color:'var(--ink-3)',lineHeight:1.55}}>{m.t}</div>
        </div>
      </div>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      {reqs.map((r,i)=><div key={i} className="card" style={{padding:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <span style={{color:'var(--olive)'}}>{r.icon({size:15})}</span>
          <h3 style={{fontSize:13,fontWeight:700,color:'var(--olive)'}}>{r.title}</h3>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {r.items.map((item,j)=><div key={j} style={{display:'flex',alignItems:'flex-start',gap:10}}>
            <div style={{width:4,height:4,borderRadius:'50%',marginTop:7,flexShrink:0,background:'var(--olive)',opacity:.4}}/>
            <span style={{fontSize:14,color:'var(--ink-2)',lineHeight:1.5}}>{item}</span>
          </div>)}
        </div>
      </div>)}
    </div>
    <div className="card" style={{padding:'22px 26px',borderColor:'rgba(179,93,93,.15)'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <span style={{color:'var(--rose)'}}>{ic.alert({size:15})}</span>
        <h3 style={{fontSize:13,fontWeight:700,color:'var(--rose)'}}>Penalties for Non-Compliance</h3>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
        <div><div style={{fontSize:12,fontWeight:700,color:'var(--ink-3)'}}>Missing certificates</div><div style={{fontSize:14,marginTop:5,color:'var(--ink-2)',lineHeight:1.6}}>€100/tCO₂ (inflation-adjusted) for each unsurrendered certificate, plus obligation to acquire the missing amount.</div></div>
        <div><div style={{fontSize:12,fontWeight:700,color:'var(--ink-3)'}}>Unauthorized imports</div><div style={{fontSize:14,marginTop:5,color:'var(--ink-2)',lineHeight:1.6}}>Up to 3× (€300/tCO₂) for importing without declarant status. Repeated violations risk deregistration.</div></div>
      </div>
    </div>
  </div>);
}

// ══════════ PROJECTIONS ══════════
function ProjView(){
  const[prod,setProd]=useState('HR flat ≥600mm');const[cc,setCc]=useState('CN');const[qty,setQty]=useState(10000);const[bm,setBm]=useState(1.370);const[sec,setSec]=useState('iron_steel');
  const proj=useMemo(()=>calculateMultiYearProjection({quantity:qty,product:prod,countryCode:cc,benchmark:bm,sector:sec}),[prod,cc,qty,bm,sec]);
  const cum=proj.reduce((s,p)=>s+p.totalCost,0);
  const doPdf=()=>{if(proj.length)generateCBAMReport(proj[0],proj)};
  return(<div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div className="card" style={{padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:16,alignItems:'flex-start'}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,letterSpacing:'-0.02em'}}>Multi-Year Cost Projections</h2>
          <p style={{fontSize:14,color:'var(--ink-3)',marginTop:4}}>Model CBAM costs from 2026–2034 with EU ETS price consensus forecasts.</p>
        </div>
        <button className="btn btn-secondary" onClick={doPdf}>{ic.dl({size:14})} Export PDF</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginTop:18}}>
        <select className="select" value={prod} onChange={e=>setProd(e.target.value)}>{Object.keys(DEFAULT_VALUES).map(p=><option key={p} value={p}>{p}</option>)}</select>
        <select className="select" value={cc} onChange={e=>setCc(e.target.value)}>{COUNTRIES.filter(c=>!c.exempt).map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>
        <input type="number" className="input" value={qty} onChange={e=>setQty(+e.target.value||0)} placeholder="Quantity (t)"/>
        <input type="number" step="0.001" className="input num" value={bm} onChange={e=>setBm(+e.target.value||0)} placeholder="Benchmark"/>
        <select className="select" value={sec} onChange={e=>setSec(e.target.value)}>{Object.values(SECTORS).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
      {[{l:'Cumulative (2026–2034)',v:formatCurrency(cum),c:'var(--olive)',t:'Sum of all annual CBAM costs over full phase-out'},
        {l:'2026 Cost',v:formatCurrency(proj[0]?.totalCost||0),c:'var(--slate)',t:'First year — only 2.5% obligation'},
        {l:'2034 Cost (Full CBAM)',v:formatCurrency(proj[proj.length-1]?.totalCost||0),c:'var(--ochre)',t:'Final year — 100% obligation'},
        {l:'Cost Multiplier',v:proj[0]?.totalCost>0?`${Math.round((proj[proj.length-1]?.totalCost||0)/proj[0].totalCost)}×`:'—',c:'var(--clay)',t:'How many times more expensive by 2034'},
      ].map((k,i)=><Tip key={i} text={k.t}><div className="kpi"><div className="kpi-bar" style={{background:k.c}}/><div style={{fontSize:12,fontWeight:600,color:'var(--ink-4)'}}>{k.l}</div><div className="num" style={{fontSize:24,fontWeight:700,marginTop:10,color:k.c==='var(--olive)'?k.c:'var(--ink)',letterSpacing:'-0.02em'}}>{k.v}</div></div></Tip>)}
    </div>
    <div className="card" style={{padding:24}}>
      <h3 style={{fontSize:13,fontWeight:700,color:'var(--ink-3)',marginBottom:16}}>Annual CBAM Cost & EU ETS Price</h3>
      <ResponsiveContainer width="100%" height={330}>
        <ComposedChart data={proj.map(p=>({year:p.input.year,cost:Math.round(p.totalCost),ets:p.etsPrice}))}>
          <defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a6741" stopOpacity={.7}/><stop offset="100%" stopColor="#4a6741" stopOpacity={.15}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,23,20,.05)"/>
          <XAxis dataKey="year" tick={{fill:'#a59d90',fontSize:12,fontFamily:'DM Mono'}}/>
          <YAxis yAxisId="c" tick={{fill:'#a59d90',fontSize:11,fontFamily:'DM Mono'}} tickFormatter={v=>`€${(v/1000).toFixed(0)}k`}/>
          <YAxis yAxisId="e" orientation="right" tick={{fill:'#a59d90',fontSize:11,fontFamily:'DM Mono'}} tickFormatter={v=>`€${v}`}/>
          <RTooltip contentStyle={chartStyle} formatter={(v,n)=>[n==='cost'?formatCurrency(v):`€${v}`,n==='cost'?'CBAM Cost':'ETS Price']}/>
          <Bar yAxisId="c" dataKey="cost" fill="url(#bg2)" radius={[4,4,0,0]}/>
          <Line yAxisId="e" type="monotone" dataKey="ets" stroke="#b5704d" strokeWidth={2} dot={{fill:'#b5704d',r:3}}/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>Year</th><th>Obligation</th><th>ETS Price</th><th>Certificates</th><th>Cost/Tonne</th><th>Total Cost</th></tr></thead>
    <tbody>{proj.map((p,i)=><tr key={i}><td className="num" style={{fontWeight:600}}>{p.input.year}</td><td><span className="badge badge-slate">{(p.phaseOut.obligation*100).toFixed(1)}%</span></td><td className="num">€{p.etsPrice}</td><td className="num">{formatNumber(p.netCertificates,0)}</td><td className="num">{formatCurrency(p.costPerTonne)}</td><td className="num" style={{fontWeight:700,color:'var(--olive)'}}>{formatCurrency(p.totalCost)}</td></tr>)}
    <tr style={{background:'var(--olive-soft)'}}><td style={{fontWeight:700,color:'var(--olive)'}} colSpan={5}>Cumulative Total</td><td className="num" style={{fontWeight:700,fontSize:16,color:'var(--olive)'}}>{formatCurrency(cum)}</td></tr>
    </tbody></table></div>
  </div>);
}
