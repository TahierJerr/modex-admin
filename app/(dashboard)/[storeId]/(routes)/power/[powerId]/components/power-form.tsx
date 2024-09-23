"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Power } from "@prisma/client"
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
    wattage: z.string().min(1),
    rating: z.string().min(1),
    priceTrackUrl: z.string().url().optional()
});

type PowerFormValues = z.infer<typeof formSchema>;

interface PowerFormProps {
    initialData: Power | null;
}

export const PowerForm: React.FC<PowerFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit power supply" : "Add power supply";
    const description = initialData ? "Edit a power supply" : "Add a new power supply";
    const toastMessage = initialData ? "Power supply updated." : "Power supply added.";
    const action = initialData ? "Save changes" : "Add";


    const defaultValues = initialData ? {
        name: initialData.name,
        model: initialData.model,
        wattage: initialData.wattage,
        rating: initialData.rating,
        priceTrackUrl: initialData.priceTrackUrl || '',
    } : {
        name: '',
        model: '',
        wattage: '',
        rating: '',
        priceTrackUrl: '',
    }

    const form = useForm<PowerFormValues>({
        defaultValues,
        resolver: zodResolver(formSchema)
    });

    const onSubmit = async (data: PowerFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/power/${params.powerId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/power`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/power`);
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
            await axios.delete(`/api/${params.storeId}/power/${params.powerId}`);
            router.refresh();
            router.push(`/${params.storeId}/power`);
            toast.success("Power supply deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this power supply first.")
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
                                <Input disabled={loading} placeholder="Power supply name" {...field}/>
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
                                <Input disabled={loading} placeholder="Power supply model" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="wattage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Power supply wattage</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="XXXW" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Power supply rating</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="80+ Bronze/Silver/Gold" {...field}/>
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
