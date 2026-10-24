import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getInventory } from '../../api/inventory';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../../components/StatusBadge';
import { QrCode, Download, ExternalLink, Search, Package, Printer, Copy, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getQrBaseUrl, fetchLanIp } from '../../utils/qrBaseUrl';

export default function DistributorGenerateQR() {
  const { data: inventory, loading } = useApi(getInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [copiedSerial, setCopiedSerial] = useState(null);

  // Encode the URL the app is actually being served from, so scanned devices
  // can reach it. (A hardcoded IP like the old 192.168.1.102 broke whenever
  // the machine changed Wi-Fi networks.)
  // NOTE: if you opened the app via localhost and plan to scan with a PHONE,
  // open it via this machine's LAN IP instead (start Vite with --host) —
  // a QR pointing at localhost is unreachable from another device.
  const baseUrl = window.location.origin;

  const filteredItems = inventory?.filter(item =>
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getVerificationUrl = (serial) => `${baseUrl}/verify/${serial}`;

  const downloadQR = useCallback((serial) => {
    const svgEl = document.getElementById(`qr-${serial}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 60;
      canvas.height = img.height + 80;
      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code centered
        ctx.drawImage(img, 30, 10);

        // Draw serial number text below QR
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(serial, canvas.width / 2, canvas.height - 35);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText('Scan to verify authenticity', canvas.width / 2, canvas.height - 15);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngFile;
        downloadLink.download = `QR_${serial}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  const downloadAllQRs = useCallback(() => {
    filteredItems.forEach((item, idx) => {
      setTimeout(() => {
        downloadQR(item.serial_number);
      }, idx * 300); // Stagger downloads
    });
  }, [filteredItems, downloadQR]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSerial(text);
      setTimeout(() => setCopiedSerial(null), 2000);
    });
  };

  const printQR = (serial) => {
    const svgEl = document.getElementById(`qr-${serial}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${serial}</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: monospace; }
          .qr-container { text-align: center; padding: 20px; border: 2px solid #e2e8f0; border-radius: 12px; }
          h2 { color: #1e293b; margin: 10px 0 5px; }
          p { color: #64748b; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>Pharma-Chain Verification</h2>
            <p>Scan this code to verify medicine authenticity</p>
            ${svgData}
            <h2>${serial}</h2>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" /> Generate QR Codes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate and download QR codes for your inventory packages. Patients can scan these to verify authenticity.
          </p>
        </div>
        {filteredItems.length > 0 && (
          <button
            onClick={downloadAllQRs}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition"
          >
            <Download className="w-4 h-4" /> Download All ({filteredItems.length})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by serial number, batch, or medicine name..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none"
        />
      </div>

      {/* QR Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm mt-3">Loading inventory...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
          <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {searchTerm ? 'No items match your search.' : 'Your inventory is empty. Receive some medicines first.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const serial = item.serial_number;
            const isExpanded = selectedSerial === serial;
            const qrUrl = getVerificationUrl(serial);

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                  isExpanded ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* QR Code Display */}
                <div className="bg-white p-4 flex items-center justify-center">
                  <QRCodeSVG
                    id={`qr-${serial}`}
                    value={qrUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Info Section */}
                <div className="p-4 space-y-3">
                  {/* Serial Number */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{serial}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Medicine Info */}
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="text-white font-medium">{item.medicine_name}</p>
                    <p>Batch: <span className="font-mono text-slate-300">{item.batch_number}</span></p>
                    <p>Qty: <span className="text-slate-300">1</span></p>
                  </div>

                  {/* URL Preview */}
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-500 break-all">
                    {qrUrl}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => downloadQR(serial)}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-medium py-2 rounded-lg text-xs transition border border-emerald-600/20"
                    >
                      <Download className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => printQR(serial)}
                      className="flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-medium py-2 rounded-lg text-xs transition border border-blue-600/20"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                      onClick={() => copyToClipboard(qrUrl)}
                      className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg text-xs transition border border-slate-700"
                    >
                      {copiedSerial === serial ? (
                        <><CheckCheck className="w-3.5 h-3.5" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                  </div>

                  {/* Test Verification Link */}
                  <Link
                    to={`/verify/${serial}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-400 transition pt-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Preview patient verification page
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
