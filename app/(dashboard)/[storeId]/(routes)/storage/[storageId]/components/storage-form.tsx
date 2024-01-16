"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Storage } from "@prisma/client"
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
    capacity: z.string().min(1),
    type: z.string().min(1),
});

type StorageFormValues = z.infer<typeof formSchema>;

interface StorageFormProps {
    initialData: Storage | null;
}

export const StorageForm: React.FC<StorageFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit storage" : "Add storage";
    const description = initialData ? "Edit a storage" : "Add a new storage";
    const toastMessage = initialData ? "Storage updated." : "Storage added.";
    const action = initialData ? "Save changes" : "Add";


    const form = useForm<StorageFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            model: '',
            capacity: '',
            type: '',
        }
    });

    const onSubmit = async (data: StorageFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/storage/${params.storageId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/storage`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/storage`);
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
            await axios.delete(`/api/${params.storeId}/storage/${params.storageId}`);
            router.refresh();
            router.push(`/${params.storeId}/storage`);
            toast.success("Storage deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this storage first.")
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
                                <Input disabled={loading} placeholder="Storage name" {...field}/>
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
                                <Input disabled={loading} placeholder="Storage model" {...field}/>
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
                            <FormLabel>Storage type</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="NVME M.2 or HDD etc.." {...field}/>
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
                            <FormLabel>Storage capacity</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="XXXGB or XTB" {...field}/>
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
