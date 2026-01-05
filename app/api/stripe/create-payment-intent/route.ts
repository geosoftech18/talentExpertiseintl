import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheduleId, courseId, courseTitle, participants = 1, registrationData } = body

    // Get schedule fee
    let amount = 0
    if (scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        select: { fee: true },
      })
      if (schedule?.fee) {
        amount = schedule.fee * participants
      }
    }

    // If no schedule fee, set a default minimum amount
    if (amount === 0) {
      amount = 100 * participants // $100 per participant minimum
    }

    // Convert to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100)

    // Create payment intent with all payment methods enabled
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        scheduleId: scheduleId || '',
        courseId: courseId || '',
        courseTitle: courseTitle || '',
        participants: participants.toString(),
        email: registrationData?.email || '',
        name: registrationData?.name || '',
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
    })

    // Create course registration with payment intent ID
    const courseRegistration = await prisma.courseRegistration.create({
      data: {
        userId: null, // Will be updated after payment
        scheduleId: scheduleId || null,
        courseId: courseId || null,
        courseTitle: courseTitle || null,
        title: registrationData?.title || null,
        name: registrationData?.name || '',
        email: registrationData?.email || '',
        designation: registrationData?.designation || null,
        company: registrationData?.company || null,
        address: registrationData?.address || '',
        city: registrationData?.city || '',
        country: registrationData?.country || '',
        telephone: registrationData?.telephone || '',
        telephoneCountryCode: registrationData?.telephoneCountryCode || '+971',
        mobile: registrationData?.mobile || null,
        mobileCountryCode: registrationData?.mobileCountryCode || null,
        paymentMethod: 'stripe',
        paymentStatus: 'Unpaid',
        orderStatus: 'Incomplete',
        participants: participants,
        differentBilling: registrationData?.differentBilling || false,
        acceptTerms: registrationData?.acceptTerms || false,
        captcha: registrationData?.captcha || null,
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      registrationId: courseRegistration.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

