import React, { useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  getBlockchainStatus,
  getLedgerTransactions,
  getTxDetails,
  getBatchTrail,
} from '../../api/system';
import { getVerificationHistory } from '../../api/verify';
import StatusBadge from '../../components/StatusBadge';
import {
  Database, Search, Loader2, Boxes, ArrowRight, Factory, Truck, Hospital,
  User, CheckCircle2, AlertTriangle, Hash, Activity, Link2, ShieldCheck,
  ShieldX, ListOrdered, ScrollText,
} from 'lucide-react';

const STATUS_FILTERS = ['', 'CONFIRMED', 'PENDING', 'FAILED'];

export default function BlockchainHistory() {
  const { data: status, loading: statusLoading, execute: refreshStatus } = useApi(getBlockchainStatus);
  const { data: txs, loading: txLoading, execute: refreshTxs } = useApi(() => getLedgerTransactions({ limit: 100 }));

  const [serial, setSerial] = useState('');
  const [flow, setFlow] = useState(null);
  const [flowBusy, setFlowBusy] = useState(false);
  const [flowError, setFlowError] = useState('');
  const [verified, setVerified] = useState({}); // hash -> on-chain details
  const [verifying, setVerifying] = useState(null);
  const [expandedHash, setExpandedHash] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // ── Batch audit trail state ────────────────────────────────────
  const [batchNumber, setBatchNumber] = useState('');
  const [batchTrail, setBatchTrail] = useState(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchError, setBatchError] = useState('');

  const rows = txs || [];

  async function lookupBatch(value) {
    const target = (value || batchNumber || '').trim();
    if (!target) return;
    setBatchNumber(target);
    setBatchBusy(true);
    setBatchError('');
    setBatchTrail(null);
    try {
      setBatchTrail(await getBatchTrail(target));
    } catch (err) {
      setBatchError(err.response?.data?.error?.message || err.message);
    } finally {
      setBatchBusy(false);
    }
  }

  const counts = useMemo(() => {
    const list = txs || [];
    return {
      fromManufacturer: list.filter((t) => t.transaction_type === 'RECEIVE' && !t.from_type).length,
      intoDistributor: list.filter((t) => t.to_type === 'DISTRIBUTOR').length,
      distributorOut: list.filter((t) => t.from_type === 'DISTRIBUTOR' && t.to_type === 'PHARMACY').length,
      intoPharmacy: list.filter((t) => t.to_type === 'PHARMACY').length,
      dispensed: list.filter((t) => t.transaction_type === 'DISPENSE').length,
      blocked: list.filter((t) => t.transaction_type === 'BLOCK').length,
      confirmed: list.filter((t) => t.blockchain_status === 'CONFIRMED').length,
      pending: list.filter((t) => t.blockchain_status === 'PENDING').length,
      failed: list.filter((t) => t.blockchain_status === 'FAILED').length,
    };
  }, [txs]);

  const stages = [
    { key: 'mfr', label: 'Manufacturer', hint: 'registers batch & ships', icon: Factory, color: 'text-sky-400 bg-sky-500/10', stat: `${counts.fromManufacturer} shipped` },
    { key: 'dist', label: 'Distributor', hint: 'receives & dispatches', icon: Truck, color: 'text-emerald-400 bg-emerald-500/10', stat: `${counts.intoDistributor} in · ${counts.distributorOut} out` },
    { key: 'pharm', label: 'Pharmacy', hint: 'receives & dispenses', icon: Hospital, color: 'text-purple-400 bg-purple-500/10', stat: `${counts.intoPharmacy} in` },
    { key: 'patient', label: 'Patient', hint: 'scans QR to verify', icon: User, color: 'text-amber-400 bg-amber-500/10', stat: `${counts.dispensed} dispensed` },
  ];

  const hops = [
    { label: 'RECEIVE', value: counts.fromManufacturer },
    { label: 'TRANSFER', value: counts.distributorOut },
    { label: 'DISPENSE', value: counts.dispensed },
  ];

  const filteredRows = statusFilter ? rows.filter((r) => r.blockchain_status === statusFilter) : rows;

  async function lookupFlow(value) {
    const target = (value || serial || '').trim();
    if (!target) return;
    setSerial(target);
    setFlowBusy(true);
    setFlowError('');
    setFlow(null);
    try {
      const data = await getVerificationHistory(target);
      if (!data.exists) {
        setFlowError(`Serial ${target} is not registered in the ledger.`);
      } else {
        setFlow(data);
      }
    } catch (err) {
      setFlowError(err.response?.data?.error?.message || err.message);
    } finally {
      setFlowBusy(false);
    }
  }

  async function verifyHash(hash) {
    if (!hash) return;
    if (verified[hash]) {
      setExpandedHash(expandedHash === hash ? null : hash);
      return;
    }
    setVerifying(hash);
    try {
      const details = await getTxDetails(hash);
      setVerified((prev) => ({ ...prev, [hash]: details }));
      setExpandedHash(hash);
    } catch (err) {
      setVerified((prev) => ({
        ...prev,
        [hash]: { hash, found: false, note: err.response?.data?.error?.message || err.message },
      }));
      setExpandedHash(hash);
    } finally {
      setVerifying(null);
    }
  }

  function HashChip({ hash, status: txStatus }) {
    if (!hash) {
      return (
        <span className="text-[11px] font-mono text-slate-600" title="The chain was unreachable when this row was written — Postgres still recorded the move.">
          no tx hash
        </span>
      );
    }
    return (
      <button
        onClick={() => verifyHash(hash)}
        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-emerald-400 transition max-w-[220px]"
        title="Verify this write on-chain"
      >
        {verifying === hash ? <Loader2 className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
        <span className="truncate">{hash.slice(0, 14)}…</span>
      </button>
    );
  }

  function TxDetails({ hash, blockClass = '' }) {
    const details = verified[hash];
    if (!details || expandedHash !== hash) return null;
    return (
      <div className={`bg-slate-950 border border-emerald-500/30 rounded-lg p-3 text-[11px] font-mono text-slate-300 ${blockClass}`}>
        {details.found ? (
          <div className="grid sm:grid-cols-3 gap-2">
            <span>Block: <b className="text-emerald-400">#{details.blockNumber}</b></span>
            <span>Confirmations: <b className="text-emerald-400">{details.confirmations}</b></span>
            <span>Result: <b className={details.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{details.status}</b></span>
            <span>Gas used: <b>{details.gasUsed}</b></span>
            <span className="col-span-2">Sender: <b className="break-all">{details.from}</b></span>
          </div>
        ) : (
          <p className="text-amber-400">⚠ {details.note}</p>
        )}
      </div>
    );
  }

  function EventRow({ ev }) {
    return (
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 mb-1.5 text-[11px]">
        <span className="font-bold text-emerald-300">{ev.eventType}</span>
        <span className="text-slate-500 font-mono truncate max-w-[200px]" title={ev.context}>{ev.context}</span>
        <span className="text-slate-600 font-mono ml-auto">
          {ev.timestamp ? new Date(ev.timestamp).toLocaleString('en-IN') : ''}
        </span>
        <span className="text-slate-600 font-mono truncate max-w-[120px]" title={ev.actor}>
          {ev.actor ? `${ev.actor.slice(0, 10)}…` : ''}
        </span>
      </div>
    );
  }

  const custodySteps = flow?.timeline || [];
  const chainSteps = flow?.onChainEvents || [];
  const stepCount = Math.max(custodySteps.length, chainSteps.length);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" /> Blockchain Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Watch a medicine move through the supply chain — every hop is written to Postgres and to the
            PharmaChain contract, and each write can be verified against the chain.
          </p>
        </div>
        <button
          onClick={() => { refreshStatus(); refreshTxs(); }}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          <Activity className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Batch audit trail ────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-emerald-400" /> Batch audit trail
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter a Batch Number to view its complete cryptographic audit trail stored on the Ethereum network —
            CDSCO verdict, every serial it minted, and each contract event backing it.
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); lookupBatch(); }}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="form-group flex-1 min-w-[240px]">
            <label>Batch number</label>
            <input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Enter a Batch Number… e.g. 011"
              className="font-mono"
            />
          </div>
          <button type="submit" disabled={batchBusy} className="btn-primary flex items-center gap-2">
            {batchBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Show audit trail
          </button>
        </form>

        {batchError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
            {batchError}
          </div>
        )}

        {batchTrail && (
          <div className="space-y-4">
            {/* CDSCO verdict banner */}
            <div
              className={`rounded-xl p-4 border ${
                batchTrail.regulatory.allowedToMove
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {batchTrail.regulatory.allowedToMove ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldX className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className={`font-bold ${batchTrail.regulatory.allowedToMove ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {batchTrail.regulatory.verdict}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {batchTrail.medicine.name} · batch <span className="font-mono">{batchTrail.batch.batchNumber}</span>{' '}
                    · status <b className="text-white">{batchTrail.regulatory.status}</b>
                    {batchTrail.regulatory.authority && <> · authority {batchTrail.regulatory.authority}</>}
                    {batchTrail.regulatory.referenceNumber && (
                      <> · ref <span className="font-mono">{batchTrail.regulatory.referenceNumber}</span></>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {batchTrail.regulatory.allowedToMove
                      ? 'Receive / transfer / dispense are permitted for serials in this batch.'
                      : 'Receive and transfer are refused for every serial in this batch (CDSCO gate enforced in distributor & pharmacy).'}
                    {' '}Expires {new Date(batchTrail.batch.expiryDate).toLocaleDateString('en-IN')}.
                  </p>
                </div>
              </div>
            </div>

            {/* summary chips */}
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              {[
                ['Serials', batchTrail.summary.totalSerials],
                ['In stock', batchTrail.summary.inStock],
                ['In transit', batchTrail.summary.inTransit],
                ['Dispensed', batchTrail.summary.dispensed],
                ['Transactions', batchTrail.summary.transactions],
                ['On-chain confirmed', batchTrail.summary.confirmed],
                ['Contract events', batchTrail.summary.contractEvents],
              ].map(([label, value]) => (
                <span key={label} className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400">
                  {label}: <b className="text-emerald-400">{value}</b>
                </span>
              ))}
            </div>

            {/* every serial in the batch */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Serial numbers ({batchTrail.serials.length}
                  {batchTrail.summary.totalSerials > batchTrail.serials.length
                    ? ` of ${batchTrail.summary.totalSerials}`
                    : ''})
                </h4>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Serial</th><th>Status</th><th>Owner</th><th>Txs</th><th>Last transaction</th></tr>
                  </thead>
                  <tbody>
                    {batchTrail.serials.map((s) => (
                      <tr key={s.id}>
                        <td className="font-mono text-emerald-400">{s.serial_number}</td>
                        <td><StatusBadge status={s.status} /></td>
                        <td className="text-slate-400 text-xs">{s.owner_name || '—'}</td>
                        <td className="text-slate-400">{Number(s.tx_count)}</td>
                        <td>
                          <HashChip hash={s.last_tx_hash} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* contract events */}
            <div className="bg-slate-950 border border-emerald-500/20 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  PharmaChain contract events
                </h4>
                <span className="ml-auto text-[10px] font-mono text-slate-500 truncate max-w-[280px]"
                  title={batchTrail.chain.contractAddress}>
                  {batchTrail.chain.contractAddress}
                </span>
              </div>
              {!batchTrail.chain.available ? (
                <p className="p-4 text-xs text-amber-400">Chain unreachable — showing the Postgres mirror only.</p>
              ) : (
                <div className="p-4 space-y-3">
                  {batchTrail.chain.batchEvents?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                        Batch-level events (BATCH#{batchTrail.batch.batchNumber})
                      </p>
                      {batchTrail.chain.batchEvents.map((ev, i) => (
                        <EventRow key={`b${i}`} ev={ev} />
                      ))}
                    </div>
                  )}
                  {Object.entries(batchTrail.chain.serialEvents || {}).map(([sn, events]) => (
                    <div key={sn}>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                        {sn} — {events.length} event(s)
                      </p>
                      {events.map((ev, i) => <EventRow key={`${sn}-${i}`} ev={ev} />)}
                    </div>
                  ))}
                  {batchTrail.summary.contractEvents === 0 && (
                    <p className="text-xs text-slate-600">
                      No events written for this batch yet — they appear as serials move.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* batch transactions with hash → chain verify */}
            {batchTrail.transactions.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ledger transactions for this batch ({batchTrail.transactions.length})
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr><th>Type</th><th>Serial</th><th>Route</th><th>Chain</th><th>Transaction</th><th>When</th></tr>
                    </thead>
                    <tbody>
                      {batchTrail.transactions.map((tx) => (
                        <React.Fragment key={tx.id}>
                          <tr>
                            <td><StatusBadge status={tx.transaction_type} /></td>
                            <td className="font-mono text-emerald-400">{tx.serial_number || '—'}</td>
                            <td className="text-slate-400 text-xs">
                              {tx.from_name || (tx.transaction_type === 'RECEIVE' ? 'Manufacturer' : '—')}
                              {' → '}
                              {tx.to_name || (tx.transaction_type === 'DISPENSE' ? 'Patient' : '—')}
                            </td>
                            <td><StatusBadge status={tx.blockchain_status} /></td>
                            <td><HashChip hash={tx.blockchain_transaction_hash || tx.blockchain_tx_hash} /></td>
                            <td className="text-[11px] text-slate-500">
                              {new Date(tx.timestamp).toLocaleString('en-IN')}
                            </td>
                          </tr>
                          {(tx.blockchain_transaction_hash || tx.blockchain_tx_hash) &&
                            expandedHash === (tx.blockchain_transaction_hash || tx.blockchain_tx_hash) && (
                              <tr>
                                <td colSpan={6} className="!p-3">
                                  <TxDetails hash={tx.blockchain_transaction_hash || tx.blockchain_tx_hash} />
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Status cards ───────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Node</p>
          <p className="mt-2 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status?.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="font-semibold text-white">
              {statusLoading ? '…' : status?.available ? 'Connected' : 'Offline'}
            </span>
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{status?.rpcUrl}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Contract</p>
          <p className="text-sm font-mono text-emerald-400 mt-2 break-all">{status?.contractAddress || 'not configured'}</p>
          <p className="text-[11px] text-slate-500 mt-1">Events recorded on-chain: {status?.totalEvents ?? '—'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Ledger writes</p>
          <p className="text-2xl font-extrabold text-white mt-2">{rows.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-400">{counts.confirmed} confirmed</span>
            {' · '}
            <span className="text-amber-400">{counts.pending} pending</span>
            {' · '}
            <span className="text-rose-400">{counts.failed} failed</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">On-chain ratio</p>
          <p className="text-2xl font-extrabold text-white mt-2">
            {rows.length ? Math.round((counts.confirmed / rows.length) * 100) : 0}%
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${rows.length ? (counts.confirmed / rows.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Network flow ───────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Supply chain flow
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          How stock transmits through the network (counts from the ledger below).
        </p>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className={`w-9 h-9 rounded-lg ${stage.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <p className="font-bold text-white text-sm">{stage.label}</p>
                  <p className="text-[11px] text-slate-500">{stage.hint}</p>
                  <p className="text-xs font-mono text-emerald-400 mt-2">{stage.stat}</p>
                </div>
                {i < stages.length - 1 && (
                  <div className="flex lg:flex-col items-center justify-center gap-1 px-2 text-center">
                    <ArrowRight className="w-5 h-5 text-slate-600 hidden lg:block" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                      {hops[i].label}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">{hops[i].value}</span>
                    <ArrowRight className="w-5 h-5 text-slate-600 lg:hidden rotate-90" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Serial transmission flow ───────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Transmission flow of a serial
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Left: custody hops recorded in Postgres (who sent it to whom). Right: the same events as
            written by the smart contract.
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); lookupFlow(); }}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="form-group flex-1 min-w-[240px]">
            <label>Serial number</label>
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="SN200954"
              className="font-mono"
            />
          </div>
          <button type="submit" disabled={flowBusy} className="btn-primary flex items-center gap-2">
            {flowBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Show flow
          </button>
        </form>

        {flowError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
            {flowError}
          </div>
        )}

        {flow && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-white">{flow.serialNumber}</span>
              <StatusBadge status={flow.onChainAvailable ? 'CONFIRMED' : 'SKIPPED'} />
              <span className="text-slate-500">
                {flow.onChainAvailable
                  ? `${chainSteps.length} event(s) read from the contract`
                  : 'contract unreachable — showing the Postgres mirror'}
              </span>
            </div>

            {stepCount === 0 && (
              <p className="text-slate-500 text-sm">No custody events recorded for this serial yet.</p>
            )}

            {Array.from({ length: stepCount }).map((_, i) => {
              const hop = custodySteps[i];
              const chainEvent = chainSteps[i];
              const prevHop = i > 0 ? custodySteps[i - 1] : null;
              // A RECEIVE row has no sender (the pack was unowned in transit),
              // so the real sender is whoever dispatched it in the hop before.
              const sender =
                hop?.type === 'DISPENSED_TO_PATIENT'
                  ? hop.pharmacy || 'Pharmacy'
                  : hop?.from?.name ||
                    (prevHop && prevHop.type === 'TRANSFER' ? prevHop.from?.name : null) ||
                    'Manufacturer';
              const receiver =
                hop?.type === 'DISPENSED_TO_PATIENT' ? 'Patient' : hop?.to?.name || '—';
              return (
                <div key={i} className="grid lg:grid-cols-2 gap-3">
                  {/* custody track */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">Postgres · custody</span>
                      {hop ? <StatusBadge status={hop.type} /> : <span className="text-[10px] text-slate-600">—</span>}
                    </div>
                    {hop ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <span className="text-white font-medium">{sender}</span>
                          <ArrowRight className="w-4 h-4 text-slate-600" />
                          <span className="text-white font-medium">{receiver}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-[11px] text-slate-500">
                            {new Date(hop.timestamp).toLocaleString('en-IN')}
                          </span>
                          <StatusBadge status={hop.blockchainStatus || 'SKIPPED'} />
                        </div>
                        <HashChip hash={hop.blockchainHash} status={hop.blockchainStatus} />
                        <TxDetails hash={hop.blockchainHash} />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 mt-3">No Postgres row for this step.</p>
                    )}
                  </div>

                  {/* chain track */}
                  <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        Contract · blockchain
                      </span>
                      {chainEvent ? <StatusBadge status="CONFIRMED" /> : <span className="text-[10px] text-slate-600">—</span>}
                    </div>
                    {chainEvent ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-bold text-emerald-300">{chainEvent.eventType}</p>
                        <p className="text-xs text-slate-400 font-mono">{chainEvent.context}</p>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-[11px] text-slate-500">
                            {new Date(chainEvent.timestamp).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 truncate max-w-[180px]"
                            title={chainEvent.actor}>
                            {chainEvent.actor?.slice(0, 12)}…
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 mt-3">
                        No contract event for this step (chain was down when it happened).
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Ledger table ───────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center gap-3">
          <Boxes className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Ledger transactions
          </h3>
          <div className="ml-auto flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f || 'all'}
                onClick={() => setStatusFilter(f)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                  statusFilter === f
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {f || 'All'}
              </button>
            ))}
          </div>
        </div>

        {txLoading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading transactions…</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No transactions in this view.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th><th>Serial</th><th>Medicine</th><th>Route</th>
                  <th>Status</th><th>Transaction</th><th>When</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr>
                      <td><StatusBadge status={tx.transaction_type} /></td>
                      <td>
                        <button
                          onClick={() => lookupFlow(tx.serial_number)}
                          disabled={!tx.serial_number}
                          className="font-mono text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 disabled:no-underline underline"
                          title="Show the transmission flow of this serial"
                        >
                          {tx.serial_number || '—'}
                        </button>
                      </td>
                      <td className="text-white">
                        {tx.medicine_name}
                        <span className="block text-[11px] text-slate-500">batch {tx.batch_number}</span>
                      </td>
                      <td className="text-slate-400 text-xs">
                        {tx.from_name || (tx.transaction_type === 'RECEIVE' ? 'Manufacturer' : '—')}
                        {' → '}
                        {tx.to_name || (tx.transaction_type === 'DISPENSE' ? 'Patient' : '—')}
                      </td>
                      <td><StatusBadge status={tx.blockchain_status} /></td>
                      <td>
                        <HashChip hash={tx.blockchain_transaction_hash || tx.blockchain_tx_hash} status={tx.blockchain_status} />
                      </td>
                      <td className="text-[11px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {(tx.blockchain_transaction_hash || tx.blockchain_tx_hash) &&
                      expandedHash === (tx.blockchain_transaction_hash || tx.blockchain_tx_hash) && (
                        <tr>
                          <td colSpan={7} className="!p-3">
                            <TxDetails hash={tx.blockchain_transaction_hash || tx.blockchain_tx_hash} />
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-4 border-t border-slate-800 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> CONFIRMED — mined on-chain, click the hash to see block &amp; confirmations
          </span>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> PENDING / FAILED — the chain was unreachable at write time; Postgres still holds the move as source of truth
          </span>
        </div>
      </div>
    </div>
  );
}
