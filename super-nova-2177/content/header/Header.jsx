"use client";
import { useState } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass";
import Link from "next/link";
import { IoMenu } from "react-icons/io5";
import Settings from "./content/Settings";
import content from "@/assets/content.json";
import { IoIosClose } from "react-icons/io";

function Header() {
  const [showSettings, setShowSettings] = useState(false); // Estado para controlar visibilidade
  const header = Object.values(content.header.titles);

  return (
    <div className="z-100 hidden lg:block fixed top-5 left-1/2 transform -translate-x-1/2">
      <LiquidGlass className="flex items-center justify-center px-4 border-[1px] border-white py-3 rounded-[33px]">
        <ul className="flex items-center justify-center gap-5 rounded-full">
          <li>
            <img className="min-w-13 w-13" src="./supernova.png" alt="logo" />
          </li>
          {header.map((item, index) => (
            <li key={index} className="rounded-full">
              <LiquidGlass className="p-2 cursor-pointer rounded-[30px] px-8 py-2 border-[1px] border-white transform transition-transform duration-300 hover:scale-105">
                <Link
                  href={`/${item.toLowerCase()}`}
                  className="cursor-pointer flex items-center justify-center font-semibold text-[0.6em] text-[var(--text-gray)]"
                >
                  {item}
                </Link>
              </LiquidGlass>
            </li>
          ))}
          <LiquidGlass className="cursor-pointer hover:scale-105 rounded-full p-2">
            {showSettings ? (
              <IoIosClose
                className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]"
                onClick={() => setShowSettings(!showSettings)}
              />
            ) : (
              <IoMenu
                onClick={() => setShowSettings(!showSettings)}
                className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]"
              />
            )}
          </LiquidGlass>
        </ul>
      </LiquidGlass>

      {showSettings ? (
        <div className="absolute z-120 mt-2">
          <Settings />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Header;
