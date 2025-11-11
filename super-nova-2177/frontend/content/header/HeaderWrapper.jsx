"use client";
import Header from "@/content/header/Header";
import HeaderMobile from "@/content/header/HeaderMobile";
import { useActiveBE } from "../ActiveBEContext";

export default function HeaderWrapper({setErrorMsg, errorMsg, setNotify, showSettings, setShowSettings}) {
  const { activeBE, setActiveBE } = useActiveBE();

  return (
    <>
      <Header showSettings={showSettings} setShowSettings={setShowSettings} setNotify={setNotify} errorMsg={errorMsg} setErrorMsg={setErrorMsg} activeBE={activeBE} setActiveBE={setActiveBE} />
      <span id="createPost"></span>
      <HeaderMobile showSettings={showSettings} setShowSettings={setShowSettings} setNotify={setNotify} errorMsg={errorMsg} setErrorMsg={setErrorMsg} activeBE={activeBE} setActiveBE={setActiveBE} />
    </>
  );
}