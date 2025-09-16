"use client";

import ProposalWrapper from "@/content/proposal/ProposalWrapper";

export default function Page() {
  // Aqui precisas de receber activeBE/setActiveBE do layout via Context
  // ou mover o estado para cá. O mais limpo é usar Context API:

  return <ProposalWrapper />; 
}