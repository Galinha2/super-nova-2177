"use client";
import { useState, useRef, useEffect } from "react";
import CreatePost from "../create post/CreatePost";
import ProposalCard from "./content/ProposalCard";
import InputFields from "../create post/InputFields";
import CardLoading from "../CardLoading";
import { useQuery } from "@tanstack/react-query";

function formatRelativeTime(dateString) {
  if (!dateString) return "now";

  const now = new Date();
  const date = new Date(dateString); // converte ISO para local
  const diffMs = now.getTime() - date.getTime(); // em ms

  if (diffMs < 0) return "now"; // previne datas futuras

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

function Proposal({ activeBE, setActiveBE }) {
  const [discard, setDiscard] = useState(true);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", activeBE],
    queryFn: async () => {
      if (!activeBE) {
        const res = await fetch("http://localhost:8000/proposals");
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      } else {
        // Fake API with date added for each post
        return [
          {
            userName: "Sophie Lee",
            userInitials: "SL",
            date: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
            title: "Check this out",
            video: "https://www.youtube.com/embed/ZeerrnuLi5E",
            likes: 11,
            dislikes: 2,
            comments: [
              {
                image:
                  "https://t4.ftcdn.net/jpg/03/96/16/79/360_F_396167959_aAhZiGlJoeXOBHivMvaO0Aloxvhg3eVT.jpg",
                name: "Ethan Black",
                comment: "Nice find!",
              },
              { name: "Fiona Gray", comment: "Thanks for sharing!" },
              {
                image:
                  "https://blog.stocksnap.io/content/images/2022/02/smiling-woman_W6GFOSFAXA.jpg",
                name: "Gray May",
                comment:
                  "Thanks for sharing! for sharing! for sharing! for sharing!",
              },
            ],
          },
          {
            userName: "Alice Johnson",
            userInitials: "AJ",
            date: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
            title: "Excited to share this!",
            text: "Just finished my latest project, feeling accomplished!",
            video: "",
            likes: 3,
            dislikes: 1,
            comments: [
              { name: "Bob Smith", comment: "Amazing work!" },
              {
                image:
                  "https://img.freepik.com/free-photo/lifestyle-people-emotions-casual-concept-confident-nice-smiling-asian-woman-cross-arms-chest-confident-ready-help-listening-coworkers-taking-part-conversation_1258-59335.jpg",
                name: "Clara White",
                comment: "Congrats!",
              },
            ],
          },
          {
            userName: "Michael Brown",
            userInitials: "MB",
            date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
            title: "Watch this video!",
            video:
              "https://www.youtube.com/watch?v=2iK3ccCsI6s&ab_channel=SMTOWN",
            likes: 1,
            dislikes: 4,
            comments: [{ name: "Diana Green", comment: "Interesting video!" }],
          },
          {
            userName: "Tom Harris",
            userInitials: "TH",
            date: new Date(Date.now() - 15 * 86400000).toISOString(), // 15 days ago
            title: "Random thoughts",
            text: "It's been a productive day. Feeling motivated to continue learning new skills.",
            video: "",
            likes: 5,
            dislikes: 2,
            comments: [],
          },
          {
            userName: "Emma Wilson",
            userInitials: "EW",
            date: new Date(Date.now() - 45 * 86400000).toISOString(), // 45 days ago
            title: "Another random post",
            text: "Sharing some thoughts on productivity and workflow optimization.",
            likes: 4,
            dislikes: 12,
            comments: [{ name: "Liam King", comment: "Great insights!" }],
          },
        ];
      }
    },
  });

  return (
    <div className="mb-50 lg:mb-10 flex flex-col items-center m-auto mt-5 lg:mt-50 gap-10 justify-center">
      {discard ? (
        <CreatePost setDiscard={setDiscard} />
      ) : (
        <div ref={inputRef}>
          <InputFields setDiscard={setDiscard} />
        </div>
      )}

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <CardLoading key={i} />)
        : posts?.map((post, index) => (
            <ProposalCard
              key={index}
              userName={post.userName}
              userInitials={post.userInitials}
              time={formatRelativeTime(post.time)}
              title={post.title}
              logo={post.author_img}
              media={{
                image: post.media?.image
                  ? `http://localhost:8000${post.media.image}`
                  : post.image
                  ? `http://localhost:8000${post.image}`
                  : "",
                video: post.media?.video || post.video || "",
                link: post.media?.link || post.link || "",
                file: post.media?.file
                  ? `http://localhost:8000${post.media.file}`
                  : post.file
                  ? `http://localhost:8000${post.file}`
                  : "",
              }}
              text={post.text}
              comments={post.comments}
              likes={post.likes}
              dislikes={post.dislikes}
            />
          ))}
    </div>
  );
}

export default Proposal;
