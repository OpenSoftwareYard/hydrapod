import type { ColumnDef } from '@tanstack/vue-table'
import type { ApiKey } from '@/lib/types'

// Define the columns for the API Keys data table
export const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires At',
    cell: ({ row }) => {
      const expiresAt = row.getValue('expiresAt') as Date
      return new Date(expiresAt).toLocaleDateString()
    },
  },
]
