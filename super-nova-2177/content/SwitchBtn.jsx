function SwitchBtn({activeBE, setActiveBE}) {
    return (
        <button onClick={() => setActiveBE(!activeBE)} className={`cursor-pointer ${!activeBE ? "bg-[var(--backgroundGray)]" : "bg-[var(--blue)]"} flex ${activeBE ? "justify-end" : "justify-start"} shadow-sm rounded-full p-[2px] w-14`}>
            <div className="rounded-full bg-white h-7 w-7"></div>
        </button>
    )
}

export default SwitchBtn
