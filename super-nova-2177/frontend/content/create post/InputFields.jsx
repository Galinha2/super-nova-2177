"use client";
import { useState } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass";
import { FaImage, FaVideo } from "react-icons/fa6";
import { FaLink, FaFileAlt } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../profile/UserContext";
import Error from "../Error";

const createPost = async (newPost) => {
  const response = await fetch("http://localhost:8000/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPost),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
};

function InputFields({ setDiscard }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState([]);
  const [mediaType, setMediaType] = useState(null); // "image", "video", "link", "file" or null
  const [mediaValue, setMediaValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const { userData } = useUser();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const response = await fetch("http://localhost:8000/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["posts"]),
  });

  const handleRemoveMedia = () => {
    setMediaType(null);
    setMediaValue(null);
    setInputValue("");
  };

  const handleFileChange = (e) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) return;
    const fileURL = URL.createObjectURL(fileObj);
    setMediaType("image");
    setMediaValue(fileURL);
  };

  const handleFileInputChange = (e) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) return;
    const fileURL = URL.createObjectURL(fileObj);
    setMediaType("file");
    setMediaValue(fileURL);
  };

  const handleSaveInputMedia = () => {
    if (inputValue.trim() === "") return;
    setMediaValue(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="fixed z-100 bottom-0 md:top-0 left-0 lg:relative lg:mt-[-70px]">
      <LiquidGlass
        className={
          "lg:p-5 h-auto bgGrayDark w-screen lg:w-150 xl:w-200 lg:rounded-[30px]"
        }
      >
        <div className="w-screen pt-30 lg:pt-0 p-5 lg:p-0 m-auto h-screen lg:h-auto lg:w-140 xl:w-190 flex text-[var(--text-black)] flex-col gap-4">
          {errorMsg.length > 0 && <Error messages={errorMsg} />}
          <h1>Title</h1>
          <input
            className="bg-white rounded-full shadow-md px-4 py-1 w-full text-[0.6em]"
            type="text"
            placeholder="Insert Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="bg-white rounded-[20px] h-50 shadow-md px-4 py-1 w-full text-[0.6em]"
            type="text"
            placeholder="Insert Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-3 text-[0.6em] items-center">
            {/* Image Input */}
            <div className="relative group">
              <label
                htmlFor="imageInput"
                className={`bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${
                  mediaType && mediaType !== "image" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={mediaType === "image" ? "Remove existing image first" : "Insert Image"}
                onClick={() => {
                  if (!mediaType || mediaType === "image") {
                    setMediaType("image");
                  }
                }}
              >
                <FaImage className="text-2xl" />
                <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">
                  Insert Image
                </span>
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (!mediaType || mediaType === "image") handleFileChange(e);
                  e.target.value = null;
                }}
                disabled={mediaType && mediaType !== "image"}
              />
            </div>
            {mediaType === "image" && mediaValue && (
              <button
                className="bg-red-600 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center text-white text-xs"
                onClick={handleRemoveMedia}
                title="Remove Image"
              >
                X
              </button>
            )}

            {/* Video Input */}
            <div className="relative group flex items-center gap-1">
              {mediaType !== "video" ? (
                <button
                  className={`bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${
                    mediaType && mediaType !== "video" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (!mediaType) setMediaType("video");
                  }}
                  disabled={mediaType && mediaType !== "video"}
                  title="Insert Video"
                >
                  <FaVideo className="text-2xl" />
                  <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">
                    Insert Video
                  </span>
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter video URL"
                    className="rounded px-2 py-1 text-[0.6em]"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button
                    className="bg-[var(--pink)] text-white rounded px-2 py-1 text-[0.6em]"
                    onClick={() => {
                      handleSaveInputMedia();
                      setMediaType("video");
                    }}
                    disabled={inputValue.trim() === ""}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-600 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center text-white text-xs"
                    onClick={handleRemoveMedia}
                    title="Remove Video"
                  >
                    X
                  </button>
                </>
              )}
              {mediaType === "video" && mediaValue && mediaValue !== "" && (
                <span className="text-[0.6em] truncate max-w-xs">{mediaValue}</span>
              )}
            </div>

            {/* Link Input */}
            <div className="relative group flex items-center gap-1">
              {mediaType !== "link" ? (
                <button
                  className={`bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${
                    mediaType && mediaType !== "link" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (!mediaType) setMediaType("link");
                  }}
                  disabled={mediaType && mediaType !== "link"}
                  title="Insert Link"
                >
                  <FaLink className="text-2xl" />
                  <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">
                    Insert Link
                  </span>
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter link URL"
                    className="rounded px-2 py-1 text-[0.6em]"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button
                    className="bg-[var(--pink)] text-white rounded px-2 py-1 text-[0.6em]"
                    onClick={() => {
                      handleSaveInputMedia();
                      setMediaType("link");
                    }}
                    disabled={inputValue.trim() === ""}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-600 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center text-white text-xs"
                    onClick={handleRemoveMedia}
                    title="Remove Link"
                  >
                    X
                  </button>
                </>
              )}
              {mediaType === "link" && mediaValue && mediaValue !== "" && (
                <span className="text-[0.6em] truncate max-w-xs">{mediaValue}</span>
              )}
            </div>

            {/* File Input */}
            <div className="relative group">
              <label
                htmlFor="fileInput"
                className={`bgGray cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${
                  mediaType && mediaType !== "file" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={mediaType === "file" ? "Remove existing file first" : "Insert File"}
                onClick={() => {
                  if (!mediaType) setMediaType("file");
                }}
              >
                <FaFileAlt className="text-2xl" />
                <span className="absolute bottom-full w-20 mb-1 hidden group-hover:block bg-black text-white text-[0.6em] rounded px-2 py-1">
                  Insert File
                </span>
              </label>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (!mediaType || mediaType === "file") handleFileInputChange(e);
                  e.target.value = null;
                }}
                disabled={mediaType && mediaType !== "file"}
              />
            </div>
            {mediaType === "file" && mediaValue && (
              <button
                className="bg-red-600 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center text-white text-xs"
                onClick={handleRemoveMedia}
                title="Remove File"
              >
                X
              </button>
            )}
          </div>
          <div className="text-[0.6em] flex gap-3 text-white">
            <button
              className="hover:scale-95 shadow-[var(--shadow-pink)] bg-[var(--pink)] rounded-full px-3 w-30"
              onClick={() => {
                const errors = [];
                if (!userData.name) {
                  errors.push("Enter username in profile settings before publishing.");
                }
                if (!userData.species) {
                  errors.push("Enter your species in profile settings before publishing.");
                }
                if (errors.length > 0) {
                  setErrorMsg(errors);
                  return;
                }
                setErrorMsg([]);
                const newPost = {
                  title,
                  body: text,
                  author: userData.name,
                  author_img: userData.avatar,
                  date: new Date().toISOString(),
                  media: {
                    image: mediaType === "image" ? mediaValue : null,
                    video: mediaType === "video" ? mediaValue : null,
                    link: mediaType === "link" ? mediaValue : null,
                    file: mediaType === "file" ? mediaValue : null,
                  },
                };
                mutation.mutate(newPost);
              }}
            >
              Publish
            </button>
            <button
              onClick={() => setDiscard(true)}
              className="hover:scale-95 shadow-[var(--shadow-blue)] bg-[var(--blue)] rounded-full px-3 w-30"
            >
              Discard
            </button>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}

export default InputFields;
