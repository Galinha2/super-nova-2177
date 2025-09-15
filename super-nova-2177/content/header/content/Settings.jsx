import LiquidGlass from "@/content/liquid glass/LiquidGlass";
import { FaServer, FaUser } from "react-icons/fa";
import { FiSlack, FiLoader } from "react-icons/fi";
import content from "@/assets/content.json";
import SwitchBtn from "@/content/SwitchBtn";

const iconsMap = {
  profile: <FaUser />,
  livebe: <FaServer />,
  aiassistant: <FiSlack />,
  agents: <FiLoader />
};

function Settings({activeBE, setActiveBE}) {
  const settings = content.header.settings;

  return (
    <LiquidGlass className="rounded-[30px] p-3">
      <div className="flex flex-col gap-2">
        {Object.entries(settings).map(([key, label]) => (
          <div
            key={key}
            className="cursor-pointer hover:scale-95 flex w-65 pr-4 bgGray rounded-full shadow-md p-1 items-center gap-2 justify-between"
          >
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center bg-[var(--gray)] rounded-full h-13 w-13 text-[var(--transparent-black)] shadow-md">
                  {iconsMap[key]}
                </div>
                <p className="text-[0.7em]">{label}</p>
            </div>
            {key === "livebe" && (<SwitchBtn activeBE={activeBE} setActiveBE={setActiveBE}/>)}
          </div>
        ))}
      </div>
    </LiquidGlass>
  );
}

export default Settings;