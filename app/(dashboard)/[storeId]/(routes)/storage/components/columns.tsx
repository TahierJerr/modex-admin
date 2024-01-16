"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type StorageColumn = {
    id: string
    name: string
    model: string
    type: string
    capacity: string
    createdAt: string;
}

export const columns: ColumnDef<StorageColumn>[] = [
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
        accessorKey: "capacity",
        header: "Capacity",
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
