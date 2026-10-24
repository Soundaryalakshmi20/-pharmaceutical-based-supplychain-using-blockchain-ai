import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { verifySerial } from '../api/verify';
import client from '../api/client';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, CheckCircle2, Clock, Building2, Package, Activity, ChevronRight, MapPin, FileText, ArrowRight, QrCode } from 'lucide-react';

export default function VerificationDisplay() {
  const { serialNumber } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action') || 'PATIENT_SCAN';
  const organizationId = searchParams.get('organizationId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVerification() {
      setLoading(true);
      try {
        const result = await verifySerial(serialNumber, action, organizationId);
        setData(result);

        // Also fetch supply chain history
        try {
          const historyRes = await client.get(`/verify/${serialNumber}/history`);
          setHistory(historyRes.data.data);
        } catch {
          // History fetch is optional - non-fatal
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to connect to verification backend');
      } finally {
        setLoading(false);
      }
    }

    if (serialNumber) {
      fetchVerification();
    }
  }, [serialNumber, action, organizationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-mono text-sm">Querying Central Verification Engine...</p>
          <p className="text-slate-500 text-xs mt-2">Scanning supply chain database for {serialNumber}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-800 p-8 rounded-2xl max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-white py-2 px-6 rounded-lg text-sm transition">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const getVerdictBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
      case 'WARNING':
        return {
          bg: 'bg-gradient-to-br from-emerald-950 to-emerald-900/80 border-emerald-500 text-emerald-300',
          icon: <CheckCircle2 className="w-14 h-14 text-emerald-400" />,
          title: status === 'WARNING' ? 'VERIFIED WITH WARNINGS' : 'AUTHENTIC & SAFE',
          subtitle: 'Verified by Official Supply Chain Ledger',
          glow: 'shadow-emerald-500/20',
        };
      case 'EXPIRED':
        return {
          bg: 'bg-gradient-to-br from-amber-950 to-amber-900/80 border-amber-500 text-amber-300',
          icon: <Clock className="w-14 h-14 text-amber-400" />,
          title: 'PRODUCT EXPIRED',
          subtitle: 'Legally Prohibited from Dispensing',
          glow: 'shadow-amber-500/20',
        };
      case 'REGULATORY_BLOCK':
        return {
          bg: 'bg-gradient-to-br from-red-950 to-red-900/80 border-red-500 text-red-300',
          icon: <ShieldAlert className="w-14 h-14 text-red-400" />,
          title: 'REGULATORY BLOCK',
          subtitle: 'Prohibited or Recalled by Drug Authorities',
          glow: 'shadow-red-500/20',
        };
      case 'ALREADY_DISPENSED':
        return {
          bg: 'bg-gradient-to-br from-blue-950 to-blue-900/80 border-blue-500 text-blue-300',
          icon: <Package className="w-14 h-14 text-blue-400" />,
          title: 'ALREADY DISPENSED',
          subtitle: 'This product has been dispensed to a patient',
          glow: 'shadow-blue-500/20',
        };
      case 'POSSIBLE_COUNTERFEIT':
      default:
        return {
          bg: 'bg-gradient-to-br from-rose-950 to-rose-900/80 border-rose-600 text-rose-300',
          icon: <AlertTriangle className="w-14 h-14 text-rose-500" />,
          title: 'POSSIBLE COUNTERFEIT',
          subtitle: 'Serial Number Unregistered in Official System',
          glow: 'shadow-rose-500/20',
        };
    }
  };

  const verdict = getVerdictBadge(data.status);
  const isVerified = data.status === 'VERIFIED' || data.status === 'WARNING';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-5">

        {/* Status Header Banner */}
        <div className={`p-6 rounded-2xl border ${verdict.bg} text-center shadow-2xl ${verdict.glow} shadow-lg`}>
          <div className="flex justify-center mb-3">{verdict.icon}</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">{verdict.title}</h1>
          <p className="text-sm opacity-90 mb-4">{verdict.subtitle}</p>

          <div className="pt-3 border-t border-slate-800/80 flex justify-between text-xs font-mono">
            <span>SERIAL: <span className="font-bold">{data.serialNumber}</span></span>
            <span>ACTION: {data.actionRequested}</span>
          </div>
        </div>

        {/* Medicine Details - Full Card */}
        {data.medicine && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" /> Medicine Information
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="text-lg font-bold text-white">{data.medicine.name}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">Code: {data.medicine.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Manufacturer</span>
                  <span className="text-slate-300 text-xs">{data.medicine.manufacturer}</span>
                </div>
                {data.medicine.composition && (
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Composition</span>
                    <span className="text-slate-300 text-xs">{data.medicine.composition}</span>
                  </div>
                )}
                {data.medicine.dosage && (
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Dosage Form</span>
                    <span className="text-slate-300 text-xs">{data.medicine.dosage}</span>
                  </div>
                )}
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Regulatory Status</span>
                  <span className={`text-xs font-semibold ${data.medicine.regulatoryStatus === 'PERMITTED' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.medicine.regulatoryStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Details */}
        {data.batch && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Batch Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Batch Number</span>
                <span className="font-mono text-white text-xs font-bold">{data.batch.batchNumber}</span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Batch Status</span>
                <span className={`text-xs font-semibold ${data.batch.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.batch.status}
                </span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Manufactured</span>
                <span className="text-slate-300 text-xs">
                  {data.batch.manufacturingDate ? new Date(data.batch.manufacturingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Expiry Date</span>
                <span className="text-slate-300 text-xs">
                  {data.batch.expiryDate ? new Date(data.batch.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Current Custody */}
        {data.currentOwner && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" /> Current Custody
            </h3>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{data.currentOwner.name}</p>
                <p className="text-xs text-slate-400">{data.currentOwner.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* CDSCO Regulatory Authority Details (shown for blocked/recalled/prohibited items) */}
        {data.regulatory && (
          <div className="bg-red-950/30 border border-red-800/50 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Regulatory Authority Order
            </h3>
            <div className="space-y-3">
              {data.regulatory.authority && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-red-900/30">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Issuing Authority</span>
                  <span className="text-xs text-white font-medium">{data.regulatory.authority}</span>
                </div>
              )}
              {data.regulatory.referenceNumber && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-red-900/30">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Notification Reference</span>
                  <span className="text-xs text-red-300 font-mono font-bold">{data.regulatory.referenceNumber}</span>
                </div>
              )}
              {data.regulatory.effectiveDate && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-red-900/30">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Effective Date</span>
                  <span className="text-xs text-slate-300">
                    {new Date(data.regulatory.effectiveDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {data.regulatory.reason && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-red-900/30">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Reason / Order Details</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{data.regulatory.reason}</p>
                </div>
              )}
              {data.regulatory.source && (
                <a
                  href={data.regulatory.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-medium mt-2 transition"
                >
                  📄 View Official CDSCO Notification &rarr;
                </a>
              )}
            </div>
          </div>
        )}

        {/* Supply Chain Timeline */}
        {history && history.timeline && history.timeline.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Supply Chain Journey
            </h3>
            <div className="space-y-0">
              {history.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                      event.type === 'DISPENSED_TO_PATIENT'
                        ? 'bg-emerald-500'
                        : event.type === 'RECEIVE'
                        ? 'bg-blue-500'
                        : event.type === 'TRANSFER'
                        ? 'bg-purple-500'
                        : event.type === 'BLOCK'
                        ? 'bg-red-500'
                        : 'bg-slate-500'
                    }`} />
                    {idx < history.timeline.length - 1 && (
                      <div className="w-px flex-1 bg-slate-700 my-1" />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase ${
                        event.type === 'RECEIVE' ? 'text-blue-400'
                          : event.type === 'TRANSFER' ? 'text-purple-400'
                          : event.type === 'BLOCK' ? 'text-red-400'
                          : event.type === 'DISPENSED_TO_PATIENT' ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}>
                        {event.type === 'DISPENSED_TO_PATIENT' ? 'DISPENSED' : event.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(event.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {event.type === 'DISPENSED_TO_PATIENT' ? (
                      <p className="text-xs text-slate-400 mt-1">
                        Dispensed to patient by <span className="text-white font-medium">{event.pharmacy}</span>
                      </p>
                    ) : (
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        {event.from && <span className="text-slate-300">{event.from.name}</span>}
                        {event.from && event.to && <ArrowRight className="w-3 h-3 text-slate-600" />}
                        {event.to && <span className="text-slate-300">{event.to.name}</span>}
                        {!event.from && event.to && <span className="text-slate-300">→ {event.to.name}</span>}
                      </div>
                    )}

                    {event.blockchainHash && (
                      <p className="text-[10px] text-slate-600 font-mono mt-1 break-all">
                        🔗 {event.blockchainHash.slice(0, 20)}... ({event.blockchainStatus})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Checks */}
        {data.checks && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verification Checks
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(data.checks).map(([key, val]) => (
                <div key={key} className="bg-slate-950/60 p-2.5 rounded-lg flex justify-between items-center border border-slate-800">
                  <span className="capitalize text-slate-400">{key}:</span>
                  <span className={val === 'PASS' ? 'text-emerald-400 font-bold' : val === 'FAIL' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings List */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-800 p-4 rounded-xl text-amber-300 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1 text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4" /> Warnings Detected:
            </span>
            {data.warnings.map((w, idx) => (
              <p key={idx}>• {w}</p>
            ))}
          </div>
        )}

        {/* Scan Another */}
        <div className="text-center pt-2 pb-8 space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-6 rounded-xl text-sm transition border border-slate-700"
          >
            <QrCode className="w-4 h-4" /> Scan Another QR Code
          </Link>
        </div>
      </div>
    </div>
  );
}
