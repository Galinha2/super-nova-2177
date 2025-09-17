"use client";
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
  text,
  media = {},
  logo,
  likes,
  dislikes,
  comments = [],
}) {
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = "http://localhost:8000";

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
            className="rounded-full w-10 h-10"
          />
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
          <a href={getFullImageUrl(media.file)} download className="text-green-600 underline">
            Download file
          </a>
        )}

        {text && <p className="post-text text-[0.9em] w-full">{text}</p>}

        {/* Action bar */}
        <div className="relative flex justify-between w-full">
          <LikesDeslikes initialLikes={likes} initialDislikes={dislikes} />
          <Comments
            commentsNum={comments.length}
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
