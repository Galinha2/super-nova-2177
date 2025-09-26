"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import LiquidGlass from "../liquid glass/LiquidGlass";
import { FaImage, FaVideo } from "react-icons/fa6";
import { FaLink, FaFileAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useUser } from "../profile/UserContext";
import Error from "../Error";
import MediaInput from "./Media";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function uploadMediaFile(file, type) {
  const formData = new FormData();
  let fileToUpload = file;
  if (type === "image" && file instanceof File) {
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      fileToUpload = await imageCompression(file, options);
    } catch {
      fileToUpload = file;
    }
  }
  formData.append("file", fileToUpload);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-${type}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error(`Failed to upload ${type} file`);
  const data = await response.json();
  return data.filename || data.url || "";
}

function InputFields({ setDiscard }) {
  const { userData } = useUser();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState([]);
  const [mediaType, setMediaType] = useState("");
  const [mediaValue, setMediaValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const handleRemoveMedia = () => {
    setMediaType("");
    setMediaValue("");
    setInputValue("");
    setSelectedFile("");
  };

  const handleFileChange = async (e) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) return;

    if (fileObj.type.startsWith("image/")) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
        const compressedFile = await imageCompression(fileObj, options);
        setSelectedFile(compressedFile);
        setMediaType("image");
        setMediaValue(compressedFile.name);
      } catch {
        setSelectedFile(fileObj);
        setMediaType("image");
        setMediaValue(fileObj.name);
      }
    } else {
      setSelectedFile(fileObj);
      setMediaType("file");
      setMediaValue(fileObj.name);
    }
  };

  const handleFileInputChange = (e) => setInputValue(e.target.value);
  const handleSaveInputMedia = () => {
    if (!inputValue.trim()) return;
    setMediaValue(inputValue.trim());
    setInputValue("");
  };

  const mutation = useMutation(
    async (newPost) => {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("body", newPost.text);
      formData.append("author", newPost.userName);
      formData.append("author_type", newPost.author_type);
      formData.append("author_img", newPost.author_img);
      formData.append("date", newPost.date);

      if (newPost.image) formData.append("image", newPost.image);
      if (newPost.file) formData.append("file", newPost.file);
      if (newPost.video) formData.append("video", newPost.video);
      if (newPost.link) formData.append("link", newPost.link);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      return response.json();
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["proposals"]),
      onError: (error) => setErrorMsg([error.message]),
    }
  );

  return (
    <div className="fixed z-100 bottom-0 md:top-0 left-0 lg:relative lg:mt-[-70px]">
      {errorMsg.length > 0 && <Error messages={errorMsg} />}
      <LiquidGlass className="lg:p-5 h-auto bgGrayDark w-screen lg:w-150 xl:w-200 lg:rounded-[30px]">
        <div className="w-screen pt-30 lg:pt-0 p-5 lg:p-0 m-auto h-screen lg:h-auto lg:w-140 xl:w-190 flex text-[var(--text-black)] flex-col gap-4">
          <h1>Title</h1>
          <input
            type="text"
            placeholder="Insert Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white rounded-full shadow-md px-4 py-1 w-full text-[0.6em]"
          />
          <textarea
            placeholder="Insert Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-white rounded-[20px] h-50 shadow-md px-4 py-1 w-full text-[0.5em]"
          />
          <div className="flex gap-3 text-[0.6em] items-center">
            <MediaInput
              type="image"
              icon={<FaImage className="text-2xl" />}
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
                if (!title.trim()) errors.push("No post Title found.");
                if (!text.trim() && !mediaValue && !selectedFile) errors.push("No post Media found.");
                if (!userData?.name) errors.push("Enter username in profile settings before publishing.");
                if (!userData?.species) errors.push("Enter your species in profile settings before publishing.");
                if (errors.length > 0) {
                  setErrorMsg(errors);
                  return;
                }
                setErrorMsg([]);

                let uploadedMediaUrl = "";
                if ((mediaType === "image" || mediaType === "file") && selectedFile) {
                  try {
                    uploadedMediaUrl = await uploadMediaFile(selectedFile, mediaType);
                  } catch {
                    setErrorMsg([`Failed to upload ${mediaType} file.`]);
                    return;
                  }
                }

                const newPost = {
                  title,
                  text,
                  userName: userData.name,
                  author_type: userData.species,
                  author_img: userData.avatar || "",
                  date: new Date().toISOString(),
                  image: mediaType === "image" ? uploadedMediaUrl : "",
                  file: mediaType === "file" ? uploadedMediaUrl : "",
                  video: mediaType === "video" ? mediaValue : "",
                  link: mediaType === "link" ? mediaValue : "",
                };

                mutation.mutate(newPost);
                setDiscard(true);
                handleRemoveMedia();
                setTitle("");
                setText("");
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
