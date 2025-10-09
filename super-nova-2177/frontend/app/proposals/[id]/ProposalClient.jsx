"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import ProposalCard from "@/content/proposal/content/ProposalCard";
import Loading from "@/app/loading";

export default function ProposalClient({ id }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProposal() {
      try {
        const { data, error } = await supabase
          .from("proposals")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw new Error(error.message);
        setProposal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProposal();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!proposal) return <p>Proposal not found!</p>;

  return (
    <div className="lg:mt-30 w-screen items-start justify-center flex">
      <ProposalCard
        className="w-screen md:rounded-[20px] rounded-[0px]"
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