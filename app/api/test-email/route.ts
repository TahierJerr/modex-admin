import { OrderConfirmationEmail } from '@/components/email-templates/order-confirmation-email';
import prismadb from '@/lib/prismadb';
import { Order, OrderItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

export async function POST() {
    
    const order: Order = {
        id: '31d361ce-ead0-4e95-a75a-1b3b656136a4',
        storeId: '31d361ce-ead0-4e95-a75a-1b3b656136a6',
        name: 'Sven',
        email: 'gamebeaststv@gmail.com',
        address: 'Kerkstraat 1',
        phone: '0612345678',
        country: 'Nederland',
        city: 'Amsterdam',
        postalCode: '1234AB',
        isPaid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        total: new Decimal(99.99),
    }

    const orderItem: OrderItem = {
        id: '31d361ce-ead0-4e95-a75a-1b3b656136a5',
        orderId: order.id,
        computerId: '31d361ce-ead0-4e95-a75a-1b3b656136a1',
    }
    
    const computer = await prismadb.computer.findFirst({
        where: {
            id: {
                equals: orderItem.computerId,
            },
        },
    });

    if (!computer) {
        return Response.json({ error: 'Computer not found' }, { status: 404 });
    }

    const computerImage = await prismadb.imageComputer.findFirst({
        where: {
            computerId: {
                equals: computer.id,
            },
        },
    });

    const computerImageUrl = computerImage?.url || '';
    
    try {
        const { data, error } = await resend.emails.send({
            from: 'MODEX <no-reply@modexgaming.com>',
            to: [`${order.email}`],
            subject: `${order.name}, bedankt voor je bestelling bij Modex!`,
            react: OrderConfirmationEmail({ order: order, computer: computer, computerImageUrl: computerImageUrl }),
            text: 'Error: Email not supported.',
        });
        
        if (error) {
            return Response.json({ error }, { status: 500 });
        }
        
        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
