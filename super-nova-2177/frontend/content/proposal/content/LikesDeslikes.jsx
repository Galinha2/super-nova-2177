"use client";
import { useState, useEffect } from "react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoIosArrowUp, IoIosClose } from "react-icons/io";
import LikesInfo from "./LikesInfo";
import { useUser } from "@/content/profile/UserContext";
import supabase from "@/lib/supabaseClient";

function LikesDeslikes({
  initialLikes,
  initialDislikes,
  proposalId,
  setErrorMsg,
  className
}) {
  const [clicked, setClicked] = useState(null);
  const [likes, setLikes] = useState(
    Array.isArray(initialLikes) ? initialLikes : []
  );
  const [dislikes, setDislikes] = useState(
    Array.isArray(initialDislikes) ? initialDislikes : []
  );
  const [action, setAction] = useState(false);
  const { userData } = useUser();

  // Function to update votes safely and optimistically
  async function updateVotes(newLikes, newDislikes) {
    // Ensure valid arrays
    const likesToSend = Array.isArray(newLikes) ? newLikes : [];
    const dislikesToSend = Array.isArray(newDislikes) ? newDislikes : [];
    // Update local state immediately
    setLikes(likesToSend);
    setDislikes(dislikesToSend);
    try {
      const { error } = await supabase
        .from("proposals")
        .update({
          likes: likesToSend,
          dislikes: dislikesToSend,
        })
        .eq("id", Number(proposalId));
      if (error) {
        setErrorMsg([error.message]);
        // Optional: revert local state if needed
        // (but we won't revert to keep UX responsive)
        return false;
      }
      return true;
    } catch (err) {
      setErrorMsg([err.message]);
      return false;
    }
  }

  // Safe handler for like
  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData?.name) {
      setErrorMsg(["You must be logged in to vote."]);
      return;
    }
    const userVoter = userData.name;
    // Remove duplicate votes
    const filteredLikes = Array.isArray(likes)
      ? likes.filter((like) => like && like.voter !== userVoter)
      : [];
    const filteredDislikes = Array.isArray(dislikes)
      ? dislikes.filter((dislike) => dislike && dislike.voter !== userVoter)
      : [];
    if (clicked === "like") {
      // Remove user's like
      await updateVotes(filteredLikes, dislikes);
      setClicked(null);
    } else {
      // Add like and remove user's dislike
      const newLikes = [
        ...filteredLikes,
        { voter: userVoter, type: userData?.species || "human" },
      ];
      await updateVotes(newLikes, filteredDislikes);
      setClicked("like");
    }
  };

  // Safe handler for dislike
  const handleDislikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData?.name) {
      setErrorMsg(["You must be logged in to vote."]);
      return;
    }
    const userVoter = userData.name;
    const filteredLikes = Array.isArray(likes)
      ? likes.filter((like) => like && like.voter !== userVoter)
      : [];
    const filteredDislikes = Array.isArray(dislikes)
      ? dislikes.filter((dislike) => dislike && dislike.voter !== userVoter)
      : [];
    if (clicked === "dislike") {
      // Remove user's dislike
      await updateVotes(likes, filteredDislikes);
      setClicked(null);
    } else {
      // Add dislike and remove user's like
      const newDislikes = [
        ...filteredDislikes,
        { voter: userVoter, type: userData?.species || "human" },
      ];
      await updateVotes(filteredLikes, newDislikes);
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
          className="flex items-center justify-center gap-1 rounded-full px-2 py-0 h-[30px] cursor-pointer"
        >
          <BiSolidLike />
          <p className="h-fit">{likes.length}</p>
        </button>
        <button
          onClick={handleDislikeClick}
          style={{
            color: clicked === "dislike" ? "white" : "var(--text-black)",
            background: clicked === "dislike" ? "var(--blue)" : "transparent",
            boxShadow: clicked === "dislike" ? "var(--shadow-blue)" : "none",
          }}
          className="flex items-center justify-center gap-1 rounded-full px-2 h-[30px] py-0 cursor-pointer"
        >
          <BiSolidDislike />
          <p className="h-fit">{dislikes.length}</p>
        </button>
        {action ? (
          <IoIosClose
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAction(false);
            }}
            className="text-white rounded-full h-[30px] w-[30px] bg-[var(--transparent-gray)] cursor-pointer"
          />
        ) : (
          <IoIosArrowUp
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAction(true);
            }}
            className="text-white rounded-full h-[30px] w-[30px] bg-[var(--transparent-gray)] cursor-pointer"
          />
        )}
      </div>
      {action && (
        <div className={`absolute ${className ? "-top-[-45px]" : "-top-55 md:-top-55 lg:-top-55 xl:-top-55"}`}>
          <LikesInfo proposalId={proposalId} />
        </div>
      )}
    </>
  );
}

export default LikesDeslikes;
