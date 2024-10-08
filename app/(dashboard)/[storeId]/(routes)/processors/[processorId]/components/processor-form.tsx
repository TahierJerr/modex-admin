"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Processor } from "@prisma/client"
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
    series: z.string().min(1),
    baseSpeed: z.string().min(1),
    cores: z.string().min(1),
    priceTrackUrl: z.string().url().optional()
});

type ProcessorFormValues = z.infer<typeof formSchema>;

interface ProcessorFormProps {
    initialData: Processor | null;
}

export const ProcessorForm: React.FC<ProcessorFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit processor" : "Add proccesor";
    const description = initialData ? "Edit a processor" : "Add a new processor";
    const toastMessage = initialData ? "Processor updated." : "Processor added.";
    const action = initialData ? "Save changes" : "Add";


    const defaultValues = initialData ? {
        name: initialData.name,
        brand: initialData.brand,
        series: initialData.series,
        baseSpeed: initialData.baseSpeed,
        cores: initialData.cores,
        priceTrackUrl: initialData.priceTrackUrl || '',
    } : {
        name: '',
        brand: '',
        series: '',
        baseSpeed: '',
        cores: '',
        priceTrackUrl: '',
    }

    const form = useForm<ProcessorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = async (data: ProcessorFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/processors/${params.processorId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/processors`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/processors`);
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
            await axios.delete(`/api/${params.storeId}/processors/${params.processorId}`);
            router.refresh();
            router.push(`/${params.storeId}/processors`);
            toast.success("Processor deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this processor first.")
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
                                <Input disabled={loading} placeholder="Processor name" {...field}/>
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
                                <Input disabled={loading} placeholder="Processor brand" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="series"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Processor series</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Processor series" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="baseSpeed"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Processor base Speed</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Processor base speed" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="cores"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Number of cores</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Processor cores" {...field}/>
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
