"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type MemoryColumn = {
    id: string
    name: string
    model: string
    type: string
    speed: string
    capacity: string
    rgb: string
    createdAt: string;
}

export const columns: ColumnDef<MemoryColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "model",
        header: "Model",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "speed",
        header: "Speed",
    },
    {
        accessorKey: "capacity",
        header: "Capacity",
    },
    {
        accessorKey: "rgb",
        header: "RGB",
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
