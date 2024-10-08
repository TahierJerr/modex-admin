"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Motherboard } from "@prisma/client"
import { Trash } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation"

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

const formSchema = z.object({
    name: z.string().min(1),
    model: z.string().min(1),
    formFactor: z.string().min(1),
    wifi: z.string().min(1),
    priceTrackUrl: z.string().url().optional()
});

type MotherboardFormValues = z.infer<typeof formSchema>;

interface MotherboardFormProps {
    initialData: Motherboard | null;
}

export const MotherboardForm: React.FC<MotherboardFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit motherboard" : "Add motherboard";
    const description = initialData ? "Edit motherboard" : "Add a new motherboard";
    const toastMessage = initialData ? "Motherboard updated." : "Motherboard added.";
    const action = initialData ? "Save changes" : "Add";

    const defaultValues = initialData ? {
        name: initialData.name,
        model: initialData.model,
        formFactor: initialData.formFactor,
        wifi: initialData.wifi,
        priceTrackUrl: initialData.priceTrackUrl || '', // Default to an empty string if null
    } : {
        name: '',
        model: '',
        formFactor: '',
        wifi: '',
        priceTrackUrl: '',
    }

    const form = useForm<MotherboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = async (data: MotherboardFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/motherboard/${params.motherboardId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/motherboard`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/motherboard`);
            toast.success(toastMessage);
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false);
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/motherboard/${params.motherboardId}`);
            router.refresh();
            router.push(`/${params.storeId}/motherboard`);
            toast.success("Motherboard deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this motherboard first.")
        } finally {
            setLoading(false);
            setOpen(false);
        }
    } 

    return (
        <>
        <AlertModal 
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
        />
        <div className="flex items-center justify-between">
            <Heading
            title={title}
            description={description}
            />
            {initialData && (
            <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
            >
                <Trash className="h-4 w-4" />
            </Button>
            )}
        </div>
        <Separator />
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                <div className="grid grid-cols-3 gap-8">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Motherboard name" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Motherboard model" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="formFactor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motherboard form factor</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="ATX, E-ATX etc..." {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="wifi"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motherboard wifi</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Yes or No" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="priceTrackUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price track URL</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="example: https://tweakers.net/pricewatch/productId/product" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <Button disabled={loading} className="ml-auto" type="submit">{action}</Button>
            </form>
        </Form>
        </>
    )
}
