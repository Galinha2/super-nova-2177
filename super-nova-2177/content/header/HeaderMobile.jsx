"use client"
import { useState } from "react";
import content from "@/assets/content.json";
import LiquidGlass from "../liquid glass/LiquidGlass";
import Link from "next/link";
import { IoMenu, IoBookOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { LuSlack } from "react-icons/lu";
import Settings from "./content/Settings";
import { IoIosClose } from "react-icons/io";

function HeaderMobile() {
  const [showSettings, setShowSettings] = useState(false); // controla visibilidade do Settings
  const header = Object.values(content.header.mobiletitles);

  const iconsMap = {
    Home: LuSlack,
    Profile: FaRegUser,
    Proposals: IoBookOutline,
  };

  return (
    <div className="z-100 fixed bottom-5 left-1/2 transform -translate-x-1/2 lg:hidden">
      <LiquidGlass className="flex items-center justify-center px-4 border-[1px] border-white py-3 rounded-[33px]">
        <ul className="flex items-center justify-center gap-5">
          <li>
            <img className="min-w-15 w-15" src="./supernova.png" alt="logo" />
          </li>
          {header.map((item, index) => {
            const IconComponent = iconsMap[item];
            return (
              <li key={index}>
                <LiquidGlass className="cursor-pointer rounded-[20px] w-15 h-15 border-[1px] border-white transform transition-transform duration-300 hover:scale-105">
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="cursor-pointer flex items-center justify-center font-semibold text-[0.6em] text-[var(--text-gray)] gap-2"
                  >
                    {IconComponent && (
                      <IconComponent className="text-[var(--text-black)] text-4xl [filter:drop-shadow(0_0_3px_var(--blue))]" />
                    )}
                  </Link>
                </LiquidGlass>
              </li>
            );
          })}
          <li>
            <LiquidGlass className="cursor-pointer hover:scale-105 rounded-[20px] w-15 h-15 flex items-center justify-center">
              {showSettings ? (
                <IoIosClose
                  onClick={() => setShowSettings(false)}
                  className="text-[var(--pink)] text-5xl [filter:drop-shadow(0_0_7px_var(--pink))]"
                />
              ) : (
                <IoMenu
                  onClick={() => setShowSettings(true)}
                  className="text-[var(--pink)] text-5xl [filter:drop-shadow(0_0_7px_var(--pink))]"
                />
              )}
            </LiquidGlass>
          </li>
        </ul>
      </LiquidGlass>

      {/* Settings visível apenas se showSettings for true */}
      {showSettings && (
        <div className="absolute bottom-full mb-2 z-120 w-full flex justify-center">
          <Settings />
        </div>
      )}
    </div>
  );
}

export default HeaderMobile;