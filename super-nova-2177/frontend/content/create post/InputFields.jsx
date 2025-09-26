"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import LiquidGlass from "../liquid glass/LiquidGlass";
import { FaImage, FaVideo } from "react-icons/fa6";
import { FaLink, FaFileAlt } from "react-icons/fa";
import { useUser } from "../profile/UserContext";
import Error from "../Error";
import MediaInput from "./Media";
import supabase from "../../supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

function InputFields({ setDiscard }) {
  const { userData } = useUser();
  const queryClient = useQueryClient(); // react-query client

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState([]);
  const [mediaType, setMediaType] = useState("");
  const [mediaValue, setMediaValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleRemoveMedia = () => {
    setMediaType("");
    setMediaValue("");
    setInputValue("");
    setSelectedFile(null);
  };

  const handleFileChange = async (e) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) return;

    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(fileObj, options);
      setSelectedFile(compressedFile);
      setMediaType("image");
      setMediaValue(compressedFile.name);
    } catch {
      setSelectedFile(fileObj);
      setMediaType("image");
      setMediaValue(fileObj.name);
    }
  };

  const handleFileInputChange = async (e) => {
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

    const handlePublishPost = async () => {
    const errors = [];
    if (!title.trim()) errors.push("No post Title found.");
    if (!text.trim() && !mediaValue && !selectedFile) errors.push("No post Media found.");
    if (!userData?.name) errors.push("Enter username before publishing.");
    if (!userData?.species) errors.push("Enter specie before publishing.");
    if (errors.length > 0) {
      setErrorMsg(errors);
      return;
    }

    setErrorMsg([]);
    try {
      let uploadedFileUrl = "";

      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`.replace(/\s/g, "_");

        const { data, error: uploadError } = await supabase.storage
          .from("proposals")
          .upload(fileName, selectedFile, { cacheControl: "3600", upsert: true });

        if (uploadError) {
          setErrorMsg([`Failed to upload file: ${uploadError.message}`]);
          return;
        }

        if (!data?.path) {
          setErrorMsg(["Upload did not return a valid path."]);
          return;
        }

        const { publicUrl, error: urlError } = supabase.storage
          .from("proposals")
          .getPublicUrl(data.path);

        if (urlError || !publicUrl) {
          setErrorMsg([`Failed to get public URL for uploaded file.`]);
          return;
        }

        uploadedFileUrl = publicUrl;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("proposals")
        .insert({
          title,
          text,
          userName: userData.name,
          author_type: userData.species,
          image: mediaType === "image" ? uploadedFileUrl : "",
          video: mediaType === "video" ? mediaValue : "",
          link: mediaType === "link" ? mediaValue : "",
          file: mediaType === "file" ? uploadedFileUrl : "",
          media: {
            image: mediaType === "image" ? uploadedFileUrl : "",
            file: mediaType === "file" ? uploadedFileUrl : "",
            video: mediaType === "video" ? mediaValue : "",
            link: mediaType === "link" ? mediaValue : ""
          },
          likes: [],
          dislikes: [],
          comments: [],
          time: new Date().toISOString()
        })
        .select();

      if (insertError) throw new Error(`Failed to create post: ${insertError.message}`);

      // Limpar campos
      setTitle("");
      setText("");
      setSelectedFile(null);
      setMediaType("");
      setMediaValue("");
      setDiscard(true);

    } catch (err) {
      setErrorMsg([err.message]);
    }
  };


  return (
    <div className="fixed z-100 bottom-0 md:top-0 left-0 lg:relative lg:mt-[-70px]">
      {errorMsg.length > 0 && <Error messages={errorMsg} />}
      <LiquidGlass className="lg:p-5 h-auto bgGrayDark w-screen lg:w-150 xl:w-200 lg:rounded-[30px]">
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
              onClick={handlePublishPost}
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