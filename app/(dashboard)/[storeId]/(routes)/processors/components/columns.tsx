"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ProcessorColumn = {
    id: string
    name: string
    brand: string
    price: string
    series: string
    baseSpeed: string
    cores: string
    createdAt: string;
}

export const columns: ColumnDef<ProcessorColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "price",
        header: "Price",
    },
    {
        accessorKey: "brand",
        header: "Brand",
    },
    {
        accessorKey: "series",
        header: "Series",
    },
    {
        accessorKey: "baseSpeed",
        header: "Base Speed",
    },
    {
        accessorKey: "cores",
        header: "Cores",
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
