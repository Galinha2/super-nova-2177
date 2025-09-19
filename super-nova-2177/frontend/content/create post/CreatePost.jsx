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
      className="z-50 fixed right-5 lg:left-1/2 bottom-24 translate-x-[-50%] lg:top-30 lg:bottom-auto lg:-translate-x-1/2 flex justify-center items-center group"
    >
      <LiquidGlass className="cursor-pointer hover:scale-98 rounded-full p-1 flex items-center">
        <LiquidGlass className="text-white rounded-full flex items-center justify-center">
          <FaPlus className="bg-[var(--transparent-black)] p-2 rounded-full h-10 w-10" />
        </LiquidGlass>
        <p className="hidden lg:block bgGray text-[var(--text-black)] text-[0.6em] ml-[-4px] rounded-full px-2">
          Create Post
        </p>
      </LiquidGlass>
    </button>
  );
}
export default CreatePost;
