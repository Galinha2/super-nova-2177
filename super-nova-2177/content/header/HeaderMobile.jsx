import content from "@/assets/content.json";
import LiquidGlass from "../liquid glass/LiquidGlass";
import Link from "next/link";
import { IoMenu, IoBookOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { LuSlack } from "react-icons/lu";

function HeaderMobile() {
  // Extract mobile header titles from the content JSON
  const header = Object.values(content.header.mobiletitles);

  // Map each header item to a corresponding icon component
  const iconsMap = {
    Home: LuSlack,
    Profile: FaRegUser,
    Proposals: IoBookOutline,
  };

  return (
    // Container div positioned absolutely at the bottom center of the screen
    // Changed from top-5 to bottom-5 to move the header to the bottom
    <div className="z-100 fixed bottom-5 left-1/2 transform -translate-x-1/2 lg:hidden">
      {/* LiquidGlass wrapper for styling the header background */}
      <LiquidGlass className="flex items-center justify-center px-4 border-[1px] border-white py-3 rounded-[33px]">
        {/* Navigation list with flex layout and spacing */}
        <ul className="flex items-center justify-center gap-5">
          {/* Logo item */}
          <li>
            <img className="min-w-15 w-15" src="./supernova.png" alt="logo" />
          </li>
          {/* Map through header items to create navigation links */}
          {header.map((item, index) => {
            // Select the appropriate icon component for the current item
            const IconComponent = iconsMap[item];
            return (
              <li key={index}>
                {/* LiquidGlass wrapper for individual nav item with hover effect */}
                <LiquidGlass className="cursor-pointer rounded-[20px] w-15 h-15 border-[1px] border-white transform transition-transform duration-300 hover:scale-105">
                  {/* Link to the corresponding page, using lowercase item name */}
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="cursor-pointer flex items-center justify-center font-semibold text-[0.6em] text-[var(--text-gray)] gap-2"
                  >
                    {/* Render the icon if it exists */}
                    {IconComponent && (
                      <IconComponent className="text-[var(--text-black)] text-4xl [filter:drop-shadow(0_0_3px_var(--blue))]" />
                    )}
                  </Link>
                </LiquidGlass>
              </li>
            );
          })}
          {/* Menu icon with hover effect */}
          <LiquidGlass
            className={"cursor-pointer hover:scale-105 rounded-[20px] w-15 h-15"}
          >
            <IoMenu className="text-[var(--pink)] text-5xl [filter:drop-shadow(0_0_7px_var(--pink))]" />
          </LiquidGlass>
        </ul>
      </LiquidGlass>
    </div>
  );
}

export default HeaderMobile;
