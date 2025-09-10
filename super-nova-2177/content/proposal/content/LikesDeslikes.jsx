"use client"
import { useState } from "react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoIosArrowUp } from "react-icons/io";
import LikesInfo from "./LikesInfo";
import { IoIosClose } from "react-icons/io";

function LikesDeslikes() {
  // State management
  const [clicked, setClicked] = useState(null); // Track if user clicked "like" or "dislike"
  const [likes, setLikes] = useState(11); // Number of likes
  const [dislikes, setDislikes] = useState(2); // Number of dislikes
  const [action, setAction] = useState(false); // Toggle for showing LikesInfo

  // Handle like button click logic
  const handleLikeClick = () => {
    if (clicked === "like") {
      setLikes(likes - 1);
      setClicked(null);
    } else if (clicked === "dislike") {
      setDislikes(dislikes - 1);
      setLikes(likes + 1);
      setClicked("like");
    } else {
      setLikes(likes + 1);
      setClicked("like");
    }
  };

  // Handle dislike button click logic
  const handleDislikeClick = () => {
    if (clicked === "dislike") {
      setDislikes(dislikes - 1);
      setClicked(null);
    } else if (clicked === "like") {
      setLikes(likes - 1);
      setDislikes(dislikes + 1);
      setClicked("dislike");
    } else {
      setDislikes(dislikes + 1);
      setClicked("dislike");
    }
  };

  return (
    <>
      {/* Like/Dislike buttons with counters and toggle button */}
      <div className="flex text-[var(--text-black)] bg-[var(--gray)] shadow-md w-fit gap-2 rounded-full px-1 py-1 items-center justify-between">
        <button
          onClick={handleLikeClick}
          style={{
            color: clicked === "like" ? "white" : "var(--text-black)" ,
            background: clicked === "like" ? "var(--pink)" : "transparent",
            boxShadow: clicked === "like" ? "var(--shadow-pink)" : "none"
          }}
          className={`flex items-center justify-center gap-1 rounded-full px-2 py-0 h-[30px] cursor-pointer ${clicked === "like" ? "" : ""}`}
        >
          <BiSolidLike />
          <p className="h-fit">{likes}</p>
        </button>
        <button
          onClick={handleDislikeClick}
          style={{
            color: clicked === "dislike" ? "white" : "var(--text-black)",
            background: clicked === "dislike" ? "var(--blue)" : "transparent",
            boxShadow: clicked === "dislike" ? "var(--shadow-blue)" : "none"
          }}
          className={`flex items-center justify-center gap-1 rounded-full px-2 h-[30px] py-0 cursor-pointer ${clicked === "dislike" ? "" : ""}`}
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

      {/* Show LikesInfo component when action is true */}
      <div className="absolute top-39 md:top-56 lg:top-112 xl:top-140">
        {action ? <LikesInfo /> : ""}
      </div>
    </>
  );
}

export default LikesDeslikes;