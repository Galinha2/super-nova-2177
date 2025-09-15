"use client";
import { useState } from "react";
import Header from "@/content/header/Header";
import HeaderMobile from "@/content/header/HeaderMobile";

export default function HeaderWrapper() {
  const [activeBE, setActiveBE] = useState(false);

  return (
    <>
      <Header activeBE={activeBE} setActiveBE={setActiveBE} />
      <span id="createPost"></span>
      <HeaderMobile activeBE={activeBE} setActiveBE={setActiveBE}/>
    </>
  );
}