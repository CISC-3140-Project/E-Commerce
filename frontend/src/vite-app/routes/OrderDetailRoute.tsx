import { useMemo } from "react"
import { useParams } from "react-router-dom"
import OrderDetailPage from "@/app/orders/[id]/page"

export function OrderDetailRoute() {
  const { id } = useParams()
  const params = useMemo(() => Promise.resolve({ id: id ?? "" }), [id])
  return <OrderDetailPage params={params} />
}
