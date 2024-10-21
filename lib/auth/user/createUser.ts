import prismadb from "@/lib/prismadb";

export default async function createUser(
    id: string,
    email_addresses: { email_address: string }[],
    first_name?: string,
    last_name?: string
) {
    if (!email_addresses || email_addresses.length === 0) {
        throw new Error('No email addresses found');
    }

    if (!id) {
        throw new Error('No user ID found');
    }

    try {
        const user = {
            id,
            email: email_addresses[0].email_address,
            firstName: first_name ?? '',
            lastName: last_name ?? '',
            phone: '',
            storeId: 'clrgi1xkm0000gawknqwc2rl4',
            address: '',
            postalCode: '',
            country: '',
            newsletter: false,
        };

        await prismadb.user.create({ data: user });
    } catch (err) {
        throw new Error('Error creating user');
    }
}