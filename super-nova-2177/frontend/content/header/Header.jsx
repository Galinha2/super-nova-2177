"use client";
import { useState, useEffect } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass";
import Link from "next/link";
import { IoMdMenu, IoIosClose } from "react-icons/io";
import { LuSlack } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { IoBookOutline } from "react-icons/io5";
import Settings from "./content/Settings";
import content from "@/assets/content.json";

function Header({
  activeBE,
  setActiveBE,
  errorMsg,
  setErrorMsg,
  setNotify,
  showSettings,
  setShowSettings,
}) {
  const menuItems = Object.values(content.header.titles);
  const [openProfile, setOpenProfile] = useState(false);
  
  const iconsMap = {
    Home: LuSlack,
    Profile: FaRegUser,
    Proposals: IoBookOutline,
  };

  const ToggleIcon = () =>
    showSettings ? (
      <IoIosClose
        className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]"
        onClick={(e) => {
          e.stopPropagation();
          setShowSettings(false);
        }}
      />
    ) : (
      <IoMdMenu
        className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]"
        onClick={(e) => {
          e.stopPropagation();
          setShowSettings(true);
        }}
      />
    );

  return (
    <div className="fixed hidden transform -translate-x-1/2 z-9002 lg:block top-5 left-1/2">
      <LiquidGlass className="flex items-center justify-center px-4 py-3 rounded-[33px]">
        <ul className="flex items-center justify-center gap-5 rounded-full">
          <li onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setOpenProfile(!openProfile); }}>
            <img className="min-w-13 w-13" src="./supernova.png" alt="logo" />
          </li>
          {menuItems.map((item, index) => {
            const IconComponent = iconsMap[item];
            return (
              <li
                key={index}
                className="p-2 px-5 py-2 transition-transform duration-300 transform rounded-full cursor-pointer bgGray hover:scale-105"
              >
                <Link
                  href={`/${item.toLowerCase()}`}
                  className="cursor-pointer flex items-center justify-center font-semibold text-[0.6em] text-[var(--text-black)]"
                >
                  {IconComponent && (
                    <IconComponent className="mr-2 text-[var(--text-black)] text-xl [filter:drop-shadow(0_0_3px_var(--blue))]" />
                  )}
                  {item}
                </Link>
              </li>
            );
          })}
          <div className="p-2 rounded-full cursor-pointer bgGray hover:scale-105">
            <ToggleIcon />
          </div>
        </ul>
      </LiquidGlass>

      {showSettings && (
        <div className="absolute right-0 flex justify-end mt-2 z-99290 w-fit">
          <Settings
            setNotify={setNotify}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            activeBE={activeBE}
            setActiveBE={setActiveBE}
            openProfile={openProfile}
          />
        </div>
      )}
    </div>
  );
}

export default Header;
