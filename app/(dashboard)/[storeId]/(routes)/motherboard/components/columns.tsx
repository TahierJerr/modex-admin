"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type MotherboardColumn = {
    id: string
    name: string
    model: string
    price: string
    formFactor: string
    wifi: String
    createdAt: string;
}

export const columns: ColumnDef<MotherboardColumn>[] = [
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
        accessorKey: "formFactor",
        header: "Form Factor",
    },
    {
        accessorKey: "wifi",
        header: "Wifi",
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
