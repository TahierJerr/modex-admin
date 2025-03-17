import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Product name is required").max(100),
    description: z.string().max(1000).optional().nullable(),
    price: z.number().nonnegative().optional().nullable(),
    productUrl: z.string().url().optional().nullable(),

    categoryId: z.string().uuid().optional().nullable(),
    parentProductId: z.string().uuid().optional().nullable(),

    mainImage: z.string().url("Main image URL is required"),
    images: z.array(
        z.object({
            url: z.string().url(),
            alt: z.string().optional()
        })
    ).optional().default([]),

    isFeatured: z.boolean().default(false),
    isArchived: z.boolean().default(false),

    variants: z.array(
        z.object({
          name: z.string().min(1),
          value: z.string().min(1),
          price: z.number().nonnegative().optional()
        })
      ).optional().default([]),
      
      specifications: z.array(
        z.object({
          name: z.string().min(1),
          value: z.string().min(1)
        })
      ).optional().default([])
})