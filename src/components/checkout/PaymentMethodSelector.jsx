import React, { useState } from 'react';
import '../../assets/styles/checkout/paymentmethodselector.css';
import VisaIcon from '../../assets/images/Footer icons/17.webp';
import MasterIcon from '../../assets/images/Footer icons/16.webp';
import AmexIcon from '../../assets/images/Footer icons/11.webp';
import TabbyIcon from '../../assets/images/Footer icons/3.webp';
import TamaraIcon from '../../assets/images/Footer icons/6.webp';

const PaymentMethodSelector = ({
  isOpen,
  onClose,
  onSelectMethod,
  subtotal = 0,
  orderId = null,
  isLoading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  if (!isOpen) return null;

  const discountPercent = 5;
  const discountAmount = subtotal * (discountPercent / 100);
  const discountedAmount = subtotal - discountAmount;

  const handleSelectPaymentMethod = (method) => {
    setSelectedMethod(method);
    // Just select, don't process yet - wait for Continue button
  };

  return (
    <div className="payment-selector-overlay" onClick={onClose}>
      <div className="payment-selector-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="payment-selector-close" onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <div className="payment-selector-header">
          <h2>Select Payment Method</h2>
          <p className="payment-selector-subtitle">
            Choose how you'd like to pay
          </p>
        </div>

        {/* Total Amount */}
        <div className="payment-selector-total">
          <span>Order Total:</span>
          <span className="total-amount">AED {subtotal.toFixed(2)}</span>
        </div>

        {/* Discount Breakdown */}
        <div className="payment-selector-discount">
          <div className="discount-row">
            <span className="discount-label">Subtotal (COD Price)</span>
            <span className="discount-value">AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="discount-row discount-highlight">
            <span className="discount-label">Prepaid Discount (5% OFF)</span>
            <span className="discount-value">-AED {discountAmount.toFixed(2)}</span>
          </div>
          <div className="discount-row total-payable">
            <span className="discount-label"><strong>Pay Now (5% OFF)</strong></span>
            <span className="discount-value"><strong>AED {discountedAmount.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-grid">
          {/* Card Payment */}
          <div 
            className={`payment-method-card ${selectedMethod === 'card' ? 'selected' : ''}`}
            onClick={() => handleSelectPaymentMethod('card')}
          >
            <div className="method-icon-container">
              <img src={VisaIcon} alt="Visa" className="payment-method-icon" />
              <img src={MasterIcon} alt="Mastercard" className="payment-method-icon" />
              <img src={AmexIcon} alt="Amex" className="payment-method-icon" />
            </div>
            <h3>Pay by Card</h3>
            <p className="method-description">Visa, Mastercard, American Express</p>
            <div className="method-checkbox">
              <input 
                type="radio" 
                name="payment-method" 
                value="card"
                checked={selectedMethod === 'card'}
                readOnly
              />
            </div>
          </div>

          {/* Tabby */}
          <div 
            className={`payment-method-card ${selectedMethod === 'tabby' ? 'selected' : ''}`}
            onClick={() => handleSelectPaymentMethod('tabby')}
          >
            <div className="method-icon-container">
              <img src={TabbyIcon} alt="Tabby" className="payment-method-icon-large" />
            </div>
            <h3>Tabby</h3>
            <p className="method-description">Pay in 4 interest-free installments</p>
            <div className="method-checkbox">
              <input 
                type="radio" 
                name="payment-method" 
                value="tabby"
                checked={selectedMethod === 'tabby'}
                readOnly
              />
            </div>
          </div>

          {/* Tamara */}
          <div 
            className={`payment-method-card ${selectedMethod === 'tamara' ? 'selected' : ''}`}
            onClick={() => handleSelectPaymentMethod('tamara')}
          >
            <div className="method-icon-container">
              <img src={TamaraIcon} alt="Tamara" className="payment-method-icon-large" />
            </div>
            <h3>Tamara</h3>
            <p className="method-description">Pay in installments with Tamara</p>
            <div className="method-checkbox">
              <input 
                type="radio" 
                name="payment-method" 
                value="tamara"
                checked={selectedMethod === 'tamara'}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="payment-selector-actions">
          <button
            className="payment-selector-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            className="payment-selector-proceed"
            onClick={() => {
              if (selectedMethod) {
                onSelectMethod(selectedMethod, discountedAmount, orderId);
              }
            }}
            disabled={!selectedMethod || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </div>

        {/* Security Info */}
        <div className="payment-selector-security">
          <span className="security-icon">🔒</span>
          <p>Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
