import { TipDetailPage } from "@/components/tip-detail-page"

export default async function TipRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TipDetailPage tipId={id} />
}
