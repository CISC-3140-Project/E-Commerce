import { useSearchParams as useRRSearchParams } from "react-router-dom"

export function useSearchParams() {
  return useRRSearchParams()[0]
}

export function notFound(): never {
  throw Object.assign(new Error("Not Found"), { status: 404 })
}

