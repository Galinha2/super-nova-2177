"use client";
import { useEffect, useState } from "react";
import LiquidGlass from '@/content/liquid glass/LiquidGlass';
import { BiSolidLike, BiSolidDislike } from 'react-icons/bi';
import { FaUser, FaBriefcase } from 'react-icons/fa';
import { BsFillCpuFill } from 'react-icons/bs';
import supabase from "@/lib/supabaseClient";

function LikeSection({ icon: Icon, label, likes, dislikes }) {
  return (
    <LiquidGlass className="rounded-full">
      <div className="flex rounded-[30px] px-1 py-1 w-70 justify-between items-center gap-3">
        <Icon className="rounded-full bg-[var(--gray)] w-20 p-0.5" />
        <p className="text-[0.6em] w-full">{label}</p>
        <div className="flex text-[var(--text-black)] text-[0.6em] bg-[var(--gray)] shadow-md w-fit gap-2 rounded-full px-1 py-1 items-center justify-between">
          <button className="flex items-center justify-center gap-1 rounded-full px-2 py-0 h-[30px] cursor-pointer">
            <BiSolidLike />
            <p className="h-fit">{likes}</p>
          </button>
          <button className="flex items-center justify-center gap-1 rounded-full px-2 h-[30px] py-0 cursor-pointer">
            <BiSolidDislike />
            <p className="h-fit">{dislikes}</p>
          </button>
        </div>
      </div>
    </LiquidGlass>
  );
}

function LikesInfo({ proposalId }) {
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);

  useEffect(() => {
    async function fetchVotes() {
      try {
        const { data, error } = await supabase
          .from("proposals")
          .select("likes, dislikes")
          .eq("id", Number(proposalId))
          .single();
        if (error) {
          console.error("Failed to fetch likes/dislikes from Supabase:", error);
          return;
        }
        setLikes(data?.likes || []);
        setDislikes(data?.dislikes || []);
      } catch (err) {
        console.error("Failed to fetch likes/dislikes:", err);
      }
    }
    fetchVotes();
  }, [proposalId]);

  const humanLikes = likes.filter(v => v.type === 'human').length;
  const companyLikes = likes.filter(v => v.type === 'company').length;
  const aiLikes = likes.filter(v => v.type === 'ai').length;

  const humanDislikes = dislikes.filter(v => v.type === 'human').length;
  const companyDislikes = dislikes.filter(v => v.type === 'company').length;
  const aiDislikes = dislikes.filter(v => v.type === 'ai').length;

  return (
    <LiquidGlass className={"rounded-[25px]"}>
      <div className="flex flex-col rounded-[25px] p-2 gap-2">
        <LikeSection icon={FaUser} label="Humans" likes={humanLikes} dislikes={humanDislikes} />
        <LikeSection icon={FaBriefcase} label="Companies" likes={companyLikes} dislikes={companyDislikes} />
        <LikeSection icon={BsFillCpuFill} label="AI" likes={aiLikes} dislikes={aiDislikes} />
      </div>
    </LiquidGlass>
  );
}

export default LikesInfo;