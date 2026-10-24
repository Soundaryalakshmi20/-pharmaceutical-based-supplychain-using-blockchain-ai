/**
 * PharmaChain — Print & Download Utilities
 * Reusable across Admin, Distributor, and Pharmacy phases.
 */

/**
 * Open a print-friendly window with the given HTML content.
 * @param {string} html - Full HTML body to print
 * @param {string} title - Document title
 */
export function printHTML(html, title = 'PharmaChain Report') {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Please allow popups to print.');
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  @page { size: A4; margin: 15mm 20mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; font-size: 13px; line-height: 1.5; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; }
  .logo h1 { margin: 0; color: #1e40af; font-size: 22px; }
  .logo p { margin: 2px 0; color: #6b7280; font-size: 12px; }
  .title-section { text-align: right; }
  .title-section h2 { margin: 0; color: #1e293b; font-size: 18px; }
  .title-section p { margin: 2px 0; color: #6b7280; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #1e293b; color: white; padding: 8px 6px; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 7px 6px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
  tr:nth-child(even) { background: #f9fafb; }
  tr.row-danger { background: #fef2f2 !important; }
  tr.row-warning { background: #fffbeb !important; }
  .summary { display: flex; gap: 16px; margin: 12px 0; flex-wrap: wrap; }
  .summary-card { flex: 1; min-width: 120px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; text-align: center; }
  .summary-card .val { font-size: 20px; font-weight: 700; color: #1e293b; }
  .summary-card .lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .badge-VERIFIED, .badge-APPROVED, .badge-DISPENSED, .badge-paid, .badge-issued { background: #dcfce7; color: #166534; }
  .badge-BLOCKED, .badge-RECALLED, .badge-cancelled, .badge-CANCELLED { background: #fee2e2; color: #991b1b; }
  .badge-PENDING_APPROVAL, .badge-pending, .badge-DRAFT { background: #fef3c7; color: #92400e; }
  .footer { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 20px; font-size: 10px; color: #9ca3af; }
  .disclaimer { background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11px; }
  .meta { text-align: center; }
  .meta p { margin: 2px 0; }
  .mono { font-family: 'Courier New', monospace; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
${html}
<script>
  window.onload = function() { setTimeout(function() { window.print(); }, 300); };
</script>
</body>
</html>`);
  win.document.close();
}

/**
 * Generate the standard PharmaChain report header HTML.
 */
export function reportHeader(title, subtitle = '') {
  return `
  <div class="header">
    <div class="logo">
      <h1>⚕ PharmaChain</h1>
      <p>Pharmaceutical Supply Chain Management</p>
      <p>License: CDSCO/MH/2024/XXXX &nbsp;|&nbsp; GSTIN: 27AABCP1234A1Z5</p>
    </div>
    <div class="title-section">
      <h2>${title}</h2>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
      <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>`;
}

/**
 * Generate the standard report footer HTML.
 */
export function reportFooter() {
  return `
  <div class="footer">
    <div class="disclaimer">
      <strong>Disclaimer:</strong> This document is generated for internal use only. All data is subject to CDSCO regulatory compliance. Unauthorized distribution is prohibited.
    </div>
    <div class="meta">
      <p>PharmaChain Pharmaceutical Management System</p>
      <p>Timestamp: ${new Date().toISOString()} | © ${new Date().getFullYear()} PharmaChain</p>
    </div>
  </div>`;
}

/**
 * Status badge HTML for print.
 */
export function statusBadge(status) {
  const s = (status || 'default').toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge-${s}">${status || '—'}</span>`;
}

/**
 * Summary cards HTML.
 */
export function summaryCards(cards) {
  return `<div class="summary">${cards.map(c =>
    `<div class="summary-card"><div class="val">${c.value}</div><div class="lbl">${c.label}</div></div>`
  ).join('')}</div>`;
}

/**
 * Export a table to CSV and trigger download.
 * @param {string} filename
 * @param {string[]} headers
 * @param {any[][]} rows
 */
export function downloadCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const val = String(cell ?? '').replace(/"/g, '""');
      return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
    }).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
