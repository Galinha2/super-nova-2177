import ProposalClient from "./ProposalClient";

export default async function ProposalPage({ params }) {
  const { id } = await params;
  return <ProposalClient id={id} />;
}