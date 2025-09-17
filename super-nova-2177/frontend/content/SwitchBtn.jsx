function SwitchBtn({activeBE, setActiveBE}) {
    return (
        <button onClick={() => setActiveBE(prev => !prev)} className={`cursor-pointer ${activeBE ? "bg-[var(--backgroundGray)]" : "bg-[var(--blue)]"} flex ${!activeBE ? "justify-end" : "justify-start"} shadow-sm rounded-full p-[2px] w-14`}>
            <div className="rounded-full shadow-sm bg-white h-7 w-7"></div>
        </button>
    )
}

export default SwitchBtn
