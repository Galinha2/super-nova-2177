"use client";
import Proposal from "@/content/proposal/Proposal";
import { useActiveBE } from "@/content/ActiveBEContext";

export default function ProposalWrapper() {
  const { activeBE, setActiveBE } = useActiveBE();

  return <Proposal activeBE={activeBE} setActiveBE={setActiveBE} />;
}