"use client";
import { createContext, useContext, useState, useMemo } from "react";

const UserContext = createContext();

function calculateInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts.map(part => part[0].toUpperCase()).join("");
  } else if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "";
}

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    species: "",
    avatar: "",
    name: "",
  });

  const initials = useMemo(() => calculateInitials(userData.name), [userData.name]);

  return (
    <UserContext.Provider value={{ userData: { ...userData, initials }, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}