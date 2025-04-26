import type { ColumnDef } from '@tanstack/vue-table'
import type { PhysicalZone } from '@/lib/types'

// Define the columns for the PhysicalZone data table
export const zoneColumns: ColumnDef<PhysicalZone>[] = [
  {
    accessorKey: 'zonename',
    header: 'ID',
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
  },
  {
    accessorFn: (row) => row['capped-cpu']?.ncpus,
    id: 'cpu',
    header: 'CPU',
    cell: ({ row }) => {
      const cpuValue = row.getValue('cpu')
      return cpuValue !== undefined ? cpuValue : 'N/A'
    },
  },
  {
    accessorFn: (row) => row['capped-memory']?.physical,
    id: 'ram',
    header: 'RAM (GB)',
    cell: ({ row }) => {
      const ramValue = row.getValue('ram')
      return ramValue !== undefined ? ramValue : 'N/A'
    },
  },
  // Uncomment if status is added in the future
  /*
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return status
    },
  },
  */
]
