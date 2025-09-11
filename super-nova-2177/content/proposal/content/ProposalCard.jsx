"use client";
import LiquidGlass from "../../liquid glass/LiquidGlass";
import LikesDeslikes from "./LikesDeslikes";
import Comments from "./Comments";
import BookShare from "./BookShare";
import DisplayComments from "./DisplayComments";
import { useState } from "react";

function ProposalCard({
  userName,
  userInitials,
  time,
  title,
  video,
  image,
  text,
  likes,
  dislikes,
  comments = [],
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="p-4 text-[var(--text-black)] rounded-[25px] bg-white shadow-md w-100 md:w-130 lg:w-150 xl:w-200 flex flex-col items-center gap-4">
      {/* User info */}
      <div className="flex items-center justify-start w-full gap-2">
        {image ? (
          <img src={image} alt="picture" />
        ) : (
          <p className="rounded-full bg-[var(--gray)] shadow-sm text-[0.5em] p-2">
            {userInitials}
          </p>
        )}
        <p>{userName}</p>
        <p>-</p>
        <p>{time}</p>
      </div>

      {/* Title */}
      <div className="flex w-full gap-3 flex-col">
        <h1 className="text-[2em]">{title}</h1>

        {/* Conditional content */}
        {video && (
          <div className="w-full aspect-video">
            <iframe
              src={video}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-md"
            ></iframe>
          </div>
        )}

        {image && <img src={image} alt={title} className="w-full rounded-md" />}

        {text && <p className="text-[0.9em]">{text}</p>}

        {/* Action bar */}
        <div className="relative flex justify-between w-full">
          <LikesDeslikes initialLikes={likes} initialDislikes={dislikes} />
          <Comments
            onClick={() => setShowComments(!showComments)}
            className="mx-auto"
          />
          <BookShare />
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="flex flex-col gap-2 rounded-[15px] p-2">
            <div className="flex gap-2 items-center justify-start mb-5">
              <p className="rounded-full bg-[var(--gray)] shadow-sm h-10 w-10 p-2">
                {userInitials}
              </p>
              <input
                type="text"
                placeholder="Insert Comment"
                className="bg-[var(--gray)] rounded-full shadow-sm px-4 py-0 h-10 w-full"
              />
              <button className="bg-[var(--pink)] text-white px-3 rounded-full h-10 shadow-sm hover:scale-95 cursor-pointer">
                Publish
              </button>
            </div>

            {comments.map((c, i) => (
              <DisplayComments
                key={i}
                name={c.name}
                image={c.image}
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
