"use client";
import { useEffect, useState } from "react";
import ProposalCard from "@/content/proposal/content/ProposalCard";

export default function ProposalClient({ id }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProposal() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/proposals/${id}`);
        if (!res.ok) throw new Error("Failed to fetch proposal");
        const data = await res.json();
        setProposal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProposal();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!proposal) return <p>No proposal found.</p>;

  return (
    <div className="lg:mt-30 w-screen items-start justify-center flex">
        <ProposalCard
        className={"w-screen rounded-[0px]"}
          id={proposal.id}
          userName={proposal.userName}
          userInitials={proposal.userInitials}
          time={proposal.time}
          title={proposal.title}
          text={proposal.text}
          logo={proposal.author_img}
          media={proposal.media}
          likes={proposal.likes}
          dislikes={proposal.dislikes}
          comments={proposal.comments}
          specie={proposal.author_type}
        />
    </div>
  );
}