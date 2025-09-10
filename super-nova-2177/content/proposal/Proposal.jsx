import CreatePost from "../CreatePost";
import ProposalCard from "./content/ProposalCard";

function Proposal() {
  return (
    <div className="flex flex-col items-center m-auto mt-5 lg:mt-50 gap-10 justify-center">
      <CreatePost />
      <ProposalCard />
      <ProposalCard />
      <ProposalCard />
      <ProposalCard />
    </div>
  );
}

export default Proposal;
