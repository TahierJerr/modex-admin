"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Graphics } from "@prisma/client"
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
    brand: z.string().min(1),
    model: z.string().min(1),
    memory: z.string().min(1),
    memoryType: z.string().min(1),
    maxClock: z.string().min(1),
    performance: z.number().int().optional(),
    priceTrackUrl: z.string().url().optional()
});

type GraphicsFormValues = z.infer<typeof formSchema>;

interface GraphicsFormProps {
    initialData: Graphics | null;
}

export const GraphicsForm: React.FC<GraphicsFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit GPU" : "Add GPU";
    const description = initialData ? "Edit GPU" : "Add new GPU";
    const toastMessage = initialData ? "GPU updated." : "GPU added.";
    const action = initialData ? "Save changes" : "Add";

    const defaultValues = initialData ? {
        name: initialData.name,
        brand: initialData.brand,
        model: initialData.model,
        memory: initialData.memory,
        memoryType: initialData.memoryType,
        maxClock: initialData.maxClock,
        performance: initialData.performance || 0,
        priceTrackUrl: initialData.priceTrackUrl || '',
    } : {
        name: '',
        brand: '',
        model: '',
        memory: '',
        memoryType: '',
        maxClock: '',
        performance: 0,
        priceTrackUrl: '',
    };


    const form = useForm<GraphicsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = async (data: GraphicsFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/graphics/${params.graphicsId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/graphics`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/graphics`);
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
            await axios.delete(`/api/${params.storeId}/graphics/${params.graphicsId}`);
            router.refresh();
            router.push(`/${params.storeId}/graphics`);
            toast.success("GPU deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this GPU first.")
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
                                <Input disabled={loading} placeholder="GPU name" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="GPU brand" {...field}/>
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
                            <FormLabel>GPU model</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="GPU model" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="memory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GPU Memory</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="XGB" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="memoryType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GPU Memory Type</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="GDDR" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="maxClock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GPU Max clock speed</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="xxxxMhz" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="performance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GPU performance</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Compared to RTX 3060 12GB" {...field}/>
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
                            <FormLabel>Price tracking URL</FormLabel>
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
