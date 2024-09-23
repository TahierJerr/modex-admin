"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type PccaseColumn = {
    id: string
    name: string
    model: string
    color: string
    price: string
    motherboardSupport: string
    ports: string
    createdAt: string;
}

export const columns: ColumnDef<PccaseColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "price",
        header: "Price",
    },
    {
        accessorKey: "model",
        header: "Model",
    },
    {
        accessorKey: "color",
        header: "Color",
    },
    {
        accessorKey: "motherboardSupport",
        header: "Motherboard Support",
    },
    {
        accessorKey: "ports",
        header: "Ports",
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
