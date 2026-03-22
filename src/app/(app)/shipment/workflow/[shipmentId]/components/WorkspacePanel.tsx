"use client";

import { useState, useRef, useEffect } from "react";
import { Send, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { useShipment } from "./ShipmentContext";

const STEP_TIMELINE = [
  { step: 1, name: "Classification" },
  { step: 2, name: "Duties" },
  { step: 3, name: "Origin" },
  { step: 4, name: "Supplier Dec" },
  { step: 5, name: "Sanctions" },
  { step: 6, name: "CDS" },
  { step: 7, name: "Bundle" },
];

const DOC_ACCESS = [
  { doc: "Commercial Invoice", exporter: "Full", importer: "Full", forwarder: "Full" },
  { doc: "MTC", exporter: "Full", importer: "View", forwarder: "View" },
  { doc: "Statement of Origin", exporter: "Edit", importer: "View", forwarder: "View" },
  { doc: "CDS MRN", exporter: "View", importer: "View", forwarder: "Full" },
  { doc: "CBAM Sheet", exporter: "Full", importer: "Full", forwarder: "—" },
  { doc: "Clearance Cert", exporter: "Full", importer: "Full", forwarder: "Full" },
];

function AccessBadge({ level }: { level: string }) {
  if (level === "Full" || level === "Edit")
    return <span className="text-[#34d399] font-mono text-[10px]">{level}</span>;
  if (level === "View")
    return <span className="text-[#5BA3D9] font-mono text-[10px]">View</span>;
  return <span className="text-[#8BA3C1] font-mono text-[10px]">—</span>;
}

export function WorkspacePanel() {
  const { shipmentId, participants, messages, currentStep, stepStatuses, sendMessage } =
    useShipment();
  const [msg, setMsg] = useState("");
  const [showDocs, setShowDocs] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!msg.trim()) return;
    sendMessage(msg.trim());
    setMsg("");
  };

  const onlineCount = participants.filter((p) => p.online).length;

  return (
    <div className="w-60 flex-shrink-0 bg-[#0D1F3C] border-l border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.08)]">
        <p className="font-mono text-[10px] font-bold text-[#F8F6F0] uppercase tracking-widest">
          WORKSPACE
        </p>
        <p className="font-mono text-[10px] text-[#8BA3C1] mt-0.5">{shipmentId}</p>
        <p className="font-mono text-[10px] text-[#5BA3D9] mt-0.5">{onlineCount} participants active</p>
      </div>

      {/* Participants */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
        <p className="font-mono text-[9px] text-[#8BA3C1] uppercase tracking-widest mb-2">
          Participants
        </p>
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(24,95,165,0.3)] border border-[rgba(91,163,217,0.3)] flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-[9px] font-bold text-[#5BA3D9]">{p.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-[#F8F6F0] truncate leading-tight">{p.name}</p>
                <p className="font-mono text-[9px] text-[#8BA3C1] truncate leading-tight">{p.role}</p>
              </div>
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  p.online ? "bg-[#34d399]" : "bg-[#8BA3C1]"
                }`}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#5BA3D9] hover:text-[#F8F6F0] transition-colors"
        >
          <UserPlus size={11} />
          + Invite participant
        </button>
        {showInvite && (
          <div className="mt-2 space-y-1.5">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@company.com"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded px-2 py-1.5 font-mono text-[10px] text-[#F8F6F0] focus:border-[#5BA3D9] focus:outline-none"
            />
            <button className="w-full py-1.5 rounded bg-[#185FA5] text-white font-mono text-[10px] font-bold hover:opacity-90 transition-opacity">
              Send Invite
            </button>
          </div>
        )}
      </div>

      {/* Document access (collapsible) */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="flex items-center justify-between w-full"
        >
          <p className="font-mono text-[9px] text-[#8BA3C1] uppercase tracking-widest">
            Doc Access
          </p>
          {showDocs ? (
            <ChevronUp size={11} className="text-[#8BA3C1]" />
          ) : (
            <ChevronDown size={11} className="text-[#8BA3C1]" />
          )}
        </button>
        {showDocs && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr>
                  <th className="text-left font-mono text-[#8BA3C1] pb-1 pr-1">Doc</th>
                  <th className="font-mono text-[#8BA3C1] pb-1 px-1">Ex.</th>
                  <th className="font-mono text-[#8BA3C1] pb-1 px-1">Im.</th>
                  <th className="font-mono text-[#8BA3C1] pb-1 pl-1">Fr.</th>
                </tr>
              </thead>
              <tbody>
                {DOC_ACCESS.map((row) => (
                  <tr key={row.doc} className="border-t border-[rgba(255,255,255,0.04)]">
                    <td className="font-mono text-[#F8F6F0] py-1 pr-1 leading-tight">{row.doc}</td>
                    <td className="text-center px-1"><AccessBadge level={row.exporter} /></td>
                    <td className="text-center px-1"><AccessBadge level={row.importer} /></td>
                    <td className="text-center pl-1"><AccessBadge level={row.forwarder} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step timeline */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
        <p className="font-mono text-[9px] text-[#8BA3C1] uppercase tracking-widest mb-2">
          Timeline
        </p>
        <div className="space-y-1">
          {STEP_TIMELINE.map((s) => {
            const status = stepStatuses[s.step];
            return (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    status === "complete"
                      ? "bg-[#34d399]"
                      : status === "active"
                      ? "bg-[#5BA3D9] animate-pulse"
                      : status === "blocked"
                      ? "bg-[#f87171]"
                      : "bg-[rgba(139,163,193,0.25)]"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] flex-1 ${
                    status === "active" ? "text-[#F8F6F0] font-bold" : "text-[#8BA3C1]"
                  }`}
                >
                  {s.name}
                </span>
                {status === "active" && (
                  <span className="font-mono text-[9px] text-[#5BA3D9]">In progress…</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2.5 rounded-lg text-[10px] ${
              m.isYou
                ? "bg-[rgba(24,95,165,0.2)] border border-[rgba(91,163,217,0.2)] ml-2"
                : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"
            }`}
          >
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-mono font-bold text-[#F8F6F0]">{m.sender}</span>
              <span className="font-mono text-[#8BA3C1]">·</span>
              <span className="font-mono text-[#8BA3C1]">{m.time}</span>
            </div>
            <p className="font-mono text-[#F8F6F0] leading-relaxed">{m.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded px-2.5 py-1.5 font-mono text-[10px] text-[#F8F6F0] placeholder-[#8BA3C1] focus:border-[#5BA3D9] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!msg.trim()}
            className="px-2.5 py-1.5 rounded bg-[#185FA5] text-white hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
