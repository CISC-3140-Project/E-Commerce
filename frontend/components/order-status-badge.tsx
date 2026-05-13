import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusClasses: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800 border-transparent hover:bg-amber-100',
  processed: 'bg-purple-100 text-purple-800 border-transparent hover:bg-purple-100',
  shipped:   'bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100',
  delivered: 'bg-green-100 text-green-800 border-transparent hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-800 border-transparent hover:bg-red-100',
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn('capitalize', statusClasses[status] ?? 'bg-muted text-muted-foreground border-transparent')}>
      {status}
    </Badge>
  )
}
