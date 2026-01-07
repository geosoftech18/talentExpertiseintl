import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve payment intent from Stripe to verify payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Only create registration if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Payment not completed. Status: ${paymentIntent.status}` 
        },
        { status: 400 }
      )
    }

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

    // If registration already exists, return it
    if (existingRegistration) {
      return NextResponse.json({
        success: true,
        registrationId: existingRegistration.id,
        message: 'Registration already exists',
      })
    }

    // Create course registration only after successful payment
    const courseRegistration = await prisma.courseRegistration.create({
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

    return NextResponse.json({
      success: true,
      registrationId: courseRegistration.id,
      message: 'Registration created successfully',
    })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create registration' 
      },
      { status: 500 }
    )
  }
}



