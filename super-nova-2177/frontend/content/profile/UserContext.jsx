"use client";
import { createContext, useState, useContext, useEffect } from "react";

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
    initials: "",
  });

  useEffect(() => {
    setUserData(prev => ({
      ...prev,
      initials: calculateInitials(prev.name)
    }));
  }, [userData.name]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}