"use client";
import { useState, useRef, useEffect } from "react";
import CreatePost from "../create post/CreatePost";
import ProposalCard from "./content/ProposalCard";
import InputFields from "../create post/InputFields";

function Proposal() {
  const [discard, setDiscard] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setDiscard(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);

  // Posts existentes + post adicional
  const posts = [
    {
      userName: "Sophie Lee",
      userInitials: "SL",
      time: "01:45 pm",
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
          comment: "Thanks for sharing! for sharing! for sharing! for sharing!",
        },
      ],
    },
    {
      userName: "Alice Johnson",
      userInitials: "AJ",
      time: "09:15 am",
      title: "Excited to share this!",
      text: "Just finished my latest project, feeling accomplished!",
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
      time: "11:30 am",
      title: "Watch this video!",
      video: "https://www.youtube.com/embed/2iK3ccCsI6s",
      likes: 1,
      dislikes: 4,
      comments: [{ name: "Diana Green", comment: "Interesting video!" }],
    },
    {
      userName: "Sophie Lee",
      userInitials: "SL",
      time: "01:45 pm",
      title: "Check this out",
      video: "https://www.youtube.com/embed/phuiiNCxRMg",
      likes: 11,
      dislikes: 2,
      comments: [
        {
          image:
            "https://www.shutterstock.com/image-photo/handsome-happy-african-american-bearded-600nw-2460702995.jpg",
          name: "Ethan Black",
          comment: "Nice find!",
        },
        { name: "Fiona Gray", comment: "Thanks for sharing!" },
      ],
    },
    {
      userName: "Tom Harris",
      userInitials: "TH",
      time: "03:00 pm",
      title: "Random thoughts",
      text: "It's been a productive day. Feeling motivated to continue learning new skills.",
      likes: 5,
      dislikes: 2,
      comments: [],
    },
    {
      userName: "Emma Wilson",
      userInitials: "EW",
      time: "04:30 pm",
      title: "Another random post",
      text: "Sharing some thoughts on productivity and workflow optimization.",
      likes: 4,
      dislikes: 12,
      comments: [{ name: "Liam King", comment: "Great insights!" }],
    },
  ];

  return (
    <div className="mb-50 lg:mb-10 flex flex-col items-center m-auto mt-5 lg:mt-50 gap-10 justify-center">
      {discard ? (
        <CreatePost setDiscard={setDiscard} />
      ) : (
        <div ref={inputRef}>
          <InputFields setDiscard={setDiscard} />
        </div>
      )}

      {posts.map((post, index) => (
        <ProposalCard
          key={index}
          userName={post.userName}
          userInitials={post.userInitials}
          time={post.time}
          title={post.title}
          video={post.video}
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
