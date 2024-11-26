"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ImageComputer, Computer, Category, Processor, Memory, Storage, Graphics, Motherboard, Power, Pccase, Software, Color, Warranty, Cooler, User } from "@prisma/client"
import { Check, ChevronsUpDown, Trash } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    categoryId: z.string().min(1),
    processorId: z.string().min(1),
    memoryId: z.string().min(1),
    storageId: z.string().min(1),
    graphicsId: z.string().min(1),
    motherboardId: z.string().min(1),
    powerId: z.string().min(1),
    pccaseId: z.string().min(1),
    softwareId: z.string().min(1),
    colorId: z.string().min(1),
    warrantyId: z.string().min(1),
    coolerId: z.string().min(1),
    deliveryTime: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
    isCustom: z.boolean().default(false).optional(),
    computerUserId: z.string().optional(),
});

type ComputerFormValues = z.infer<typeof formSchema>;
    
    interface ComputerFormProps {
        initialData: Computer & {
            images: ImageComputer[]
        } | null;
        categories: Category[];
        processors: Processor[];
        memories: Memory[];
        storages: Storage[];
        graphics: Graphics[];
        motherboards: Motherboard[];
        powers: Power[];
        pccases: Pccase[];
        softwares: Software[];
        colors: Color[];
        warranties: Warranty[];
        coolers: Cooler[];
        users: User[]
    }
    
    export const ComputerForm: React.FC<ComputerFormProps> = ({
        initialData,
        categories,
        processors,
        memories,
        storages,
        graphics,
        motherboards,
        powers,
        pccases,
        softwares,
        colors,
        warranties,
        coolers,
        users
    }) => {
        const params = useParams();
        const router = useRouter();
        
        const [open, setOpen] = useState(false);
        const [loading, setLoading] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        
        const filteredUsers = users.filter((user) =>
        `${user.firstName} ${user.lastName} (${user.email})`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
        );
        
        const title = initialData ? "Edit computer" : "Create computer";
        const description = initialData ? "Edit a computer" : "Add a new computer";
        const toastMessage = initialData ? "Computer updated." : "Computer created.";
        const action = initialData ? "Save changes" : "Create";
        
        
        const form = useForm<ComputerFormValues>({
            resolver: zodResolver(formSchema),
            defaultValues: initialData ? {
                ...initialData,
                price: parseFloat(String(initialData?.price)),
            } : {
                name: '',
                images: [],
                price: 0,
                categoryId: '',
                processorId: '',
                memoryId: '',
                storageId: '',
                graphicsId: '',
                motherboardId: '',
                powerId: '',
                pccaseId: '',
                softwareId: '',
                colorId: '',
                warrantyId: '',
                coolerId: '',
                deliveryTime: '',
                isFeatured: false,
                isArchived: false,
                isCustom: false,
                computerUserId: '',
            }
        });
        
        const onSubmit = async (data: ComputerFormValues) => {
            try {
                setLoading(true);
                if (initialData) {
                    await axios.patch(`/api/${params.storeId}/computers/${params.computerId}`, data);
                } else {
                    await axios.post(`/api/${params.storeId}/computers`, data);
                }
                router.refresh();
                router.push(`/${params.storeId}/computers`);
                toast.success(toastMessage);
            } catch (error) {
                toast.error("Something went wrong.")
            } finally {
                setLoading(false);
            }
        }
        
        const handleKeyDown = (event: React.KeyboardEvent) => {
            event.stopPropagation();
        };
        
        const onDelete = async () => {
            try {
                setLoading(true);
                await axios.delete(`/api/${params.storeId}/computers/${params.computerId}`);
                router.refresh();
                router.push(`/${params.storeId}/computers`);
                toast.success("Computer deleted.");
            } catch (error) {
                toast.error("Something went wrong.")
            } finally {
                setLoading(false);
                setOpen(false);
            }
        }
        
        const calculateTotalPrice = () => {
            return [
            processors.find((processor) => processor.id === form.getValues().processorId)?.price || 0,
            memories.find((memory) => memory.id === form.getValues().memoryId)?.price || 0,
            storages.find((storage) => storage.id === form.getValues().storageId)?.price || 0,
            graphics.find((graphic) => graphic.id === form.getValues().graphicsId)?.price || 0,
            motherboards.find((motherboard) => motherboard.id === form.getValues().motherboardId)?.price || 0,
            powers.find((power) => power.id === form.getValues().powerId)?.price || 0,
            pccases.find((pccase) => pccase.id === form.getValues().pccaseId)?.price || 0,
            softwares.find((software) => software.id === form.getValues().softwareId)?.price || 0,
            coolers.find((cooler) => cooler.id === form.getValues().coolerId)?.price || 0
            ].reduce((total, price) => total + price, 0).toFixed(2);
        };
        
        const [totalPrice, setTotalPrice] = useState(calculateTotalPrice());
        
        // Effect to recalculate total price when form values change
        useEffect(() => {
            const updateTotalPrice = () => {
                const newTotalPrice = calculateTotalPrice();
                setTotalPrice(newTotalPrice);
                
                const priceValue = parseFloat(String(form.getValues().price)) || 0; // Ensure priceValue is a number
                if (priceValue < parseFloat(newTotalPrice)) {
                    form.setError("price", {
                        type: "manual",
                        message: `Price is lower than total cost (€${newTotalPrice})`,
                    });
                } else {
                    form.clearErrors("price");
                }
            };
            
            
            // Update total price on select change
            const subscription = form.watch(updateTotalPrice); // Watch for changes in the form values
            
            // add fixed price of 40 to total price
            const fixedPrice = 40;
            setTotalPrice((prev) => (parseFloat(prev) + fixedPrice).toFixed(2));
            
            
            return () => subscription.unsubscribe(); // Clean up subscription on unmount
        }, [form]);
        
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
            <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-400">
                    Total Cost: € {totalPrice}
                </span>
                <span className="text-lg font-bold text-green-700">
                    Profit: € {(parseFloat(String(form.getValues().price)) - parseFloat(totalPrice)).toFixed(2)}
                </span>
            </div>
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
                <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                        <ImageUpload value={field.value.map((image) => image.url)} disabled={loading} onChange={(url) => field.onChange( [...field.value, { url }])} onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                    />
                    
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Computer name" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input 
                                type="number" 
                                disabled={loading} 
                                placeholder="999.99" 
                                {...field} 
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value); // Convert input value to number
                                    field.onChange(value); // Call the original onChange with the number value
                                    if (value < parseFloat(totalPrice)) {
                                        form.setError("price", {
                                            type: "manual",
                                            message: `Price is lower than total cost (€${totalPrice})`,
                                        });
                                    } else {
                                        form.clearErrors("price");
                                    }
                                }} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue 
                                        defaultValue={field.value} 
                                        placeholder="Select a category"
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="processorId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Processor</FormLabel>
                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue 
                                            defaultValue={field.value} 
                                            placeholder="Select a processor"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {processors.map((processor) => (
                                            <SelectItem className="flex items-center justify-between" key={processor.id} value={processor.id}>
                                                <span>
                                                    {processor.name}
                                                </span>
                                                <span>
                                                    {`€${processor.price}`}
                                                </span>
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="memoryId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RAM</FormLabel>
                                    <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue 
                                                defaultValue={field.value} 
                                                placeholder="Select a memory"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {memories.map((memory) => (
                                                <SelectItem className="flex items-center justify-between" key={memory.id} value={memory.id}>
                                                    <span>
                                                        {memory.name}
                                                    </span>
                                                    <span>
                                                        `{`€${memory.price}`}
                                                    </span>
                                                </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={form.control}
                                    name="graphicsId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Graphics card</FormLabel>
                                        <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue 
                                                    defaultValue={field.value} 
                                                    placeholder="Select a graphic card"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {graphics.map((graphics) => (
                                                    <SelectItem className="flex items-center justify-between" key={graphics.id} value={graphics.id}>
                                                        <span>
                                                            {graphics.name}
                                                        </span>
                                                        <span>
                                                            `{`€${graphics.price}`}
                                                        </span>
                                                    </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                        />
                                        <FormField
                                        control={form.control}
                                        name="motherboardId"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Motherboard</FormLabel>
                                            <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue 
                                                        defaultValue={field.value} 
                                                        placeholder="Select a motherboard"
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {motherboards.map((motherboard) => (
                                                        <SelectItem className="flex items-center justify-between" key={motherboard.id} value={motherboard.id}>
                                                            <span>
                                                                {motherboard.name}
                                                            </span>
                                                            <span>
                                                                `{`€${motherboard.price}`}
                                                            </span>
                                                        </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                            />
                                            <FormField
                                            control={form.control}
                                            name="storageId"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Storage</FormLabel>
                                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue 
                                                            defaultValue={field.value} 
                                                            placeholder="Select a storage"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {storages.map((storage) => (
                                                            <SelectItem className="flex items-center justify-between" key={storage.id} value={storage.id}>
                                                                <span>
                                                                    {storage.name}
                                                                </span>
                                                                <span>
                                                                    `{`€${storage.price}`}
                                                                </span>
                                                            </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                                />
                                                <FormField
                                                control={form.control}
                                                name="pccaseId"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PC Case</FormLabel>
                                                    <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue 
                                                                defaultValue={field.value} 
                                                                placeholder="Select a PC Case"
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {pccases.map((pccase) => (
                                                                <SelectItem className="flex items-center justify-between" key={pccase.id} value={pccase.id}>
                                                                    <span>
                                                                        {pccase.name}
                                                                    </span>
                                                                    <span>
                                                                        `{`€${pccase.price}`}
                                                                    </span>
                                                                </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                    />
                                                    <FormField
                                                    control={form.control}
                                                    name="coolerId"
                                                    render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>CPU Cooler</FormLabel>
                                                        <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue 
                                                                    defaultValue={field.value} 
                                                                    placeholder="Select a CPU Cooler"
                                                                    />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {coolers.map((cooler) => (
                                                                    <SelectItem className="flex items-center justify-between" key={cooler.id} value={cooler.id}>
                                                                        <span>
                                                                            {cooler.name}
                                                                        </span>
                                                                        <span>
                                                                            `{`€${cooler.price}`}
                                                                        </span>
                                                                    </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                        )}
                                                        />
                                                        <FormField
                                                        control={form.control}
                                                        name="powerId"
                                                        render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>PSU</FormLabel>
                                                            <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue 
                                                                        defaultValue={field.value} 
                                                                        placeholder="Select a PSU"
                                                                        />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {powers.map((power) => (
                                                                        <SelectItem className="flex items-center justify-between" key={power.id} value={power.id}>
                                                                            <span>
                                                                                {power.name}
                                                                            </span>
                                                                            <span>
                                                                                `{`€${power.price}`}
                                                                            </span>
                                                                        </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                            )}
                                                            />
                                                            <FormField
                                                            control={form.control}
                                                            name="colorId"
                                                            render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>PC Color</FormLabel>
                                                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue 
                                                                            defaultValue={field.value} 
                                                                            placeholder="Select a color"
                                                                            />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {colors.map((color) => (
                                                                            <SelectItem key={color.id} value={color.id}>
                                                                                {color.name}
                                                                            </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                                )}
                                                                />
                                                                <FormField
                                                                control={form.control}
                                                                name="softwareId"
                                                                render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Operating System</FormLabel>
                                                                    <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue 
                                                                                defaultValue={field.value} 
                                                                                placeholder="Select an operating system"
                                                                                />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {softwares.map((software) => (
                                                                                <SelectItem key={software.id} value={software.id}>
                                                                                    {software.name}
                                                                                </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                    )}
                                                                    />
                                                                    <FormField
                                                                    control={form.control}
                                                                    name="warrantyId"
                                                                    render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Warranty</FormLabel>
                                                                        <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue 
                                                                                    defaultValue={field.value} 
                                                                                    placeholder="Select a category"
                                                                                    />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                {warranties.map((warranty) => (
                                                                                    <SelectItem key={warranty.id} value={warranty.id}>
                                                                                        {warranty.name}
                                                                                    </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                        )}
                                                                        />
                                                                        <FormField
                                                                        control={form.control}
                                                                        name="deliveryTime"
                                                                        render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Delivery Days</FormLabel>
                                                                            <FormControl>
                                                                                <Input disabled={loading} placeholder="Delivery Days" {...field}/>
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                        )}
                                                                        />
                                                                        <FormField
                                                                        control={form.control}
                                                                        name="isFeatured"
                                                                        render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                                            <FormControl>
                                                                                <Checkbox 
                                                                                checked={field.value}
                                                                                // @ts-ignore
                                                                                onCheckedChange={field.onChange}
                                                                                />
                                                                            </FormControl>
                                                                            <div className="space-y-1 leading-none">
                                                                                <FormLabel>
                                                                                    Featured
                                                                                </FormLabel>
                                                                                <FormDescription>
                                                                                    This computer will appear on the homepage.
                                                                                </FormDescription>
                                                                            </div>
                                                                        </FormItem>
                                                                        )}
                                                                        />
                                                                        <FormField
                                                                        control={form.control}
                                                                        name="isArchived"
                                                                        render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                                            <FormControl>
                                                                                <Checkbox 
                                                                                checked={field.value}
                                                                                // @ts-ignore
                                                                                onCheckedChange={field.onChange}
                                                                                />
                                                                            </FormControl>
                                                                            <div className="space-y-1 leading-none">
                                                                                <FormLabel>
                                                                                    Archived
                                                                                </FormLabel>
                                                                                <FormDescription>
                                                                                    This computer will not appear anywhere in the store.
                                                                                </FormDescription>
                                                                            </div>
                                                                        </FormItem>
                                                                        )}
                                                                        />
                                                                        <FormField
                                                                        control={form.control}
                                                                        name="isCustom"
                                                                        render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                                            <FormControl>
                                                                                <Checkbox 
                                                                                checked={field.value}
                                                                                // @ts-ignore
                                                                                onCheckedChange={field.onChange}
                                                                                />
                                                                            </FormControl>
                                                                            <div className="space-y-1 leading-none">
                                                                                <FormLabel>
                                                                                    Custom
                                                                                </FormLabel>
                                                                                <FormDescription>
                                                                                    This computer is custom made.
                                                                                </FormDescription>
                                                                            </div>
                                                                        </FormItem>
                                                                        )}
                                                                        />
                                                                        {form.getValues().isCustom && (
                                                                            <FormField
                                                                            control={form.control}
                                                                            name="computerUserId"
                                                                            render={({ field }) => (
                                                                            <FormItem className="flex flex-col">
                                                                                <FormLabel>Customer</FormLabel>
                                                                                <Popover open={open} onOpenChange={setOpen}>
                                                                                    <PopoverTrigger asChild>
                                                                                        <FormControl>
                                                                                            <Button
                                                                                            variant="outline"
                                                                                            role="combobox"
                                                                                            aria-expanded={open}
                                                                                            className={cn(
                                                                                            "w-full justify-between",
                                                                                            !field.value && "text-muted-foreground"
                                                                                            )}
                                                                                            disabled={loading}
                                                                                            >
                                                                                            {field.value
                                                                                                ? users.find((user) => user.id === field.value)
                                                                                                ? `${users.find((user) => user.id === field.value)?.firstName} ${users.find((user) => user.id === field.value)?.lastName}`
                                                                                                : "No User"
                                                                                                : "Select a customer"}
                                                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                            </Button>
                                                                                        </FormControl>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent className="w-[300px] p-0">
                                                                                        <Command>
                                                                                            <CommandInput
                                                                                            placeholder="Search for a customer..."
                                                                                            onValueChange={setSearchTerm}
                                                                                            disabled={loading}
                                                                                            />
                                                                                            <CommandEmpty>No customer found.</CommandEmpty>
                                                                                            <CommandGroup>
                                                                                                <CommandItem
                                                                                                onSelect={() => {
                                                                                                    form.setValue("computerUserId", "no-user")
                                                                                                    setOpen(false)
                                                                                                }}
                                                                                                >
                                                                                                <Check
                                                                                                className={cn(
                                                                                                "mr-2 h-4 w-4",
                                                                                                field.value === "no-user" ? "opacity-100" : "opacity-0"
                                                                                                )}
                                                                                                />
                                                                                                No User
                                                                                            </CommandItem>
                                                                                            {filteredUsers.map((user) => (
                                                                                                <CommandItem
                                                                                                key={user.id}
                                                                                                onSelect={() => {
                                                                                                    form.setValue("computerUserId", user.id)
                                                                                                    setOpen(false)
                                                                                                }}
                                                                                                >
                                                                                                <Check
                                                                                                className={cn(
                                                                                                "mr-2 h-4 w-4",
                                                                                                field.value === user.id ? "opacity-100" : "opacity-0"
                                                                                                )}
                                                                                                />
                                                                                                {user.firstName} {user.lastName} ({user.email})
                                                                                            </CommandItem>
                                                                                            ))}
                                                                                        </CommandGroup>
                                                                                    </Command>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                        )}
                                                                        />
                                                                        )}
                                                                    </div>
                                                                    <Button disabled={loading} className="ml-auto" type="submit">{action}</Button>
                                                                </form>
                                                            </Form>
                                                            </>
                                                            )
                                                        }
                                                        