import type { ColumnDef } from '@tanstack/vue-table'
import type { Node } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { h } from 'vue'
import { useRouter } from 'vue-router'

// Define the columns for the Node data table
export const nodeColumns: ColumnDef<Node>[] = [
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'port',
    header: 'Port',
  },
  {
    accessorKey: 'totalCpu',
    header: 'CPU',
  },
  {
    accessorKey: 'totalRamGB',
    header: 'RAM (GB)',
  },
  {
    accessorKey: 'totalDiskGB',
    header: 'Disk (GB)',
  },
  {
    accessorKey: 'health',
    header: 'Health',
    cell: ({ row }) => {
      const health = (row.getValue('health') as string) || 'Unknown'
      return health
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const node = row.original

      return h('div', { class: 'flex space-x-2' }, [
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            onClick: () => {
              // This will be handled in the component
              window.dispatchEvent(
                new CustomEvent('edit-node', {
                  detail: node,
                }),
              )
            },
          },
          () => 'Edit',
        ),
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            onClick: () => {
              // This will be handled in the component
              window.dispatchEvent(
                new CustomEvent('view-node-zones', {
                  detail: node.id,
                }),
              )
            },
          },
          () => 'Zones',
        ),
        h(
          Button,
          {
            variant: 'destructive',
            size: 'sm',
            onClick: () => {
              // This will be handled in the component
              window.dispatchEvent(
                new CustomEvent('delete-node', {
                  detail: node.id,
                }),
              )
            },
          },
          () => 'Delete',
        ),
      ])
    },
  },
]
