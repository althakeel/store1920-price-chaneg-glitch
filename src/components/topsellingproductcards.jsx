import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/New.css';
import { useCart } from '../contexts/CartContext';
import MiniCart from '../components/MiniCart';
import AddCarticon from '../assets/images/addtocart.png';
import AddedToCartIcon from '../assets/images/added-cart.png';
import Adsicon from '../assets/images/summer-saving-coloured.png';
import IconAED from '../assets/images/Dirham 2.png';
import ProductCardReviews from '../components/temp/productcardreviews';

import { getProductsByCategory, getFirstVariation, getCurrencySymbol } from '../api/woocommerce';
// Set this to your actual 'topselling' category ID from WooCommerce
const TOPSELLING_CATEGORY_ID = 29686;

const PRODUCTS_PER_PAGE = 24;
const TITLE_LIMIT = 35;

// ===================== Utility functions =====================
const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};
const truncate = (str) => (str?.length <= TITLE_LIMIT ? str : `${str.slice(0, TITLE_LIMIT)}…`);

// ===================== Skeleton Loader =====================
const SkeletonCard = () => (
  <div className="pcus-prd-card pcus-skeleton">
    <div className="pcus-prd-image-skel" />
    <div className="pcus-prd-info-skel">
      <div className="pcus-prd-title-skel" />
      <div className="pcus-prd-review-skel" />
      <div className="pcus-prd-price-cart-skel" />
    </div>
  </div>
);

// ===================== Main Component =====================
const New = () => {
  // For deferred review loading (LCP optimization)
  const [showReviews, setShowReviews] = useState([]);
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const cartIconRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [variationPrices, setVariationPrices] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('AED');
  const [productsPage, setProductsPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [bestSellerIds, setBestSellerIds] = useState([]);




  

  // ===================== Fetch currency =====================
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const symbol = await getCurrencySymbol();
        setCurrencySymbol(symbol || 'AED');
      } catch (error) {
        console.error('Failed to fetch currency symbol:', error);
        setCurrencySymbol('AED');
      }
    };
    fetchCurrency();
  }, []);


  // ===================== Fetch products from 'topselling' category only =====================
  const fetchProducts = useCallback(async (page = 1) => {
    setLoadingProducts(true);
    try {
      const data = await getProductsByCategory(TOPSELLING_CATEGORY_ID, page, PRODUCTS_PER_PAGE);
      const validData = Array.isArray(data) ? data : [];
      setProducts(prev => page === 1 ? validData : [...prev, ...validData]);
      setHasMoreProducts(validData.length >= PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setHasMoreProducts(false);
    } finally {
      setLoadingProducts(false);
    }
  }, []);



  useEffect(() => {
    fetchProducts(1);
    setProductsPage(1);
  }, [fetchProducts]);

  // Defer reviews for all but the first product for LCP
  useEffect(() => {
    // Calculate visible products
    const filtered = products.filter(p => {
      const hasImage = Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.src;
      const isVariable = p.type === 'variable';
      const variationPriceInfo = variationPrices[p.id] || {};
      const price = isVariable ? variationPriceInfo.price : p.price || p.regular_price || 0;
      return hasImage && parseFloat(price) > 0;
    });
    const visible = filtered.slice(0, productsPage * PRODUCTS_PER_PAGE);

    // Set up review delays
    let timeouts = [];
    setShowReviews(visible.map((_, i) => i === 0));
    for (let i = 1; i < visible.length; ++i) {
      timeouts.push(setTimeout(() => {
        setShowReviews(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 600 + i * 40));
    }
    return () => timeouts.forEach(clearTimeout);
  }, [products, variationPrices, productsPage]);

  // Optimized Load More: show skeletons instantly, fetch in background
  const loadMoreProducts = () => {
    if (!hasMoreProducts || loadingProducts) return;
    const nextPage = productsPage + 1;
    setProductsPage(nextPage);
    // Show skeletons instantly for next page
    setLoadingProducts(true);
    // Fetch next page in background and append as soon as ready
    getProductsByCategory(TOPSELLING_CATEGORY_ID, nextPage, PRODUCTS_PER_PAGE)
      .then((data) => {
        const validData = Array.isArray(data) ? data : [];
        setProducts(prev => [...prev, ...validData]);
        setHasMoreProducts(validData.length >= PRODUCTS_PER_PAGE);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setHasMoreProducts(false);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  };

  // ===================== Handle product click =====================
  const onProductClick = useCallback((slug, id) => {
    let recent = JSON.parse(localStorage.getItem('recentProducts')) || [];
    recent = recent.filter((rid) => rid !== id);
    recent.unshift(id);
    localStorage.setItem('recentProducts', JSON.stringify(recent.slice(0, 5)));
    window.open(`/product/${slug}`, '_blank', 'noopener,noreferrer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===================== Fetch first variation prices =====================
  useEffect(() => {
    if (!products || products.length === 0) return;
    products.forEach((p) => {
      if (p.type === 'variable' && !variationPrices[p.id]) fetchFirstVariationPrice(p.id);
    });
  }, [products]);

  const fetchFirstVariationPrice = async (productId) => {
    try {
      const variation = await getFirstVariation(productId);
      if (variation) {
        setVariationPrices((prev) => ({
          ...prev,
          [productId]: {
            price: variation.price,
            regular_price: variation.regular_price,
            sale_price: variation.sale_price,
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch variation for product ${productId}:`, error);
    }
  };

  // ===================== Fly to cart animation =====================
  const flyToCart = (e, imgSrc) => {
    if (!cartIconRef.current || !imgSrc) return;

    const cartRect = cartIconRef.current.getBoundingClientRect();
    const startRect = e.currentTarget.getBoundingClientRect();

    const clone = document.createElement('img');
    clone.src = imgSrc;
    Object.assign(clone.style, {
      position: 'fixed',
      zIndex: 9999,
      width: '60px',
      height: '60px',
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      transition: 'all 0.7s ease-in-out',
      borderRadius: '50%',
      pointerEvents: 'none',
    });
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.opacity = '0';
      clone.style.transform = 'scale(0.2)';
    });

    setTimeout(() => clone.remove(), 800);
  };
  
// ===================== Shuffle utility =====================
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ===================== Shuffle products every hour =====================
// ===================== Shuffle first page every hour =====================
useEffect(() => {
  const interval = setInterval(() => {
    setProducts(prev => {
      if (!prev || prev.length === 0) return prev;

      const firstPage = prev.slice(0, PRODUCTS_PER_PAGE); // only first page
      const rest = prev.slice(PRODUCTS_PER_PAGE);         // rest of products
      return [...shuffleArray(firstPage), ...rest];
    });
  }, 60 * 60 * 1000); // 1 hour

  return () => clearInterval(interval);
}, []);


  // ===================== Render =====================
  return (
    <div className="pcus-wrapper12" style={{ display: 'flex' }}>
      <div className="pcus-categories-products1" style={{ width: '100%', transition: 'width 0.3s ease' }}>
        {/* Title Section */}
        <div className="pcus-title-section">
          <h2 className="pcus-main-title">
            <img src={Adsicon} style={{ maxWidth: '18px' }} alt="Ads icon" /> TOP SELLING ITEMS{' '}
            <img src={Adsicon} style={{ maxWidth: '18px' }} alt="Ads icon" />
          </h2>
          <p className="pcus-sub-title">OUR BESTSELLERS</p>
        </div>


        {/* Product Grid */}
        {loadingProducts && (!products || products.length === 0) ? (
          <div className="pcus-prd-grid12">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (!products || products.length === 0) ? (
          <div className="pcus-no-products" style={{ minHeight: '300px', textAlign: 'center', paddingTop: '40px', fontSize: '18px', color: '#666' }}>
            No products found.
          </div>
        ) : (
          <div className="pcus-prd-grid12">
            {/* Show first 24 products instantly, then skeletons for rest while loading */}
            {(() => {
              const filtered = products.filter(p => {
                // Exclude products with no images or price 0/0.00
                const hasImage = Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.src;
                const isVariable = p.type === 'variable';
                const variationPriceInfo = variationPrices[p.id] || {};
                const price = isVariable ? variationPriceInfo.price : p.price || p.regular_price || 0;
                return hasImage && parseFloat(price) > 0;
              });
              const visible = filtered.slice(0, productsPage * PRODUCTS_PER_PAGE);
              return <>
                {visible.map((p, idx) => {
                  const isVariable = p.type === 'variable';
                  const variationPriceInfo = variationPrices[p.id] || {};
                  const displayRegularPrice = isVariable ? variationPriceInfo.regular_price : p.regular_price || p.price;
                  const displaySalePrice = isVariable ? variationPriceInfo.sale_price : p.sale_price || null;
                  const displayPrice = isVariable ? variationPriceInfo.price : p.price || p.regular_price || 0;
                  const onSale = displaySalePrice && displaySalePrice !== displayRegularPrice;
                  // Static badge for all products
                  const staticBadge = <div className="static-top-badge" style={{position:'absolute',top:8,right:8,background:'#1976d2',color:'#fff',fontWeight:700,fontSize:'13px',borderRadius:'5px',padding:'2px 10px',zIndex:3,boxShadow:'0 1px 4px rgba(25,118,210,0.10)',letterSpacing:'0.5px',textTransform:'uppercase'}}>Top Seller</div>;
                  // Show orange savings/countdown badge for products with a sale price lower than regular price
                  const showSavingsBadge = displaySalePrice && displaySalePrice < displayRegularPrice;
                  const savings = showSavingsBadge ? (parseFloat(displayRegularPrice) - parseFloat(displaySalePrice)).toFixed(2) : null;
                  const countdownDemo = '11:54:08';
                  return (
                    <div
                      key={p.id}
                      className="pcus-prd-card"
                      onClick={(e) => { e.stopPropagation(); onProductClick(p.slug, p.id); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onProductClick(p.slug)}
                      style={{ position: 'relative', minHeight: '340px', boxShadow: '0 2px 12px rgba(56,142,60,0.04)' }}
                    >
                      {staticBadge}
                      <div className="pcus-image-wrapper1">
                        <img src={p.images?.[0]?.src || ''} alt={decodeHTML(p.name)} className="pcus-prd-image1 primary-img" loading={idx < 24 ? 'eager' : 'lazy'} decoding="auto" />
                        {p.images?.[1] && <img src={p.images[1].src} alt={`${decodeHTML(p.name)} - second`} className="pcus-prd-image1 secondary-img" loading="lazy" decoding="async" />}
                        {p.stock_status === 'outofstock' && <div className="pcus-stock-overlay10 out-of-stock">Out of Stock</div>}
                        {typeof p.stock_quantity === 'number' && p.stock_quantity < 50 && <div className="pcus-stock-overlay10 low-stock">Only {p.stock_quantity} left in stock</div>}
                      </div>
                      <div className="pcus-prd-info1">
                        <h3 className="pcus-prd-title1">{truncate(decodeHTML(p.name))}</h3>
                        {showReviews[idx] ? <ProductCardReviews productId={p.id} /> : <div style={{height:24}} />}
                        <div style={{ height: "1px", width: "100%", backgroundColor: "lightgrey", margin: "0px 0 2px 0", borderRadius: "1px" }} />
                        <div className="pcus-prd-price-cart1" style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, color: '#ff6600', fontSize: '18px', letterSpacing: '0.2px' }}>
                              AED{onSale ? parseFloat(displaySalePrice || 0).toFixed(2) : parseFloat(displayPrice || 0).toFixed(2)}
                            </span>
                            {p.sold_count || p.soldCount || p.total_sales ? (
                              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#888', fontWeight: 500 }}>
                                <span style={{ color: '#ff6600', fontSize: '16px', marginRight: 2 }}>🔥</span>
                                {(p.sold_count || p.soldCount || p.total_sales) >= 1000
                                  ? `${Math.round((p.sold_count || p.soldCount || p.total_sales) / 100) / 10}K+ sold`
                                  : `${p.sold_count || p.soldCount || p.total_sales} sold`}
                              </span>
                            ) : null}
                          </div>
                          {onSale && (
                            <div style={{ fontSize: '13px', color: '#888', textDecoration: 'line-through', marginBottom: 2 }}>
                              AED{parseFloat(displayRegularPrice || 0).toFixed(2)}
                            </div>
                          )}
                          <button
                            className={`pcus-prd-add-cart-btn10 ${cartItems.some(item => item.id === p.id) ? 'added-to-cart' : ''}`}
                            onClick={(e) => { e.stopPropagation(); flyToCart(e, p.images?.[0]?.src); addToCart(p, true); }}
                            aria-label={`Add ${decodeHTML(p.name)} to cart`}
                          >
                            <img src={cartItems.some(item => item.id === p.id) ? AddedToCartIcon : AddCarticon} alt="Add to cart" className="pcus-prd-add-cart-icon-img" />
                          </button>
                        </div>
                        {showSavingsBadge && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            margin: '10px auto 0 auto',
                            width: '98%',
                            background: '#ff8800',
                            borderRadius: '5px',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '15px',
                            padding: '4px 10px 4px 10px',
                            letterSpacing: '0.2px',
                            boxShadow: '0 1px 4px rgba(255,136,0,0.10)',
                            border: '1px solid #ff9800',
                            minHeight: '32px',
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                              <span style={{ fontSize: '18px', marginRight: 6, lineHeight: 1 }}>↓</span>
                              Saved AED{savings}
                            </span>
                            <span style={{
                              background: '#fff',
                              color: '#ff8800',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '14px',
                              padding: '2px 10px',
                              marginLeft: 10,
                              minWidth: 70,
                              textAlign: 'center',
                              letterSpacing: '0.5px',
                            }}>{countdownDemo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Show fewer skeletons for faster perceived load */}
                {loadingProducts && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i+visible.length}`} />)}
              </>;
            })()}
          </div>
        )}

        {/* Load More */}
        {hasMoreProducts && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button className="pcus-load-more-btn" onClick={loadMoreProducts} disabled={loadingProducts}>
              {loadingProducts ? 'Loading…' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      <MiniCart ref={cartIconRef} />
    </div>
  );
};

export default memo(New);
