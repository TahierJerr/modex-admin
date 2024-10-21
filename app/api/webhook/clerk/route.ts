import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { WebhookEvent } from '@clerk/nextjs/dist/types/server';
import createUser from '@/lib/auth/user/createUser';

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
        return new NextResponse('Error occurred -- no svix headers', {
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
        return new NextResponse('Error occurred', {
            status: 400,
        });
    }

    // Handle the event using switch
    try {
        switch (evt.type) {
            case 'user.created':
                await createUser(
                    evt.data.id,
                    evt.data.email_addresses,
                    evt.data.first_name ?? '',
                    evt.data.last_name ?? ''
                );
                break;
            case 'user.updated':
                if (!evt.data.id) {
                    throw new Error('No user ID found');
                }

                if (!evt.data.email_addresses || evt.data.email_addresses.length === 0) {
                    throw new Error('No email addresses found');
                }
                await prismadb.user.update({
                    where: {
                        id: evt.data.id,
                    },
                    data: {
                        email: evt.data.email_addresses[0].email_address,
                        firstName: evt.data.first_name ?? '',
                        lastName: evt.data.last_name ?? '',
                        phone: '',
                    },
                });
                break;
            case 'user.deleted':
                if (!evt.data.id) {
                    throw new Error('No user ID found');
                }

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

        return new NextResponse('Event handled', { status: 200 });
    } catch (err) {
        console.error('Error handling event:', err);
        return new NextResponse('Error occurred while handling the event', {
            status: 500,
        });
    }
}
