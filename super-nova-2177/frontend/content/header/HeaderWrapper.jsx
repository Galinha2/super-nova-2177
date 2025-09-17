"use client";
import Header from "@/content/header/Header";
import HeaderMobile from "@/content/header/HeaderMobile";
import { useActiveBE } from "../ActiveBEContext";

export default function HeaderWrapper({setErrorMsg, errorMsg, setNotify}) {
  const { activeBE, setActiveBE } = useActiveBE();

  return (
    <>
      <Header setNotify={setNotify} errorMsg={errorMsg} setErrorMsg={setErrorMsg} activeBE={activeBE} setActiveBE={setActiveBE} />
      <span id="createPost"></span>
      <HeaderMobile setNotify={setNotify} errorMsg={errorMsg} setErrorMsg={setErrorMsg} activeBE={activeBE} setActiveBE={setActiveBE} />
    </>
  );
}