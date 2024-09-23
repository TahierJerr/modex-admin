"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type PowerColumn = {
    id: string
    name: string
    model: string
    price: string
    wattage: string
    rating: string
    createdAt: string;
}

export const columns: ColumnDef<PowerColumn>[] = [
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
        accessorKey: "wattage",
        header: "Wattage",
    },
    {
        accessorKey: "rating",
        header: "Rating",
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
