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
import Product12 from '../../../assets/images/staticproducts/minproject/1.webp'
// import Product8 from '../../../assets/images/staticproducts/'
import Product13 from '../../../assets/images/staticproducts/Boxing Machine/1.webp'
import Product14 from '../../../assets/images/staticproducts/CCTV Camera/1.webp'
import Product15 from '../../../assets/images/staticproducts/drill-machine/2.webp'
import Product16 from '../../../assets/images/staticproducts/wrinkle-remover/1.webp'


const PAGE_SIZE = 10;
const INITIAL_VISIBLE = 84;
const QUICK_LOAD_COUNT = 10; // Load 10 products quickly first
const PRODUCT_FETCH_LIMIT = 24;
const RECOMMENDED_CATEGORY_LIMIT = 8;
const CATEGORY_PAGE_LIMIT = 4;
const MAX_PRODUCTS = 580;
const ITEMS_PER_ROW = 4;


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


// Static Products with categories property
const staticProducts = [

   {
    id: "600013",
    name: "neck-face-massager ",
    price: "99.99",
    regular_price: "149.90",
    sale_price: "99.99",
    images: [{ src: Product16 }],
    slug: "neck-face-massager",
    path: "/products/neck-face-massager",
    rating: 4,
    reviews: 18,
    sold: 120,
    categories: [29688, 498, 6531], // Recommended, Electronics & Smart, Automotive & Motorcycle
  },

  {
    id: "600012",
    name: "Drill Machine",
    price: "124.00",
    regular_price: "150.00",
    sale_price: "124.00",
    images: [{ src: Product15 }],
    slug: "drill-machine",
    path: "/products/drill-machine",
    rating: 4,
    reviews: 18,
    sold: 120,
    categories: [29688, 498, 6531], // Recommended, Electronics & Smart, Automotive & Motorcycle
  },
   {
    id: "600011",
    name: "CCTV Camera",
    price: "124.00",
    regular_price: "150.00",
    sale_price: "124.00",
    images: [{ src: Product14 }],
    slug: "cctv-camera",
    path: "/products/cctv-camera",
    rating: 4,
    reviews: 18,
    sold: 120,
    categories: [29688, 498, 6531], // Recommended, Electronics & Smart, Automotive & Motorcycle
  },
  
   {
    id: "600010",
    name: "Boxing Machine",
    price: "124.00",
    regular_price: "150.00",
    sale_price: "124.00",
    images: [{ src: Product13 }],
    slug: "boxing-machine",
    path: "/products/boxing-machine",
    rating: 4,
    reviews: 18,
    sold: 120,
    categories: [29688, 498, 6531], // Recommended, Electronics & Smart, Automotive & Motorcycle
  },
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
    sold: 120,
    categories: [29688, 498, 6531], // Recommended, Electronics & Smart, Automotive & Motorcycle
  },
  {
    id: "twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    name: "Twin Size Air Mattress with Built-in Rechargeable Pump – 16 Self-Inflating Blow Up Bed for Home, Camping & Guests",
    price: "159.90.00",
    regular_price: "189.0",
    sale_price: "174.00",
    images: [{ src: Product2 }],
    slug: "twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    path: "/products/twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    rating: 5,
    reviews: 45,
    sold: 135,
    categories: [29688, 6528], // Recommended, Baby, Kids & Maternity
  },
  {
    id: "850w-electric-paint-sprayer-uae",
    name: "Electric Paint Sprayer",
    price: "99.90",
    regular_price: "250.0",
    sale_price: "99.90",
    images: [{ src: Product3 }],
    slug: "850w-electric-paint-sprayer-uae",
    path: "/products/850w-electric-paint-sprayer-uae",
    rating: 5,
    reviews: 159,
    sold: 195,
    categories: [29688, 6520], // Recommended, Home Improvement & Tools
  },
  {
    id: "5",
    name: "TrimPro™ 21V Cordless Electric Pruning Shears",
    price: "119.90",
    regular_price: "250.0",
    sale_price: "119.90",
    images: [{ src: Product4 }],
    slug: "trimpro-21v-cordless-electric-pruning-shears",
    path: "/products/trimpro-21v-cordless-electric-pruning-shears",
    rating: 5,
    reviews: 169,
    sold: 225,
    categories: [29688, 6520], // Recommended, Home Improvement & Tools
  },
  {
    id: "6",
    name: "GameBox 64 Retro Console – 20,000+ Preloaded Games with 4K HDMI & Wireless Controllers",
    price: "79.90",
    regular_price: "96.0",
    sale_price: "79.90",
    images: [{ src: Product5 }],
    slug: "gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllerse",
    path: "/products/gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllers",
    rating: 5,
    reviews: 110,
    sold: 185,
    categories: [29688, 498], // Recommended, Electronics & Smart
  },
  {
    id: "7",
    name: "Cordless Leaf Blower",
    price: "59.90",
    regular_price: "189.00",
    sale_price: "59.90",
    images: [{ src: Product7 }],
    slug: "cordless-2-in-1-leaf-blower-vacuum",
    path: "/products/cordless-2-in-1-leaf-blower-vacuum",
    rating: 5,
    reviews: 195,
    sold: 285,
    categories: [29688, 6531], // Recommended, Automotive & Motorcycle
  },
  {
    id: "8",
    name: "Turbo Cordless Leaf Blower – 21V Power for Every Task",
    price: "49.90",
    regular_price: "99.98",
    sale_price: "49.90",
    images: [{ src: Product8 }],
    slug: "turbo-cordless-leaf-blower-21v-power-for-every-task",
    path: "/products/turbo-cordless-leaf-blower-21v-power-for-every-task",
    rating: 5,
    reviews: 125,
    sold: 299,
    categories: [29688, 6531], // Recommended, Automotive & Motorcycle
  },
  {
    id: "9",
    name: "Steam Cleaner DF-A001 – Japan Technology",
    price: "89.90",
    regular_price: "129.98",
    sale_price: "89.90",
    images: [{ src: Product9 }],
    slug: "steam-cleaner-df-a001-japan-technology",
    path: "/products/steam-cleaner-df-a001-japan-technology",
    rating: 5,
    reviews: 125,
    sold: 299,
    categories: [29688, 6519], // Recommended, Home Appliances
  },
  {
    id: "10",
    name: "Electric Grape & Garlic Peeling Machine",
    price: "89.90",
    regular_price: "100.00",
    sale_price: "89.90",
    images: [{ src: Product6 }],
    slug: "electric-grape-garlic-peeling-machine",
    path: "/products/electric-grape-garlic-peeling-machine",
    rating: 5,
    reviews: 199,
    sold: 305,
    categories: [29688, 6519], // Recommended, Home Appliances
  },
  {
    id: 526258,
    name: "Mini Portable Smart Projector",
    price: 149.90,
    regular_price: 349.0,
    sale_price: 179.0,
    images: [{ src: Product12 }],
    slug: "mini-portable-smart-projector",
    path: "/products/mini-portable-smart-projector",
    rating: 5,
    reviews: 45,
    sold: 135,
    categories: [29688, 6519], // Recommended, Home Appliances
  },
];
 

const staticPositions = [2,5, 11, 15, 19, 24,28, 32, 39,22, 28];

// In-memory cache for API products by category
const apiProductCache = {};
// Track clicked products to prioritize them
const clickedProductIds = new Set();
// Track which categories are currently loading to prevent duplicate fetches
const loadingCategories = new Set();

const ProductCategory = () => {
  // Static category list (name, id)
  const staticCategories = [
    { name: 'Recommended', id: 29688 },
    { name: 'Electronics & Smart Devices', id: 498 },
    { name: 'Beauty & Personal Care', id: 6526 },
    { name: 'Baby, Kids & Maternity', id: 6528 },
    { name: 'Automotive & Motorcycle', id: 6531 },
    { name: 'Women\'s Clothing', id: 6523 },
    { name: 'Shoes & Footwear', id: 6527 },
    { name: 'Pet Supplies', id: 6533 },
    { name: 'Men\'s Clothing', id: 6522 },
    { name: 'Lingerie & Loungewear', id: 6524 },
    { name: 'Home Improvement & Tools', id: 6520 },
    { name: 'Home Appliances', id: 6519 },
  ];
  const { addToCart, cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  // Ref for cart icon for flyToCart

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
  const [showingStaticOnly, setShowingStaticOnly] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track if first batch loaded
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false); // Track background fetch
  const [productLoadAnimation, setProductLoadAnimation] = useState({}); // Track which products to animate
  // No need for apiLoaded state anymore
  // For 'Recommended', hasMoreProducts should consider both API and static products
  const getTotalProducts = () => {
    if (selectedCategoryId === "29688") {
      return allProducts.length + staticProducts.length;
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

  // Fetch products with progressive loading
  // Stage 1: Fetch 10 products quickly with minimal fields
  // Stage 2: Fetch remaining products in background
  const fetchProducts = useCallback(async (categoryId) => {
    console.log('🔍 Fetching products for category ID:', categoryId);
    
    // Prevent duplicate loading for same category
    if (loadingCategories.has(categoryId)) {
      console.log('⏳ Already loading this category, skipping...');
      return;
    }
    
    setVisibleCount(INITIAL_VISIBLE);
    setLoadingProducts(true);
    setInitialLoadComplete(false); // Reset initial load state
    
    // If cached, use cache instantly and prioritize clicked products
    if (apiProductCache[categoryId]) {
      console.log('✅ Using cached products:', apiProductCache[categoryId].length);
      const cached = apiProductCache[categoryId];
      
      // Move clicked products to top
      const clickedProducts = cached.filter(p => clickedProductIds.has(p.id));
      const unclickedProducts = cached.filter(p => !clickedProductIds.has(p.id));
      const reordered = [...clickedProducts, ...unclickedProducts];
      
      setAllProducts(reordered);
      setLoadingProducts(false);
      setShowingStaticOnly(false);
      setInitialLoadComplete(true); // Mark as complete
      return;
    }
    
    // Mark this category as loading
    loadingCategories.add(categoryId);
    
    // Show static products instantly while API loads
    setAllProducts([]);
    setShowingStaticOnly(true);
    
    try {
      // Stage 1: Quick load first 10 products with minimal fields
      const quickUrl = `${API_BASE}/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=${QUICK_LOAD_COUNT}&page=1&category=${categoryId}&_fields=id,name,price,regular_price,sale_price,images,slug`;
      console.log(`⚡ Quick loading first ${QUICK_LOAD_COUNT} products...`);
      
      const quickRes = await fetch(quickUrl);
      const quickData = await quickRes.json();
      
      if (Array.isArray(quickData) && quickData.length > 0) {
        console.log(`✅ Quick loaded ${quickData.length} products`);
        
        // Filter out products without images or with 0 price
        const validQuickData = quickData.filter(p => {
          const hasImage = p.images && p.images.length > 0 && p.images[0]?.src;
          const hasPrice = p.price && parseFloat(p.price) > 0;
          const hasSalePrice = !p.sale_price || parseFloat(p.sale_price) > 0;
          return hasImage && hasPrice && hasSalePrice;
        });
        
        setAllProducts(validQuickData);
        setLoadingProducts(false);
        setShowingStaticOnly(false);
        setInitialLoadComplete(true); // Mark initial load as complete - no more blinking
        
        // Stage 2: Load remaining products in background (only if not already loading)
        if (!isBackgroundLoading) {
          setIsBackgroundLoading(true);
          setTimeout(async () => {
            try {
              let page = 2; // Start from page 2
              let currentProducts = [...validQuickData];
              
              // Fetch pages and update UI every batch for progressive loading
              while (true) {
                const url = `${API_BASE}/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=${PRODUCT_FETCH_LIMIT}&page=${page}&category=${categoryId}&_fields=id,name,price,regular_price,sale_price,images,categories,slug`;
                console.log(`📡 Background fetching page ${page}...`);
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (!Array.isArray(data) || !data.length) {
                  console.log('⚠️ No more products found');
                  break;
                }
                
                console.log(`✅ Fetched page ${page}, products: ${data.length}`);
                
                // Filter valid products from this page
                const validPageProducts = data.filter(p => {
                  const hasImage = p.images && p.images.length > 0 && p.images[0]?.src;
                  const hasPrice = p.price && parseFloat(p.price) > 0;
                  const hasSalePrice = !p.sale_price || parseFloat(p.sale_price) > 0;
                  return hasImage && hasPrice && hasSalePrice;
                });
                
                // Append to current products
                currentProducts = [...currentProducts, ...validPageProducts];
                const limited = currentProducts.slice(0, MAX_PRODUCTS);
                
                // Update cache and state with animation
                apiProductCache[categoryId] = limited;
                setAllProducts([...limited]);
                
                // Mark new products for animation
                validPageProducts.forEach(p => {
                  setProductLoadAnimation(prev => ({ ...prev, [p.id]: true }));
                });
                
                // Remove animation after it completes
                setTimeout(() => {
                  validPageProducts.forEach(p => {
                    setProductLoadAnimation(prev => {
                      const next = { ...prev };
                      delete next[p.id];
                      return next;
                    });
                  });
                }, 500);
                
                if (data.length < PRODUCT_FETCH_LIMIT) break;
                page++;
                
                // Check if we've reached max
                if (limited.length >= MAX_PRODUCTS) break;
                
                // Small delay between batches for smooth UX
                await new Promise(resolve => setTimeout(resolve, 200));
              }
              
              // Final update after all products loaded
              const finalLimited = currentProducts.slice(0, MAX_PRODUCTS);
              apiProductCache[categoryId] = finalLimited;
              setAllProducts([...finalLimited]);
              console.log('🎯 Background loading complete:', finalLimited.length);
            } catch (bgErr) {
              console.error('❌ Background fetch error:', bgErr);
            } finally {
              // Remove from loading set when done
              loadingCategories.delete(categoryId);
              setIsBackgroundLoading(false);
            }
          }, 100);
        }
      } else {
        console.log('❌ No products found for category:', categoryId);
        apiProductCache[categoryId] = [];
        setAllProducts([]);
        setLoadingProducts(false);
        setShowingStaticOnly(false);
        loadingCategories.delete(categoryId); // Remove from loading
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setAllProducts([]);
      setLoadingProducts(false);
      setShowingStaticOnly(false);
      loadingCategories.delete(categoryId); // Remove from loading on error
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
    if (selectedCategoryId === "29688") {
      fetchProducts("29688");
    } else {
      fetchProducts(selectedCategoryId);
    }
  }, [selectedCategoryId, fetchProducts]);

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
  // Track clicked product to show it on top next time
  clickedProductIds.add(product.id);
  
  if (product.isStatic) {
    navigate(product.path || `/products/${product.slug}`);
    window.scrollTo(0, 0);
    return;
  }
  // Navigate directly to product page (no pre-fetching needed)
  navigate(`/product/${product.slug}`);
  window.scrollTo(0, 0);
};

// Merge static products for the selected category
const getMergedProducts = () => {
  // Find static products that belong to the selected category
  const staticForCategory = staticProducts.filter(p =>
    Array.isArray(p.categories) && p.categories.includes(Number(selectedCategoryId))
  ).map(p => ({ ...p, isStatic: true }));

  console.log('🔧 Selected Category ID:', selectedCategoryId);
  console.log('📊 API Products:', allProducts.length);
  console.log('🎨 Static Products for this category:', staticForCategory.length);

  // For Recommended, use staticPositions to interleave, else just append static products
  if (selectedCategoryId === "29688") {
    const merged = [...allProducts];
    staticPositions.forEach((pos, i) => {
      if (i < staticForCategory.length) {
        const insertPos = Math.min(pos, merged.length);
        merged.splice(insertPos, 0, staticForCategory[i]);
      }
    });
    console.log('✅ Merged Products (Recommended):', merged.length);
    return merged;
  } else {
    // For other categories, append static products at the end
    const merged = [...allProducts, ...staticForCategory];
    console.log('✅ Merged Products (Other):', merged.length);
    return merged;
  }
};


  
  const selectedCategory = staticCategories.find(c => String(c.id) === String(selectedCategoryId));
  const showMegaOffer = false; // No dynamic offer badge for static categories


// Remove progressive rendering - show all content immediately to prevent layout shifts
// const [showFull, setShowFull] = useState([true, ...Array(INITIAL_VISIBLE - 1).fill(false)]);
// useEffect(() => {
//   setShowFull([true, ...Array(visibleCount - 1).fill(false)]);
//   let timeouts = [];
//   for (let i = 1; i < visibleCount; ++i) {
//     timeouts.push(setTimeout(() => {
//       setShowFull(prev => {
//         const next = [...prev];
//         next[i] = true;
//         return next;
//       });
//     }, 200 + i * 30));
//   }
//   return () => timeouts.forEach(clearTimeout);
// }, [allProducts, visibleCount, selectedCategoryId]);

// --- Hover and image loaded state management moved to parent ---
const [secondImageLoaded, setSecondImageLoaded] = React.useState({});
const [hoveredCards, setHoveredCards] = React.useState({});

const handleSecondImageLoad = (id) => {
  setSecondImageLoaded(prev => ({ ...prev, [id]: true }));
};
const handleMouseEnter = (id) => {
  setHoveredCards(prev => ({ ...prev, [id]: true }));
};
const handleMouseLeave = (id) => {
  setHoveredCards(prev => ({ ...prev, [id]: false }));
};

const renderProducts = (productsToShowParam) => {
  let productsToShow = productsToShowParam;
  const countRaw = Math.min(visibleCount, productsToShow.length);
  const count = Math.min(productsToShow.length, Math.ceil(countRaw / ITEMS_PER_ROW) * ITEMS_PER_ROW);
  return productsToShow.slice(0, count).map((p, index) => {
    const hasSale = p.sale_price && p.sale_price !== p.regular_price;
    const hasSecondImage = p.images && p.images.length > 1 && typeof p.images[1]?.src === 'string' && p.images[1]?.src.trim() !== '';
    const hovered = hoveredCards[p.id] || false;
    // Static product card
    if (p.isStatic) {
      // Always allow hover, and switch to 2nd image when available
      const handleEnter = () => handleMouseEnter(p.id);
      const handleLeave = () => handleMouseLeave(p.id);
      // On hover, if second image is loaded, show it; otherwise keep showing first image
      let imageToShow = p.images[0]?.src || PlaceholderImage;
      if (hovered && hasSecondImage && p.images[1]?.src && secondImageLoaded[p.id]) {
        imageToShow = p.images[1].src;
      }
      return (
        <div
          key={p.id}
          className="pcus-prd-card static-product-card"
          onClick={() => handleProductClick(p)}
          style={{ 
            cursor: "pointer", 
            position: "relative",
            animation: productLoadAnimation[p.id] ? 'fadeInUp 0.5s ease-out' : 'none',
            opacity: productLoadAnimation[p.id] ? 0 : 1,
            animationFillMode: 'forwards'
          }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#ff6207", color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", zIndex: 2 }}>Fast Moving</div>
          <div className="pcus-image-wrapper" style={{ position: "relative", pointerEvents: "none" }}>
            <img
              src={imageToShow}
              alt={decodeHTML(p.name)}
              className="pcus-prd-image1 primary-img"
              onLoad={() => {
                if (hasSecondImage && !secondImageLoaded[p.id]) {
                  // Preload second image
                  const img = new window.Image();
                  img.src = p.images[1].src;
                  img.onload = () => handleSecondImageLoad(p.id);
                }
              }}
              style={{ transition: 'opacity 0.3s ease-in-out', display: 'block', width: '100%' }}
            />
          </div>
          <div className="pcus-prd-info12">
            <h2 className="pcus-prd-title1">{decodeHTML(p.name)}</h2>
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
          </div>
        </div>
      );
    }
  // API product card (show price, sale, Buy Now, etc.)
  // Always allow hover, and switch to 2nd image when available
  const handleEnter = () => handleMouseEnter(p.id);
  const handleLeave = () => handleMouseLeave(p.id);
  // On hover, if second image is loaded, show it; otherwise keep showing first image
  let imageToShow = p.images?.[0]?.src || PlaceholderImage;
  if (hovered && hasSecondImage && p.images[1]?.src && secondImageLoaded[p.id]) {
    imageToShow = p.images[1].src;
  }
  return (
      <div
        key={p.id}
        className="pcus-prd-card"
        onClick={() => handleProductClick(p)}
        style={{ 
          cursor: "pointer", 
          position: "relative",
          animation: productLoadAnimation[p.id] ? 'fadeInUp 0.5s ease-out' : 'none',
          opacity: productLoadAnimation[p.id] ? 0 : 1,
          animationFillMode: 'forwards'
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
  <div className="pcus-image-wrapper1" style={{ pointerEvents: "none" }}>
          <img
            src={imageToShow}
            alt={decodeHTML(p.name || p.slug)}
            className="pcus-prd-image1 primary-img"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="auto"
            onLoad={() => {
              if (hasSecondImage && !secondImageLoaded[p.id]) {
                // Preload second image
                const img = new window.Image();
                img.src = p.images[1].src;
                img.onload = () => handleSecondImageLoad(p.id);
              }
            }}
            style={{ transition: 'opacity 0.3s ease-in-out', display: 'block', width: '100%' }}
          />
        </div>
        <div className="pcus-prd-info12">
          <h2 className="pcus-prd-title1">{decodeHTML(p.name || p.slug)}</h2>
          <div className="pcus-prd-dummy-reviews" style={{ display: "flex", alignItems: "center", margin: "0px 5px" }}>
            {/* API products may not have rating/reviews/sold, so show 0 or blank if missing */}
            <div style={{ color: "#FFD700", marginRight: "8px" }}>{"★".repeat(Number(p.rating) || 0)}{"☆".repeat(5 - (Number(p.rating) || 0))}</div>
            <div style={{ fontSize: "12px", color: "#666", marginRight: "8px" }}>({p.reviews || 0})</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{p.sold || ''}{p.sold ? ' sold' : ''}</div>
          </div>
          <div style={{ height: "1px", width: "100%", backgroundColor: "lightgrey", margin: "0px 0 2px 0", borderRadius: "1px" }} />
          <div className="prc-row-abc123" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <div className="prc-left-abc123" style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
              <img src={IconAED} alt="AED" style={{ width: "auto", height: "12px", marginRight: "0px", verticalAlign: "middle" }} />
              <Price value={p.sale_price || p.price} className="prc-sale-abc123" />
              <Price value={p.regular_price} className="prc-regular-abc123" />
              {p.sale_price && p.regular_price && p.sale_price < p.regular_price && (
                <span className="prc-off-abc123">{Math.round(((p.regular_price - p.sale_price) / p.regular_price) * 100)}% Off</span>
              )}
            </div>
            <button
              className="prc-cart-btn-abc123"
              style={{
                background: '#fff',
                border: '2px solid #eee',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              title="Add to Cart"
              onClick={(e) => {
                    e.stopPropagation();
                    flyToCart(e, p.images?.[0]?.src);
                    if (addToCart) addToCart(p);
                  }}
                >
                  <img src={cartItems.some(item => item.id === p.id) ? AddedToCartIcon : AddCarticon} alt="Add to Cart" style={{ width: '20px', height: '20px' }} />
                  {cartItems.some(item => item.id === p.id) && (
                    <span
                      className="cart-count-badge"
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#ff6207',
                        color: '#fff',
                        borderRadius: '50%',
                        fontSize: '11px',
                        fontWeight: 700,
                        minWidth: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                      }}
                    >
                      {cartItems.find(item => item.id === p.id)?.quantity || 1}
                    </span>
                  )}
                </button>
              </div>
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
        {/* <div style={{ display: "flex", justifyContent: "center" }}>
          <img src='https://db.store1920.com/wp-content/uploads/2025/11/Mini-Sub-Banner-2.webp' className="schoolimage" style={{ maxWidth: "400px", width: "100%", height: "auto" }} alt="Category banner" />
        </div> */}

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
          // Show static products instantly while API loads (only if initial load not complete)
          let productsToShow = [];
          if (showingStaticOnly && !initialLoadComplete) {
            // Only static products for this category, then skeletons for API loading
            const staticForCategory = staticProducts.filter(p =>
              Array.isArray(p.categories) && p.categories.includes(Number(selectedCategoryId))
            ).map(p => ({ ...p, isStatic: true }));
            if (staticForCategory.length === 0) {
              // Show skeletons while loading
              const skeletons = Array(10).fill(0).map((_, idx) => <SkeletonCard key={"skel-"+idx} />);
              return <div className="pcus-prd-grid001">{skeletons}</div>;
            }
            // Show static products with few skeletons
            const skeletons = Array(4).fill(0).map((_, idx) => <SkeletonCard key={"skel-"+idx} />);
            return (
              <div className="pcus-prd-grid001">
                {renderProducts(staticForCategory)}
                {skeletons}
              </div>
            );
          }
          // After initial load complete, show products without blinking
          productsToShow = getMergedProducts();
          if (productsToShow.length === 0 && initialLoadComplete) {
            return (
              <div className="pcus-no-products" style={{ minHeight: "300px", textAlign: "center", paddingTop: "40px", fontSize: "18px", color: "#666" }}>
                No products found.
              </div>
            );
          }
          return <div className="pcus-prd-grid001">{renderProducts(productsToShow)}</div>;
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
  <MiniCart ref={cartIconRef} />
    </div>
  );
};

export default ProductCategory;
