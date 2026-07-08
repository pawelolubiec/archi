/**
 * Regenerates the branded app mockups in public/screens/*.png (1366×830).
 *
 * Usage:  node scripts/mockups/generate-screens.mjs [app_id ...]
 * Needs a Chromium binary (CHROMIUM env var, default /opt/pw-browsers/chromium).
 *
 * Every mockup is plain HTML/CSS rendered headlessly, so content edits are a
 * text change here + re-run — no design tool required.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'public/screens');
const TMP_DIR = path.join(ROOT, 'scripts/mockups/.tmp');
const CHROMIUM = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium';

const C = {
  bg: '#081120',
  panel: '#0D1727',
  panelSoft: '#0A1420',
  line: 'rgba(255,255,255,0.08)',
  text: '#F2F7FC',
  mist: '#9DB4CC',
  green: '#34D399',
  gold: '#D6BF91',
  sea: '#2EC5C5',
  red: '#F87171',
};

/* ---------- shared building blocks ---------- */

const kpi = (label, value, note, noteColor = C.green) => `
  <div class="kpi">
    <div class="kpi-label">${label}</div>
    <div class="kpi-row"><span class="kpi-value">${value}</span>
      ${note ? `<span class="kpi-note" style="color:${noteColor}">${note}</span>` : ''}</div>
  </div>`;

const card = (title, body, extra = '') => `
  <div class="card" ${extra}>
    <div class="card-title">${title}</div>
    ${body}
  </div>`;

const bars = (values, color, { width = 30, gap = 10, height = 210, line } = {}) => {
  const max = Math.max(...values);
  const bar = (v, i) =>
    `<div class="bar" style="width:${width}px;height:${(v / max) * height}px;background:${color}"></div>`;
  let overlay = '';
  if (line) {
    const step = width + gap;
    const pts = line
      .map((v, i) => `${i * step + width / 2},${height - (v / Math.max(...line)) * height * 0.92}`)
      .join(' ');
    overlay = `<svg class="line-overlay" width="${values.length * step - gap}" height="${height}">
      <polyline points="${pts}" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity="0.85"/></svg>`;
  }
  return `<div class="bars" style="gap:${gap}px;height:${height}px">${values.map(bar).join('')}${overlay}</div>`;
};

const hbars = (rows, color, height = 16) => {
  const max = Math.max(...rows.map((r) => r[1]));
  return `<div class="hbars">${rows
    .map(
      ([label, v, suffix]) => `
    <div class="hbar-row">
      <span class="hbar-label">${label}</span>
      <div class="hbar-track"><div class="hbar-fill" style="width:${(v / max) * 100}%;background:${color};height:${height}px"></div></div>
      <span class="hbar-value">${suffix ?? v}</span>
    </div>`,
    )
    .join('')}</div>`;
};

const donut = (pct, label, sub, color) => {
  const r = 34, c = 2 * Math.PI * r;
  return `
  <div class="donut">
    <svg width="92" height="92" viewBox="0 0 92 92">
      <circle cx="46" cy="46" r="${r}" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="7"/>
      <circle cx="46" cy="46" r="${r}" fill="none" stroke="${color}" stroke-width="7"
        stroke-linecap="round" stroke-dasharray="${(pct / 100) * c} ${c}"
        transform="rotate(-90 46 46)"/>
      <text x="46" y="50" text-anchor="middle" fill="${C.text}" font-size="16" font-weight="600">${pct}%</text>
    </svg>
    <div class="donut-label">${label}</div>
    <div class="donut-sub">${sub}</div>
  </div>`;
};

const table = (headers, rows, chipCol = -1, chipColors = {}) => `
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows
      .map(
        (r) =>
          `<tr>${r
            .map((cell, i) =>
              i === chipCol
                ? `<td><span class="chip" style="color:${chipColors[cell] ?? C.mist};border-color:${(chipColors[cell] ?? C.mist) + '55'}">${cell}</span></td>`
                : `<td>${cell}</td>`,
            )
            .join('')}</tr>`,
      )
      .join('')}</tbody>
  </table>`;

/* ---------- per-app content ---------- */

const APPS = {
  mifo: {
    accent: C.green,
    title: 'MiFo',
    subtitle: 'Forecasting, Ordering &amp; Profitability',
    nav: ['Forecast', 'Orders', 'Quotes', 'Customers', 'Margin', 'AI insights'],
    kpis:
      kpi('FORECAST ACCURACY', '82.4%', '+1.2 pp') +
      kpi('ORDER BOOK · 4W', '€12.8M', '+6%') +
      kpi('AVG MARGIN', '11.6%', '+0.4 pp') +
      kpi('SERVICE LEVEL · OTIF', '95.1%', '+0.8 pp'),
    main: `
      <div class="grid-2" style="margin-bottom:14px">
        ${card('FORECAST VS ACTUAL · 12 WEEKS', bars([62, 71, 68, 75, 79, 74, 82, 85, 80, 77, 86, 90], C.green, { line: [65, 69, 70, 74, 76, 76, 80, 82, 81, 80, 84, 87] }))}
        ${card('MARGIN BY CUSTOMER · TOP 6', hbars([
          ['Retail DE', 96, '13.8%'], ['Retail FR', 84, '12.1%'], ['Foodservice IT', 71, '11.4%'],
          ['Retail US', 65, '10.9%'], ['Wholesale JP', 52, '9.7%'], ['Retail AU', 40, '8.8%'],
        ], C.gold))}
      </div>
      ${card('OPEN ORDERS', table(
        ['ORDER', 'CUSTOMER', 'PRODUCT', 'QTY', 'MARGIN', 'DELIVERY', 'STATUS'],
        [
          ['ORD-7741', 'Retail DE', 'Smoked salmon sliced 100 g', '18,400 kg', '13.2%', 'Fri · wk 28', 'CONFIRMED'],
          ['ORD-7738', 'Foodservice IT', 'Fillet trim D fresh', '9,600 kg', '11.0%', 'Thu · wk 28', 'CONFIRMED'],
          ['ORD-7735', 'Retail FR', 'Portions MAP 2×125 g', '12,250 kg', '12.4%', 'Mon · wk 29', 'IN REVIEW'],
        ],
        6, { CONFIRMED: C.green, 'IN REVIEW': C.gold },
      ))}`,
  },

  workday_erp: {
    accent: C.gold,
    title: 'ERP · Financial Core',
    subtitle: 'Workday / IFS candidate',
    nav: ['General ledger', 'Purchasing', 'Fixed assets', 'Close', 'Reports'],
    kpis:
      kpi('CLOSE · M06', 'Day 3/5', 'on track') +
      kpi('AP OPEN', '€2.4M', '−8%') +
      kpi('AR OVERDUE', '€0.9M', '−12%') +
      kpi('CASH POSITION', '€6.2M', '+4%'),
    main: `
      <div class="grid-2" style="grid-template-columns: 1.4fr 1fr">
        ${card('RECENT POSTINGS', table(
          ['ACCOUNT', 'DOCUMENT', 'AMOUNT', 'TIME'],
          [
            ['4010 · Revenue', 'INV-88412 · Retail DE', '€184,220', '09:41'],
            ['5020 · Raw material', 'PO-55131 · Salmon RM', '€96,480', '09:12'],
            ['6110 · Energy', 'INV-88395 · Utility PL', '€21,730', '08:56'],
            ['4010 · Revenue', 'INV-88389 · Foodservice IT', '€67,910', '08:31'],
            ['7040 · Maintenance', 'PO-55118 · Spare parts', '€8,140', '07:58'],
          ],
        ))}
        ${card('OPEX BY MONTH', bars([54, 58, 52, 61, 57, 55], C.gold, { width: 40, gap: 16, height: 200 }))}
      </div>`,
  },

  pts: {
    accent: C.green,
    title: 'PTS',
    subtitle: 'Production Tracking · Słupsk plant',
    nav: ['Live lines', 'Work orders', 'Labels', 'Operators', 'Downtime'],
    kpis:
      kpi('ORDERS TODAY', '38', '92% complete') +
      kpi('YIELD · 7D', '83.6%', '+0.9 pp') +
      kpi('DOWNTIME', '42 min', '−18%') +
      kpi('REJECTS', '0.8%', '−0.2 pp'),
    main: `
      ${card('LINE PERFORMANCE · OEE', `<div class="donuts">
        ${donut(87, 'FILLETING F1', 'shift A', C.green)}
        ${donut(82, 'FILLETING F2', 'shift A', C.green)}
        ${donut(78, 'SMOKEHOUSE W1', 'shift A', C.gold)}
        ${donut(91, 'PACKING P1', 'shift A', C.green)}
      </div>`)}
      ${card('ACTIVE WORK ORDERS', table(
        ['ORDER', 'BATCH', 'SHIFT', 'QTY', 'START', 'STATUS'],
        [
          ['SO-4471 · Fillets trim D', 'LOT 442/S2', 'A', '3,200 kg', '06:10', 'RUNNING'],
          ['SO-4468 · Sliced smoked', 'LOT 439/S1', 'A', '1,850 kg', '06:40', 'RUNNING'],
          ['SO-4465 · Portions MAP', 'LOT 438/S1', 'A', '2,400 kg', '07:05', 'QUEUED'],
        ],
        5, { RUNNING: C.green, QUEUED: C.gold },
      ))}`,
  },

  pid: {
    accent: C.sea,
    title: 'PID',
    subtitle: 'Product Information Database',
    nav: ['Recipes', 'Specifications', 'Allergens', 'Packaging', 'Versions'],
    kpis:
      kpi('ACTIVE SKUS', '412', '+6') +
      kpi('VERSIONS IN REVIEW', '9', '2 urgent', C.gold) +
      kpi('CUSTOMER SPECS', '168', 'all current') +
      kpi('DATA GAPS', '14', '−5'),
    main: `
      <div class="grid-2" style="grid-template-columns: 1.4fr 1fr">
        ${card('RECIPES · LATEST CHANGES', table(
          ['RECIPE', 'VERSION', 'CHANGED', 'STATUS'],
          [
            ['Smoked salmon sliced 100 g', 'v14', 'today 08:12', 'APPROVED'],
            ['Fillet trim D fresh', 'v9', 'yesterday', 'IN REVIEW'],
            ['Portions MAP 2×125 g', 'v11', '2 days ago', 'APPROVED'],
            ['Gravlax dill 200 g', 'v6', '3 days ago', 'APPROVED'],
            ['Hot-smoked pepper 150 g', 'v4', '4 days ago', 'IN REVIEW'],
          ],
          3, { APPROVED: C.green, 'IN REVIEW': C.gold },
        ))}
        ${card('SPEC UPDATES · 6 MONTHS', bars([18, 24, 15, 31, 22, 27], C.sea, { width: 40, gap: 16, height: 200 }))}
      </div>`,
  },

  wms: {
    accent: C.sea,
    title: 'WMS',
    subtitle: 'Warehouse · FEFO / locations',
    nav: ['Hall map', 'Receiving', 'Dispatch', 'Loading', 'Stock count'],
    kpis:
      kpi('OCCUPANCY', '78%', '+3 pp') +
      kpi('FEFO COMPLIANCE', '98.6%', '+0.4 pp') +
      kpi('RECEIPTS TODAY', '24', '3 pending', C.gold) +
      kpi('LOADINGS', '11', 'on schedule'),
    main: `
      ${card('HALL A · COLD ZONE 0–2°C', `
        <div class="heatmap">${Array.from({ length: 10 * 26 }, (_, i) => {
          const r = (i * 2654435761) % 100;
          const cls = r < 62 ? 'ok' : r < 80 ? 'soon' : 'empty';
          return `<div class="cell ${cls}"></div>`;
        }).join('')}</div>
        <div class="legend">
          <span><i style="background:${C.green}"></i> FEFO OK</span>
          <span><i style="background:${C.gold}"></i> &lt; 5 days</span>
          <span><i style="background:rgba(255,255,255,0.07)"></i> Empty</span>
        </div>`)}`,
  },

  qms_lims: {
    accent: C.gold,
    title: 'QMS / LIMS',
    subtitle: 'Quality &amp; laboratory',
    nav: ['Tests', 'Audits', 'Non-conformance', 'CAPA', 'Certificates', 'Documents'],
    kpis:
      kpi('TESTS TODAY', '46', '9 in progress', C.gold) +
      kpi('OPEN NCs', '7', '−2') +
      kpi('CAPA ON TIME', '92%', '+5 pp') +
      kpi('CERT RENEWAL', '12 days', 'IFS Food', C.gold),
    main: `
      ${card('LAB RESULTS · TODAY', table(
        ['SAMPLE', 'BATCH', 'PARAMETER', 'RESULT', 'STATUS'],
        [
          ['S-2211 · Raw material', 'LOT 442/S2', 'Listeria monocytogenes', 'not detected / 25 g', 'PASS'],
          ['S-2210 · Finished sliced', 'LOT 439/S1', 'Salt content', '2.9%', 'PASS'],
          ['S-2209 · Surface swab W1', '—', 'Total viable count', '180 cfu/cm²', 'PASS'],
          ['S-2208 · Finished MAP', 'LOT 438/S1', 'Gas mix O₂', '0.4%', 'PASS'],
          ['S-2207 · Water · line F2', '—', 'pH', '7.6', 'RETEST'],
          ['S-2206 · Finished gravlax', 'LOT 436/S2', 'Histamine', '11 mg/kg', 'PASS'],
        ],
        4, { PASS: C.green, RETEST: C.gold },
      ))}`,
  },

  aps: {
    accent: C.green,
    title: 'APS',
    subtitle: 'Planning &amp; scheduling',
    nav: ['Schedule', 'Demand', 'Capacity', 'Scenarios', 'S&amp;OP', 'Calendar'],
    kpis:
      kpi('PLAN ADHERENCE', '91%', '+2 pp') +
      kpi('BOTTLENECK', 'Smokehouse', 'W1 · 96%', C.gold) +
      kpi('CAPACITY · 7D', '84%', 'balanced') +
      kpi('PLAN CHANGES', '6', 'today', C.gold),
    main: `
      ${card('SCHEDULE · TODAY 6:00–20:00', `
        <div class="gantt">
          ${[
            ['Line F1 · fillets', [[0, 22, C.green], [26, 30, C.green], [60, 28, C.gold]]],
            ['Line F2 · fillets', [[4, 30, C.green], [38, 26, C.green], [70, 22, C.green]]],
            ['Smokehouse W1', [[0, 44, C.gold], [48, 46, C.gold]]],
            ['Smokehouse W2', [[10, 36, C.green], [52, 30, C.green]]],
            ['Packing P1', [[8, 26, C.green], [40, 24, C.gold], [70, 26, C.green]]],
            ['Packing P2', [[16, 28, C.green], [50, 34, C.green]]],
            ['Freezer', [[0, 90, 'rgba(46,197,197,0.45)']]],
          ]
            .map(
              ([label, segs]) => `
            <div class="gantt-row">
              <span class="gantt-label">${label}</span>
              <div class="gantt-track">
                ${segs.map(([l, w, col]) => `<div class="gantt-bar" style="left:${l}%;width:${w}%;background:${col}"></div>`).join('')}
              </div>
            </div>`,
            )
            .join('')}
          <div class="gantt-axis">${['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
            .map((t) => `<span>${t}</span>`)
            .join('')}</div>
        </div>`)}`,
  },

  data_platform: {
    accent: C.sea,
    title: 'Data Platform',
    subtitle: 'Superset · lakehouse',
    nav: ['Dashboards', 'Datasets', 'KPI models', 'Pipelines', 'SQL Lab', 'Access'],
    kpis:
      kpi('DATASETS', '214', '+9') +
      kpi('PIPELINES OK', '47/48', '1 late', C.gold) +
      kpi('USERS · 30D', '126', '+14') +
      kpi('DATA FRESHNESS', '99.2%', 'SLA met'),
    main: `
      <div class="grid-3">
        ${[
          ['SALES · FRANCE', [42, 55, 49, 63, 58, 71], C.sea],
          ['YIELD · PLANT', [80, 82, 81, 83, 84, 84], C.green],
          ['CUSTOMER CONCENTRATION', [66, 61, 58, 55, 52, 50], C.gold],
          ['OTIF', [90, 92, 91, 94, 93, 95], C.sea],
          ['INVENTORY DAYS', [34, 32, 33, 30, 29, 28], C.gold],
          ['ENERGY · kWh/kg', [40, 38, 39, 36, 35, 34], C.green],
        ]
          .map(([t, vals, col]) => card(t, bars(vals, col, { width: 22, gap: 10, height: 92 })))
          .join('')}
      </div>`,
  },

  gone_ai: {
    accent: C.gold,
    title: 'Gone-AI',
    subtitle: 'AI agents · decision support',
    nav: ['Console', 'Agents', 'Automations', 'Insights', 'Digital Twin', 'Logs'],
    kpis:
      kpi('ACTIVE AGENTS', '6', 'all healthy') +
      kpi('RECOMMENDATIONS · 7D', '23', '18 accepted') +
      kpi('ACCEPTANCE RATE', '78%', '+6 pp') +
      kpi('EST. SAVINGS · 30D', '€41k', 'validated', C.gold),
    main: `
      <div class="grid-2" style="grid-template-columns: 1.5fr 1fr">
        ${card('CONSOLE · YIELD WATCH', `
          <div class="chat">
            <div class="msg agent">Yield on line F2 dropped 1.8 pp against the 7-day average.</div>
            <div class="msg agent">Likely cause: raw-material batch LOT 442/S2 — average weight below specification.</div>
            <div class="msg user">Show the impact on today's plan and propose a correction.</div>
            <div class="msg agent">Recommendation: move SO-4471 to line F1 and backfill F2 with LOT 448. Risk: +20 min changeover on F1. Expected recovery: +1.1 pp yield.</div>
            <div class="msg actions"><span class="btn primary">Apply to plan</span><span class="btn">Simulate first</span></div>
          </div>`)}
        ${card('ACTIVE AGENTS', `
          <div class="agents">
            ${[
              ['Yield Watch', 'active', C.green],
              ['Demand Sense', 'learning', C.gold],
              ['Plan Guard', 'active', C.green],
              ['Energy Optimizer', 'active', C.green],
              ['Quality Sentinel', 'active', C.green],
              ['Stock Balancer', 'paused', C.mist],
            ]
              .map(
                ([name, st, col]) => `
              <div class="agent-row">
                <span class="dot" style="background:${col}"></span>
                <span class="agent-name">${name}</span>
                <span class="agent-status" style="color:${col}">${st}</span>
              </div>`,
              )
              .join('')}
          </div>`)}
      </div>`,
  },
};

/* ---------- page template ---------- */

function pageHTML(app) {
  const fonts = `file://${ROOT}/public/fonts`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Inter; font-weight: 400; src: url('${fonts}/inter-latin-400.woff2') format('woff2'); }
  @font-face { font-family: Inter; font-weight: 500; src: url('${fonts}/inter-latin-500.woff2') format('woff2'); }
  @font-face { font-family: Inter; font-weight: 600; src: url('${fonts}/inter-latin-600.woff2') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1366px; height: 830px; overflow: hidden; }
  body { background: ${C.bg}; color: ${C.text}; font: 400 13px/1.45 Inter, system-ui, sans-serif;
         display: grid; grid-template: 56px 1fr / 200px 1fr; }
  header { grid-column: 1 / 3; display: flex; align-items: center; gap: 12px; padding: 0 20px;
           border-bottom: 1px solid ${C.line}; background: ${C.panelSoft}; }
  .ring { width: 26px; height: 26px; border-radius: 50%; border: 2px solid ${app.accent};
          display: flex; align-items: center; justify-content: center; }
  .ring i { width: 8px; height: 8px; border-radius: 50%; background: ${app.accent}; }
  .app-name { font-weight: 600; font-size: 16px; letter-spacing: 0.02em; }
  .app-sub { color: ${C.mist}; font-size: 12.5px; }
  .meta { margin-left: auto; color: ${C.mist}; font-size: 12px; }
  .meta b { color: ${app.accent}; font-weight: 600; margin-left: 6px; }
  aside { border-right: 1px solid ${C.line}; background: ${C.panelSoft};
          padding: 18px 12px; display: flex; flex-direction: column; }
  .nav-item { padding: 9px 12px; border-radius: 8px; color: ${C.mist}; font-size: 13px;
              border: 1px solid transparent; margin-bottom: 2px; }
  .nav-item.active { color: ${app.accent}; border-color: ${app.accent}66; background: ${app.accent}0d; font-weight: 500; }
  .version { margin-top: auto; color: ${C.mist}; opacity: 0.6; font-size: 11px; padding: 0 12px; }
  main { padding: 20px 22px; overflow: hidden; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
  .kpi { background: ${C.panel}; border: 1px solid ${C.line}; border-radius: 10px; padding: 12px 14px; }
  .kpi-label { font-size: 10px; letter-spacing: 0.14em; color: ${C.mist}; }
  .kpi-row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 6px; }
  .kpi-value { font-size: 22px; font-weight: 600; }
  .kpi-note { font-size: 11px; font-weight: 500; }
  .card { background: ${C.panel}; border: 1px solid ${C.line}; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; }
  .card-title { font-size: 10px; letter-spacing: 0.14em; color: ${C.mist}; margin-bottom: 12px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-2 .card { margin-bottom: 0; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .grid-3 .card { margin-bottom: 0; }
  .bars { display: flex; align-items: flex-end; position: relative; }
  .bar { border-radius: 4px 4px 2px 2px; opacity: 0.9; }
  .line-overlay { position: absolute; left: 0; bottom: 0; }
  .hbars { display: flex; flex-direction: column; gap: 12px; }
  .hbar-row { display: flex; align-items: center; gap: 10px; }
  .hbar-label { width: 110px; color: ${C.mist}; font-size: 12px; }
  .hbar-track { flex: 1; background: rgba(255,255,255,0.06); border-radius: 4px; }
  .hbar-fill { border-radius: 4px; opacity: 0.9; }
  .hbar-value { width: 48px; text-align: right; font-size: 12px; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th { text-align: left; font-size: 10px; letter-spacing: 0.12em; color: ${C.mist}; font-weight: 500;
       padding: 6px 10px; border-bottom: 1px solid ${C.line}; }
  td { padding: 9px 10px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .chip { border: 1px solid; border-radius: 999px; padding: 2px 9px; font-size: 10.5px; font-weight: 500; }
  .donuts { display: flex; justify-content: space-around; padding: 6px 0; }
  .donut { text-align: center; }
  .donut-label { font-size: 11px; font-weight: 500; margin-top: 6px; }
  .donut-sub { font-size: 10px; color: ${C.mist}; }
  .heatmap { display: grid; grid-template-columns: repeat(26, 1fr); gap: 5px; }
  .cell { height: 16px; border-radius: 3px; }
  .cell.ok { background: ${C.green}; opacity: 0.75; }
  .cell.soon { background: ${C.gold}; opacity: 0.8; }
  .cell.empty { background: rgba(255,255,255,0.07); }
  .legend { display: flex; gap: 22px; margin-top: 14px; color: ${C.mist}; font-size: 12px; }
  .legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 7px; }
  .gantt-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .gantt-label { width: 130px; color: ${C.mist}; font-size: 12px; }
  .gantt-track { flex: 1; height: 20px; background: rgba(255,255,255,0.05); border-radius: 5px; position: relative; }
  .gantt-bar { position: absolute; top: 2px; bottom: 2px; border-radius: 4px; opacity: 0.85; }
  .gantt-axis { display: flex; justify-content: space-between; margin-left: 142px; color: ${C.mist};
                font-size: 10px; margin-top: 4px; }
  .chat { display: flex; flex-direction: column; gap: 10px; }
  .msg { max-width: 82%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
  .msg.agent { background: rgba(255,255,255,0.05); border: 1px solid ${C.line}; }
  .msg.user { background: ${app.accent}1a; border: 1px solid ${app.accent}55; align-self: flex-end; }
  .msg.actions { display: flex; gap: 10px; padding: 0; }
  .btn { border: 1px solid ${C.line}; border-radius: 8px; padding: 7px 14px; font-size: 12px; color: ${C.mist}; }
  .btn.primary { border-color: ${app.accent}66; background: ${app.accent}14; color: ${app.accent}; font-weight: 500; }
  .agents { display: flex; flex-direction: column; gap: 13px; }
  .agent-row { display: flex; align-items: center; gap: 10px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .agent-name { flex: 1; font-size: 13px; }
  .agent-status { font-size: 11.5px; }
  </style></head><body>
    <header>
      <div class="ring"><i></i></div>
      <span class="app-name">${app.title}</span>
      <span class="app-sub">${app.subtitle}</span>
      <span class="meta">Milarex · Production<b>PL</b></span>
    </header>
    <aside>
      ${app.nav.map((n, i) => `<div class="nav-item${i === 0 ? ' active' : ''}">${n}</div>`).join('')}
      <div class="version">v4.2 · on-prem</div>
    </aside>
    <main>
      <div class="kpis">${app.kpis}</div>
      ${app.main}
    </main>
  </body></html>`;
}

/* ---------- render ---------- */

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(APPS);
mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

for (const id of ids) {
  const app = APPS[id];
  if (!app) {
    console.error(`unknown app: ${id}`);
    process.exitCode = 1;
    continue;
  }
  const htmlPath = path.join(TMP_DIR, `${id}.html`);
  writeFileSync(htmlPath, pageHTML(app));
  execFileSync(CHROMIUM, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1366,830',
    '--virtual-time-budget=3000',
    `--screenshot=${path.join(OUT_DIR, `${id}.png`)}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe' });
  console.log(`✓ ${id}.png`);
}

rmSync(TMP_DIR, { recursive: true, force: true });
