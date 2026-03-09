import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatNumber } from './calculator.js';

export function generateCBAMReport(result, projection) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(26, 23, 20);
  doc.rect(0, 0, w, 40, 'F');
  doc.setFontSize(18);
  doc.setTextColor(254, 253, 251);
  doc.text('CBAM Compass', 14, 17);
  doc.setFontSize(9);
  doc.setTextColor(165, 157, 144);
  doc.text('EU Carbon Border Adjustment Mechanism — Liability Report', 14, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 32);

  let y = 50;

  // Summary
  doc.setFillColor(240, 236, 228);
  doc.roundedRect(14, y, w - 28, 36, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(122, 114, 101);
  doc.text('TOTAL CBAM LIABILITY', 20, y + 10);
  doc.setFontSize(22);
  doc.setTextColor(74, 103, 65);
  doc.text(formatCurrency(result.totalCost), 20, y + 24);
  doc.setFontSize(9);
  doc.setTextColor(122, 114, 101);
  doc.text(`${formatNumber(result.netCertificates, 1)} certificates at €${result.etsPrice}/cert`, 20, y + 32);
  doc.text(`Cost per tonne: ${formatCurrency(result.costPerTonne, 2)}`, w - 14, y + 12, { align: 'right' });
  doc.text(`Obligation: ${(result.phaseOut.obligation * 100).toFixed(1)}%`, w - 14, y + 20, { align: 'right' });

  y += 46;

  // Import details table
  doc.setFontSize(12);
  doc.setTextColor(26, 23, 20);
  doc.text('Import Details', 14, y);
  y += 8;

  doc.autoTable({
    startY: y, theme: 'plain',
    headStyles: { fillColor: [240, 236, 228], textColor: [122, 114, 101], fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
    bodyStyles: { textColor: [74, 68, 57], fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [246, 243, 238] },
    head: [['Parameter', 'Value']],
    body: [
      ['Product category', result.input.product],
      ['Country of origin', result.country?.name || result.input.countryCode],
      ['Sector', result.input.sector.replace('_', ' & ')],
      ['Import quantity', `${formatNumber(result.input.quantity, 0)} tonnes`],
      ['Compliance year', String(result.input.year)],
      ['Data type', result.input.useActualEmissions ? 'Actual (verified)' : 'Default values (with markup)'],
      ['Benchmark', `${result.input.benchmark} tCO₂e/t`],
    ],
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 12;

  // Breakdown
  doc.setFontSize(12);
  doc.setTextColor(26, 23, 20);
  doc.text('Calculation Breakdown', 14, y);
  y += 8;

  doc.autoTable({
    startY: y, theme: 'plain',
    headStyles: { fillColor: [240, 236, 228], textColor: [122, 114, 101], fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
    bodyStyles: { textColor: [74, 68, 57], fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [246, 243, 238] },
    head: [['Step', 'Description', 'Value']],
    body: [
      ['1', 'Specific embedded emissions (direct)', `${formatNumber(result.emissions.specificDirect, 3)} tCO₂e/t`],
      ['2', 'Specific embedded emissions (indirect)', `${formatNumber(result.emissions.specificIndirect, 3)} tCO₂e/t`],
      ['3', 'Total embedded emissions', `${formatNumber(result.emissions.totalEmbedded, 2)} tCO₂e`],
      ['4', 'Free allocation adjustment (SEFA)', `−${formatNumber(result.freeAllocation.sefa, 2)} tCO₂e`],
      ['5', 'Gross certificates required', formatNumber(result.grossCertificates, 2)],
      ['6', 'Carbon price deduction', `−${formatNumber(result.carbonPriceDeduction.deductionTonnes, 2)}`],
      ['7', 'Net certificates required', formatNumber(result.netCertificates, 2)],
      ['8', 'Certificate price', `€${result.etsPrice}/tCO₂`],
      ['', 'TOTAL CBAM COST', formatCurrency(result.totalCost)],
    ],
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.row.index === 8) { data.cell.styles.textColor = [74, 103, 65]; data.cell.styles.fontStyle = 'bold'; data.cell.styles.fontSize = 10; }
    }
  });

  if (projection && projection.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(26, 23, 20);
    doc.text('Multi-Year Cost Projection (2026–2034)', 14, 20);

    doc.autoTable({
      startY: 28, theme: 'plain',
      headStyles: { fillColor: [240, 236, 228], textColor: [122, 114, 101], fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
      bodyStyles: { textColor: [74, 68, 57], fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [246, 243, 238] },
      head: [['Year', 'Obligation', 'ETS Price', 'Certificates', 'Cost/Tonne', 'Total Cost']],
      body: [
        ...projection.map(p => [
          String(p.input.year), `${(p.phaseOut.obligation * 100).toFixed(1)}%`,
          `€${p.etsPrice}`, formatNumber(p.netCertificates, 0),
          formatCurrency(p.costPerTonne), formatCurrency(p.totalCost),
        ]),
        ['', '', '', '', 'CUMULATIVE', formatCurrency(projection.reduce((s, p) => s + p.totalCost, 0))],
      ],
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.row.index === projection.length) { data.cell.styles.textColor = [74, 103, 65]; data.cell.styles.fontStyle = 'bold'; }
      }
    });
  }

  const pc = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(165, 157, 144);
    doc.text('CBAM Compass — For informational purposes only. Verify with official EU CBAM Registry.', 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${pc}`, w - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }

  doc.save(`CBAM-Report-${result.input.product.replace(/[\s\/]/g, '-')}-${result.input.countryCode}-${result.input.year}.pdf`);
}
