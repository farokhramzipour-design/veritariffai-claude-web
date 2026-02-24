export default function ResultPage({ params }: { params: { id: string } }) {
  return <h1>Result ID: {params.id}</h1>;
}
