// src/components/checkout/CheckoutRight.jsx
import React, { useState, useEffect } from 'react';
import '../assets/styles/checkout/CheckoutRight.css';
import TrustSection from './checkout/TrustSection';
import CouponDiscount from './sub/account/CouponDiscount';
import CoinBalance from './sub/account/CoinBalace';
import OrderConfirmedPopup from './checkout/OrderConfirmedPopup';
import PaymentMethodSelector from './checkout/PaymentMethodSelector';
import Tabby from '../assets/images/Footer icons/3.webp'
import Tamara from '../assets/images/Footer icons/6.webp'

// -----------------------------
// Alert Component
// -----------------------------
function Alert({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  const colors = { info: '#2f86eb', success: '#28a745', error: '#dc3545' };

  return (
    <div
      style={{
        padding: '12px 20px',
        marginBottom: '20px',
        backgroundColor: colors[type] || colors.info,
        color: '#fff',
        borderRadius: '4px',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
      role="alert"
    >
      {message}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          right: '12px',
          top: '12px',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}

// -----------------------------
// Utility: parse price safely
// -----------------------------
const parsePrice = (raw) => {
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.price ?? raw.regular_price ?? raw.sale_price ?? 0;
  }
  const cleaned = String(raw).replace(/,/g, '').replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// -----------------------------
// CheckoutRight Component
// -----------------------------
export default function CheckoutRight({ cartItems, formData, createOrder, clearCart, orderId, showForm = false }) {
  const [alert, setAlert] = useState({ message: '', type: 'info' });
  const [hoverMessage, setHoverMessage] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [coinDiscount, setCoinDiscount] = useState(0);
  const [showOrderConfirmed, setShowOrderConfirmed] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  const showAlert = (message, type = 'info') => setAlert({ message, type });

  const itemsTotal = cartItems.reduce((acc, item) => {
    const price = parsePrice(item.prices?.price ?? item.price);
    const quantity = parseInt(item.quantity, 10) || 1;
    return acc + price * quantity;
  }, 0);

  const subtotal = Math.max(0, itemsTotal - discount - coinDiscount);
  const totalWithDelivery = subtotal;
  const amountToSend = Math.max(totalWithDelivery, 0.01);
  const hasCartItems = cartItems.some((item) => (parseInt(item.quantity, 10) || 0) > 0);
  const isAddressFormOpen = !!(showForm || formData?.addressModalOpen);

  const requiredFields = [
    'first_name',
    'email',
    'phone_number',
    'street',
    'city',
    'country',
  ];
  const shippingOrBilling = formData.shipping || formData.billing || {};
  const isAddressComplete = requiredFields.every((f) => shippingOrBilling[f]?.trim());
  const canPlaceOrder = isAddressComplete && hasCartItems;

  // Capture order items
  const captureOrderItems = async (orderId, cartItems, customer) => {
    const items = cartItems.map((item) => ({
      id: item.wooId || item.id || 0,
      name: item.name || item.title,
      price: parseFloat(item.prices?.price ?? item.price ?? 0),
      quantity: parseInt(item.quantity, 10) || 1,
    }));

    await fetch('https://db.store1920.com/wp-json/custom/v1/capture-order-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        customer: {
          first_name: customer.first_name,
          email: customer.email,
          phone_number: customer.phone_number,
        },
        items,
      }),
    });
  };

  // -----------------------------
  // Place Order
  // -----------------------------
  const handlePlaceOrder = async () => {
    if (!hasCartItems) return showAlert('Your cart is empty.', 'error');
    if (!isAddressComplete) return showAlert('Please fill all required address fields.', 'error');
    if (!formData.paymentMethod) return showAlert('Select a payment method', 'error');
    setIsPlacingOrder(true);

    try {
      const id = orderId || (await createOrder());
      await captureOrderItems(id, cartItems, shippingOrBilling);

      // COD - Show order confirmed popup instead of redirecting
      if (formData.paymentMethod === 'cod') {
        clearCart();
        setConfirmedOrderId(id.id || id);
        setConfirmedOrderTotal(amountToSend); // Store the order total
        setShowOrderConfirmed(true);
        setIsPlacingOrder(false);
        return;
      }

      // ✅ STRIPE FLOW
      if (formData.paymentMethod === 'stripe') {
        const normalized = {
          first_name: shippingOrBilling.first_name || 'First',
          email: shippingOrBilling.email || 'customer@example.com',
        };

        const payload = {
          amount: amountToSend,
          order_id: id.id || id,
          billing: normalized,
          frontend_success: window.location.origin + '/order-success',
        };

        try {
          const res = await fetch('https://db.store1920.com/wp-json/custom/v3/stripe-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          console.log('✅ Stripe Session =>', data);
          if (!res.ok || !data.checkout_url) {
            throw new Error(data.error || 'Failed to start Stripe session.');
          }
          window.location.href = data.checkout_url;
          return;
        } catch (err) {
          console.error('❌ STRIPE FETCH ERROR:', err);
          showAlert(err.message || 'Failed to initiate Stripe payment.', 'error');
        }
      }

      if (formData.paymentMethod === 'tabby') {
  // Construct full phone number from prefix and number
        const phone = shippingOrBilling.phone_number || "";
        const fullPhone = `+971${phone}`;

  const normalized = {
    first_name: shippingOrBilling.first_name || 'First',
    email:      shippingOrBilling.email      || 'customer@example.com',
    phone_number: fullPhone
  };

  const payload = {
    amount: amountToSend,
    order_id: id.id || id,
    billing: normalized
  };

  try {
    const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tabby-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('✅ Tabby Response =>', data);
    console.log('📋 Tabby Payload Sent =>', payload);

    // Check if response indicates an error or missing checkout_url
    if (!res.ok || !data.checkout_url || data.error || data.message) {
      console.error('❌ Tabby API Error Details:', {
        status: res.status,
        statusText: res.statusText,
        response: data
      });
      
      // Use the actual error message from Tabby's response
      const errorMessage = data.error || data.message || 'Failed to start Tabby session.';
      throw new Error(errorMessage);
    }

    window.location.href = data.checkout_url;
    return;
  } catch (err) {
    console.error('❌ TABBY ERROR:', err);
    showAlert(err.message || 'Failed to initiate Tabby payment.', 'error');
  }
      }
      if (formData.paymentMethod === 'tamara') {
        const payload = {
          amount: amountToSend,
          order_id: id.id || id,
          billing: shippingOrBilling,
        };
        const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tamara-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          console.error('Tamara error:', data);
        }
      }



      // ✅ PAYMOB / TABBY / TAMARA / CARD FLOW
      if (['paymob', 'card'].includes(formData.paymentMethod)) {
        const normalized = {
          first_name: shippingOrBilling.first_name?.trim() || 'First',
          email:
            shippingOrBilling.email?.trim() ||
            formData.billing?.email ||
            'customer@example.com',
          phone_number: shippingOrBilling.phone_number?.startsWith('+')
            ? shippingOrBilling.phone_number
            : `+${shippingOrBilling.phone_number || '971501234567'}`,
          street: shippingOrBilling.street?.trim() || '',
          city: shippingOrBilling.city?.trim() || 'Dubai',
          country: 'AE',
        };

        const payload = {
          amount: amountToSend,
          order_id: id.id || id,
          billing: normalized,
          shipping: normalized,
          billingSameAsShipping: true,
          items: [
            {
              name: `Order ${id.id || id}`,
              amount: amountToSend,
              quantity: 1,
              description: 'Order from store1920.com',
            },
          ],
          provider: formData.paymentMethod,
        };

        try {
          const res = await fetch('https://db.store1920.com/wp-json/custom/v3/stripe-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          console.log('✅ Paymob Response =>', data);

          if (!res.ok) throw new Error(data.message || 'Failed to initiate payment.');
          if (!data.checkout_url && !data.payment_url)
            throw new Error('Paymob checkout URL missing.');
          window.location.href = data.checkout_url || data.payment_url;
          return;
        } catch (err) {
          console.error('❌ PAYMOB FETCH ERROR:', err);
          showAlert(err.message || 'Failed to initiate Paymob payment.', 'error');
        }
      }
    } catch (err) {
      console.error('❌ ORDER ERROR:', err);
      showAlert(err.message || 'Failed to place order.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // -----------------------------
  // UI helpers
  // -----------------------------
  const getButtonStyle = () => {
    let backgroundColor = '#ff9800'; // Default orange
    let borderColor = '#f57c00';
    let hoverBorderColor = '#ef6c00';
    
    // Use exact brand colors for specific payment methods
    if (formData.paymentMethod === 'tabby') {
      backgroundColor = '#50C878'; // Tabby's exact teal/mint color
      borderColor = '#45B369';
      hoverBorderColor = '#3A9E5A';
    } else if (formData.paymentMethod === 'tamara') {
      backgroundColor = '#39B54A'; // Tamara's exact green color
      borderColor = '#2E9338';
      hoverBorderColor = '#237A2C';
    }
    
    const base = {
      color: '#ffffff',
      backgroundColor: backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '25px',
      fontWeight: 600,
      padding: '14px 36px',
      cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
    };
    
    // Add hover effect styling
    const hoverStyle = {
      ':hover': {
        borderColor: hoverBorderColor,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }
    };

    return base;
  };

  // Handle "Pay Now" from order confirmed popup
  const handlePayNowFromConfirmation = () => {
    // Show payment method selector
    setShowOrderConfirmed(false);
    setShowPaymentSelector(true);
  };

  // Handle close order confirmed popup
  const handleCloseOrderConfirmed = () => {
    setShowOrderConfirmed(false);
    console.log('✅ COD Order Confirmed - Redirecting to success page');
    // For COD orders, redirect to payment callback which shows success
    // This ensures proper status checking
    window.location.href = `/payment-callback?order_id=${confirmedOrderId}`;
  };

  // Handle payment method selection from selector
  const handleSelectPaymentMethod = async (method, amount, orderId) => {
    setShowPaymentSelector(false);
    
    // The amount passed already includes the 5% discount from the selector
    // No need to apply discount again - use it as is
    const finalAmount = amount;
    
    // Format data for payment processing
    const shippingOrBilling = formData.shipping || formData.billing || {};
    const normalized = {
      first_name: shippingOrBilling.first_name?.trim() || 'First',
      email: shippingOrBilling.email?.trim() || 'customer@example.com',
      phone_number: shippingOrBilling.phone_number?.startsWith('+')
        ? shippingOrBilling.phone_number
        : `+${shippingOrBilling.phone_number || '971501234567'}`,
    };

    try {
      // CARD PAYMENT
      if (method === 'card') {
        const payload = {
          amount: finalAmount,
          order_id: orderId,
          billing: normalized,
          frontend_success: window.location.origin + '/order-success',
        };

        const res = await fetch('https://db.store1920.com/wp-json/custom/v3/stripe-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.checkout_url) {
          throw new Error(data.error || 'Failed to start payment.');
        }
        window.location.href = data.checkout_url;
        return;
      }

      // TABBY PAYMENT
      if (method === 'tabby') {
        const phone = shippingOrBilling.phone_number || "";
        const fullPhone = `+971${phone}`;

        const payload = {
          amount: finalAmount,
          order_id: orderId,
          billing: { ...normalized, phone_number: fullPhone }
        };

        const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tabby-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.checkout_url) {
          throw new Error(data.error || 'Failed to start Tabby payment.');
        }
        window.location.href = data.checkout_url;
        return;
      }

      // TAMARA PAYMENT
      if (method === 'tamara') {
        const payload = {
          amount: finalAmount,
          order_id: orderId,
          billing: normalized,
        };
        const res = await fetch('https://db.store1920.com/wp-json/custom/v1/tamara-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error('Failed to start Tamara payment.');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      showAlert(err.message || 'Failed to process payment.', 'error');
      // Show selector again on error
      setShowPaymentSelector(true);
    }
  };

  const getButtonLabel = () => {
    const labels = {
      cod: 'Cash on Delivery',
      stripe: 'Stripe',
      paymob: 'Paymob',
      card: 'Card',
      tabby: 'Tabby',
      tamara: 'Tamara',
    };

    const defaultLogos = {
      tabby: Tabby,
      tamara: Tamara,
    };

    const method = formData.paymentMethod;
    const hasMethod = Boolean(method);
    const label = hasMethod ? (labels[method] || method) : 'Order';
  const rawLogo = hasMethod ? (defaultLogos[method] || formData.paymentMethodLogo || null) : null;
  const shouldHideLogo = method === 'cod' || method === 'card';
  const logoUrl = shouldHideLogo ? null : rawLogo;
    const baseText = isPlacingOrder
      ? hasMethod
        ? `Placing Order with ${label}...`
        : 'Placing Order...'
      : hasMethod
        ? `Place Order with ${label}`
        : 'Place Order';

    const wrapperStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      minHeight: '24px',
      textAlign: 'center',
    };

    if (!logoUrl) {
      return <span style={wrapperStyle}>{baseText}</span>;
    }

    const logoStyle = {
      height: method === 'tabby' || method === 'tamara' ? '38px' : '32px',
      width: method === 'tabby' || method === 'tamara' ? '60px' : 'auto',
      objectFit: 'contain',
      padding: '2px 4px',
      borderRadius: '4px',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
    };

    if (method === 'tabby' || method === 'tamara') {
      logoStyle.backgroundColor = 'transparent';
      logoStyle.border = 'none';
    } else if (method === 'cod') {
      logoStyle.backgroundColor = '#fff7ed';
      logoStyle.border = '1px solid #f97316';
    } else if (method === 'card') {
      logoStyle.backgroundColor = '#f0fdf4';
      logoStyle.border = '1px solid #22c55e';
    }

    return (
      <span style={wrapperStyle}>
        <span>{baseText}</span>
        <img
          src={logoUrl}
          alt={label}
          style={{
            ...logoStyle,
            visibility: isPlacingOrder ? 'hidden' : 'visible',
          }}
        />
      </span>
    );
  };

  return (
    <aside className="checkoutRightContainer">
      {/* Order Confirmed Popup */}
      <OrderConfirmedPopup
        isOpen={showOrderConfirmed}
        onClose={handleCloseOrderConfirmed}
        onPayNow={handlePayNowFromConfirmation}
        orderId={confirmedOrderId}
        isLoading={false}
        paymentMethod={formData.paymentMethod}
      />

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        isOpen={showPaymentSelector}
        onClose={() => {
          // When closing payment selector, confirm order as COD
          setShowPaymentSelector(false);
          window.location.href = `/order-success?order_id=${confirmedOrderId}`;
        }}
        onSelectMethod={handleSelectPaymentMethod}
        subtotal={confirmedOrderTotal}
        orderId={confirmedOrderId}
        isLoading={false}
      />

      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: '', type: 'info' })}
      />
      {/* Order Summary: only show when order confirmed popup is NOT open (desktop and mobile) */}
      {!showOrderConfirmed && (
        <>
          <div className="orderSummaryResponsive desktop-only">
            <h2
              style={{
                marginBottom: '12px',
                fontSize: '18px',
                fontWeight: 700,
                color: '#222'
              }}
            >
              Order Summary
            </h2>
            <CouponDiscount onApplyCoupon={() => {}} />
            <div className="summaryRowCR" style={{ marginTop: '1rem' }}>
              <span>Total:</span>
              <strong>{`AED ${totalWithDelivery.toFixed(2)}`}</strong>
            </div>
          </div>
          {/* Mobile order summary (if you have a mobile-only version, add the same !showOrderConfirmed check there) */}
        </>
      )}

      {/* Desktop: normal button */}
      <button
        className="placeOrderBtnCR desktopStickyButton"
        onClick={handlePlaceOrder}
        disabled={isPlacingOrder || !canPlaceOrder}
        style={getButtonStyle()}
      >
        {getButtonLabel()}
      </button>

      {/* Mobile: sticky button with total, only after address is complete and not editing address/form or order popup */}
      {isAddressComplete && !editingAddress && !isAddressFormOpen && !showOrderConfirmed && (
        <div className="mobileStickyButton">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: '12px' }}>
            <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, marginBottom: '2px', marginLeft: '2px' }}>Total:</span>
            <span className="mobileSubtotal" style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}> AED {totalWithDelivery.toFixed(2)}</span>
          </div>
          <button
            className="placeOrderBtnCR"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || !canPlaceOrder}
            style={getButtonStyle()}
          >
            {getButtonLabel()}
          </button>
        </div>
      )}

      <TrustSection />
    </aside>
  );
}
