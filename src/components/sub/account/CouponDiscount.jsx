import React, { useState } from 'react';
import axios from 'axios';

export default function CouponDiscount({ onApplyCoupon }) {
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage('Please enter a coupon code.');
      setDiscountData(null);
      setIsValid(false);
      onApplyCoupon && onApplyCoupon(null);
      return;
    }

    setLoading(true);
    setMessage('');
    setDiscountData(null);
    setIsValid(false);

    try {
      const formData = new FormData();
      formData.append('coupon_code', couponCode.trim());

      const response = await axios.post(
        '/wp-admin/admin-ajax.php?action=check_coupon',
        formData
      );

      if (response.data.success) {
        const data = response.data.data;
        setDiscountData(data);
        setMessage('Coupon applied!');
        setIsValid(true);
        onApplyCoupon && onApplyCoupon(data);
      } else {
        setMessage(response.data.data || 'Invalid coupon code.');
        setIsValid(false);
        onApplyCoupon && onApplyCoupon(null);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error checking coupon. Please try again.');
      setIsValid(false);
      onApplyCoupon && onApplyCoupon(null);
    }

    setLoading(false);
  };

  return (
    <div className="coupon-card">
      <div className="coupon-header">Have a Coupon?</div>

      <div className="coupon-row">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
          disabled={loading}
          className={`coupon-input ${isValid ? 'valid' : ''}`}
        />

        <button
          onClick={handleApplyCoupon}
          disabled={loading}
          className="coupon-button"
        >
          {loading ? 'Checking...' : 'Apply'}
        </button>
      </div>

      {message && (
        <div className={`coupon-message ${isValid ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {discountData && isValid && (
        <div className="coupon-discount">
          {discountData.discount_type === 'percent'
            ? `${discountData.amount}% OFF`
            : `AED ${discountData.amount} OFF`}
        </div>
      )}

      <style jsx>{`
        .coupon-card {
          background: none;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          border: none;
          font-family: 'Montserrat', sans-serif;
          max-width: 100%;
        }

        .coupon-header {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .coupon-row {
          display: flex;
          gap: 8px;
          align-items: center;
          padding-right: 6px; /* ✅ spacing from right border */
        }

        .coupon-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #ddd;
          font-size: 14px;
          background: #fdfdfd;
          transition: all 0.3s;
        }

        .coupon-input:focus {
          outline: none;
          border-color: #ff5722;
          box-shadow: 0 0 8px rgba(255, 87, 34, 0.3);
        }

        .coupon-input.valid {
          border-color: #4caf50;
          box-shadow: 0 0 6px rgba(76, 175, 80, 0.3);
        }

        .coupon-button {
          padding: 12px 18px;
          border-radius: 14px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(90deg, #ff9800, #ff5722);
          transition: all 0.3s;
          white-space: nowrap;
        }

        .coupon-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4);
        }

        .coupon-button:disabled {
          background: #ffb74d66;
          cursor: not-allowed;
        }

        .coupon-message {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .coupon-message.success {
          color: #155724;
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }

        .coupon-message.error {
          color: #721c24;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }

        .coupon-discount {
          margin-top: 12px;
          padding: 12px;
          border-radius: 16px;
          text-align: center;
          font-weight: 700;
          font-size: 15px;
          color: #006064;
          background: linear-gradient(90deg, #b2ebf2, #e0f7fa);
          border: 1px solid #00acc1;
        }

        @media (max-width: 480px) {
          .coupon-row {
            flex-direction: row;
          }

          .coupon-input {
            width: 100%;
          }

          .coupon-card {
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}
