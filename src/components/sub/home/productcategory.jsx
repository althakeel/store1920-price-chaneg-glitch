// src/components/ProductCategory.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../assets/styles/ProductCategory.css";
import { useCart } from "../../../contexts/CartContext";
import MiniCart from "../../MiniCart";
import AddCarticon from "../../../assets/images/addtocart.png";
import AddedToCartIcon from "../../../assets/images/added-cart.png";
import IconAED from "../../../assets/images/Dirham 2.png";
import TitleImage from "../../../assets/images/seasontitle/Halloween mini banner.webp";
import PlaceholderImage from "../../../assets/images/common/Placeholder.png";
import { throttle } from "lodash";
import { API_BASE, CONSUMER_KEY, CONSUMER_SECRET } from "../../../api/woocommerce";
import ProductCardReviews from "../../temp/productcardreviews";
import Product1 from '../../../assets/images/staticproducts//pressurewasher/1.webp';
import Product2 from '../../../assets/images/staticproducts/airbed/1.webp'
import Product3 from '../../../assets/images/staticproducts/paintspray/14.webp'
import Product4 from '../../../assets/images/staticproducts/pruningmachine/10.webp'
import Product5 from '../../../assets/images/staticproducts//gamekit/1.webp'
import Product7 from '../../../assets/images/staticproducts/Air Blower/1.webp'
import Product8 from '../../../assets/images/staticproducts//AIR BLOWER MINI/1.webp'
import Product9 from '../../../assets/images/staticproducts/Steamer/1.webp'
import Product6 from '../../../assets/images/staticproducts/Peeler/1.webp'
// import Product8 from '../../../assets/images/staticproducts/'


const PAGE_SIZE = 10;
const INITIAL_VISIBLE = 20;
const PRODUCT_FETCH_LIMIT = 8;
const RECOMMENDED_CATEGORY_LIMIT = 8;
const CATEGORY_PAGE_LIMIT = 4;
const MAX_PRODUCTS = 180;


// Utility to decode HTML entities
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Skeleton Loader
const SkeletonCard = () => (
  <div className="pcus-prd-card pcus-skeleton">
    <div className="pcus-prd-image-skel" />
    <div className="pcus-prd-info-skel">
      <div className="pcus-prd-title-skel" />
      <div className="pcus-prd-price-cart-skel" />
    </div>
  </div>
);

// Price Component
const Price = ({ value, className }) => {
  if (!value) return null;
  const price = parseFloat(value || 0).toFixed(2);
  const [int, dec] = price.split(".");
  return (
    <span className={className}>
      <span style={{ fontSize: "18px", fontWeight: "bold" }}>{int}</span>
      <span style={{ fontSize: "12px" }}>.{dec}</span>
    </span>
  );
};



// Shuffle Array
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Static Products
const staticProducts = [
  {
    id: "68V Cordless Portable Car Wash Pressure Washer Gun with Dual",
    name: "68V Cordless Portable Car Wash Pressure Washer Gun with Dual",
    price: "69.90",
    regular_price: "149.90",
    sale_price: "69.90",
    images: [{ src: Product1 }],
    slug: "68v-cordless-portable-car-wash-pressure-washer-gun-with-dual",
    path: "/products/68v-cordless-portable-car-wash-pressure-washer-gun-with-dual",
    rating: 4,
    reviews: 18,
    sold: 120
  },
    {
    id: "twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    name: "Twin Size Air Mattress with Built-in Rechargeable Pump – 16 Self-Inflating Blow Up Bed for Home, Camping & Guests",
    price: "139.00",
    regular_price: "189.0",
    sale_price: "139.00",
    images: [{ src:Product2 }],
    slug: "twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    path: "/products/twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    rating: 5,
    reviews: 45,
    sold: 135,
  },
   {
    id: "850w-electric-paint-sprayer-uae",
    name: "Electric Paint Sprayer",
    price: "89.99",
    regular_price: "250.0",
    sale_price: "89.99",
    images: [{ src:Product3 }],
    slug: "850w-electric-paint-sprayer-uae",
    path: "/products/850w-electric-paint-sprayer-uae",
    rating: 5,
    reviews: 159,
    sold: 195,
  },
     {
    id: "5",
    name: "TrimPro™ 21V Cordless Electric Pruning Shears",
    price: "109.9",
    regular_price: "250.0",
    sale_price: "109.9",
    images: [{ src:Product4 }],
    slug: "trimpro-21v-cordless-electric-pruning-shears",
    path: "/products/trimpro-21v-cordless-electric-pruning-shears",
    rating: 5,
    reviews: 169,
    sold: 225,
  },
     {
    id: "6",
    name: "GameBox 64 Retro Console – 20,000+ Preloaded Games with 4K HDMI & Wireless Controllers",
    price: "96.00",
    regular_price: "96.0",
    sale_price: "69.99",
    images: [{ src:Product5 }],
    slug: "gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllerse",
    path: "/products/gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllers",
    rating: 5,
    reviews: 110,
    sold: 185,
  },
       {
    id: "7",
    name: "Cordless 2-in-1 Leaf Blower & Vacuum",
    price: "55.90",
    regular_price: "189.00",
    sale_price: "55.90",
    images: [{ src:Product7 }],
    slug: "cordless-2-in-1-leaf-blower-vacuum",
    path: "/products/cordless-2-in-1-leaf-blower-vacuum",
    rating: 5,
    reviews: 195,
    sold: 285,
  },

      {
    id: "8",
 name: "Turbo Cordless Leaf Blower – 21V Power for Every Task",
    price: "49.90",
    regular_price: "99.98",
    sale_price: "49.90",
    images: [{ src:Product8 }],
    slug: "turbo-cordless-leaf-blower-21v-power-for-every-task",
    path: "/products/turbo-cordless-leaf-blower-21v-power-for-every-task",
    rating: 5,
    reviews: 125,
    sold: 299,
  },
     {
    id: "9",
    name: "Steam Cleaner DF-A001 – Japan Technology",
    price: "89.90",
    regular_price: "129.98",
    sale_price: "89.90",
    images: [{ src:Product9 }],
    slug: "steam-cleaner-df-a001-japan-technology",
    path: "/products/steam-cleaner-df-a001-japan-technology",
    rating: 5,
    reviews: 125,
    sold: 299,   
  },
  {
    id: "10",
    name: "Electric Grape & Garlic Peeling Machine",
    price: "89.00",
    regular_price: "100.00",
    sale_price: "89.0",
    images: [{ src:Product6 }],
    slug: "electric-grape-garlic-peeling-machine",
    path: "/products/electric-grape-garlic-peeling-machine",
    rating: 5,
    reviews: 199,
    sold: 305,
  },
];
 

const staticPositions = [2,5, 11, 15, 19, 24,28, 32, 39,22,];

const ProductCategory = () => {
  // Static category list (name, id)
  const staticCategories = [
    { name: 'Recommended', id: 29688 },
    { name: 'Electronics & Smart', id: 498 },
    { name: 'Beauty & Personal Care', id: 6526 },
    { name: 'Baby, Kids & Maternity', id: 6528 },
    { name: 'Automotive & Motorcycle', id: 6531 },
    { name: 'Women’s Clothing', id: 6523 },
    { name: 'Shoes & Footwear', id: 6527 },
    { name: 'Pet Supplies', id: 6533 },
    { name: 'Men’s Clothing', id: 6522 },
    { name: 'Lingerie & Loungewear', id: 6524 },
    { name: 'Home Improvement & Tools', id: 6520 },
    { name: 'Home Appliances', id: 6519 },
    { name: 'Electronics & Smart Devices', id: 498 },
  ];
  const { addToCart, cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  // Static category list will be used below

  const [selectedCategoryId, setSelectedCategoryId] = useState("29688");
  const DAILY_USE_ID = "daily-use";
  const [badgeText, setBadgeText] = useState("MEGA OFFER");
  const [animate, setAnimate] = useState(true);

  const categoriesRef = useRef(null);
  const cartIconRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [allProducts, setAllProducts] = useState([]); // fetched products
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false); // for recommended: has user loaded API products?
  // For 'Recommended', hasMoreProducts should consider both API and static products
  const getTotalProducts = () => {
    if (selectedCategoryId === "29688") {
      if (apiLoaded) {
        return allProducts.length + staticProducts.length;
      } else {
        return staticProducts.length;
      }
    }
    return allProducts.length;
  };
  const hasMoreProducts = visibleCount < getTotalProducts();


  const [categoryProducts, setCategoryProducts] = useState([]); // products for selected category
const [categoryPage, setCategoryPage] = useState(1);
const [categoryHasMore, setCategoryHasMore] = useState(true);

  // No need to fetch categories from API

  // Badge animation
  useEffect(() => {
    const texts = ["MEGA OFFER", "HURRY UP"];
    let idx = 0;
    const interval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        idx = (idx + 1) % texts.length;
        setBadgeText(texts[idx]);
        setAnimate(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products
  // Fetch only id and images for initial grid
  const fetchProducts = useCallback(async (categoryId) => {
    setVisibleCount(INITIAL_VISIBLE);
    setAllProducts([]);
    setLoadingProducts(true);
    try {
      let fetchedProducts = [];
      let page = 1;
      while (page <= CATEGORY_PAGE_LIMIT && fetchedProducts.length < MAX_PRODUCTS) {
        const res = await fetch(
          `${API_BASE}/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=${PRODUCT_FETCH_LIMIT}&page=${page}&category=${categoryId}&_fields=id,images,categories,slug`
        );
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) break;
        if (String(categoryId) === "29688") {
          fetchedProducts.push(...data.filter(p => Array.isArray(p.categories) && p.categories.some(cat => String(cat.id) === "29688")));
        } else {
          fetchedProducts.push(...data);
        }
        page++;
      }
      fetchedProducts = fetchedProducts.slice(0, MAX_PRODUCTS);
      if (fetchedProducts.length > 0) {
        setAllProducts(shuffleArray(fetchedProducts));
      } else {
        setAllProducts([]);
      }
    } catch (err) {
      console.error(err);
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
    if (selectedCategoryId !== "29688") {
      fetchProducts(selectedCategoryId);
      setApiLoaded(true);
    } else {
      setAllProducts([]);
      setApiLoaded(false);
    }
  }, [selectedCategoryId, fetchProducts]);

  // Handler to load API products for Recommended
  const handleLoadApiProducts = async () => {
    setLoadingProducts(true);
    await fetchProducts("29688");
    setApiLoaded(true);
    setLoadingProducts(false);
  };

  // Arrow visibility for categories scroll
  const updateArrowVisibility = useCallback(() => {
    const el = categoriesRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollWidth - el.scrollLeft > el.clientWidth + 10);
  }, []);

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) return;
    const throttled = throttle(updateArrowVisibility, 100);
    el.addEventListener("scroll", throttled);
    updateArrowVisibility();
    return () => el.removeEventListener("scroll", throttled);
  }, [updateArrowVisibility]);

  // Load more products
  const loadMoreProducts = () => {
    setVisibleCount(prev => Math.min(prev + INITIAL_VISIBLE, getTotalProducts()));
  };

  // Fly to cart animation
  const flyToCart = (e, imgSrc) => {
    if (!cartIconRef.current || !imgSrc) return;
    const cartRect = cartIconRef.current.getBoundingClientRect();
    const startRect = e.currentTarget.getBoundingClientRect();

    const clone = document.createElement("img");
    clone.src = imgSrc;
    clone.style.position = "fixed";
    clone.style.zIndex = 9999;
    clone.style.width = "60px";
    clone.style.height = "60px";
    clone.style.top = `${startRect.top}px`;
    clone.style.left = `${startRect.left}px`;
    clone.style.transition = "all 0.7s ease-in-out";
    clone.style.borderRadius = "50%";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.opacity = "0";
      clone.style.transform = "scale(0.2)";
    });

    setTimeout(() => clone.remove(), 800);
  };

// Fetch full product details on click for API products
const [loadingProductId, setLoadingProductId] = useState(null);
const [productDetails, setProductDetails] = useState({});
const handleProductClick = async (product) => {
  if (product.isStatic) {
    navigate(product.path || `/products/${product.slug}`);
    window.scrollTo(0, 0);
    return;
  }
  // If already have details, go to product page
  if (productDetails[product.id]) {
    navigate(`/product/${product.slug}`);
    window.scrollTo(0, 0);
    return;
  }
  setLoadingProductId(product.id);
  try {
    const res = await fetch(`${API_BASE}/products/${product.id}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
    const data = await res.json();
    setProductDetails(prev => ({ ...prev, [product.id]: data }));
    navigate(`/product/${product.slug}`);
    window.scrollTo(0, 0);
  } catch (err) {
    alert('Failed to load product details.');
  } finally {
    setLoadingProductId(null);
  }
};

const getMergedProducts = () => {
  const merged = [...allProducts];
  staticPositions.forEach((pos, i) => {
    if (i < staticProducts.length) {
      const insertPos = Math.min(pos, merged.length); // safe position
      merged.splice(insertPos, 0, { ...staticProducts[i], isStatic: true });
    }
  });
  return merged;
};


  
  const selectedCategory = staticCategories.find(c => String(c.id) === String(selectedCategoryId));
  const showMegaOffer = false; // No dynamic offer badge for static categories


// Progressive product card rendering: show only first product fully, then rest after a short delay
const [showFull, setShowFull] = useState([true, ...Array(INITIAL_VISIBLE - 1).fill(false)]);
useEffect(() => {
  setShowFull([true, ...Array(visibleCount - 1).fill(false)]);
  let timeouts = [];
  for (let i = 1; i < visibleCount; ++i) {
    timeouts.push(setTimeout(() => {
      setShowFull(prev => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    }, 200 + i * 30));
  }
  return () => timeouts.forEach(clearTimeout);
}, [allProducts, visibleCount, selectedCategoryId]);

const renderProducts = (productsToShowParam) => {
  // Accept productsToShow as a parameter for instant rendering
  let productsToShow = productsToShowParam;
  // Ensure visibleCount does not exceed productsToShow length
  const count = Math.min(visibleCount, productsToShow.length);
  return productsToShow.slice(0, count).map((p, index) => {
    const hasSale = p.sale_price && p.sale_price !== p.regular_price;
    // Static product card
    if (p.isStatic) {
      return (
        <div key={p.id} className="pcus-prd-card static-product-card" onClick={() => handleProductClick(p)} style={{ cursor: "pointer", position: "relative" }}>
          <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#ff6207", color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", zIndex: 2 }}>Fast Moving</div>
          <div className="pcus-image-wrapper" style={{ position: "relative" }}>
            <img src={p.images[0].src} alt={decodeHTML(p.name)} className="pcus-prd-image1 primary-img" />
          </div>
          <div className="pcus-prd-info12">
            <h2 className="pcus-prd-title1">{decodeHTML(p.name)}</h2>
            {showFull[index] && (
              <>
                <div className="pcus-prd-dummy-reviews" style={{ display: "flex", alignItems: "center", margin: "0px 5px" }}>
                  <div style={{ color: "#FFD700", marginRight: "8px" }}>{"★".repeat(p.rating)}{"☆".repeat(5 - p.rating)}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginRight: "8px" }}>({p.reviews})</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{p.sold} sold</div>
                </div>
                <div style={{ height: "1px", width: "100%", backgroundColor: "lightgrey", margin: "0px 0 2px 0", borderRadius: "1px" }} />
                <div className="prc-row-abc123">
                  <div className="prc-left-abc123">
                    <img src={IconAED} alt="AED" style={{ width: "auto", height: "12px", marginRight: "0px", verticalAlign: "middle" }} />
                    <Price value={p.sale_price} className="prc-sale-abc123" />
                    <Price value={p.regular_price} className="prc-regular-abc123" />
                    {p.sale_price < p.regular_price && <span className="prc-off-abc123">{Math.round(((p.regular_price - p.sale_price) / p.regular_price) * 100)}% Off</span>}
                  </div>
                </div>
                <div className="prc-row-badge-btn">
                  <div className="prc-badge-abc123">Fast Moving Product</div>
                  <button className="prc-btn-abc123">Buy Now</button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    // Regular product card (no new badges)
    return (
      <div key={p.id} className="pcus-prd-card" onClick={() => handleProductClick(p)} style={{ cursor: "pointer", position: "relative" }}>
        <div className="pcus-image-wrapper1">
          <img src={p.images?.[0]?.src || PlaceholderImage} alt={decodeHTML(p.name || p.slug)} className="pcus-prd-image1 primary-img" loading={index === 0 ? "eager" : "lazy"} decoding="auto" />
        </div>
        <div className="pcus-prd-info12">
          <h2 className="pcus-prd-title1">{decodeHTML(p.name || p.slug)}</h2>
          {loadingProductId === p.id ? (
            <div style={{ color: '#ff6207', fontSize: '13px', margin: '8px 0' }}>Loading details...</div>
          ) : null}
        </div>
      </div>
    );
  });
};
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // No need to fetch categories on mount

  return (
    <div className="pcus-wrapper3" style={{ display: "flex" }}>
      <div className="pcus-categories-products1" style={{ width: "100%", transition: "width 0.3s ease" }}>
        {/* Banner */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src='https://db.store1920.com/wp-content/uploads/2025/11/Mini-Sub-Banner-2.webp' className="schoolimage" style={{ maxWidth: "400px", width: "100%", height: "auto" }} alt="Category banner" />
        </div>

        {/* Categories */}
        <div className="pcus-categories-wrapper1 pcus-categories-wrapper3">
          {canScrollLeft && <button className="pcus-arrow-btn" onClick={() => categoriesRef.current.scrollBy({ left: -200, behavior: "smooth" })}>‹</button>}
          <div className="pcus-categories-scroll" ref={categoriesRef}>
            {staticCategories.map((cat) => (
              <button key={cat.id} className={`pcus-category-btn ${selectedCategoryId === String(cat.id) ? "active" : ""}`} onClick={() => setSelectedCategoryId(String(cat.id))} title={cat.name}>
                {cat.name}
              </button>
            ))}
          </div>
          {canScrollRight && <button className="pcus-arrow-btn" onClick={() => categoriesRef.current.scrollBy({ left: 200, behavior: "smooth" })}>›</button>}
        </div>

        {/* Products */}
        {(() => {
          // For 'Recommended', show only static products instantly, load API products on demand
          let productsToShow = [];
          if (selectedCategoryId === "29688") {
            if (!apiLoaded) {
              // Show only static products instantly
              productsToShow = staticProducts.map((p) => ({ ...p, isStatic: true }));
            } else if (loadingProducts) {
              // Show skeletons while loading API products
              return (
                <div className="pcus-prd-grid001">
                  {Array(10).fill(0).map((_, idx) => <SkeletonCard key={idx} />)}
                </div>
              );
            } else {
              // Show merged API + static products
              productsToShow = getMergedProducts();
            }
          } else {
            if (loadingProducts) {
              // Show skeletons for non-Recommended categories
              return (
                <div className="pcus-prd-grid001">
                  {Array(10).fill(0).map((_, idx) => <SkeletonCard key={idx} />)}
                </div>
              );
            }
            productsToShow = allProducts;
          }
          if (productsToShow.length === 0) {
            return (
              <div className="pcus-no-products" style={{ minHeight: "300px", textAlign: "center", paddingTop: "40px", fontSize: "18px", color: "#666" }}>
                No products found.
              </div>
            );
          }
          return <>
            <div className="pcus-prd-grid001">{renderProducts(productsToShow)}</div>
            {/* Show More button for Recommended */}
            {selectedCategoryId === "29688" && !apiLoaded && (
              <div style={{ textAlign: "center", margin: "24px 0" }}>
                <button
                  className="pcus-load-more-btn"
                  onClick={handleLoadApiProducts}
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    backgroundColor: "#ff6207ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer"
                  }}
                >
                  Show More Products
                </button>
              </div>
            )}
          </>;
        })()}

        {/* Load More */}
        <div className="pcus-load-more-wrapper" style={{ textAlign: "center", margin: "24px 0" }}>
          {hasMoreProducts ? (
            <button
              className="pcus-load-more-btn"
              onClick={loadMoreProducts}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                backgroundColor: "#ff6207ff",
                color: "#fff",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer"
              }}
            >
              Load More
            </button>
          ) : (
            <span style={{ color: "#666", fontSize: "14px" }}></span>
          )}
        </div>
      </div>
      <MiniCart />
    </div>
  );
};

export default ProductCategory;
