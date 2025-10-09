import ProposalClient from "./ProposalClient";
import supabase from "@/lib/supabaseClient";

export async function generateStaticParams() {
  // Busca todos os IDs válidos da tabela 'proposals' do Supabase
  const { data, error } = await supabase
    .from("proposals")
    .select("id");

  if (error) {
    console.error("Erro ao buscar IDs de propostas:", error);
    return [];
  }

  // Filtra propostas inválidas (id nulo ou undefined)
  const validData = data.filter(proposal => proposal?.id != null);

  return validData.map(proposal => ({
    id: proposal.id.toString()
  }));
}

export default function ProposalPage({ params }) {
  return <ProposalClient id={params.id} />;
}