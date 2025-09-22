import { useParams } from "next/navigation";

export default function ProposalPage() {
  const params = useParams();
  const proposalId = params.id;

  const [proposal, setProposal] = React.useState(null);

  React.useEffect(() => {
    async function fetchProposal() {
      const res = await fetch(`http://localhost:8000/proposals/${proposalId}`);
      const data = await res.json();
      setProposal(data);
    }
    fetchProposal();
  }, [proposalId]);

  if (!proposal) return <p>Loading...</p>;

  return (
    <div>
      <h1>{proposal.title}</h1>
      <p>{proposal.text}</p>
      {/* resto do conteúdo do proposal */}
    </div>
  );
}