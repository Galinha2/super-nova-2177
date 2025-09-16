"use client";
import Header from "@/content/header/Header";
import HeaderMobile from "@/content/header/HeaderMobile";
import { useActiveBE } from "../ActiveBEContext";

export default function HeaderWrapper() {
  const { activeBE, setActiveBE } = useActiveBE();

  return (
    <>
      <Header activeBE={activeBE} setActiveBE={setActiveBE} />
      <span id="createPost"></span>
      <HeaderMobile activeBE={activeBE} setActiveBE={setActiveBE} />
    </>
  );
}