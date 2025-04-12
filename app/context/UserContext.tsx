"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  email: string;
  setEmail: (email: string) => void;
}

const UserContext = createContext<UserContextType>({
  email: "",
  setEmail: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmailState] = useState("");

  // On mount, try reading from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmailState(storedEmail);
    }
  }, []);

  function setEmail(newEmail: string) {
    setEmailState(newEmail);
    // Also sync with localStorage
    localStorage.setItem("userEmail", newEmail);
  }

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to access the context
export function useUserContext() {
  return useContext(UserContext);
}
