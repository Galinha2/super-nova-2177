"use client";
import LikesDeslikes from "./LikesDeslikes";
import Comments from "./Comments";
import BookShare from "./BookShare";
import DisplayComments from "./DisplayComments";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { useUser } from "@/content/profile/UserContext";
import InsertComment from "./InsertComment";
import Loading from "@/app/loading";

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
  const [localComments, setLocalComments] = useState(comments);
  const { userData } = useUser();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return backendUrl + url;
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com/embed/")) return url;
      const regExp =
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="p-4 text-[var(--text-black)] rounded-[25px] bg-white shadow-md w-100 md:w-130 lg:w-150 xl:w-200 flex flex-col items-center gap-4">
      <div className="flex items-center justify-start w-full gap-2">
        {logo ? (
          <img
            src={getFullImageUrl(logo)}
            alt="user avatar"
            className="rounded-full w-8 h-8"
          />
        ) : (
          <div className="rounded-full bg-[var(--gray)] shadow-sm p-2 w-8 h-8 flex items-center justify-center">
            <p className="text-[0.8em]">{userInitials}</p>
          </div>
        )}
        <p>{userName}</p>
        <p>-</p>
        <p>{time}</p>
      </div>

      <div className="flex w-full gap-3 flex-col">
        <h1 className="text-[1.5em] my-[-10px]">{title}</h1>

        {media.image && (
          <>
            {!imageLoaded && <div className="bg-[var(--gray)] rounded-md shadow-sm flex items-center justify-center h-50 w-full"><img src="./spinner.svg" alt="loading" /></div>}
            <div className="rounded-md shadow-sm max-h-150 w-full items-center justify-center flex bg-[var(--gray)]">
              <img
                src={getFullImageUrl(media.image)}
                alt={title}
                className={`rounded-md shadow-sm max-h-150 w-fit ${imageLoaded ? "" : "hidden"}`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </>
        )}

        {media.video && (
          <>
            <div className={`${videoLoaded ? "" : "hidden"} w-full aspect-video`}>
              <iframe
                src={getEmbedUrl(media.video)}
                title="Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setVideoLoaded(true)}
                className="w-full h-full rounded-md"
              ></iframe>
            </div>
          </>
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
          <a
            href={getFullImageUrl(media.file)}
            download
            className="cursor-pointer flex items-center bg-[var(--blue)] text-white shadow-[var(--shadow-blue)] w-fit px-2 py-2 rounded-full"
          >
            <FaFileAlt className="text-[2em]" />
            <p>Download file</p>
          </a>
        )}

        <div className="relative flex justify-between w-full">
          <LikesDeslikes setErrorMsg={setErrorMsg} initialLikes={likes.length} initialDislikes={dislikes.length} proposalId={id} />
          <Comments commentsNum={localComments.length} onClick={() => setShowComments(!showComments)} className="mx-auto" />
          <BookShare />
        </div>

        {showComments && (
          <div className="flex flex-col gap-2 rounded-[15px] p-2">
            <InsertComment setErrorMsg={setErrorMsg} setNotify={setNotify} proposalId={id} setLocalComments={setLocalComments} />
            {localComments.map((c, i) => (
              <DisplayComments key={i} name={c.user} image={c.user_img} comment={c.comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProposalCard;