<?php
/**
 * Webhook Handlers for Payment Gateways
 * File: wordpress-payment-webhooks.php
 * 
 * Add this to your WordPress functions.php or as a separate plugin file
 * Handles webhooks from Tabby, Tamara, Stripe, and PayPal
 */

// ============================================
// TABBY WEBHOOK ENDPOINT
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/tabby-webhook', array(
        'methods' => 'POST',
        'callback' => 'handle_tabby_webhook',
        'permission_callback' => '__return_true'
    ));
});

function handle_tabby_webhook() {
    $payload = file_get_contents('php://input');
    $data = json_decode($payload, true);

    error_log('Tabby Webhook: ' . json_encode($data));

    if (!isset($data['order']['reference_id'])) {
        return new WP_Error('missing_order_id', 'Order ID missing from webhook', ['status' => 400]);
    }

    $order_id = intval($data['order']['reference_id']);
    $status = $data['order']['status'] ?? 'PENDING';

    // Map Tabby status to WooCommerce status
    $status_map = [
        'APPROVED' => 'completed',
        'PENDING' => 'pending',
        'REJECTED' => 'failed',
        'CANCELLED' => 'cancelled',
        'CLOSED' => 'completed'
    ];

    $new_status = $status_map[$status] ?? 'pending';
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
    }

    // Update order
    $order->set_payment_method('tabby');
    $order->set_payment_method_title('Tabby');
    $order->set_status($new_status);
    $order->add_meta_data('tabby_order_id', $data['order']['id']);
    $order->add_meta_data('tabby_status', $status);
    $order->save();

    // Send confirmation email if payment completed
    if ($new_status === 'completed') {
        do_action('woocommerce_order_status_completed', $order_id);
    }

    return rest_ensure_response([
        'success' => true,
        'order_id' => $order_id,
        'status' => $new_status,
        'message' => 'Tabby webhook processed successfully'
    ]);
}

// ============================================
// TAMARA WEBHOOK ENDPOINT
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/tamara-webhook', array(
        'methods' => 'POST',
        'callback' => 'handle_tamara_webhook',
        'permission_callback' => '__return_true'
    ));
});

function handle_tamara_webhook() {
    $payload = file_get_contents('php://input');
    $data = json_decode($payload, true);

    error_log('Tamara Webhook: ' . json_encode($data));

    if (!isset($data['order_reference_id'])) {
        return new WP_Error('missing_order_id', 'Order ID missing from webhook', ['status' => 400]);
    }

    $order_id = intval($data['order_reference_id']);
    $status = $data['order_status'] ?? 'PENDING';

    // Map Tamara status to WooCommerce status
    $status_map = [
        'APPROVED' => 'completed',
        'PENDING' => 'pending',
        'REJECTED' => 'failed',
        'CANCELLED' => 'cancelled',
        'CAPTURED' => 'completed'
    ];

    $new_status = $status_map[$status] ?? 'pending';
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
    }

    // Update order
    $order->set_payment_method('tamara');
    $order->set_payment_method_title('Tamara');
    $order->set_status($new_status);
    $order->add_meta_data('tamara_order_id', $data['order_id']);
    $order->add_meta_data('tamara_status', $status);
    $order->save();

    // Send confirmation email if payment completed
    if ($new_status === 'completed') {
        do_action('woocommerce_order_status_completed', $order_id);
    }

    return rest_ensure_response([
        'success' => true,
        'order_id' => $order_id,
        'status' => $new_status,
        'message' => 'Tamara webhook processed successfully'
    ]);
}

// ============================================
// STRIPE WEBHOOK ENDPOINT
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/stripe-webhook', array(
        'methods' => 'POST',
        'callback' => 'handle_stripe_webhook',
        'permission_callback' => '__return_true'
    ));
});

function handle_stripe_webhook() {
    $payload = file_get_contents('php://input');
    $data = json_decode($payload, true);

    error_log('Stripe Webhook: ' . json_encode($data));

    $event_type = $data['type'] ?? null;
    $session = $data['data']['object'] ?? [];

    if (!isset($session['client_reference_id'])) {
        return new WP_Error('missing_order_id', 'Order ID missing from webhook', ['status' => 400]);
    }

    $order_id = intval($session['client_reference_id']);
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
    }

    $new_status = 'pending';

    switch ($event_type) {
        case 'checkout.session.completed':
            $new_status = 'completed';
            $order->add_meta_data('stripe_session_id', $session['id']);
            $order->add_meta_data('stripe_payment_status', $session['payment_status']);
            break;

        case 'charge.failed':
            $new_status = 'failed';
            $order->add_meta_data('stripe_error', 'Payment failed');
            break;

        case 'charge.refunded':
            $new_status = 'refunded';
            break;
    }

    $order->set_payment_method('stripe');
    $order->set_payment_method_title('Stripe');
    $order->set_status($new_status);
    $order->save();

    // Send confirmation email if payment completed
    if ($new_status === 'completed') {
        do_action('woocommerce_order_status_completed', $order_id);
    }

    return rest_ensure_response([
        'success' => true,
        'order_id' => $order_id,
        'status' => $new_status,
        'event_type' => $event_type,
        'message' => 'Stripe webhook processed successfully'
    ]);
}

// ============================================
// COD CONFIRMATION ENDPOINT
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/cod-confirm', array(
        'methods' => 'POST',
        'callback' => 'handle_cod_confirmation',
        'permission_callback' => '__return_true'
    ));
});

function handle_cod_confirmation() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['order_id'])) {
        return new WP_Error('missing_order_id', 'Order ID is required', ['status' => 400]);
    }

    $order_id = intval($data['order_id']);
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
    }

    // Set COD status as processing (awaiting payment on delivery)
    $order->set_payment_method('cod');
    $order->set_payment_method_title('Cash on Delivery');
    $order->set_status('processing');
    $order->add_meta_data('cod_confirmed', current_time('mysql'));
    $order->save();

    // Send confirmation email
    do_action('woocommerce_order_status_processing', $order_id);

    return rest_ensure_response([
        'success' => true,
        'order_id' => $order_id,
        'status' => 'processing',
        'message' => 'COD order confirmed and awaiting delivery'
    ]);
}

// ============================================
// GET PAYMENT STATUS ENDPOINT
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/payment-status/(?P<order_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'get_payment_status',
        'permission_callback' => '__return_true'
    ));
});

function get_payment_status($request) {
    $order_id = intval($request->get_param('order_id'));
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
    }

    return rest_ensure_response([
        'order_id' => $order->get_id(),
        'status' => $order->get_status(),
        'payment_method' => $order->get_payment_method(),
        'payment_method_title' => $order->get_payment_method_title(),
        'is_paid' => $order->is_paid(),
        'total' => $order->get_total(),
        'currency' => $order->get_currency(),
        'date_paid' => $order->get_date_paid()
    ]);
}

// ============================================
// SEND PAYMENT CONFIRMATION EMAIL
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/send-payment-confirmation', array(
        'methods' => 'POST',
        'callback' => 'send_payment_confirmation_email',
        'permission_callback' => '__return_true'
    ));
});

function send_payment_confirmation_email() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['order_id']) || !isset($data['customer_email'])) {
        return new WP_Error('missing_data', 'Order ID and customer email are required', ['status' => 400]);
    }

    $order_id = intval($data['order_id']);
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
    }

    // Send email
    $to = $data['customer_email'];
    $subject = sprintf(__('Order #%d - Payment Confirmed', 'woocommerce'), $order_id);
    
    $message = sprintf(
        __('Dear %s,<br>Your payment for Order #%d has been confirmed.<br>Amount: %s<br>Payment Method: %s', 'woocommerce'),
        $order->get_billing_first_name(),
        $order_id,
        wc_price($order->get_total()),
        $order->get_payment_method_title()
    );

    $headers = array('Content-Type: text/html; charset=UTF-8');
    $sent = wp_mail($to, $subject, $message, $headers);

    return rest_ensure_response([
        'success' => $sent,
        'message' => $sent ? 'Email sent successfully' : 'Failed to send email'
    ]);
}

// ============================================
// LOG WEBHOOK EVENTS
// ============================================
function log_webhook_event($gateway, $event_type, $data) {
    $log_file = WP_CONTENT_DIR . '/payment-webhooks.log';
    $timestamp = current_time('Y-m-d H:i:s');
    $log_entry = sprintf(
        "[%s] %s - %s: %s\n",
        $timestamp,
        $gateway,
        $event_type,
        json_encode($data)
    );
    
    error_log($log_entry, 3, $log_file);
}

// ============================================
// WEBHOOK SETUP IN PAYMENT PROVIDER ACCOUNTS
// ============================================
/**
 * SETUP INSTRUCTIONS:
 * 
 * === TABBY ===
 * 1. Go to Tabby Merchant Dashboard
 * 2. Settings > Webhooks
 * 3. Add webhook URL: https://db.store1920.com/wp-json/custom/v1/tabby-webhook
 * 4. Select events: Order.CLOSED, Order.APPROVED, Order.REJECTED
 * 
 * === TAMARA ===
 * 1. Go to Tamara Merchant Dashboard
 * 2. Settings > Webhooks
 * 3. Add webhook URL: https://db.store1920.com/wp-json/custom/v1/tamara-webhook
 * 4. Select events: order_approved, order_rejected, order_cancelled, order_captured
 * 
 * === STRIPE ===
 * 1. Go to Stripe Dashboard
 * 2. Developers > Webhooks
 * 3. Add webhook URL: https://db.store1920.com/wp-json/custom/v1/stripe-webhook
 * 4. Select events:
 *    - checkout.session.completed
 *    - charge.failed
 *    - charge.refunded
 * 
 * === PAYPAL ===
 * Similar to above, but use PayPal's IPN (Instant Payment Notification)
 * Webhook URL: https://db.store1920.com/wp-json/custom/v1/paypal-webhook
 */
?>
