"use client";


import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePathname, useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();
    
    const routes = [
        {
            label: "Dashboard",
            href: `/${params.storeId}`,
            active: pathname === `/${params.storeId}`,
        },
        {
            href: `/${params.storeId}/orders`,
            label: "Orders",
            active: pathname === `/${params.storeId}/orders`,
        },
        {
            label: "Store",
            items: [
                {
                    label: "Billboards",
                    href: `/${params.storeId}/billboards`,
                    active: pathname === `/${params.storeId}/billboards`,
                },
                {
                    label: "Categories",
                    href: `/${params.storeId}/categories`,
                    active: pathname === `/${params.storeId}/categories`,
                },
            ],
        },
        {
            label: "Products",
            items: [
                {
                    href: `/${params.storeId}/computers`,
                    label: "Computers",
                    active: pathname === `/${params.storeId}/computers`,
                },
                {
                    href: `/${params.storeId}/processors`,
                    label: "Processors",
                    active: pathname === `/${params.storeId}/processors`,
                },
                {
                    href: `/${params.storeId}/graphics`,
                    label: "Graphics cards",
                    active: pathname === `/${params.storeId}/graphics`,
                },
                {
                    href: `/${params.storeId}/motherboard`,
                    label: "Motherboards",
                    active: pathname === `/${params.storeId}/motherboard`,
                },
                {
                    href: `/${params.storeId}/memory`,
                    label: "Memory",
                    active: pathname === `/${params.storeId}/memory`,
                },
                {
                    href: `/${params.storeId}/storage`,
                    label: "Storage",
                    active: pathname === `/${params.storeId}/storage`,
                },
                {
                    href: `/${params.storeId}/pccase`,
                    label: "Cases",
                    active: pathname === `/${params.storeId}/pccase`,
                },
                {
                    href: `/${params.storeId}/color`,
                    label: "Colors",
                    active: pathname === `/${params.storeId}/color`,
                },
                {
                    href: `/${params.storeId}/cooler`,
                    label: "Coolers",
                    active: pathname === `/${params.storeId}/cooler`,
                },
                {
                    href: `/${params.storeId}/power`,
                    label: "Power Supplies",
                    active: pathname === `/${params.storeId}/power`,
                },
                {
                    href: `/${params.storeId}/warranty`,
                    label: "Warranty",
                    active: pathname === `/${params.storeId}/warranty`,
                },
                {
                    href: `/${params.storeId}/software`,
                    label: "Software",
                    active: pathname === `/${params.storeId}/software`,
                },
            ]
        },
        {
            href: `/${params.storeId}/answer`,
            label: "FAQ",
            active: pathname === `/${params.storeId}/answer`,
        },
        
        {
            href: `/${params.storeId}/settings`,
            label: "Settings",
            active: pathname === `/${params.storeId}/settings`,
        },
    ];
    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
            {routes.map((route) => (
                route.items ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center text-muted-foreground">
                            {route.label} <ChevronDown className="h-4 w-4 ml-1" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel >{route.label}</DropdownMenuLabel>
                            {route.items.map((item) => (
                                <Link key={item.href} href={item.href}>
                                        <DropdownMenuItem className={item.active ? "text-black dark:text-white" : "text-muted-foreground"}>
                                            {item.label}
                                        </DropdownMenuItem>
                                </Link>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link key={route.href} href={route.href} className={route.active ? "text-black dark:text-white" : "text-muted-foreground"}>
                            {route.label}
                    </Link>
                )
            ))}
        </nav>
    );    
}