"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Cooler } from "@prisma/client"
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
    fanModel: z.string().min(1),
    rgb: z.string().min(1),
    priceTrackUrl: z.string().url().optional()
});

type CoolerFormValues = z.infer<typeof formSchema>;

interface CoolerFormProps {
    initialData: Cooler | null;
}

export const CoolerForm: React.FC<CoolerFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit CPU cooler" : "Add CPU cooler";
    const description = initialData ? "Edit CPU cooler" : "Add new CPU cooler";
    const toastMessage = initialData ? "CPU cooler updated." : "CPU cooler added.";
    const action = initialData ? "Save changes" : "Add";

    const defaultValues = initialData ? {
        name: initialData.name,
        model: initialData.model,
        type: initialData.type,
        fanModel: initialData.fanModel,
        rgb: initialData.rgb,
        priceTrackUrl: initialData.priceTrackUrl || '',
    } : {
        name: '',
        model: '',
        type: '',
        fanModel: '',
        rgb: '',
        priceTrackUrl: '',
    }


    const form = useForm<CoolerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = async (data: CoolerFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/cooler/${params.coolerId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/cooler`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/cooler`);
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
            await axios.delete(`/api/${params.storeId}/cooler/${params.coolerId}`);
            router.refresh();
            router.push(`/${params.storeId}/cooler`);
            toast.success("CPU cooler deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this CPU cooler first.")
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
                                <Input disabled={loading} placeholder="CPU cooler name" {...field}/>
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
                            <FormLabel>CPU Cooler model</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="CPU cooler model" {...field}/>
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
                            <FormLabel>CPU cooler type</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="AIO cooler or Air" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="fanModel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CPU cooler fan model</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="CPU cooler fan model" {...field}/>
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
                            <FormLabel>CPU cooler rgb</FormLabel>
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
                            <FormLabel>Price tracking URL</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Price tracking URL" {...field}/>
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
