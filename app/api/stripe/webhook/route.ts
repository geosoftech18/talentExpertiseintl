import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const metadata = paymentIntent.metadata

        // Check if registration already exists (to prevent duplicates)
        const existingRegistration = await prisma.courseRegistration.findFirst({
          where: {
            email: metadata.email || '',
            paymentMethod: 'stripe',
            paymentStatus: 'Paid',
            orderStatus: 'Completed',
          },
          orderBy: { createdAt: 'desc' },
        })

        // Only create registration if it doesn't exist
        if (!existingRegistration) {
          // Create course registration only after successful payment
          await prisma.courseRegistration.create({
            data: {
              userId: null,
              scheduleId: metadata.scheduleId || null,
              courseId: metadata.courseId || null,
              courseTitle: metadata.courseTitle || null,
              title: metadata.title || null,
              name: metadata.name || '',
              email: metadata.email || '',
              designation: metadata.designation || null,
              company: metadata.company || null,
              address: metadata.address || '',
              city: metadata.city || '',
              country: metadata.country || '',
              telephone: metadata.telephone || '',
              telephoneCountryCode: metadata.telephoneCountryCode || '+971',
              mobile: metadata.mobile || null,
              mobileCountryCode: metadata.mobileCountryCode || null,
              paymentMethod: 'stripe',
              paymentStatus: 'Paid',
              orderStatus: 'Completed',
              participants: parseInt(metadata.participants || '1'),
              differentBilling: metadata.differentBilling === 'true',
              acceptTerms: metadata.acceptTerms === 'true',
              captcha: metadata.captcha || null,
            },
          })
          console.log('Registration created from webhook for payment:', paymentIntent.id)
        } else {
          console.log('Registration already exists for payment:', paymentIntent.id)
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', failedPayment.id)
        // No registration is created for failed payments - this is correct behavior
        break

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment canceled:', canceledPayment.id)
        // No registration is created for canceled payments - this is correct behavior
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

