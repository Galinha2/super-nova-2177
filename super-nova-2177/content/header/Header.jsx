"use client";
import { useState } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass";
import Link from "next/link";
import { IoMdMenu, IoIosClose } from "react-icons/io";
import Settings from "./content/Settings";
import content from "@/assets/content.json";

function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const menuItems = Object.values(content.header.titles);

  const ToggleIcon = () =>
    showSettings ? (
      <IoIosClose
        className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]"
        onClick={() => setShowSettings(false)}
      />
    ) : (
      <IoMdMenu
        className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]"
        onClick={() => setShowSettings(true)}
      />
    );

  return (
    <div className="z-300 hidden lg:block fixed top-5 left-1/2 transform -translate-x-1/2">
      <LiquidGlass className="flex items-center justify-center px-4 py-3 rounded-[33px]">
        <ul className="flex items-center justify-center gap-5 rounded-full">
          <li>
            <img className="min-w-13 w-13" src="./supernova.png" alt="logo" />
          </li>
          {menuItems.map((item, index) => (
            <li key={index} className="rounded-full p-2 cursor-pointer px-8 py-2 transform transition-transform bgGray duration-300 hover:scale-105">
 
                <Link
                  href={`/${item.toLowerCase()}`}
                  className="cursor-pointer flex items-center justify-center font-semibold text-[0.6em] text-[var(--text-black)]"
                >
                  {item}
                </Link>
        
            </li>
          ))}
          <div className="cursor-pointer bgGray hover:scale-105 rounded-full p-2">
            <ToggleIcon />
          </div>
        </ul>
      </LiquidGlass>

      {showSettings && (
  <div className="absolute z-2290 mt-2 right-[-160px] flex justify-end w-full">
    <Settings />
  </div>
)}
    </div>
  );
}

export default Header;
