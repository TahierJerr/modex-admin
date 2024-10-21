import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occurred', {
            status: 400,
        });
    }

    // Handle the event using switch
    try {
        switch (evt.type) {
            case 'user.created':
                await prismadb.user.create({
                    data: {
                        id: evt.data.id,
                        email: evt.data.email_addresses[0].email_address,
                        firstName: evt.data.first_name ?? '',
                        lastName: evt.data.last_name ?? '',
                        phone: evt.data.phone_numbers[0].phone_number ?? '',
                        storeId: 'clrgi1xkm0000gawknqwc2rl4',
                        address: '',
                        postalCode: '',
                        country: '',
                        newsletter: false,
                    },
                });
                break;
            case 'user.updated':
                await prismadb.user.update({
                    where: {
                        id: evt.data.id,
                    },
                    data: {
                        email: evt.data.email_addresses[0].email_address,
                        firstName: evt.data.first_name ?? '',
                        lastName: evt.data.last_name ?? '',
                        phone: evt.data.phone_numbers[0].phone_number ?? '',
                    },
                });
                break;
            case 'user.deleted':
                await prismadb.user.delete({
                    where: {
                        id: evt.data.id,
                    },
                });
                break;
            default:
                console.warn(`Unhandled event type: ${evt.type}`);
                break;
        }

        return new Response('Event handled', { status: 200 });
    } catch (err) {
        console.error('Error handling event:', err);
        return new Response('Error occurred while handling the event', {
            status: 500,
        });
    }
}
