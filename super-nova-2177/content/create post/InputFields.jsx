"use client"
import { useState } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass"
import { FaPlus } from "react-icons/fa6";

function InputFields({setDiscard}) {

    return (
        <div className="fixed z-100 bottom-0 md:top-0 left-0 lg:relative lg:mt-[-70px]">
            <LiquidGlass className={"p-5 h-auto w-screen lg:w-150 xl:w-200 rounded-[30px]"}>
                <div className="w-screen p-10 h-screen lg:h-auto lg:w-140 xl:w-190 flex text-[var(--text-black)] flex-col gap-4">
                    <h1>Title</h1>
                    <input className="bg-white rounded-full shadow-md px-4 py-1 w-full text-[0.6em]" type="text" placeholder="Insert Title" />
                    <textarea className="bg-white rounded-[20px] h-50 shadow-md px-4 py-1 w-full text-[0.6em]" type="text" placeholder="Insert Title" />
                    <div className="flex gap-3 text-[0.6em]">
                        <div>
                            <h1>Image</h1>
                            <div className="rounded-full bg-white shadow-md w-10 h-10 flex items-center justify-center">
                                <FaPlus />
                            </div>
                        </div>
                        <div className="w-full">
                            <h1>Video</h1>
                            <input className="bg-white h-10 rounded-full shadow-md px-4 py-1 w-full text-[0.6em]" type="text" placeholder="Insert Video URL" />
                        </div>
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
