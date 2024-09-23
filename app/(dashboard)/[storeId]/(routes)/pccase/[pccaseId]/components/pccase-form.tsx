"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Pccase } from "@prisma/client"
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
    color: z.string().min(1),
    motherboardSupport: z.string().min(1),
    ports: z.string().min(1),
    priceTrackUrl: z.string().url().optional()
});

type PccaseFormValues = z.infer<typeof formSchema>;

interface PccaseFormProps {
    initialData: Pccase | null;
}

export const PccaseForm: React.FC<PccaseFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit case" : "Add case";
    const description = initialData ? "Edit case" : "Add a new case";
    const toastMessage = initialData ? "Case updated." : "Case added.";
    const action = initialData ? "Save changes" : "Add";

    const defaultValues = initialData ? {
        name: initialData.name,
        model: initialData.model,
        color: initialData.color,
        motherboardSupport: initialData.motherboardSupport,
        ports: initialData.ports,
        priceTrackUrl: initialData.priceTrackUrl || '',
    } : {
        name: '',
        model: '',
        color: '',
        motherboardSupport: '',
        ports: '',
    }

    const form = useForm<PccaseFormValues>({
        defaultValues,
        resolver: zodResolver(formSchema)
    });

    const onSubmit = async (data: PccaseFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/pccase/${params.pccaseId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/pccase`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/pccase`);
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
            await axios.delete(`/api/${params.storeId}/pccase/${params.pccaseId}`);
            router.refresh();
            router.push(`/${params.storeId}/pccase`);
            toast.success("Case deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this case first.")
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
                                <Input disabled={loading} placeholder="Case name" {...field}/>
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
                                <Input disabled={loading} placeholder="Case model" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Case color</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Case color" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="motherboardSupport"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Case motherboard support</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="ATX, E-ATX, etc..." {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="ports"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Case ports</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Case ports" {...field}/>
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
                            <FormLabel>Price track url</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Price track url" {...field}/>
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
