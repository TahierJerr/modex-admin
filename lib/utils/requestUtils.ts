import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

type ValidateAndProcessRequestParams<T> = {
    req: Request;
    schema: ZodSchema<T>;
    handler: (data: T) => any;
};

export async function validateAndProcessRequest<T>({
    req,
    schema,
    handler,
}: ValidateAndProcessRequestParams<T>): Promise<NextResponse | any> {
    try {
        const body = await req.json();
        const validation = schema.safeParse(body);
        
        if (!validation.success) {
            const errorMessages = validation.error.errors.map(err => err.message).join(", ");
            console.error("Validation error:", errorMessages);
            return new NextResponse(`Validation failed: ${errorMessages}`, { status: 400 });
        }
        
        return handler(validation.data);
    } catch (error) {
        console.error("Request processing error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
