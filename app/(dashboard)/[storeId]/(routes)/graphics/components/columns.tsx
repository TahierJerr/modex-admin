"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type GraphicsColumn = {
    id: string
    name: string
    brand: string
    model: string
    memory: string
    memoryType: string
    maxClock: string
    createdAt: string;
}

export const columns: ColumnDef<GraphicsColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "brand",
        header: "Brand",
    },
    {
        accessorKey: "model",
        header: "Model",
    },
    {
        accessorKey: "memory",
        header: "Memory",
    },
    {
        accessorKey: "memoryType",
        header: "Memory Type",
    },
    {
        accessorKey: "maxClock",
        header: "Max Clock",
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
