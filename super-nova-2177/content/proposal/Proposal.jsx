import CreatePost from "../CreatePost"
import ProposalCard from "./ProposalCard"

function Proposal() {
    return (
        <div className="flex flex-col items-center m-auto mt-50 justify-center">
            <CreatePost />
            <ProposalCard />
            <ProposalCard />
            <ProposalCard />
            <ProposalCard />
        </div>
    )
}

export default Proposal
