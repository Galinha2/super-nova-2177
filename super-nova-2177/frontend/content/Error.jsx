"use client";
import { useState, useEffect } from "react";

export default function Error({ messages }) {
  const [visibleMessages, setVisibleMessages] = useState([]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setVisibleMessages(prevMessages => {
        // Adiciona novas mensagens que ainda não estão visíveis
        const newMessages = messages.filter(msg => !prevMessages.includes(msg));
        return [...prevMessages, ...newMessages];
      });
    }
  }, [messages]);

  useEffect(() => {
    if (visibleMessages.length === 0) return;

    const timers = visibleMessages.map((message) =>
      setTimeout(() => {
        setVisibleMessages((prevMessages) =>
          prevMessages.filter((msg) => msg !== message)
        );
      }, 10000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [visibleMessages]);

  if (!visibleMessages || visibleMessages.length === 0) return null;

  return (
    <>
      {visibleMessages.map((message, index) => (
        <div
          key={index}
          className="fixed z-9999 bottom-10 right-10 w-auto h-auto px-5 py-2 bg-red-500 rounded-[20px] flex items-center justify-center text-white text-[1em] font-[900]"
          style={{ bottom: `${10 + index * 50}px` }}
        >
          <p>{message}</p>
        </div>
      ))}
    </>
  );
}