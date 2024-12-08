import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key)
  const responseBody = await response.json();

  return responseBody
}


export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  let UpdatedAtText = "Carregando..."

  if(!isLoading && data) {
    UpdatedAtText = new Date(data.updated_at).toLocaleString("pt-BR")
  }

  return (
    <>
      <div>Ultima atualização: {UpdatedAtText}</div>
      <div>
        Versão do postgres: {JSON.stringify(data.dependencies.database.version)}
      </div>
      <div>
        Quantidade maxima de conecções:{" "}
        {JSON.stringify(data.dependencies.database.max_connections)}
      </div>
      <div>
        Quantidade de conecções abertas:{" "}
        {JSON.stringify(data.dependencies.database.opened_connections)}
      </div>
    </>
  );
}