"use client";
import { useState } from "react";
import content from "@/assets/content.json";
import LiquidGlass from "../liquid glass/LiquidGlass";
import Link from "next/link";
import { IoMenu, IoBookOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { LuSlack } from "react-icons/lu";
import Settings from "./content/Settings";
import { IoIosClose } from "react-icons/io";

function HeaderMobile({
  activeBE,
  setActiveBE,
  errorMsg,
  setErrorMsg,
  setNotify,
}) {
  const [showSettings, setShowSettings] = useState(false); // controla visibilidade do Settings
  const header = Object.values(content.header.mobiletitles);

  const iconsMap = {
    Home: [LuSlack, "Home"],
    Profile: [FaRegUser, "Profile"],
    Proposals: [IoBookOutline, "Proposals"],
  };

  return (
    <div className="z-9000 fixed bottom-2 left-1/2 transform -translate-x-1/2 lg:hidden">
      <LiquidGlass className="flex items-center justify-center px-4 border-[1px] border-white py-3 rounded-[33px]">
        <ul className="flex items-center justify-center gap-5">
          <li>
            <img className="min-w-13 w-13" src="./supernova.png" alt="logo" />
          </li>
          {header.map((item, index) => {
            const IconComponent = iconsMap[item]?.[0];
            const label = iconsMap[item]?.[1];

            return (
              <li
                className="cursor-pointer rounded-[20px] w-13 h-13 bgGray transform transition-transform duration-300 hover:scale-105 flex flex-col items-center justify-center"
                key={index}
              >
                <Link
                  href={`/${item.toLowerCase()}`}
                  className="flex flex-col items-center justify-center font-semibold text-[0.6em] text-[var(--text-gray)]"
                >
                  {IconComponent && (
                    <IconComponent className="text-[var(--text-black)] text-2xl [filter:drop-shadow(0_0_3px_var(--blue))]" />
                  )}
                  {label && <span className="text-[var(--text-black)] text-[0.5em]">{label}</span>}{" "}
        
                </Link>
              </li>
            );
          })}
          <li className="cursor-pointer hover:scale-105 rounded-[20px] w-13 h-13 flex items-center bgGray justify-center">
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
          </li>
        </ul>
      </LiquidGlass>

      {/* Settings visível apenas se showSettings for true */}
      {showSettings && (
        <div className="absolute right-0 bottom-full mb-2 z-120 w-full flex justify-center">
          <Settings
            setNotify={setNotify}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            setActiveBE={setActiveBE}
            activeBE={activeBE}
          />
        </div>
      )}
    </div>
  );
}

export default HeaderMobile;
