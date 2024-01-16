"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Answer } from "@prisma/client"
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
    question: z.string().min(1),
    answers: z.string().min(1),
});

type AnswerFormValues = z.infer<typeof formSchema>;

interface AnswerFormProps {
    initialData: Answer | null;
}

export const AnswerForm: React.FC<AnswerFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit FAQ" : "Create FAQ";
    const description = initialData ? "Edit a FAQ" : "Add a new FAQ";
    const toastMessage = initialData ? "FAQ updated." : "FAQ created.";
    const action = initialData ? "Save changes" : "Create";


    const form = useForm<AnswerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            question: '',
            answers: ''
        }
    });

    const onSubmit = async (data: AnswerFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
            await axios.patch(`/api/${params.storeId}/answer/${params.answerId}`, data);
            } else {
            await axios.post(`/api/${params.storeId}/answer`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/answer`);
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
            await axios.delete(`/api/${params.storeId}/answer/${params.answerId}`);
            router.refresh();
            router.push(`/${params.storeId}/answer`);
            toast.success("FAQ deleted.");
        } catch (error) {
            toast.error("Make sure you removed all categories using this answer first.")
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
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Question" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="answers"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Answer" {...field}/>
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
