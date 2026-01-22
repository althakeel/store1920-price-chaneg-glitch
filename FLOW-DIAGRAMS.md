# Payment Flow Diagrams

## 1. COD (Cash on Delivery) Complete Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CHECKOUT PAGE                                  │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐         │
│  │   Fill Form     │→ │  Select Payment │→ │  Click Pay Now   │         │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘         │
│                                │                                          │
│                                ├─► COD Selected                          │
│                                ├─► Card Selected                         │
│                                ├─► Tabby Selected                        │
│                                └─► Tamara Selected                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │  COD SELECTED   │ │  CARD SELECTED   │ │ TABBY/TAMARA     │
        └─────────────────┘ └──────────────────┘ └──────────────────┘
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Order Created       │  │ Order Created│  │ Order Created│
        │  (Status: PENDING)   │  │(Status:     │  │(Status:     │
        │                      │  │ PENDING)    │  │ PENDING)    │
        └──────────────────────┘  └──────────────┘  └──────────────┘
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────────────┐ ┌────────────────┐ ┌────────────────┐
        │ OrderConfirmedPopup  │ │ Redirect to    │ │ Redirect to    │
        │   Shows:             │ │ Payment        │ │ Payment        │
        │  ✓ Checkmark         │ │ Gateway        │ │ Gateway        │
        │  ✓ "Confirmed" msg   │ │ (Stripe)       │ │ (Tabby/Tamara) │
        │  ✓ Cash icon         │ │                │ │                │
        │  ✓ "COD" badge       │ └────────────────┘ └────────────────┘
        │  ✓ "CONTINUE" btn    │        │                   │
        └──────────────────────┘        ▼                   ▼
                │             ┌──────────────────┐ ┌──────────────────┐
                │             │ Customer Pays    │ │ Customer Pays    │
                │             │ on Gateway       │ │ on Gateway       │
                │             └──────────────────┘ └──────────────────┘
                │                      │                   │
                │                      ▼                   ▼
                │             ┌──────────────────┐ ┌──────────────────┐
                │             │ Webhook Sent     │ │ Webhook Sent     │
                │             │ to Backend       │ │ to Backend       │
                │             └──────────────────┘ └──────────────────┘
                │                      │                   │
                │                      ▼                   ▼
                │             ┌──────────────────┐ ┌──────────────────┐
                │             │ Order Status     │ │ Order Status     │
                │             │ Updated:         │ │ Updated:         │
                │             │ COMPLETED        │ │ COMPLETED        │
                │             └──────────────────┘ └──────────────────┘
                │                      │                   │
                └──────────┬───────────┴───────────────────┘
                           ▼
                ┌──────────────────────────────────┐
                │   User Clicks "CONTINUE" (COD)   │
                │   OR                             │
                │   Redirected to Success (Card)   │
                └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      ORDER SUCCESS PAGE              │
        │                                      │
        │  ✓ Thank You                        │
        │  ✓ Order ID: #5678                  │
        │  ✓ Order Date                       │
        │  ✓ Total Amount                     │
        │  ✓ Payment Method: Cash on Delivery │
        │  ✓ Order Details                    │
        │  ✓ Track Order Button               │
        └──────────────────────────────────────┘
```

---

## 2. Webhook Processing Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROVIDER                             │
│                  (Tabby/Tamara/Stripe)                          │
│                                                                 │
│  Customer Completes Payment → Webhook Triggered                │
└────────────────────────────────────────────────────────────────┘
                                  │
                                  │ POST /wp-json/custom/v1/[gateway]-webhook
                                  │ with payment_status and order_id
                                  ▼
┌────────────────────────────────────────────────────────────────┐
│                   WORDPRESS BACKEND                             │
│              (REST API Webhook Handler)                         │
│                                                                 │
│  1. Receive POST request                                       │
│  2. Validate payload (check order exists)                      │
│  3. Extract order_id and payment_status                        │
│                                                                 │
│     Status Map:                                                │
│     ┌─────────────────────────────────────┐                   │
│     │ APPROVED → COMPLETED                 │                   │
│     │ PENDING → PENDING                    │                   │
│     │ REJECTED → FAILED                    │                   │
│     │ CANCELLED → CANCELLED                │                   │
│     │ REFUNDED → REFUNDED                  │                   │
│     └─────────────────────────────────────┘                   │
│                                                                 │
│  4. Update WooCommerce order:                                  │
│     • Set status (COMPLETED/FAILED/etc)                       │
│     • Set payment method (tabby/tamara/stripe)                │
│     • Store gateway-specific metadata                          │
│                                                                 │
│  5. Send response back to gateway:                             │
│     ✓ Success: 200 OK                                          │
│     ✗ Error: 400/500 with error message                       │
│                                                                 │
│  6. Trigger WordPress hooks:                                   │
│     • woocommerce_order_status_completed                      │
│     • Send customer email                                      │
│     • Log transaction                                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌───────────────────────┐  ┌──────────────────────┐
        │ Order in WooCommerce  │  │ Customer Receives    │
        │ Status: COMPLETED ✓   │  │ Confirmation Email   │
        │ Payment: Paid         │  │                      │
        │ Method: Tabby/Tamara  │  │ Email contains:      │
        │ Metadata: Gateway ID  │  │ • Order number       │
        │ Date Paid: [timestamp]│  │ • Total amount       │
        └───────────────────────┘  │ • Payment status     │
                                    └──────────────────────┘
```

---

## 3. COD vs Payment Gateway Decision

```
                        ┌──────────────────┐
                        │  User at Checkout │
                        └──────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Select Payment Method │
                    └───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼───────┐  ┌───▼──────┐  ┌───▼──────┐
        │  Cash on Deiv. │  │   Card   │  │ Tabby    │
        │   (COD)        │  │ (Stripe) │  │ (Tamara) │
        └───────────────┘  └──────────┘  └──────────┘
                │               │            │
        ┌───────▼────────────────┴────────────▼────────┐
        │                                              │
        │           CLICK "PAY NOW" BUTTON             │
        │                                              │
        └───────────┬────────────┬─────────────────────┘
                    │            │
            ┌───────▼─┐    ┌─────▼──────┐
            │ COD?    │    │ External   │
            └────┬────┘    │ Gateway?   │
                 │         └─────┬──────┘
            YES │              YES │
                ▼                  ▼
        ┌─────────────────┐  ┌──────────────────┐
        │ Create Order    │  │ Create Order     │
        │ (PENDING)       │  │ (PENDING)        │
        │                 │  │                  │
        │ Show Popup:     │  │ Redirect to:     │
        │ • "Confirmed"✓  │  │ • Stripe         │
        │ • Cash icon     │  │ • Tabby          │
        │ • COD badge     │  │ • Tamara         │
        │ • CONTINUE btn  │  │                  │
        └─────────────────┘  └──────────────────┘
                │                    │
        ┌───────▼─────────┐      ┌────▼────────────┐
        │ Order Status:   │      │ Customer pays   │
        │ PROCESSING      │      │ on gateway      │
        │                 │      │                 │
        │ (Awaiting cash  │      │ Gateway sends   │
        │  on delivery)   │      │ webhook         │
        └─────────────────┘      │                 │
                │                │ Backend updates │
                │                │ order status    │
                │                │ to COMPLETED    │
                │                │                 │
                └────────┬───────┘
                         ▼
        ┌──────────────────────────┐
        │  Order Success Page      │
        │                          │
        │ Shows:                   │
        │ • Order confirmation     │
        │ • Order details          │
        │ • Payment status         │
        │ • Next steps             │
        └──────────────────────────┘
```

---

## 4. OrderConfirmedPopup Component States

```
                    ┌────────────────────┐
                    │ OrderConfirmedPopup│
                    └────────────────────┘
                            │
                            ▼
                    ┌────────────────────┐
                    │ Check Payment      │
                    │ Method from props  │
                    └────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
        ┌───▼──┐                       ┌───▼──────┐
        │ COD? │                       │ Non-COD? │
        │ YES  │                       │ NO       │
        └───┬──┘                       └───┬──────┘
            │                              │
            ▼                              ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │ COD POPUP LAYOUT    │   │ NON-COD POPUP LAYOUT │
    │                     │   │                      │
    │ • Checkmark ✓       │   │ • Checkmark ✓        │
    │ • "Confirmed" msg   │   │ • "Confirmed" msg    │
    │ • Blue info box:    │   │                      │
    │   - Cash icon       │   │ • Orange offer box:  │
    │   - "Payment Method │   │   "5% OFF prepaid"   │
    │     COD"            │   │                      │
    │   - "Delivery agent │   │ • Payment icons:     │
    │     collects"       │   │   Visa, Mastercard,  │
    │                     │   │   Tabby, Tamara      │
    │ • ONE Button:       │   │                      │
    │   "CONTINUE TO      │   │ • TWO Buttons:       │
    │    ORDER TRACKING"  │   │   "PAY NOW"          │
    │                     │   │   "NO, THANKS"       │
    │ • Order ID #5678    │   │                      │
    │                     │   │ • Order ID #5678     │
    └─────────────────────┘   └──────────────────────┘
            │                           │
            ▼                           ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │ User clicks         │   │ User clicks          │
    │ "CONTINUE"          │   │ "PAY NOW"            │
    └─────────────────────┘   └──────────────────────┘
            │                           │
            ▼                           ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │ Navigate to         │   │ Open Payment Method  │
    │ Order Success page  │   │ Selector (Tabby/etc) │
    └─────────────────────┘   └──────────────────────┘
```

---

## 5. Database Order Status Transitions

```
                    ┌─────────────┐
                    │   PENDING   │
                    │(Order Just) │
                    │ Created     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐        ┌───────────┐     ┌──────────┐
    │  COD   │        │ CARD/TABBY│     │ WEBHOOK  │
    │Selected│        │ SELECTED  │     │ RECEIVED │
    └────┬───┘        └─────┬─────┘     └────┬─────┘
         │                  │                 │
         ▼                  ▼                 ▼
    ┌────────────┐   ┌────────────────┐  ┌──────────────┐
    │PROCESSING  │   │REDIRECT to     │  │APPROVE EVENT │
    │            │   │GATEWAY         │  │              │
    │"Awaiting   │   │                │  │Status update │
    │delivery"   │   │Customer pays   │  │to COMPLETED  │
    └────┬───────┘   └────┬───────────┘  └──────────────┘
         │                │                  │
         │          ┌─────▼─────┐            │
         │          │ Webhook   │            │
         │          │ Received  │            │
         │          └─────┬─────┘            │
         │                │                  │
         │       ┌────────▼────────┐         │
         │       │ Check Status    │         │
         │       │ from gateway    │         │
         │       └────┬───────┬────┘         │
         │            │       │              │
    ┌────▼────┐  ┌────▼─┐  ┌─▼──────┐      │
    │SHIPPED/ │  │COMPLT│  │FAILED  │      │
    │DELIVERED│  │ED    │  │/REJECT │      │
    │(Manual) │  └──────┘  └────────┘      │
    └────┬────┘     │           │          │
         │          │           │          │
         │          ▼           ▼          │
         │      ┌─────────────────────┐    │
         │      │ Order in Dashboard  │    │
         │      │ Status Updated ✓    │    │
         │      │ Email Sent          │    │
         │      │ Payment Recorded    │    │
         │      └─────────────────────┘    │
         │               │                  │
         └───────┬───────┘                  │
                 │                          │
                 └──────────────┬───────────┘
                                ▼
                    ┌────────────────────┐
                    │  Order Visible in  │
                    │ Customer Dashboard │
                    │ with Payment Status│
                    └────────────────────┘
```

---

## 6. API Call Sequence

```
CLIENT SIDE (React)                    SERVER SIDE (WordPress)
──────────────────────                 ──────────────────────

1. User clicks "Pay Now"
   │
   ├─ if (COD)
   │  │
   │  └─→ handlePlaceOrder()
   │      │
   │      ├─→ createOrder()────────────→ POST /wp-json/wc/v3/orders
   │      │                             │
   │      │                             └─→ Create new WooCommerce order
   │      │                                 Return: order_id
   │      │
   │      ├─→ captureOrderItems()────────→ POST /wp-json/custom/v1/capture-order-items
   │      │                              │
   │      │                              └─→ Store order items metadata
   │      │
   │      └─→ Show OrderConfirmedPopup
   │          (payment method = 'cod')
   │
   ├─ else (Card/Tabby/Tamara)
   │  │
   │  └─→ handlePlaceOrder()
   │      │
   │      ├─→ createOrder()────────────→ POST /wp-json/wc/v3/orders
   │      │
   │      ├─→ captureOrderItems()
   │      │
   │      └─→ Redirect to Gateway
   │          (Tabby/Stripe/etc)
   │
   │
2. Customer Pays on Gateway
   │
   │
3. Gateway Webhook Sent
   │
   └────→ POST /wp-json/custom/v1/[gateway]-webhook
                                        │
                                        ├─→ Verify order exists
                                        │
                                        ├─→ Map status
                                        │
                                        ├─→ PUT /wp-json/wc/v3/orders/[id]
                                        │   │
                                        │   └─→ Update order status
                                        │       Add payment method
                                        │       Store metadata
                                        │
                                        ├─→ Send confirmation email
                                        │
                                        └─→ Return: 200 OK
```

---

## 7. File Dependencies

```
CheckoutRight.jsx
    │
    ├─→ imports OrderConfirmedPopup
    │       │
    │       ├─→ accepts paymentMethod prop
    │       └─→ renders COD or Payment Gateway UI
    │
    ├─→ imports handlePlaceOrder() logic
    │       │
    │       ├─→ if COD: shows popup
    │       └─→ if Card/Tabby/Tamara: redirects
    │
    └─→ uses formData.paymentMethod

webhookHandlers.js (Client)
    │
    ├─→ exports handleTabbyWebhook()
    ├─→ exports handleTamaraWebhook()
    ├─→ exports handleStripeWebhook()
    ├─→ exports handleCODConfirmation()
    └─→ exports checkPaymentStatus()

wordpress-payment-webhooks.php (Server)
    │
    ├─→ Registers REST routes
    │       │
    │       ├─→ POST /tabby-webhook
    │       ├─→ POST /tamara-webhook
    │       ├─→ POST /stripe-webhook
    │       ├─→ POST /cod-confirm
    │       ├─→ GET /payment-status/{id}
    │       └─→ POST /send-payment-confirmation
    │
    ├─→ Each endpoint:
    │       ├─→ Validates payload
    │       ├─→ Checks order exists
    │       ├─→ Maps payment status
    │       ├─→ Updates WooCommerce order
    │       └─→ Sends email
    │
    └─→ Calls WordPress hooks
            └─→ woocommerce_order_status_completed
```

---

Generated: January 12, 2026  
Version: 1.0
