import React from 'react';
import '../../assets/styles/checkoutleft/paymentconfirmation.css';
import CardIcon from '../../assets/images/tabby/creditcard.webp';

const PaymentConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  subtotal,
  discount = 0,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const discountPercentage = 5;
  const discountAmount = subtotal * (discountPercentage / 100);
  const finalAmount = subtotal - discountAmount;

  const getPaymentMethodIcon = () => {
    const icons = {
      card: CardIcon,
      stripe: CardIcon,
    };
    return icons[paymentMethod] || CardIcon;
  };

  const getPaymentMethodTitle = () => {
    const titles = {
      card: 'Credit/Debit Card',
      stripe: 'Stripe',
      paymob: 'Paymob',
      tabby: 'Tabby',
      tamara: 'Tamara',
      cod: 'Cash on Delivery',
    };
    return titles[paymentMethod] || 'Payment';
  };

  return (
    <div className="payment-confirmation-overlay" onClick={onClose}>
      <div className="payment-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="payment-confirmation-close" onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <div className="payment-confirmation-header">
          <img 
            src={getPaymentMethodIcon()} 
            alt={getPaymentMethodTitle()} 
            className="payment-confirmation-icon"
          />
          <h2>Confirm Payment</h2>
          <p className="payment-confirmation-subtitle">
            {getPaymentMethodTitle()}
          </p>
        </div>

        {/* Price Details */}
        <div className="payment-confirmation-details">
          <div className="payment-detail-row">
            <span className="payment-detail-label">Subtotal</span>
            <span className="payment-detail-value">
              AED {subtotal.toFixed(2)}
            </span>
          </div>

          <div className="payment-detail-row discount-row">
            <span className="payment-detail-label discount-label">
              Discount ({discountPercentage}% OFF)
            </span>
            <span className="payment-detail-value discount-value">
              -AED {discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="payment-detail-divider"></div>

          <div className="payment-detail-row total-row">
            <span className="payment-detail-label">Total Amount</span>
            <span className="payment-detail-value total-value">
              AED {finalAmount.toFixed(2)}
            </span>
          </div>

          {/* Savings Badge */}
          <div className="payment-savings-badge">
            <span className="savings-icon">✓</span>
            <span className="savings-text">
              Your Total Savings: <strong>AED {discountAmount.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Security Info */}
        <div className="payment-confirmation-security">
          <span className="security-icon">🔒</span>
          <span className="security-text">Safe & Secure Payment Transaction</span>
        </div>

        {/* Action Buttons */}
        <div className="payment-confirmation-actions">
          <button
            className="payment-confirmation-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="payment-confirmation-proceed"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                Proceed to Pay
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </div>

        {/* Terms Info */}
        <div className="payment-confirmation-terms">
          <p>
            By clicking "Proceed to Pay", you agree to our payment terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPopup;
