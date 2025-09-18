"use client";
import LikesDeslikes from "./LikesDeslikes";
import Comments from "./Comments";
import BookShare from "./BookShare";
import DisplayComments from "./DisplayComments";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { useUser } from "@/content/profile/UserContext";
import InsertComment from "./InsertComment";

function ProposalCard({
  id,
  userName,
  userInitials,
  time,
  title,
  text,
  media = {},
  logo,
  likes,
  dislikes,
  comments = [],
  setErrorMsg,
  setNotify
}) {
  
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localComments, setLocalComments] = useState(comments);
  const { userData } = useUser();
  const backendUrl = "http://localhost:8000";
  console.log("username:", userData)
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return backendUrl + url;
  };

  return (
    <div
      className="p-4 text-[var(--text-black)] rounded-[25px] bg-white shadow-md w-100 md:w-130 lg:w-150 xl:w-200 flex flex-col items-center gap-4"
      onLoad={() => setLoading(false)}
    >
      {/* User info */}
      <div className="flex items-center justify-start w-full gap-2">
        {logo ? (
          <img
            src={getFullImageUrl(logo)}
            alt="user avatar"
            className="rounded-full w-8 h-8"
          />
        ) : (
          <div className="rounded-full bg-[var(--gray)] shadow-sm p-2 w-8 h-8 flex items-center justify-center">
            <p className="text-[0.8em]">
              {userInitials}
            </p>
          </div>
        )}
        <p>{userName}</p>
        <p>-</p>
        <p>{time}</p>
      </div>

      {/* Title */}
      <div className="flex w-full gap-3 flex-col">
        <h1 className="text-[1.5em] my-[-15px]">{title}</h1>

        {/* Conditional content */}
        {media.image && (
          <img src={getFullImageUrl(media.image)} alt={title} className="w-full rounded-md" />
        )}
        {media.video && (
          <div className="w-full aspect-video">
            <iframe
              src={media.video}
              title="Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-md"
            ></iframe>
          </div>
        )}

        {text && <p className="post-text text-[0.9em] w-full">{text}</p>}
        {media.link && (
          <a
            href={media.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {media.link}
          </a>
        )}
        {media.file && (
          <a href={getFullImageUrl(media.file)} download className="cursor-pointer flex items-center bg-[var(--blue)] text-white shadow-[var(--shadow-blue)] w-fit px-2 py-2 rounded-full" >
            <FaFileAlt className="text-[2em]" />

            <p className="">
              Download file
            </p>
          </a>
        )}
        {/* Action bar */}
        <div className="relative flex justify-between w-full">
          <LikesDeslikes setErrorMsg={setErrorMsg} initialLikes={likes.length} initialDislikes={dislikes.length} proposalId={id} />
          <Comments
            commentsNum={localComments.length}
            onClick={() => setShowComments(!showComments)}
            className="mx-auto"
          />
          <BookShare />
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="flex flex-col gap-2 rounded-[15px] p-2">
            <InsertComment setErrorMsg={setErrorMsg} setNotify={setNotify} proposalId={id} setLocalComments={setLocalComments} />

            {localComments.map((c, i) => (
              <DisplayComments
                key={i}
                name={c.user}
                image={c.user_img}
                comment={c.comment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProposalCard;
