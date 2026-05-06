import { useMemo } from "react"
import { useParams } from "react-router-dom"
import ProductPage from "@/app/products/[id]/page"

export function ProductPageRoute() {
  const { id } = useParams()

  const params = useMemo(() => Promise.resolve({ id: id ?? "" }), [id])

  return <ProductPage params={params} />
}

