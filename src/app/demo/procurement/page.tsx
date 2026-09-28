import GuidedScenario from "@/components/demo/guided-scenario";
import Explorer from "@/components/demo/explorer";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return mode === "explore" ? (
    <Explorer id="procurement" />
  ) : (
    <GuidedScenario id="procurement" />
  );
}
