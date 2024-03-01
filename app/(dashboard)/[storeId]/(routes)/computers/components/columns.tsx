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
