"use client";
// Main structure of a proposal card component
import LiquidGlass from "../../liquid glass/LiquidGlass";
import LikesDeslikes from "./LikesDeslikes";
import Comments from "./Comments";
import BookShare from "./BookShare";
import DisplayComments from "./DisplayComments";
import { useState } from "react";

function ProposalCard() {
  // State to control the visibility of the comments section
  const [comment, setComment] = useState(false);

  return (
      // Main container of the proposal card
      <div className="p-4 text-[var(--text-black)] rounded-[25px] bg-white shadow-md w-100 md:w-130 lg:w-150 xl:w-200 flex flex-col items-center gap-4">
        {/* Section with initials/logo, name and time */}
        <div className="flex items-center justify-start w-full gap-2">
          <p className="rounded-full bg-[var(--gray)] shadow-sm text-[0.5em] p-2">
            HG
          </p>
          {/* Name */}
          <p>Henrique Galinha</p>
          <p>-</p>
          <p>06:42 pm</p>
        </div>
        {/* Title section */}
        <div className="flex w-full gap-3 flex-col">
          <h1 className="text-[2em]">Title Ipsum</h1>

          {/* YouTube video iframe */}
          <div className="w-full aspect-video">
            <iframe
              src="https://www.youtube.com/embed/ZeerrnuLi5E"
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-md"
            ></iframe>
          </div>
          {/* Action bar with likes, comments, and share */}
          <div className="flex justify-between w-full">
            <LikesDeslikes />
            <Comments
              onClick={() => setComment(!comment)}
              className="mx-auto"
            />
            <BookShare />
          </div>
          {/* Conditional rendering of the comments section */}
          {!comment ? (
            ""
          ) : (
            <div className="flex flex-col gap-2 rounded-[15px] p-2">
              {/* Input for new comment */}
              <div className="flex gap-2 items-center justify-start mb-5">
                <p className="rounded-full bg-[var(--gray)] shadow-sm h-10 w-10 p-2">
                  {"HG"}
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
              {/* List of existing comments */}
              <DisplayComments
                name="Abby Cumber"
                comment={
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                }
              />
              <DisplayComments
                image={
                  "https://www.shutterstock.com/image-photo/handsome-happy-african-american-bearded-600nw-2460702995.jpg"
                }
                name="James Timber"
                comment={
                  "Ut enim ad minim veniam, quis nostrud exercitation reprehenderit in voluptate llamco laboris."
                }
              />
              <DisplayComments
                image={
                  "https://t4.ftcdn.net/jpg/03/96/16/79/360_F_396167959_aAhZiGlJoeXOBHivMvaO0Aloxvhg3eVT.jpg"
                }
                name="Oscar Milos"
                comment={
                  "Duis aute irure dolor in reprehenderit in voluptate reprehenderit in voluptate reprehenderit in voluptate reprehenderit in voluptate reprehenderit in voluptate velit esse cillum."
                }
              />
              <DisplayComments
                name="Brook Mcgill"
                comment={"Sed do eiusmod magna aliqua."}
              />
              <DisplayComments
                image={
                  "https://blog.stocksnap.io/content/images/2022/02/smiling-woman_W6GFOSFAXA.jpg"
                }
                name="Greta Hambert"
                comment={
                  "Excepteur sint occaecat cupidatat non, sunt in culpa qui officia."
                }
              />
            </div>
          )}
        </div>
      </div>
  );
}

export default ProposalCard;
