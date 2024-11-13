import { Computer } from '@prisma/client';
import * as React from 'react';

interface ConfirmationEmailProps {
    firstName: string;
    address: string;
    orderId: string;
    products: Computer[];
    totalPrice: number;
}

export const ConfirmationEmail: React.FC<Readonly<ConfirmationEmailProps>> = ({
    firstName,
    address,
    orderId,
    products,
    totalPrice,
}) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #000', borderRadius: '8px', backgroundColor: '#fff', color: '#000' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://vtskkfdezssgqtdhmzhq.supabase.co/storage/v1/object/public/Brand/brandmark-design-1024x0.png" alt="MODEX Logo" style={{ width: '150px' }} />
            <h1>Order Confirmation</h1>
        </div>
        <h2>Hello, {firstName}!</h2>
        <p style={{ marginBottom: '10px' }}>Thank you for your order at MODEX! Here are your order details:</p>
        
        <h3>Order ID: {orderId}</h3>
        <h3>Shipping Address:</h3>
        <p>{address}</p>
        
        <h3>Products:</h3>
        <ul style={{ listStyleType: 'none', padding: '0' }}>
            {products.map((product, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                    <strong>{product.name}</strong> - €{product.price.toFixed(2)}
                </li>
            ))}
        </ul>
        
        <h3>Total Price: €{totalPrice.toFixed(2)}</h3>
        
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
            Your shipping code will be sent to you later. If you have any questions, feel free to contact our support at <a href="mailto:info@modexgaming.com">info@modexgaming.com</a> or call <strong>0649146060</strong>. Support is available on weekdays between 9 AM and 5 PM.
        </p>
        
        <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
            &copy; {new Date().getFullYear()} MODEX. All rights reserved.
        </footer>
    </div>
);
