import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
    console.log('Webhook received')
    try {
        const payload = await request.json()
        console.log('Event type:', payload.type)
        
        // Handle different event types
        switch (payload.type) {
            case 'checkout.session.completed':
                const session = payload.data.object;
                // Store subscription ID instead of price ID
                if (session.subscription) {
                    await db.update(usersTable)
                        .set({ plan: session.subscription })
                        .where(eq(usersTable.stripe_id, session.customer));
                }
                break;

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subEvent = payload.data.object;
                // Store subscription ID
                await db.update(usersTable)
                    .set({ plan: subEvent.id })
                    .where(eq(usersTable.stripe_id, subEvent.customer));
                break;

            case 'customer.subscription.deleted':
                // Reset the user's plan to none
                await db.update(usersTable)
                    .set({ plan: 'none' })
                    .where(eq(usersTable.stripe_id, payload.data.object.customer));
                break;

            case 'billing_portal.session.created':
            case 'customer.created':
            case 'payment_intent.succeeded':
            case 'payment_intent.created':
            case 'payment_method.attached':
            case 'customer.updated':
            case 'charge.succeeded':
            case 'invoice.created':
            case 'invoice.finalized':
            case 'invoice.updated':
            case 'invoice.paid':
            case 'invoice.payment_succeeded':
                // These events don't require any action
                break;

            default:
                console.log(`Unhandled event type: ${payload.type}`);
        }

        return new Response('Success', { status: 200 });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        });
    }
}