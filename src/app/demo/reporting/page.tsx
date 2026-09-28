import Reporting from "@/components/demo/reporting";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string; doc?: string }>;
}) {
  const { scenario, doc } = await searchParams;
  return (
    <Reporting
      key={`${scenario ?? "all"}:${doc ?? ""}`}
      initialScenario={scenario}
      initialDocument={doc}
    />
  );
}
