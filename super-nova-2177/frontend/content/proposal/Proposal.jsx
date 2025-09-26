"use client";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import CreatePost from "../create post/CreatePost";
import ProposalCard from "./content/ProposalCard";
import InputFields from "../create post/InputFields";
import CardLoading from "../CardLoading";
import FilterHeader from "../filters/FilterHeader";
import supabase from "../../supabaseClient";

function formatRelativeTime(dateString) {
  if (!dateString) return "now";

  // Forçar interpretação como UTC
  const date = new Date(dateString + "Z"); 
  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 0) return "now";

  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return diffYears === 1 ? "1y" : `${diffYears}y`;
  if (diffMonths > 0) return diffMonths === 1 ? "1mo" : `${diffMonths}mo`;
  if (diffDays > 0) return diffDays === 1 ? "1d" : `${diffDays}d`;
  if (diffHours > 0) return diffHours === 1 ? "1h" : `${diffHours}h`;
  if (diffMin > 0) return diffMin === 1 ? "1min" : `${diffMin}min`;
  return "now";
}

function Proposal({ activeBE, setErrorMsg, setNotify }) {
  const [discard, setDiscard] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["proposals", filter, search],
    queryFn: async () => {
      let query = supabase
        .from("proposals")
        .select(`
          id,
          userName,
          userInitials,
          time,
          title,
          author_img,
          author_type,
          media,
          image,
          video,
          link,
          file,
          text,
          likes,
          dislikes,
          comments
        `);

      // Apply filter
      switch (filter) {
        case "Latest":
          query = query.order("time", { ascending: false });
          break;
        case "Oldest":
          query = query.order("time", { ascending: true });
          break;
        case "Top Liked":
          query = query.order("likes", { ascending: false });
          break;
        case "Less Liked":
          query = query.order("likes", { ascending: true });
          break;
        case "Popular":
          query = query.order("comments_count", { ascending: false });
          break;
        case "AI":
        case "Company":
        case "Human":
          query = query.eq("author_type", filter.toLowerCase());
          break;
        default:
          query = query.order("time", { ascending: false });
          break;
      }

      // Apply search filter if present
      if (search && search.trim() !== "") {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        setErrorMsg([error.message]);
        return [];
      }

      // Ensure JSON fields are arrays or objects
      return data.map(post => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes : [],
        dislikes: Array.isArray(post.dislikes) ? post.dislikes : [],
        comments: Array.isArray(post.comments) ? post.comments : [],
        media: post.media || {
          image: post.image || "",
          video: post.video || "",
          link: post.link || "",
          file: post.file || ""
        }
      }));
    },
    keepPreviousData: true
  });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="mb-50 lg:mb-10 flex flex-col-reverse lg:flex-row items-center lg:items-start m-auto mt-5 lg:mt-50 gap-10 justify-center relative">
      <div className="flex flex-col gap-10">
        {discard ? (
          <CreatePost setDiscard={setDiscard} />
        ) : (
          <div ref={inputRef}>
            <InputFields setDiscard={setDiscard} />
          </div>
        )}

        <div className="flex lg:flex-col gap-10 flex-col">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <CardLoading key={i} />)
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <ProposalCard
                key={post.id}
                id={post.id}
                userName={post.userName}
                userInitials={post.userInitials}
                time={formatRelativeTime(post.time)}
                title={post.title}
                logo={post.author_img}
                media={{
                  image: post.media?.image || post.image || "",
                  video: post.media?.video || post.video || "",
                  link: post.media?.link || post.link || "",
                  file: post.media?.file || post.file || ""
                }}
                text={post.text}
                comments={post.comments}
                likes={post.likes}
                dislikes={post.dislikes}
                setErrorMsg={setErrorMsg}
                setNotify={setNotify}
                specie={post.author_type}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No Proposals found.</p>
          )}
        </div>
      </div>

      <FilterHeader
        setSearch={setSearch}
        search={search}
        filter={filter}
        setFilter={setFilter}
      />
    </div>
  );
}

export default Proposal;