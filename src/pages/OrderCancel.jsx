import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getOrderById } from "../api/woocommerce";
import "../assets/styles/OrderSuccess.css";

const formatPrice = (value) => {
  const amount = Number.parseFloat(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `AED ${safeAmount.toFixed(2)}`;
};

const popularSearchTerms = [
  "Mosquito killer machine",
  "Electric mosquito killer",
  "Installment mobile phones",
  "Hair curling iron",
  "Portable Screen",
  "Oral irrigator",
  "Water Flosser",
  "Water tooth flosser",
  "Toothbrush",
  "Oral",
  "Electric toothbrush",
  "Bluetooth headphones",
  "Wireless earphones",
  "Travel kit",
  "Coffee bean grinder",
  "Treadmill",
  "Coffee maker machine",
  "Coffee grinder",
  "Home projector",
  "Candle Machines",
  "Gym equipment",
];

export default function OrderCancel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");
  const paymentId = queryParams.get("payment_id");
  const cancelReason = queryParams.get("reason") || "Payment was cancelled by user";

  const [animate, setAnimate] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        
        if (data && data.id) {
          // Order was placed successfully
          console.log('📦 Order found in backend:', data);
          console.log('💳 Payment Method:', data.payment_method);
          console.log('� Payment Method Title:', data.payment_method_title);
          console.log('📊 Order Status:', data.status);
          
          // CHECK: If COD, we already have the order placed
          // So we'll show success page, not cancelled
          setOrder(data);
          setOrderPlaced(true);
        } else {
          // Order was NOT placed
          console.warn('❌ Order not found in backend - order was not placed');
          setOrder(null);
          setOrderPlaced(false);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
        setOrderPlaced(false);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }

    setAnimate(true);

    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, orderId]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    alert('Order ID copied to clipboard!');
  };

  const handleCopyPaymentId = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      alert('Payment ID copied to clipboard!');
    }
  };

  const handlePopularSearchClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          <div style={{
            fontSize: 48,
            marginBottom: 16,
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <div className="loading-spinner">Checking order status...</div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // If order WAS placed, show Order Confirmed UI regardless of cancellation
  if (order && orderPlaced) {
    const isCOD = order.payment_method === 'cod' || 
                  order.payment_method_title === 'Cash on Delivery' ||
                  order.payment_method_title?.includes('Cash') ||
                  order.payment_method?.toLowerCase() === 'cod';
    
    console.log('🔍 Order found - Showing Order Confirmed UI');
    console.log('💳 Payment Method:', order.payment_method);
    console.log('📊 Order Status:', order.status);
    
    // Show Order Confirmed UI (matching the design from the image)
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          {/* Success Icon */}
          <div style={{ 
            fontSize: 80, 
            color: '#39B54A', 
            marginBottom: 16, 
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✓
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 12px 0',
            color: '#222',
            textAlign: 'center'
          }}>
            Order Confirmed!
          </h1>

          {/* Message */}
          <p style={{
            color: '#666',
            fontSize: 16,
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            Your order has been confirmed. We will deliver your items soon.
          </p>

          {/* Order Details Box */}
          <div style={{
            background: '#f7f7f7',
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 6px 0', color: '#888', fontSize: 12, fontWeight: '500' }}>
                Order Number:
              </p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#222' }}>
                #{order.id}
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 6px 0', color: '#888', fontSize: 12, fontWeight: '500' }}>
                Payment Method
              </p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#222' }}>
                {isCOD ? 'Cash on Delivery' : order.payment_method_title || 'Online Payment'}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 6px 0', color: '#888', fontSize: 12, fontWeight: '500' }}>
                Total Amount
              </p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#39B54A' }}>
                AED {parseFloat(order.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate(`/track-order?order_id=${order?.id}`)}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: '#2f86eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(47, 134, 235, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1e5ac7';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(47, 134, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#2f86eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(47, 134, 235, 0.3)';
              }}
            >
              Track Order
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: '#fff',
                color: '#222',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff';
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If order was NOT placed, show cancelled message
  if (!orderPlaced) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          {/* Header Section - Cancelled */}
          <div className="order-header">
            <div className="cancel-icon" style={{ 
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '48px', 
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(231, 76, 60, 0.3)'
            }}>✕</div>
            <h1 className="thank-you-title" style={{ color: '#e74c3c' }}>
              Order Cancelled
            </h1>
            <p className="thank-you-subtitle" style={{ color: '#666', marginBottom: '10px' }}>
              Your order has been cancelled and will not be processed.
            </p>
          </div>

          {/* Info Box */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            marginTop: 24
          }}>
            <p style={{ margin: 0, color: '#856404', fontSize: 13, lineHeight: 1.5 }}>
              <strong>What's next?</strong><br />
              Your order was not placed. No charges have been made to your account. You can start a new order whenever you're ready.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button 
              onClick={() => navigate('/checkout')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#2f86eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#1e5ac7'}
              onMouseLeave={(e) => e.target.style.background = '#2f86eb'}
            >
              Start New Order
            </button>

            <button 
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#f0f0f0',
                color: '#222',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If order not found
  if (!order) {
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          <div className="error-message">Order not found.</div>
          <button 
            onClick={() => navigate('/')}
            style={{
              marginTop: 20,
              padding: '12px 20px',
              background: '#2f86eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // This should never be reached, but kept for safety
  return null;
}