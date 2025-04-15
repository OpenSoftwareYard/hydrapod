import type { ColumnDef } from '@tanstack/vue-table'
import type { Zone } from '@/lib/types'

// Define the columns for the Zone data table
export const columns: ColumnDef<Zone>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return id.substring(0, 8) + '...'
    },
  },
  {
    accessorKey: 'cpuCount',
    header: 'CPU Cores',
  },
  {
    accessorKey: 'ramGB',
    header: 'RAM (GB)',
    cell: ({ row }) => {
      const ramGB = row.getValue('ramGB') as number
      return `${ramGB} GB`
    },
  },
  {
    accessorKey: 'diskGB',
    header: 'Disk (GB)',
    cell: ({ row }) => {
      const diskGB = row.getValue('diskGB') as number
      return `${diskGB} GB`
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      // Return a string with a custom class that will be applied in the template
      return status
    },
  },
]
