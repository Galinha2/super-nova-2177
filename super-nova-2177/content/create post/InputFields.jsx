"use client"
import { useState } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass"
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { FaLink } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";


function InputFields({setDiscard}) {

    return (
        <div className="fixed z-100 bottom-0 md:top-0 left-0 lg:relative lg:mt-[-70px]">
            <LiquidGlass className={"lg:p-5 h-auto bgGrayDark w-screen lg:w-150 xl:w-200 lg:rounded-[30px]"}>
                <div className="w-screen pt-30 lg:pt-0 p-5 lg:p-0 m-auto h-screen lg:h-auto lg:w-140 xl:w-190 flex text-[var(--text-black)] flex-col gap-4">
                    <h1>Title</h1>
                    <input className="bg-white rounded-full shadow-md px-4 py-1 w-full text-[0.6em]" type="text" placeholder="Insert Title" />
                    <textarea className="bg-white rounded-[20px] h-50 shadow-md px-4 py-1 w-full text-[0.6em]" type="text" placeholder="Insert Text" />
                    <div className="flex gap-3 text-[0.6em]">
                        {/* icons aqui */}
                        <button className="bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center relative group">
                            <FaImage className="text-2xl"/>
                            <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">Insert Image</span>
                        </button>
                        <button className="bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center relative group">
                            <FaVideo className="text-2xl"/>
                            <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">Insert Video</span>
                        </button>
                        <button className="bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center relative group">
                            <FaLink className="text-2xl"/>
                            <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">Insert Link</span>
                        </button>
                        <button className="bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center relative group">
                            <FaFileAlt className="text-2xl"/>
                            <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">Insert File</span>
                        </button>
                    </div>
                    <div className="text-[0.6em] flex gap-3 text-white">
                        <button className="hover:scale-95 shadow-[var(--shadow-pink)] bg-[var(--pink)] rounded-full px-3 w-30">Publish</button>
                        <button onClick={() => setDiscard(true)} className="hover:scale-95 shadow-[var(--shadow-blue)] bg-[var(--blue)] rounded-full px-3 w-30">Discard</button>
                        </div>
                </div>
            </LiquidGlass>
        </div>
    )
}

export default InputFields
