import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/ButtonSection.css';
import { useCart } from '../../contexts/CartContext';

export default function ButtonSection({ product, selectedVariation, quantity, isClearance }) {
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const variation = selectedVariation || product;

  const handleAddToCart = () => {
    const itemId = variation.id;
    const itemPrice = variation.price || product.price;

    const itemToAdd = {
      id: itemId,
      name: product.name,
      quantity: quantity,
      price: itemPrice,
      image: variation.image?.src || product.images?.[0]?.src || '',
      variation: selectedVariation?.attributes || [],
    };

    addToCart(itemToAdd);
    setAddedToCart(true);
    setIsCartOpen(true);

    if (isClearance) {
      navigate('/checkout');
    }
  };

  const handleGoToCart = () => navigate('/cart');
  const handleGoToCheckout = () => navigate('/checkout');

  useEffect(() => {
    setAddedToCart(false);
  }, [quantity, variation?.id]);

  // -------------------------------
  // ⭐ TABBY WIDGET LOADER
  // -------------------------------
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.tabby.ai/tabby-promo.js';
    script.onload = () => {
      if (window.TabbyPromo) {
        new window.TabbyPromo({
          selector: '#TabbyPromo',
          currency: 'AED',
          price: String(variation?.price || product?.price || "0.00"),
          lang: 'en',
          source: 'product',
          shouldInheritBg: false,
          publicKey: 'your_pk',
          merchantCode: 'your_merchant_code'
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // cleanup: remove widget html when variation changes
      const target = document.querySelector('#TabbyPromo');
      if (target) target.innerHTML = '';
    };
  }, [variation]);

  return (
    <>
      {isClearance ? (
        <div className="button-section">
          <button className="buy-now-btn" onClick={handleAddToCart}>
            Buy Now
          </button>
        </div>
      ) : (
        <div className="button-section">
          {!addedToCart ? (
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          ) : (
            <>
              <button className="go-to-cart-btn" onClick={handleGoToCart}>
                Go to Cart
              </button>
              <button className="go-to-checkout-btn" onClick={handleGoToCheckout}>
                Go to Checkout
              </button>
            </>
          )}
        </div>
      )}

      {/* ⭐⭐⭐ TABBY PROMO WIDGET BELOW BUTTONS ⭐⭐⭐ */}
      <div id="TabbyPromo" style={{ marginTop: '15px',marginBottom:"10px" }}></div>
    </>
  );
}
