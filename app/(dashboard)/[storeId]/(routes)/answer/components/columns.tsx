"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type AnswerColumn = {
    id: string
    question: string
    createdAt: string;
}

export const columns: ColumnDef<AnswerColumn>[] = [
    {
        accessorKey: "question",
        header: "Question",
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original}/>
    }
]
