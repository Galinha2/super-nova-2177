"use client";
import { createContext, useContext, useState } from "react";

const ActiveBEContext = createContext();

export function ActiveBEProvider({ children }) {
  const [activeBE, setActiveBE] = useState(false);

  return (
    <ActiveBEContext.Provider value={{ activeBE, setActiveBE }}>
      {children}
    </ActiveBEContext.Provider>
  );
}

export function useActiveBE() {
  return useContext(ActiveBEContext);
}