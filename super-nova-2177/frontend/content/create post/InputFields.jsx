"use client";
import { useState } from "react";
import LiquidGlass from "../liquid glass/LiquidGlass";
import { FaImage, FaVideo } from "react-icons/fa6";
import { FaLink, FaFileAlt } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../profile/UserContext";
import Error from "../Error";
import { IoClose } from "react-icons/io5";
import MediaInput from "./Media";

function InputFields({ setDiscard }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState([]);
  const [mediaType, setMediaType] = useState(""); // "image", "video", "link", "file"
  const [mediaValue, setMediaValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const { userData } = useUser();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const formData = new FormData();
      formData.append("title", newPost.title || "");
      formData.append("body", newPost.body || "");
      formData.append("author", newPost.author || "");
      formData.append("author_img", newPost.author_img || "");
      formData.append("date", newPost.date || "");
      formData.append("video", newPost.video || "");
      formData.append("link", newPost.link || "");
      if ((mediaType === "image" || mediaType === "file") && selectedFile) {
        if (mediaType === "image") {
          formData.append("image", selectedFile);
        } else if (mediaType === "file") {
          formData.append("file", selectedFile);
        }
      }

      const response = await fetch("http://localhost:8000/proposals", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["posts"]),
  });

  const uploadMediaFile = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`http://localhost:8000/upload-${type}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`Failed to upload ${type}`);
    const data = await response.json();
    return data.filename || data.url || "";
  };

  const handleRemoveMedia = () => {
    setMediaType("");
    setMediaValue("");
    setInputValue("");
    setSelectedFile("");
  };

  const handleFileChange = (e) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) return;
    setSelectedFile(fileObj);
    setMediaType("image");
    setMediaValue(fileObj.name);
  };

  const handleFileInputChange = (e) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) return;
    setSelectedFile(fileObj);
    setMediaType("file");
    setMediaValue(fileObj.name);
  };

  const handleSaveInputMedia = async () => {
    if (inputValue.trim() === "") return;
    setMediaValue(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="fixed z-100 bottom-0 md:top-0 left-0 lg:relative lg:mt-[-70px]">
      {errorMsg.length > 0 && <Error messages={errorMsg} />}
      <LiquidGlass
        className={
          "lg:p-5 h-auto bgGrayDark w-screen lg:w-150 xl:w-200 lg:rounded-[30px]"
        }
      >
        <div className="w-screen pt-30 lg:pt-0 p-5 lg:p-0 m-auto h-screen lg:h-auto lg:w-140 xl:w-190 flex text-[var(--text-black)] flex-col gap-4">
          <h1>Title</h1>
          <input
            className="bg-white rounded-full shadow-md px-4 py-1 w-full text-[0.6em]"
            type="text"
            placeholder="Insert Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="bg-white rounded-[20px] h-50 shadow-md px-4 py-1 w-full text-[0.5em]"
            placeholder="Insert Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-3 text-[0.6em] items-center">
            <MediaInput
              type="image"
              icon={<FaImage className="text-2xl" />}
              accept="image/*"
              mediaType={mediaType}
              setMediaType={setMediaType}
              mediaValue={mediaValue}
              setMediaValue={setMediaValue}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleRemoveMedia={handleRemoveMedia}
              handleFileChange={handleFileChange}
              handleFileInputChange={handleFileInputChange}
              handleSaveInputMedia={handleSaveInputMedia}
            />
            <MediaInput
              type="video"
              icon={<FaVideo className="text-2xl" />}
              mediaType={mediaType}
              setMediaType={setMediaType}
              mediaValue={mediaValue}
              setMediaValue={setMediaValue}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleRemoveMedia={handleRemoveMedia}
              handleFileChange={handleFileChange}
              handleFileInputChange={handleFileInputChange}
              handleSaveInputMedia={handleSaveInputMedia}
            />
            <MediaInput
              type="link"
              icon={<FaLink className="text-2xl" />}
              mediaType={mediaType}
              setMediaType={setMediaType}
              mediaValue={mediaValue}
              setMediaValue={setMediaValue}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleRemoveMedia={handleRemoveMedia}
              handleFileChange={handleFileChange}
              handleFileInputChange={handleFileInputChange}
              handleSaveInputMedia={handleSaveInputMedia}
            />
            <MediaInput
              type="file"
              icon={<FaFileAlt className="text-2xl" />}
              mediaType={mediaType}
              setMediaType={setMediaType}
              mediaValue={mediaValue}
              setMediaValue={setMediaValue}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleRemoveMedia={handleRemoveMedia}
              handleFileChange={handleFileChange}
              handleFileInputChange={handleFileInputChange}
              handleSaveInputMedia={handleSaveInputMedia}
            />
          </div>
          <div className="text-[0.6em] flex gap-3 text-white">
            <button
              className="hover:scale-95 cursor-pointer shadow-[var(--shadow-pink)] bg-[var(--pink)] rounded-full px-3 w-30"
              onClick={async () => {
                const errors = [];
                if (!title) errors.push("No post Title found.");
                if (!text && !mediaValue) errors.push("No post Media found.");
                if (!userData.name)
                  errors.push(
                    "Enter username in profile settings before publishing."
                  );
                if (!userData.species)
                  errors.push(
                    "Enter your species in profile settings before publishing."
                  );
                if (errors.length > 0) {
                  setErrorMsg(errors);
                  return;
                }
                setErrorMsg([]);

                let uploadedMediaUrl = "";
                try {
                  if (
                    (mediaType === "image" || mediaType === "file") &&
                    selectedFile
                  ) {
                    const typeKey = mediaType === "image" ? "image" : "file";
                    uploadedMediaUrl = await uploadMediaFile(
                      selectedFile,
                      typeKey
                    );
                  }
                } catch (uploadError) {
                  setErrorMsg([`Failed to upload ${mediaType} file.`]);
                  return;
                }

                const newPost = {
                  title,
                  body: text,
                  author: userData.name,
                  author_img: userData.avatar,
                  date: new Date().toISOString(),
                  mediaType,
                  selectedFile: uploadedMediaUrl,
                  image:
                    mediaType === "image"
                      ? uploadedMediaUrl || mediaValue || inputValue
                      : "",
                  video:
                    mediaType === "video" ? mediaValue || inputValue : "",
                  link: mediaType === "link" ? mediaValue || inputValue : "",
                  file:
                    mediaType === "file"
                      ? uploadedMediaUrl || mediaValue || inputValue
                      : "",
                };
                mutation.mutate(newPost);
                setDiscard(true);
              }}
            >
              Publish
            </button>
            <button
              onClick={() => setDiscard(true)}
              className="hover:scale-95 cursor-pointer shadow-[var(--shadow-blue)] bg-[var(--blue)] rounded-full px-3 w-30"
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