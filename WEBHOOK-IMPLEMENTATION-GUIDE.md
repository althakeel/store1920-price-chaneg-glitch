# Payment Webhook Implementation Guide

## Overview
This guide explains how to implement payment webhook handlers for **COD (Cash on Delivery)**, **Tabby**, **Tamara**, **Stripe**, and other payment gateways.

---

## Table of Contents
1. [Frontend Implementation](#frontend-implementation)
2. [Backend Implementation](#backend-implementation)
3. [Webhook Setup Instructions](#webhook-setup-instructions)
4. [Testing Webhooks](#testing-webhooks)
5. [Order Flow Diagrams](#order-flow-diagrams)

---

## Frontend Implementation

### 1. COD Order Flow
When a customer selects **Cash on Delivery (COD)** and clicks "Pay Now":

```
Customer clicks COD → Clicks "Pay Now" 
  → Order Created 
  → OrderConfirmedPopup Shows "Your order is confirmed" with COD badge
  → Buttons: "CONTINUE TO ORDER TRACKING" (leads to Order Success page)
```

**Files Involved:**
- `src/components/CheckoutRight.jsx` - Handles order creation
- `src/components/checkout/OrderConfirmedPopup.jsx` - Shows COD confirmation
- `src/pages/OrderSuccess.jsx` - Displays order details

**Key Code:**
```jsx
// In CheckoutRight.jsx - handlePlaceOrder function
if (formData.paymentMethod === 'cod') {
  clearCart();
  setConfirmedOrderId(id.id || id);
  setConfirmedOrderTotal(amountToSend);
  setShowOrderConfirmed(true); // Shows confirmation popup
  setIsPlacingOrder(false);
  return;
}
```

### 2. Card/Tabby/Tamara Order Flow
When customer selects **Card**, **Tabby**, or **Tamara**:

```
Customer clicks payment method → Clicks "Pay Now"
  → Redirected to Payment Gateway
  → Customer completes payment
  → Payment gateway sends webhook to backend
  → Order status updated automatically
  → Customer redirected to Order Success page
```

**No confirmation popup shown for these methods** - they handle confirmation on their own platforms.

---

## Backend Implementation

### 1. Webhook Files

#### A. JavaScript/Node.js Webhooks (`src/api/webhookHandlers.js`)
Contains handlers for client-side webhook processing:
- `handleTabbyWebhook()` - Process Tabby payment events
- `handleTamaraWebhook()` - Process Tamara payment events
- `handleStripeWebhook()` - Process Stripe payment events
- `handleCODConfirmation()` - Confirm COD orders
- `checkPaymentStatus()` - Check payment status
- `sendPaymentConfirmationEmail()` - Send confirmation emails

#### B. WordPress/PHP Webhooks (`wordpress-payment-webhooks.php`)
REST API endpoints for webhook processing:

```php
POST /wp-json/custom/v1/tabby-webhook
POST /wp-json/custom/v1/tamara-webhook
POST /wp-json/custom/v1/stripe-webhook
POST /wp-json/custom/v1/cod-confirm
GET  /wp-json/custom/v1/payment-status/{order_id}
POST /wp-json/custom/v1/send-payment-confirmation
```

### 2. Install WordPress Webhook Handler

1. Copy `wordpress-payment-webhooks.php` to your WordPress site
2. Add to your theme's `functions.php` or as a plugin:

```php
// Add to wp-content/plugins/payment-webhooks.php
<?php
/*
Plugin Name: Payment Gateway Webhooks
Description: Handles webhooks from Tabby, Tamara, Stripe, etc.
Version: 1.0
*/

require_once __DIR__ . '/payment-webhooks.php';
```

3. Activate the plugin in WordPress admin

---

## Webhook Setup Instructions

### 1. TABBY Webhook Setup

**Step 1:** Log in to Tabby Merchant Dashboard
- Visit: https://merchant.tabby.ai/

**Step 2:** Navigate to Settings > Webhooks
- Look for "Webhooks" or "API Settings"

**Step 3:** Add Webhook Endpoint
- **Webhook URL:** `https://db.store1920.com/wp-json/custom/v1/tabby-webhook`
- **Event Types:** Select these events:
  - `order.closed`
  - `order.approved`
  - `order.rejected`
  - `order.pending`

**Step 4:** Test the Webhook
- Tabby provides a test button to verify connectivity

**Example Webhook Payload (Tabby Sends):**
```json
{
  "event": "order.approved",
  "order": {
    "id": "tabby_order_123",
    "reference_id": "5678",
    "status": "APPROVED",
    "amount": 299.99,
    "currency": "AED"
  }
}
```

---

### 2. TAMARA Webhook Setup

**Step 1:** Log in to Tamara Merchant Dashboard
- Visit: https://merchant.tamara.co/

**Step 2:** Navigate to Settings > Webhooks

**Step 3:** Add Webhook Endpoint
- **Webhook URL:** `https://db.store1920.com/wp-json/custom/v1/tamara-webhook`
- **Event Types:** Select these events:
  - `order_approved`
  - `order_rejected`
  - `order_cancelled`
  - `order_captured`

**Step 4:** Verify and Save

**Example Webhook Payload (Tamara Sends):**
```json
{
  "order_id": "tamara_order_456",
  "order_reference_id": "5678",
  "order_status": "APPROVED",
  "amount": 299.99,
  "currency": "AED"
}
```

---

### 3. STRIPE Webhook Setup

**Step 1:** Log in to Stripe Dashboard
- Visit: https://dashboard.stripe.com/

**Step 2:** Navigate to Developers > Webhooks

**Step 3:** Click "Add Endpoint"
- **Webhook URL:** `https://db.store1920.com/wp-json/custom/v1/stripe-webhook`
- **Events to Send:** Select these events:
  - `checkout.session.completed`
  - `charge.failed`
  - `charge.refunded`

**Step 4:** Copy and Save Webhook Signing Secret
- Store this secret for signature verification

**Example Webhook Payload (Stripe Sends):**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_stripe_789",
      "client_reference_id": "5678",
      "payment_status": "paid",
      "amount_total": 29999
    }
  }
}
```

---

### 4. COD Order Confirmation

For COD orders, no webhook is needed from payment providers. Instead:

**Frontend:**
```jsx
// When customer clicks "Pay Now" for COD
const handlePlaceOrder = async () => {
  // ... create order ...
  
  if (formData.paymentMethod === 'cod') {
    setShowOrderConfirmed(true); // Show confirmation popup
    return;
  }
};
```

**Backend (Optional - for manual confirmation):**
```bash
POST /wp-json/custom/v1/cod-confirm
{
  "order_id": 5678
}
```

---

## Testing Webhooks

### 1. Using Webhook Testing Tools

#### Option A: Stripe CLI (Best for Stripe)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login and listen to events
stripe login
stripe listen --forward-to https://db.store1920.com/wp-json/custom/v1/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

#### Option B: Webhook.site (For All Services)
1. Go to https://webhook.site/
2. Copy the unique URL
3. Temporarily set webhook URL in payment provider dashboard
4. Make test payment and see the payload

#### Option C: Postman
1. Open Postman
2. Create POST request to webhook URL
3. Set body as JSON with sample payload (see examples above)
4. Send and check response

### 2. Test Payload Examples

**Test Tabby Webhook:**
```bash
curl -X POST https://db.store1920.com/wp-json/custom/v1/tabby-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.approved",
    "order": {
      "id": "test_tabby_123",
      "reference_id": "5678",
      "status": "APPROVED"
    }
  }'
```

**Test COD Confirmation:**
```bash
curl -X POST https://db.store1920.com/wp-json/custom/v1/cod-confirm \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 5678
  }'
```

---

## Order Flow Diagrams

### COD Flow
```
┌─────────────┐
│   Checkout  │
└─────────────┘
       │
       ├─ Select "Cash on Delivery"
       │
       ├─ Click "Pay Now"
       │
       ├─ Order Created (ID: 5678)
       │
       ├─ OrderConfirmedPopup Shows
       │  ├─ "Your order is confirmed" ✓
       │  ├─ Payment Method: Cash on Delivery
       │  └─ Button: "CONTINUE TO ORDER TRACKING"
       │
       ├─ User clicks button
       │
       ├─ Order Status: PROCESSING
       │  (Awaiting payment on delivery)
       │
       └─> Order Success Page
           └─ Shows order details + COD info
```

### Card/Tabby/Tamara Flow
```
┌─────────────┐
│   Checkout  │
└─────────────┘
       │
       ├─ Select "Card/Tabby/Tamara"
       │
       ├─ Click "Pay Now"
       │
       ├─ Order Created (ID: 5678)
       │
       ├─ Redirected to Payment Gateway
       │
       ├─ User completes payment
       │
       ├─ Payment Gateway sends Webhook
       │  └─ POST /wp-json/custom/v1/[gateway]-webhook
       │
       ├─ Backend Updates Order
       │  ├─ Status: COMPLETED (if success)
       │  ├─ Payment Method: [Gateway Name]
       │  └─ Metadata: Payment ID, etc
       │
       ├─ Confirmation Email Sent
       │
       └─> Order Success Page
           └─ Shows order details + payment info
```

---

## Order Status Mapping

### Order Status Transitions

```
COD:
  PENDING → PROCESSING (awaiting cash on delivery)
  
Tabby/Tamara:
  PENDING → COMPLETED (on approval)
  PENDING → FAILED (on rejection)
  PENDING → CANCELLED (on cancellation)
  
Stripe:
  PENDING → COMPLETED (checkout.session.completed)
  PENDING → FAILED (charge.failed)
  COMPLETED → REFUNDED (charge.refunded)
```

---

## Troubleshooting

### Issue: Webhook Not Being Received
- **Check 1:** Verify endpoint URL is correct and publicly accessible
- **Check 2:** Check WordPress logs: `wp-content/debug.log`
- **Check 3:** Verify firewall/security allows POST requests
- **Check 4:** Check webhook logs in payment provider dashboard

### Issue: Order Not Updating
- **Check 1:** Verify order ID matches between platforms
- **Check 2:** Check WordPress API authentication headers
- **Check 3:** Look for PHP errors in webhook handler
- **Check 4:** Verify WooCommerce is installed and activated

### Issue: Email Not Sending
- **Check 1:** Verify SMTP server is configured
- **Check 2:** Check WordPress email settings
- **Check 3:** Review `wp-mail()` logs

---

## Security Considerations

### 1. Webhook Verification
Add signature verification:

```php
// For Stripe
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$event = \Stripe\Webhook::constructEvent(
  $payload, $sig_header, $endpoint_secret
);

// For Tabby
$signature = $_SERVER['HTTP_X_TABBY_SIGNATURE'] ?? '';
if (!verify_tabby_signature($payload, $signature)) {
  return error_response('Invalid signature');
}
```

### 2. CORS Configuration
If webhooks come from external domains, configure CORS:

```php
add_action('rest_api_init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT');
    header('Access-Control-Allow-Headers: Content-Type');
});
```

### 3. Rate Limiting
Prevent webhook replay attacks:

```php
$last_webhook = get_transient('webhook_' . $order_id);
if ($last_webhook && (time() - $last_webhook) < 5) {
    return error_response('Duplicate webhook');
}
set_transient('webhook_' . $order_id, time(), 3600);
```

---

## File Locations

```
Frontend:
├── src/
│   ├── components/
│   │   ├── CheckoutRight.jsx (Order creation logic)
│   │   └── checkout/
│   │       └── OrderConfirmedPopup.jsx (COD confirmation)
│   ├── api/
│   │   └── webhookHandlers.js (Client-side handlers)
│   └── pages/
│       └── OrderSuccess.jsx (Success page display)

Backend:
├── wordpress-payment-webhooks.php (REST API endpoints)
└── wp-content/
    └── plugins/
        └── payment-webhooks/ (Optional plugin)
            └── payment-webhooks.php
```

---

## Next Steps

1. ✅ Review webhook handler files
2. ✅ Install WordPress webhook handler
3. ✅ Configure webhooks in payment provider dashboards
4. ✅ Test each webhook with sample payloads
5. ✅ Monitor WordPress logs for errors
6. ✅ Test full payment flows in staging environment
7. ✅ Deploy to production

---

## Support Contacts

- **Tabby:** support@tabby.ai / https://support.tabby.ai
- **Tamara:** support@tamara.co / https://support.tamara.co
- **Stripe:** support@stripe.com / https://support.stripe.com
- **WooCommerce:** https://woocommerce.com/support/

---

**Last Updated:** January 12, 2026
**Version:** 1.0
