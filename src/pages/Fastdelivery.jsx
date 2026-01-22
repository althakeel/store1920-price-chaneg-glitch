import React from 'react';
import { useNavigate } from 'react-router-dom';
import Product1 from '../assets/images/staticproducts/pressurewasher/1.webp';
import Product2 from '../assets/images/staticproducts/airbed/1.webp';
import Product3 from '../assets/images/staticproducts/paintspray/14.webp';
import Product4 from '../assets/images/staticproducts/pruningmachine/10.webp';
import Product5 from '../assets/images/staticproducts/gamekit/1.webp';
import Product7 from '../assets/images/staticproducts/Air Blower/1.webp';
import Product8 from '../assets/images/staticproducts/AIR BLOWER MINI/9.webp'
import Product9 from '../assets/images/staticproducts/Steamer/1.webp'
import Product10 from '../assets/images/staticproducts/Peeler/1.webp'
import Product11 from '../assets/images/staticproducts/minproject/4.webp'
import Product12 from '../assets/images/staticproducts/Boxing Machine/1.webp'
import Product13 from '../assets/images/staticproducts/CCTV Camera/1.webp'
import Product14 from '../assets/images/staticproducts/drill-machine/2.webp'
import Product15 from '../assets/images/staticproducts/wrinkle-remover/10.webp'
import Product16 from '../assets/images/staticproducts/massager/3.webp'
import product17 from '../assets/images/staticproducts/wirelesscharger/GNPTRIOWCGY-2998.webp'

const staticProducts = [
   

     {
    id: "neck-face-massager",
    name: "Neck Face Massager",
    price: "100",
    regular_price: "120.  ",
    sale_price: "99.99",
    images: [{ src: Product15 }],
    path: "/products/neck-face-massager",
    rating: 5,
    reviews: 48,
    sold: 102
  },
  
    {
    id: "drill-kit-with-2-battery–ultimate-cordless-power-tool-set",
    name: "Drill Kit with 2 Battery – Ultimate Cordless Power Tool Set",
    price: "109.90",
    regular_price: "150.  ",
    sale_price: "109.90",
    images: [{ src: Product14 }],
    
    path: "/products/drill-kit-with-2-battery–ultimate-cordless-power-tool-set",
    rating: 5,
    reviews: 48,
    sold: 119
  },

  //  {
  //   id: "cctv-camera",
  //   name: "CCTV",
  //   price: "99.90",
  //   regular_price: "120.  ",
  //   sale_price: "99.90",
  //   images: [{ src: Product13 }],
  //   path: "/products/cctv-camera",
  //   rating: 5,
  //   reviews: 48,
  //   sold: 139
  // },
  {
    id: "Boxing machine",
    name: "Music Boxing Machine – Smart Boxing Trainer",
    price: "124.00",
    regular_price: "150.  ",
    sale_price: "124.00",
    images: [{ src: Product12 }],
    path: "/products/boxing-machine",
    rating: 5,
    reviews: 48,
    sold: 152
  },
  {
    id: "Mini Portable Smart Projector",
    name: "Mini Portable Smart Projector",
    price: "149.90",
    regular_price: "329.00",
    sale_price: "149.90",
    images: [{ src: Product11 }],
    path: "/products/mini-portable-smart-projector",
    rating: 5,
    reviews: 48,
    sold: 139
  },
  {
    id: "68V Cordless Portable Car Wash Pressure Washer Gun with Dual",
    name: "68V Cordless Portable Car Wash Pressure Washer Gun with Dual",
    price: "69.9",
    regular_price: "89.00",
    sale_price: "69.90",
    images: [{ src: Product1 }],
    path: "/products/68v-cordless-portable-car-wash-pressure-washer-gun-with-dual",
    rating: 4,
    reviews: 18,
    sold: 120
  },
  {
    id: "twin-size-air-mattress-with-built-in-rechargeable-pump",
    name: "Twin Size Air Mattress with Built-in Rechargeable Pump – Self-Inflating Blow Up Bed",
    price: "159.90",
    regular_price: "189.0",
    sale_price: "159.90",
    images: [{ src: Product2 }],
    path: "/products/twin-size-air-mattress-with-built-in-rechargeable-pump-16-self-inflating-blow-up-bed-for-home-camping-guests",
    rating: 5,
    reviews: 45,
    sold: 135,
  },
  {
    id: "850w-electric-paint-sprayer-uae",
    name: "Electric Paint Sprayer",
    price: "99.90",
    regular_price: "250.0",
    sale_price: "99.90",
    images: [{ src: Product3 }],
    path: "/products/850w-electric-paint-sprayer-uae",
    rating: 5,
    reviews: 159,
    sold: 195,
  },
  {
    id: "5",
    name: "TrimPro™ 21V Cordless Electric Pruning Shears",
    price: "119.90",
    regular_price: "250.0",
    sale_price: "119.90",
    images: [{ src: Product4 }],
    path: "/products/trimpro-21v-cordless-electric-pruning-shears",
    rating: 5,
    reviews: 169,
    sold: 225,
  },
  {
    id: "6",
    name: "GameBox 64 Retro Console – 20,000+ Games, 4K HDMI, Wireless Controllers",
    price: "79.90",
    regular_price: "96.0",
    sale_price: "79.90",
    images: [{ src: Product5 }],
    path: "/products/gamebox-64-retro-console-20000-preloaded-games-4k-hdmi-wireless-controllers",
    rating: 5,
    reviews: 110,
    sold: 185,
  },
  {
    id: "7",
    name: "Cordless Leaf Blower",
    price: "59.90",
    regular_price: "189.00",
    sale_price: "59.90",
    images: [{ src: Product7 }],
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
    images: [{ src: Product8 }],
    path: "/products/turbo-cordless-leaf-blower-21v-power-for-every-task",
    rating: 5,
    reviews: 169,
    sold: 225,
  },
      {
    id: "9",
    name: "Steam Cleaner DF-A001 – Japan Technology",
    price: "89.90",
    regular_price: "129.70",
    sale_price: "89.90",
    images: [{ src: Product9 }],
    path: "/products/steam-cleaner-df-a001-japan-technology",
    rating: 5,
    reviews: 139,
    sold: 295,
  },
  {
    id: "10",
    name: "Electric Grape & Garlic Peeling Machine",
    price: "89.90",
    regular_price: "100",
    sale_price: "89.90",
    images: [{ src: Product10 }],
    path: "/products/electric-grape-garlic-peeling-machine",
    rating: 5,
    reviews: 199,
    sold: 305,
  },
   {
    id: "11",
    name: "Heated Shiatsu Massager – Human-Like Neck & Back Relief Anywhere",
    price: "139.00",
    regular_price: "199.00",
    sale_price: "139.00",
    images: [{ src: Product16 }],
    path: "/products/heated-shiatsu-massager-human-like-neck-back-relief-anywhere",
    rating: 5,
    reviews: 182,
    sold: 285,
  },
   {
    id: "12",
    name: "Green Lion Power Trio – 3-in-1 Magnetic Wireless Charger",
    price: "149.00",
    regular_price: "199.00",
    sale_price: "149.00",
    images: [{ src: product17 }],
    path: "/products//green-lion-power-trio-3-in-1-magnetic-wireless-charger",
    rating: 5,
    reviews: 165,
    sold: 195,
  },
];

const Fastdelivery = () => {
  const navigate = useNavigate();
  
  const truncateName = (name) => {
    const isMobile = window.innerWidth <= 768;
    const limit = isMobile ? 28 : 50;
    return name.length > limit ? name.substring(0, limit) + "..." : name;
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ background: '#fff', padding: '10px 0 40px' }}>

      {/* TITLE */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 25px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: isMobile ? '20px' : '26px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '5px',
        }}>
          Fast Delivery Products
        </h2>
        <p style={{
          color: '#666',
          fontSize: isMobile ? '13px' : '15px',
          margin: 0,
        }}>
          Get your top-selling items delivered in no time!
        </p>
      </div>

      {/* PRODUCT GRID */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: isMobile ? '12px' : '20px',
        padding: '0 12px',
      }}>
        {staticProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(product.path)}
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0,0,0,0.10)',
              cursor: 'pointer',
              transition: 'transform 0.25s ease',
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = 'translateY(0)')}
          >

            {/* FAST MOVING BADGE */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#ff6b00',
              color: '#fff',
              padding: '3px 6px',
              borderRadius: '6px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              zIndex: 3
            }}>
              Fast Moving
            </div>

            {/* IMAGE */}
            <img
              src={product.images[0].src}
              alt={product.name}
              style={{
                width: '100%',
                height: isMobile ? '160px' : '220px',
                objectFit: 'cover',
                borderBottom: '1px solid #f0f0f0',
              }}
            />

            {/* CONTENT */}
            <div style={{ padding: isMobile ? '10px' : '14px', paddingBottom: isMobile ? '60px' : '70px' }}>
              <h3 style={{
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                color: '#333',
                minHeight: isMobile ? '38px' : '44px',
                marginBottom: '8px',
                overflow: 'hidden',
                lineHeight: '1.4em',
              }}>
                {truncateName(product.name)}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#ff6b00', fontSize: isMobile ? '12px' : '14px' }}>
                  AED {product.sale_price}
                </span>
                <span style={{
                  textDecoration: 'line-through',
                  color: '#999',
                  fontSize: isMobile ? '10px' : '12px'
                }}>
                  AED {product.regular_price}
                </span>
              </div>

              <div style={{
                fontSize: isMobile ? '10px' : '12px',
                color: '#666',
                marginTop: '5px'
              }}>
                ⭐ {product.rating} ({product.reviews}) • Sold {product.sold}
              </div>
            </div>

            {/* BOTTOM OVERLAY */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                background: '#ffcc00',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: isMobile ? '9px' : '11px',
                fontWeight: 'bold',
                color: '#000'
              }}>
                Fast Delivery
              </div>

              <div
                onClick={(e) => { e.stopPropagation(); navigate(product.path); }}
                style={{
                  background: '#ff6b00',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.3s ease',
                }}
              >
                Buy Now
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Fastdelivery;