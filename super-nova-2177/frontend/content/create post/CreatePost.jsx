import { FaPlus } from "react-icons/fa6";
import LiquidGlass from "../liquid glass/LiquidGlass";

function CreatePost({ setDiscard }) {
  const handleClick = () => {
    setDiscard(false);
    const element = document.getElementById("createPost");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="z-9001 w-fit fixed left-1/2 bottom-5.5 -translate-x-1/2 lg:top-30 lg:bottom-auto flex justify-center items-center group"
    >
      <LiquidGlass className="h-12.5 w-12.5 lg:w-fit lg:h-fit cursor-pointer hover:scale-98 rounded-[20px] lg:rounded-full p-0 lg:p-1 flex items-center">
        <LiquidGlass className="text-black opacity-70 rounded-full flex items-center justify-center">
          <FaPlus className="bgGray p-2 opacity-100 rounded-[20px] lg:rounded-full lg:w-10 lg:h-10 h-11 w-11" />
        </LiquidGlass>
        <p className="hidden lg:block bgGray text-[var(--text-black)] text-[0.6em] ml-[-4px] rounded-full px-2">
          Create Post
        </p>
      </LiquidGlass>
    </button>
  );
}
export default CreatePost;
