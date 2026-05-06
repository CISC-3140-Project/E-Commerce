import type { ReactNode } from "react"
import { Link as RouterLink } from "react-router-dom"

type NextLinkProps = {
  href: string
  className?: string
  children?: ReactNode
}

export default function Link({ href, className, children }: NextLinkProps) {
  return (
    <RouterLink to={href} className={className}>
      {children}
    </RouterLink>
  )
}

