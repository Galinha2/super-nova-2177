import ProposalClient from "./ProposalClient";

export default function ProposalPage({ params }) {
  return <ProposalClient id={params.id} />;
}