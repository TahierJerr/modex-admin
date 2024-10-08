"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Memory } from "@prisma/client"
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
    type: z.string().min(1),
    speed: z.string().min(1),
    capacity: z.string().min(1),
    rgb: z.string().min(1),
    priceTrackUrl: z.string().url().optional()
});

type MemoryFormValues = z.infer<typeof formSchema>;

interface MemoryFormProps {
    initialData: Memory | null;
}

export const MemoryForm: React.FC<MemoryFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit memory" : "Add memory";
    const description = initialData ? "Edit a memory" : "Add a new memory";
    const toastMessage = initialData ? "Memory updated." : "Memory added.";
    const action = initialData ? "Save changes" : "Add";

    const defaultValues = initialData ? {
        name: initialData.name,
        model: initialData.model,
        type: initialData.type,
        speed: initialData.speed,
        capacity: initialData.capacity,
        rgb: initialData.rgb,
        priceTrackUrl: initialData.priceTrackUrl || '', // Default to an empty string if null
    } : {
        name: '',
        model: '',
        type: '',
        speed: '',
        capacity: '',
        rgb: '',
        priceTrackUrl: '', // Add this line
    };


    const form = useForm<MemoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = async (data: MemoryFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/memory/${params.memoryId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/memory`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/memory`);
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
            await axios.delete(`/api/${params.storeId}/memory/${params.memoryId}`);
            router.refresh();
            router.push(`/${params.storeId}/memory`);
            toast.success("Memory deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this memory first.")
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
                                <Input disabled={loading} placeholder="Memory name" {...field}/>
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
                                <Input disabled={loading} placeholder="Memory model" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Memory type</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="DDRX" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="speed"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Memory speed</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="XXXX Mhz" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Memory capacity</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="XXGB (X x XXGB)" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="rgb"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Memory RGB</FormLabel>
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
