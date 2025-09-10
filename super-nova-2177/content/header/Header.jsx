// Importing content data for header titles
import content from "@/assets/content.json";
// Importing custom LiquidGlass component for glassmorphism effect
import LiquidGlass from "../liquid glass/LiquidGlass";
// Importing Link component for navigation
import Link from "next/link";
// Importing IoMenu icon for menu button
import { IoMenu } from "react-icons/io5";

function Header() {
  // Get header titles from content data
  const header = Object.values(content.header.titles);

  return (
    // Header container: absolutely positioned and centered horizontally.
    // Hidden on small and medium screens, visible only on large (lg) and above.
    <div className="z-100 hidden lg:block fixed top-5 left-1/2 transform -translate-x-1/2">
      {/* Glassmorphic background for the header */}
      <LiquidGlass className="flex items-center justify-center px-4 border-[1px] border-white py-3 rounded-[33px]">
        <ul className="flex items-center justify-center gap-5 rounded-full">
          {/* Logo on the left */}
          <li>
            <img className="min-w-13 w-13" src="./supernova.png" alt="logo" />
          </li>
          {/* Render navigation links from header array */}
          {header.map((item, index) => (
            <li key={index} className="rounded-full">
              {/* Each nav item has a LiquidGlass background and hover effect */}
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
          {/* Menu icon on the right, wrapped with LiquidGlass for effect */}
          <LiquidGlass className={"cursor-pointer hover:scale-105 rounded-full p-2"}>
            <IoMenu className="text-[var(--pink)] [filter:drop-shadow(0_0_7px_var(--pink))]" />
          </LiquidGlass>
        </ul>
      </LiquidGlass>
    </div>
  );
}

export default Header;
