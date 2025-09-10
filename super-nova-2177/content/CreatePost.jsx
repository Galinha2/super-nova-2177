import { FaPlus } from "react-icons/fa6";
import LiquidGlass from "./liquid glass/LiquidGlass";

function CreatePost() {
    return (
        <div className="z-100 fixed left-1/2 bottom-30 translate-x-[-50%] lg:top-30 lg:bottom-auto lg:-translate-x-1/2 flex justify-center items-center">
            <LiquidGlass className={"cursor-pointer hover:scale-98 rounded-full p-1"}>
                <LiquidGlass className={"bg-black text-white rounded-full p-2"}>
                    <FaPlus />
                </LiquidGlass>
                <p className="text-[0.6em] pr-2">Create Post</p>
            </LiquidGlass>
        </div>
    )
}

export default CreatePost;