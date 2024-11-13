'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { ChevronDown, MenuSquareIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import StoreSwitcher from '@/components/store-switcher'
import { ModeToggle } from '@/components/theme-toggle'

export default function Navbar({ stores }: { stores: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const params = useParams()
    
    const routes = [
    {
        label: 'Dashboard',
        href: `/${params.storeId}`,
        active: pathname === `/${params.storeId}`,
    },
    {
        href: `/${params.storeId}/orders`,
        label: 'Orders',
        active: pathname === `/${params.storeId}/orders`,
    },
    {
        label: 'Store',
        items: [
        {
            label: 'Billboards',
            href: `/${params.storeId}/billboards`,
            active: pathname === `/${params.storeId}/billboards`,
        },
        {
            label: 'Categories',
            href: `/${params.storeId}/categories`,
            active: pathname === `/${params.storeId}/categories`,
        },
        ],
    },
    {
        label: 'Products',
        items: [
        {
            href: `/${params.storeId}/computers`,
            label: 'Computers',
            active: pathname === `/${params.storeId}/computers`,
        },
        {
            href: `/${params.storeId}/processors`,
            label: 'Processors',
            active: pathname === `/${params.storeId}/processors`,
        },
        {
            href: `/${params.storeId}/graphics`,
            label: 'Graphics cards',
            active: pathname === `/${params.storeId}/graphics`,
        },
        {
            href: `/${params.storeId}/motherboard`,
            label: 'Motherboards',
            active: pathname === `/${params.storeId}/motherboard`,
        },
        {
            href: `/${params.storeId}/memory`,
            label: 'Memory',
            active: pathname === `/${params.storeId}/memory`,
        },
        {
            href: `/${params.storeId}/storage`,
            label: 'Storage',
            active: pathname === `/${params.storeId}/storage`,
        },
        {
            href: `/${params.storeId}/pccase`,
            label: 'Cases',
            active: pathname === `/${params.storeId}/pccase`,
        },
        {
            href: `/${params.storeId}/color`,
            label: 'Colors',
            active: pathname === `/${params.storeId}/color`,
        },
        {
            href: `/${params.storeId}/cooler`,
            label: 'Coolers',
            active: pathname === `/${params.storeId}/cooler`,
        },
        {
            href: `/${params.storeId}/power`,
            label: 'Power Supplies',
            active: pathname === `/${params.storeId}/power`,
        },
        {
            href: `/${params.storeId}/warranty`,
            label: 'Warranty',
            active: pathname === `/${params.storeId}/warranty`,
        },
        {
            href: `/${params.storeId}/software`,
            label: 'Software',
            active: pathname === `/${params.storeId}/software`,
        },
        ],
    },
    {
        href: `/${params.storeId}/answer`,
        label: 'FAQ',
        active: pathname === `/${params.storeId}/answer`,
    },
    {
        href: `/${params.storeId}/settings`,
        label: 'Settings',
        active: pathname === `/${params.storeId}/settings`,
    },
    ]
    
    const NavItems = ({ mobile = false }) => (
    <>
    {routes.map((route) =>
        route.items ? (
        <DropdownMenu key={route.label}>
            <DropdownMenuTrigger className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                {route.label} <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{route.label}</DropdownMenuLabel>
                {route.items.map((item) => (
                    <Link key={item.href} href={item.href} prefetch={false}>
                        <DropdownMenuItem 
                        className={cn(
                        "cursor-pointer",
                        item.active ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                        onClick={() => mobile && setIsOpen(false)}
                        >
                        {item.label}
                    </DropdownMenuItem>
                </Link>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        ) : (
        <Link
        key={route.href}
        href={route.href}
        prefetch={false}
        className={cn(
        "text-muted-foreground hover:text-foreground transition-colors",
        route.active ? "text-foreground font-medium" : "",
        mobile ? "text-lg py-2" : ""
        )}
        onClick={() => mobile && setIsOpen(false)}
        >
        {route.label}
    </Link>
    )
    )}
    </>
    )
    
    return (
    <div className="border-b">
        <div className="flex h-16 items-center px-4">
            <StoreSwitcher items={stores} />
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 mx-6">
                <NavItems />
            </nav>
            
            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden ml-auto">
                        <MenuSquareIcon className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col space-y-4 mt-8">
                        <NavItems mobile />
                    </div>
                </SheetContent>
            </Sheet>
            
            {/* Right-side items */}
            <div className="ml-auto flex items-center space-x-4">
                <ModeToggle />
                <UserButton afterSignOutUrl="/" />
            </div>
        </div>
    </div>
    )
}