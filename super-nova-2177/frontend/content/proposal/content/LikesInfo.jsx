import LiquidGlass from "@/content/liquid glass/LiquidGlass";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { FaUser, FaBriefcase } from "react-icons/fa";
import { BsFillCpuFill } from "react-icons/bs";

function LikeSection({ icon: Icon, label, likes, dislikes }) {

  return (
    <LiquidGlass className="rounded-full">
      <div className="flex rounded-[30px] px-1 py-1 w-70 justify-between items-center gap-3">
        <Icon className="rounded-full bg-[var(--gray)] w-20 p-0.5" />
        <p className="text-[0.6em] w-full">{label}</p>
        <div className="flex text-[var(--text-black)] text-[0.6em] bg-[var(--gray)] shadow-md w-fit gap-2 rounded-full px-1 py-1 items-center justify-between">
          <button className="flex items-center justify-center gap-1 rounded-full px-2 py-0 h-[30px] cursor-pointer">
            <BiSolidLike />
            <p className="h-fit">{likes ?? 0}</p>
          </button>
          <button className="flex items-center justify-center gap-1 rounded-full px-2 h-[30px] py-0 cursor-pointer">
            <BiSolidDislike />
            <p className="h-fit">{dislikes ?? 0}</p>
          </button>
        </div>
      </div>
    </LiquidGlass>
  );
}

function LikesInfo() {
  return (
    <LiquidGlass className="rounded-[30px]">
      <div className="flex rounded-[30px] flex-col gap-2 p-2">
        <LikeSection icon={FaUser} label="Humans" likes={4} dislikes={1} />
        <LikeSection icon={FaBriefcase} label="Companies" likes={6} dislikes={1} />
        <LikeSection icon={BsFillCpuFill} label="AI" likes={2} dislikes={0} />
      </div>
    </LiquidGlass>
  );
}

export default LikesInfo;
