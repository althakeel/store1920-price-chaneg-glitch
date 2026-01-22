import React from 'react';
import '../../assets/styles/checkoutleft/codconfirmation.css';
import CashIcon from '../../assets/images/Footer icons/13.webp';

const CODConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  subtotal = 0,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const storeCredit = 20;
  const deliveryDaysRange = '1-2';

  return (
    <div className="cod-confirmation-overlay" onClick={onClose}>
      <div className="cod-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="cod-confirmation-close" onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <div className="cod-confirmation-header">
          <img 
            src={CashIcon} 
            alt="Cash on Delivery" 
            className="cod-confirmation-icon"
          />
          <h2>Place Order with Cash on Delivery</h2>
        </div>

        {/* Delivery Guarantee Section */}
        <div className="cod-guarantee-section">
          <div className="guarantee-header">
            <span className="guarantee-icon">✓</span>
            <h3>Delivery Guarantee</h3>
          </div>
          
          <div className="guarantee-item">
            <span className="guarantee-check">✓</span>
            <div className="guarantee-content">
              <p className="guarantee-title">AED {storeCredit}.00 Store Credit</p>
              <p className="guarantee-desc">
                if your delivery is delayed by more than {deliveryDaysRange} days
              </p>
            </div>
          </div>

          <div className="guarantee-item">
            <span className="guarantee-check">✓</span>
            <div className="guarantee-content">
              <p className="guarantee-title">Fast Delivery</p>
              <p className="guarantee-desc">
                Get your order within {deliveryDaysRange} working days (8am - 11pm)
              </p>
            </div>
          </div>

          <div className="guarantee-item">
            <span className="guarantee-check">✓</span>
            <div className="guarantee-content">
              <p className="guarantee-title">Easy Payment</p>
              <p className="guarantee-desc">
                Pay the exact cash amount directly to our delivery agent
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cod-order-summary">
          <div className="summary-row">
            <span className="summary-label">Order Total:</span>
            <span className="summary-value">AED {subtotal.toFixed(2)}</span>
          </div>
          <p className="summary-note">
            📝 You will receive an order confirmation SMS and email
          </p>
        </div>

        {/* How it Works */}
        <div className="cod-how-works">
          <h3>How it Works</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <p className="step-title">Place Your Order</p>
                <p className="step-desc">Use Cash on Delivery option</p>
              </div>
            </div>

            <div className="step-divider">→</div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <p className="step-title">Prepare Cash</p>
                <p className="step-desc">Ready exact amount for delivery</p>
              </div>
            </div>

            <div className="step-divider">→</div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <p className="step-title">Receive & Pay</p>
                <p className="step-desc">Pay delivery agent on arrival</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cod-confirmation-actions">
          <button
            className="cod-confirmation-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="cod-confirmation-proceed"
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
                Place Order
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </div>

        {/* Terms */}
        <div className="cod-confirmation-terms">
          <p>
            By clicking "Place Order", you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default CODConfirmationPopup;
