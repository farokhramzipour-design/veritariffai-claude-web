"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type StepStatus = "complete" | "active" | "pending" | "blocked";

export interface WorkspaceMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
  isYou?: boolean;
}

export interface WorkspaceParticipant {
  initials: string;
  name: string;
  role: string;
  online: boolean;
  isYou?: boolean;
}

export interface ShipmentContextValue {
  shipmentId: string;
  corridor: string;
  hsCode: string;
  commodity: string;
  weight: string;
  currentStep: number;
  stepStatuses: Record<number, StepStatus>;
  hardBlock: boolean;
  hardBlockReason: string;
  participants: WorkspaceParticipant[];
  messages: WorkspaceMessage[];
  setCurrentStep: (step: number) => void;
  setStepStatus: (step: number, status: StepStatus) => void;
  triggerHardBlock: (reason: string) => void;
  clearHardBlock: () => void;
  sendMessage: (text: string) => void;
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null);

export function useShipment() {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipment must be used within ShipmentProvider");
  return ctx;
}

const STEP_TIMES: Record<number, string> = {
  1: "~2 min",
  2: "~3 min",
  3: "~5 min",
  4: "~3 min",
  5: "~1 min",
  6: "~4 min",
  7: "~instant",
};

export { STEP_TIMES };

const WORKFLOW_SEED_KEY = "veritariff_workflow_seed";

interface Props {
  shipmentId: string;
  children: React.ReactNode;
}

export function ShipmentProvider({ shipmentId, children }: Props) {
  const [corridor, setCorridor] = useState("UK → Germany");
  const [hsCode, setHsCode] = useState("7224 90 02 89");
  const [commodity, setCommodity] = useState("42CrMo4 Alloy Steel Billets");
  const [weight, setWeight] = useState("500t");
  const [currentStep, setCurrentStepState] = useState(1);
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepStatus>>({
    1: "active",
    2: "pending",
    3: "pending",
    4: "pending",
    5: "pending",
    6: "pending",
    7: "pending",
  });
  const [hardBlock, setHardBlock] = useState(false);
  const [hardBlockReason, setHardBlockReason] = useState("");
  const [messages, setMessages] = useState<WorkspaceMessage[]>([
    {
      id: "1",
      sender: "Klaus Meier",
      role: "Importer (DE)",
      text: "Do you have the CBAM verifier accreditation number for the MTC?",
      time: "09:22",
    },
    {
      id: "2",
      sender: "You",
      role: "Exporter",
      text: "Yes — TÜV SÜD DE-V-AKK-2024-0081",
      time: "09:35",
      isYou: true,
    },
  ]);

  const participants: WorkspaceParticipant[] = [
    { initials: "H", name: "Hasti (You)", role: "Exporter", online: true, isYou: true },
    { initials: "KM", name: "Klaus Meier", role: "Importer (DE)", online: true },
    { initials: "MF", name: "Meridian Freight", role: "Forwarder", online: false },
  ];

  const setCurrentStep = useCallback((step: number) => {
    setCurrentStepState(step);
    setStepStatuses((prev) => {
      const next = { ...prev };
      for (let i = 1; i <= 7; i++) {
        if (i < step && next[i] !== "blocked") next[i] = "complete";
        else if (i === step) next[i] = "active";
        else if (next[i] !== "blocked") next[i] = "pending";
      }
      return next;
    });
  }, []);

  const setStepStatus = useCallback((step: number, status: StepStatus) => {
    setStepStatuses((prev) => ({ ...prev, [step]: status }));
  }, []);

  const triggerHardBlock = useCallback((reason: string) => {
    setHardBlock(true);
    setHardBlockReason(reason);
  }, []);

  const clearHardBlock = useCallback(() => {
    setHardBlock(false);
    setHardBlockReason("");
  }, []);

  const sendMessage = useCallback((text: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "You", role: "Exporter", text, time, isYou: true },
    ]);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WORKFLOW_SEED_KEY);
      if (!raw) return;
      sessionStorage.removeItem(WORKFLOW_SEED_KEY);
      const seed = JSON.parse(raw) as Partial<Record<"corridor" | "hsCode" | "commodity" | "weight", unknown>>;
      if (typeof seed.corridor === "string" && seed.corridor.trim()) setCorridor(seed.corridor);
      if (typeof seed.hsCode === "string" && seed.hsCode.trim()) setHsCode(seed.hsCode);
      if (typeof seed.commodity === "string" && seed.commodity.trim()) setCommodity(seed.commodity);
      if (typeof seed.weight === "string" && seed.weight.trim()) setWeight(seed.weight);
    } catch {}
  }, []);

  return (
    <ShipmentContext.Provider
      value={{
        shipmentId,
        corridor,
        hsCode,
        commodity,
        weight,
        currentStep,
        stepStatuses,
        hardBlock,
        hardBlockReason,
        participants,
        messages,
        setCurrentStep,
        setStepStatus,
        triggerHardBlock,
        clearHardBlock,
        sendMessage,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}
