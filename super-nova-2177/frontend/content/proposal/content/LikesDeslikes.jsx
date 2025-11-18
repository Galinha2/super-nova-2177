"use client";
import { useState, useEffect } from "react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoIosArrowUp } from "react-icons/io";
import LikesInfo from "./LikesInfo";
import { IoIosClose } from "react-icons/io";
import { useUser } from "@/content/profile/UserContext";

function LikesDeslikes({
  initialLikes,
  initialDislikes,
  proposalId,
  setErrorMsg,
  className
}) {
  const [clicked, setClicked] = useState(null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [action, setAction] = useState(false);
  const { userData } = useUser();

  async function sendVote(choice) {
    const errors = [];
    if (!userData?.name) errors.push("User name is missing.");
    if (!userData?.species) errors.push("Species is missing.");

    if (errors.length > 0) {
      setErrorMsg(errors);
      return false;
    }

    await fetch("http://localhost:8000/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposal_id: proposalId,
        username: userData.name,
        choice: choice,
        voter_type: userData.species || "human",
      }),
    });
    return true;
  }

  async function removeVote() {
    await fetch(
      `http://localhost:8000/votes?proposal_id=${proposalId}&username=${userData.name}`,
      {
        method: "DELETE",
      }
    );
  }

  const handleLikeClick = async () => {
    if (!userData?.name || !userData?.species) {
      setErrorMsg(["User name or species is missing"]);
      return;
    }

    if (clicked === "like") {
      await removeVote();
      setLikes(likes - 1);
      setClicked(null);
    } else {
      const success = await sendVote("up");
      if (!success) return;
      if (clicked === "dislike") {
        setDislikes(dislikes - 1);
      }
      setLikes(likes + 1);
      setClicked("like");
    }
  };

  const handleDislikeClick = async () => {
    if (!userData?.name || !userData?.species) {
      setErrorMsg(["User name or species is missing"]);
      return;
    }

    if (clicked === "dislike") {
      await removeVote();
      setDislikes(dislikes - 1);
      setClicked(null);
    } else {
      const success = await sendVote("down");
      if (!success) return;
      if (clicked === "like") {
        setLikes(likes - 1);
      }
      setDislikes(dislikes + 1);
      setClicked("dislike");
    }
  };

  return (
    <>
      <div className="flex text-[var(--text-black)] bg-[var(--gray)] shadow-md w-fit gap-2 rounded-full px-1 py-1 items-center justify-between">
        <button
          onClick={handleLikeClick}
          style={{
            color: clicked === "like" ? "white" : "var(--text-black)",
            background: clicked === "like" ? "var(--pink)" : "transparent",
            boxShadow: clicked === "like" ? "var(--shadow-pink)" : "none",
          }}
          className={`flex items-center justify-center gap-1 rounded-full px-2 py-0 h-[30px] cursor-pointer ${
            clicked === "like" ? "" : ""
          }`}
        >
          <BiSolidLike />
          <p className="h-fit">{likes}</p>
        </button>
        <button
          onClick={handleDislikeClick}
          style={{
            color: clicked === "dislike" ? "white" : "var(--text-black)",
            background: clicked === "dislike" ? "var(--blue)" : "transparent",
            boxShadow: clicked === "dislike" ? "var(--shadow-blue)" : "none",
          }}
          className={`flex items-center justify-center gap-1 rounded-full px-2 h-[30px] py-0 cursor-pointer ${
            clicked === "dislike" ? "" : ""
          }`}
        >
          <BiSolidDislike />
          <p className="h-fit">{dislikes}</p>
        </button>
        {action ? (
          <IoIosClose
            onClick={() => setAction(false)}
            className="text-white rounded-full h-[30px] w-[30px] bg-[var(--transparent-gray)] cursor-pointer"
          />
        ) : (
          <IoIosArrowUp
            onClick={() => setAction(true)}
            className="text-white rounded-full h-[30px] w-[30px] bg-[var(--transparent-gray)] cursor-pointer"
          />
        )}
      </div>
      <div className={`absolute ${className ? "-top-[-45px]" : "-top-55 md:-top-55 lg:-top-55 xl:-top-55"}`}>
        {action ? (
          <LikesInfo
            proposalId={proposalId}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default LikesDeslikes;
