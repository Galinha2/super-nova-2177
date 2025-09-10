import LiquidGlass from "@/content/liquid glass/LiquidGlass";
import { FaServer, FaUser } from "react-icons/fa";
import { FiSlack, FiLoader } from "react-icons/fi";
import content from "@/assets/content.json";

const iconsMap = {
  profile: <FaUser />,
  livebe: <FaServer />,
  aiassistant: <FiSlack />,
  agents: <FiLoader />
};

function Settings() {
  const settings = content.header.settings;

  return (
    <LiquidGlass className="rounded-[30px] p-3">
      <div className="flex flex-col gap-2">
        {Object.entries(settings).map(([key, label]) => (
          <div
            key={key}
            className="cursor-pointer hover:scale-95 flex w-65 bg-[var(--transparent-white)] rounded-full shadow-md p-1 items-center gap-2"
          >
            <div className="flex items-center justify-center bg-[var(--gray)] rounded-full h-13 w-13 text-[var(--transparent-black)] shadow-md">
              {iconsMap[key]}
            </div>
            <p className="text-[0.7em]">{label}</p>
          </div>
        ))}
      </div>
    </LiquidGlass>
  );
}

export default Settings;