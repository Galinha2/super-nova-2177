"use client";
import { useState, useRef, useEffect } from "react";
import CreatePost from "../create post/CreatePost";
import ProposalCard from "./content/ProposalCard";
import InputFields from "../create post/InputFields";
import CardLoading from "../CardLoading";
import { useQuery } from "@tanstack/react-query";
import FilterHeader from "../filters/FilterHeader";
import { generateRandomProposals } from "@/utils/fakeApi";

function formatRelativeTime(dateString) {
  if (!dateString) return "now";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime(); // em ms

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

function fetchFakeProposals() {
  return Promise.resolve(generateRandomProposals(5, true));
}

function Proposal({ activeBE, setErrorMsg, setNotify }) {
  const [discard, setDiscard] = useState(true);
  const [filter, setFilter] = useState("All");
  const inputRef = useRef(null);
  const [search, setSearch] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["proposals", filter, search, activeBE],
    queryFn: async () => {
      if (activeBE) {
        return fetchFakeProposals();
      } else {
        const filterMap = {
          All: "all",
          Latest: "latest",
          Oldest: "oldest",
          "Top Liked": "topLikes",
          "Less Liked": "fewestLikes",
          Popular: "popular",
          AI: "ai",
          Company: "company",
          Human: "human",
        };
        const filterParam = filterMap[filter];
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let url = `${apiUrl}/proposals?filter=${filterParam}`;
        if (search && search.trim() !== "") {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      }
    },
    keepPreviousData: true,
  });

  return (
    <div className="mb-50 mt-20 lg:mb-10 xl:mx-auto lg:mr-80 flex flex-col-reverse lg:flex-row items-center lg:items-start m-auto lg:mt-50  gap-10 justify-center relative">
      <div className="flex flex-col gap-10">
        {discard ? (
          <CreatePost setDiscard={setDiscard} />
        ) : (
          <div ref={inputRef}>
            <InputFields activeBE={activeBE} setDiscard={setDiscard} />
          </div>
        )}
        <div className="flex lg:flex-col gap-10 flex-col">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <CardLoading key={i} />)
          ) : posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <ProposalCard
                key={post.id}
                id={post.id}
                userName={post.userName}
                userInitials={post.userInitials}
                time={formatRelativeTime(post.time)}
                title={post.title}
                logo={post.author_img}
                media={{
                  image: post.media?.image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${post.media.image}`
                    : post.image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${post.image}`
                    : "",
                  video: post.media?.video || post.video || "",
                  link: post.media?.link || post.link || "",
                  file: post.media?.file
                    ? `${process.env.NEXT_PUBLIC_API_URL}${post.media.file}`
                    : post.file
                    ? `${process.env.NEXT_PUBLIC_API_URL}${post.file}`
                    : "",
                }}
                text={post.text}
                comments={post.comments}
                likes={post.likes}
                dislikes={post.dislikes}
                setErrorMsg={setErrorMsg}
                setNotify={setNotify}
                specie={post.author_type}
                activeBE={activeBE}
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