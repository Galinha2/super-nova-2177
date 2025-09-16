"use client"
import { useState } from "react";
import { IoMdBookmark } from "react-icons/io";
import { IoIosShare } from "react-icons/io";

function BookShare() {
  const [clicked, setClicked] = useState(false);

  return (
    <div
      className="flex text-[0.6em] bg-[var(--gray)] text-white shadow-md w-fit gap-2 cursor-pointer rounded-full px-1 py-1 items-center justify-between"
    >
      <button
        onClick={() => setClicked(!clicked)}
        className={`flex items-center justify-center gap-1 rounded-full py-0 h-[30px] w-[30px] cursor-pointer ${
          clicked ? "text-[var(--blue)] [filter:drop-shadow(0_0_1px_var(--blue))] bg-[var(--transparent-gray)]" : "bg-[var(--transparent-gray)]"
        }`}
      >
        <IoMdBookmark size={20} />
      </button>
      <button
        onClick={() => setClicked(!clicked)}
        className={`flex items-center justify-center gap-1 rounded-full py-0 h-[30px] w-[30px] cursor-pointer bg-[var(--transparent-gray)] text-white`}
      >
        <IoIosShare size={20} />
      </button>
    </div>
  );
}

export default BookShare;