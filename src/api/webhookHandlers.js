/**
 * Webhook Handlers for Payment Providers
 * Handles callbacks from Tabby, Tamara, Stripe, and other payment gateways
 */

// ============================================
// TABBY WEBHOOK HANDLER
// ============================================
export const handleTabbyWebhook = async (payload) => {
  try {
    console.log('🔔 Tabby Webhook Received:', payload);

    const { event, order } = payload;
    
    if (!order || !order.reference_id) {
      throw new Error('Invalid Tabby webhook payload');
    }

    const orderId = order.reference_id;
    const status = order.status;

    // Map Tabby status to order status
    const statusMap = {
      'APPROVED': 'completed',
      'PENDING': 'pending',
      'REJECTED': 'failed',
      'CANCELLED': 'cancelled',
      'CLOSED': 'completed'
    };

    const newStatus = statusMap[status] || 'pending';

    // Update order in WordPress
    const response = await fetch(
      `https://db.store1920.com/wp-json/wc/v3/orders/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('ck_0a0d00041ca702d912afaabcaf637eb524b9b3cf:cs_aeec86581438c3bea01aaebd9b6ec1183a42bd8d')}`
        },
        body: JSON.stringify({
          status: newStatus,
          payment_method: 'tabby',
          payment_method_title: 'Tabby',
          meta_data: [
            {
              key: 'tabby_order_id',
              value: order.id
            },
            {
              key: 'tabby_status',
              value: status
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }

    const updatedOrder = await response.json();
    console.log('✅ Tabby Order Updated:', updatedOrder);

    return {
      success: true,
      orderId,
      status: newStatus,
      message: `Order ${orderId} updated with Tabby payment status: ${status}`
    };
  } catch (error) {
    console.error('❌ Tabby Webhook Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// TAMARA WEBHOOK HANDLER
// ============================================
export const handleTamaraWebhook = async (payload) => {
  try {
    console.log('🔔 Tamara Webhook Received:', payload);

    const { order_reference_id, order_status, order_id } = payload;

    if (!order_reference_id) {
      throw new Error('Invalid Tamara webhook payload');
    }

    const orderId = order_reference_id;

    // Map Tamara status to order status
    const statusMap = {
      'APPROVED': 'completed',
      'PENDING': 'pending',
      'REJECTED': 'failed',
      'CANCELLED': 'cancelled',
      'CAPTURED': 'completed'
    };

    const newStatus = statusMap[order_status] || 'pending';

    // Update order in WordPress
    const response = await fetch(
      `https://db.store1920.com/wp-json/wc/v3/orders/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('ck_0a0d00041ca702d912afaabcaf637eb524b9b3cf:cs_aeec86581438c3bea01aaebd9b6ec1183a42bd8d')}`
        },
        body: JSON.stringify({
          status: newStatus,
          payment_method: 'tamara',
          payment_method_title: 'Tamara',
          meta_data: [
            {
              key: 'tamara_order_id',
              value: order_id
            },
            {
              key: 'tamara_status',
              value: order_status
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }

    const updatedOrder = await response.json();
    console.log('✅ Tamara Order Updated:', updatedOrder);

    return {
      success: true,
      orderId,
      status: newStatus,
      message: `Order ${orderId} updated with Tamara payment status: ${order_status}`
    };
  } catch (error) {
    console.error('❌ Tamara Webhook Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// STRIPE WEBHOOK HANDLER
// ============================================
export const handleStripeWebhook = async (event) => {
  try {
    console.log('🔔 Stripe Webhook Received:', event.type);

    const { type, data } = event;
    const session = data.object;

    if (!session.client_reference_id) {
      throw new Error('Order ID not found in session');
    }

    const orderId = session.client_reference_id;
    let newStatus = 'pending';
    let updateData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe'
    };

    // Handle different Stripe events
    if (type === 'checkout.session.completed') {
      newStatus = 'completed';
      updateData.meta_data = [
        {
          key: 'stripe_session_id',
          value: session.id
        },
        {
          key: 'stripe_payment_status',
          value: session.payment_status
        }
      ];
    } else if (type === 'charge.failed') {
      newStatus = 'failed';
      updateData.meta_data = [
        {
          key: 'stripe_error',
          value: session.outcome?.reason || 'Payment failed'
        }
      ];
    } else if (type === 'charge.refunded') {
      newStatus = 'refunded';
    }

    // Update order in WordPress
    const response = await fetch(
      `https://db.store1920.com/wp-json/wc/v3/orders/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('ck_0a0d00041ca702d912afaabcaf637eb524b9b3cf:cs_aeec86581438c3bea01aaebd9b6ec1183a42bd8d')}`
        },
        body: JSON.stringify({
          status: newStatus,
          ...updateData
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }

    const updatedOrder = await response.json();
    console.log('✅ Stripe Order Updated:', updatedOrder);

    return {
      success: true,
      orderId,
      status: newStatus,
      message: `Order ${orderId} updated with Stripe event: ${type}`
    };
  } catch (error) {
    console.error('❌ Stripe Webhook Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// COD CONFIRMATION HANDLER
// ============================================
export const handleCODConfirmation = async (orderId) => {
  try {
    console.log('🔔 COD Order Confirmation:', orderId);

    // For COD, set order status to processing (awaiting payment on delivery)
    const response = await fetch(
      `https://db.store1920.com/wp-json/wc/v3/orders/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('ck_0a0d00041ca702d912afaabcaf637eb524b9b3cf:cs_aeec86581438c3bea01aaebd9b6ec1183a42bd8d')}`
        },
        body: JSON.stringify({
          status: 'processing',
          payment_method: 'cod',
          payment_method_title: 'Cash on Delivery',
          meta_data: [
            {
              key: 'cod_confirmed',
              value: new Date().toISOString()
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to confirm COD order: ${response.statusText}`);
    }

    const updatedOrder = await response.json();
    console.log('✅ COD Order Confirmed:', updatedOrder);

    return {
      success: true,
      orderId,
      status: 'processing',
      message: `COD order ${orderId} confirmed and awaiting payment on delivery`
    };
  } catch (error) {
    console.error('❌ COD Confirmation Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// PAYMENT STATUS CHECK
// ============================================
export const checkPaymentStatus = async (orderId) => {
  try {
    const response = await fetch(
      `https://db.store1920.com/wp-json/wc/v3/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Basic ${btoa('ck_0a0d00041ca702d912afaabcaf637eb524b9b3cf:cs_aeec86581438c3bea01aaebd9b6ec1183a42bd8d')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const order = await response.json();

    return {
      orderId: order.id,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentMethodTitle: order.payment_method_title,
      isPaid: order.date_paid !== null,
      total: order.total,
      currency: order.currency
    };
  } catch (error) {
    console.error('❌ Payment Status Check Error:', error);
    throw error;
  }
};

// ============================================
// SEND PAYMENT CONFIRMATION EMAIL
// ============================================
export const sendPaymentConfirmationEmail = async (orderId, orderData) => {
  try {
    console.log('📧 Sending Payment Confirmation Email for Order:', orderId);

    const response = await fetch(
      'https://db.store1920.com/wp-json/custom/v1/send-payment-confirmation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          customer_email: orderData.billing?.email,
          payment_method: orderData.payment_method,
          amount: orderData.total,
          date: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send confirmation email');
    }

    const result = await response.json();
    console.log('✅ Payment Confirmation Email Sent:', result);

    return {
      success: true,
      message: 'Confirmation email sent successfully'
    };
  } catch (error) {
    console.error('❌ Email Sending Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
