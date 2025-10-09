"use client";
import { useState } from "react";
import { useUser } from "@/content/profile/UserContext";
import supabase from "@/lib/supabaseClient";

function InsertComment({
  proposalId,
  setNotify = () => {},
  setErrorMsg = () => {},
  setLocalComments = () => {}
}) {
  const { userData, defaultAvatar } = useUser();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidImage = (url) => {
    return /\.(jpeg|jpg|png)$/i.test(url);
  };

  const handlePublish = async () => {
    const errors = [];
    if (!userData?.name) errors.push("User name is missing.");
    if (!proposalId) errors.push("Proposal ID is missing.");
    if (!comment.trim()) errors.push("Comment is empty.");

    if (errors.length > 0) {
      setErrorMsg(errors);
      return; // stop before sending
    }

    // only here the update in supabase is done
    let avatar = defaultAvatar || userData.initials;
    if (userData.avatar && isValidImage(userData.avatar)) {
      avatar = userData.avatar;
    }

    setLoading(true);
    try {
      // Fetch current comments array from the proposals table
      const { data, error: fetchError } = await supabase
        .from("proposals")
        .select("comments")
        .eq("id", Number(proposalId))
        .single();

      if (fetchError) {
        setErrorMsg([`Failed to fetch comments: ${fetchError.message}`]);
        setLoading(false);
        return;
      }

      const currentComments = data?.comments || [];

      const newComment = {
        proposal_id: Number(proposalId),
        user: userData.name,
        user_img: avatar,
        comment: comment.trim(),
      };

      const updatedComments = [...currentComments, newComment];

      // Update the comments JSON field in proposals table
      const { error: updateError } = await supabase
        .from("proposals")
        .update({ comments: updatedComments })
        .eq("id", Number(proposalId));

      if (updateError) {
        setErrorMsg([`Failed to post comment: ${updateError.message}`]);
        setLoading(false);
        return;
      }

      setNotify(["Comment Submitted"]);
      setComment("");
      setLocalComments(updatedComments);
    } catch (err) {
      setErrorMsg([`Error sending comment: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex gap-2 items-center justify-start mb-5">
      <div className="rounded-full bg-[var(--gray)] shadow-sm h-10 w-14 flex items-center justify-center overflow-hidden">
        {userData.avatar && isValidImage(userData.avatar) && !imgError ? (
          <img
            src={userData.avatar}
            alt={userData.name}
            className="h-10 w-10 object-cover rounded-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[var(--text-gray)] font-bold">
            {userData.initials}
          </span>
        )}
      </div>
      <input
        type="text"
        placeholder="Insert Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-[var(--gray)] rounded-full shadow-sm px-4 py-0 h-10 w-full"
      />
      <button
        onClick={handlePublish}
        disabled={loading}
        className="bg-[var(--pink)] text-white px-3 rounded-full h-10 shadow-sm hover:scale-95 cursor-pointer disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}

export default InsertComment;
