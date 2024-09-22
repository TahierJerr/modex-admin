"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type CoolerColumn = {
    id: string
    name: string
    price: string
    createdAt: string;
}

export const columns: ColumnDef<CoolerColumn>[] = [
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
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "fanModel",
        header: "Fan Model",
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
