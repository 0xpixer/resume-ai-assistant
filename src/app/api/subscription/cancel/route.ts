import { NextRequest, NextResponse } from 'next/server';

/**
 * Cancel user's subscription
 */
export async function POST(req: NextRequest) {
  try {
    // In a real project, this would connect to the Stripe API to cancel the subscription
    const body = await req.json();
    const { reason } = body;

    console.log('Cancelling subscription, reason:', reason);
    
    // Mock successful response
    return NextResponse.json({
      success: true,
      message: 'Subscription successfully cancelled',
      subscription: {
        id: 'sub_1234567890',
        status: 'canceled',
        cancelAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // End of current period
        cancelReason: reason
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Error cancelling subscription' },
      { status: 500 }
    );
  }
} 