"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ComputerColumn = {
    id: string;
    name: string;
    price: string;
    processors: string;
    graphics: string;
    memory: string;
    motherboard: string;
    color: string;
    isFeatured: boolean;
    isArchived: boolean;
    deliveryTime: string;
    createdAt: string;
}

export const columns: ColumnDef<ComputerColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "price",
        header: "Price",
    },
    {
        accessorKey: "processors",
        header: "Processor",
    },
    {
        accessorKey: "graphics",
        header: "GPU",
    },
    {
        accessorKey: "memory",
        header: "Memory",
    },
    {
        accessorKey: "motherboard",
        header: "Motherboard",
    },
    {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                {row.original.color}
                <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: row.original.color }} />
            </div>
        )
    },
    {
        accessorKey: "isFeatured",
        header: "Featured",
    },
    {
        accessorKey: "isArchived",
        header: "Archived",
    },
    {
        accessorKey: "deliveryTime",
        header: "Delivery Time",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original}/>
    }
]
