import React from "react";
import "../assets/styles/Footer.css";
import { FaInstagram, FaFacebookF } from "react-icons/fa6";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

// Footer icons
import Image1 from '../assets/images/Footer icons/1.webp';
import Image2 from '../assets/images/Footer icons/4.webp';
import Image3 from '../assets/images/Footer icons/7.webp';
import Image4 from '../assets/images/Footer icons/8.webp';
import Image5 from '../assets/images/Footer icons/9.webp';
import Image6 from '../assets/images/Footer icons/10.webp';
import Image7 from '../assets/images/Footer icons/21.webp';
import Image8 from '../assets/images/Footer icons/2.webp';
import Image9 from '../assets/images/Footer icons/3.webp';
import Image10 from '../assets/images/Footer icons/6.webp';
import Image11 from '../assets/images/Footer icons/11.webp';
import Image12 from '../assets/images/Footer icons/12.webp';
import Image13 from '../assets/images/Footer icons/13.webp';
import Image14 from '../assets/images/Footer icons/16.webp';
import Image15 from '../assets/images/Footer icons/17.webp';
import Image16 from '../assets/images/Footer icons/18.webp';
import Image17 from '../assets/images/Footer icons/19.webp';
import Image18 from '../assets/images/Footer icons/20.webp';

const categoryData = [
  {
    id: 1,
    title: "Company info",
    items: [
      { id: 1101, name: "About Store1920",  path: "/about	" },
        { id: 1102, name: "Contact us",  path: "/contact" },
        // { id: 1104, name: "Baby Shoes & Kids' Shoes",  path: "/category/6632	" },
        // { id: 1105, name: "Nursery & Baby Furniture",  path: "/category/" },
        // { id: 1106, name: "Baby Care & Hygiene",  path: "/category/6634" },
        // { id: 1107, name: "Activity Gear & Baby Carriers", path: "/category/6635" },
        // { id: 1108, name: "Kids' Accessories", path: "/category/6636" },
        ],
  },
  {
    id: 2,
    title: "Customer service",
    items: [
        { id: 501, name: "Return and refund policy", path: "/return-policy" },
        { id: 502, name: "Shipping info",  path: "/shippinginfo" },
        // { id: 504, name: "Sweaters & Hoodies",  path: "/category/6577" },
        // { id: 505, name: "Blazers & Suits",  path: "/category/6578" },
        // { id: 506, name: "Shorts",path: "/category/6579" },
        // { id: 507, name: "Winter Wear & Down Jackets", image: MensWinterWear, path: "/mens-clothing/winter" },
        // { id: 508, name: "Clothing Sets", path: "/category/6629" },
        // { id: 509, name: "New Arrivals",  path: "/category/6582" }
    ],
  },
  {
    id: 3,
    title: "Help",
    items: [
        // { id: 601, name: "Support center & FAQ",  path: "/category/6584", metaTitle: "Women's Clothing Online – Dresses, Tops & Outerwear | Store1920", metaDescription: "Discover stylish women’s fashion at Store1920. Shop dresses, blouses, skirts, and outerwear with trendy new arrivals." },
        { id: 602, name: "Safety center",  path: "/safetycenter" },
        { id: 603, name: "Store1920 purchase protection",  path: "/purchaseprotection" },
 { id: 604, name: "Track Order", path: "/track-order	" },
        // { id: 605, name: "Curve & Plus Size Clothing", path: "/category/6588" },
        // { id: 606, name: "Swimwear",  path: "/category/6589" },
        // { id: 607, name: "Wedding Dresses",  path: "/category/6590" },
        // { id: 608, name: "Special Occasion Dresses",  path: "/category/6591" },
   
      ],
  },
  // {
  //   id: 4,
  //   title: "Accessories",
  //   items: [

  //       { id: 803, name: "Sunglasses & Eyewear", path: "/category/6602" },
  //       { id: 804, name: "Scarves & Gloves", path: "/category/6603" },
  //       { id: 805, name: "Hats & Headwear",  path: "/category/6604" },
  //       { id: 806, name: "Jewelry & Watches",  path: "/category/6605" },
  //       { id: 807, name: "Necklaces",  path: "/category/6606" },
  //       { id: 808, name: "Earrings", path: "/category/6607" },
  //       { id: 809, name: "Bracelets & Bangles", path: "/category/6608" },
  //       { id: 810, name: "Men's Watches",  path: "/category/6609" },
  //       ],
  // },
];

const Footer = () => {
  const { isCartOpen } = useCart();

  return (
    <footer
      className="main-footer"
      style={{
        width: window.innerWidth >= 768 && isCartOpen ? "calc(100% - 250px)" : "100%",
        transition: "width 0.3s ease",
      }}
    >
      <div className="footer-container">
        <div className="footer-top" style={{ display: 'flex', width: '100%', gap: '0', justifyContent: 'space-between' }}>
          {categoryData.map((category) => (
            <div className="footer-section" key={category.id} style={{ flex: 1 }}>
              <h4>{category.title}</h4>
              <ul>
                {category.items.map((item) => (
                  <li key={item.id}>
                    <Link to={item.path}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-section" style={{ flex: 1 }}>
            <h4>Connect with Store1920</h4>
            <div className="social-icons">
              <a href="https://www.instagram.com/store1920.ae" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://www.facebook.com/thestore1920" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="security">
            <h5>Security Certifications</h5>
            <div className="certs">
              {[Image1, Image2, Image3, Image4, Image5, Image6, Image7].map((img, index) => (
                <img key={index} src={img} alt={`Cert ${index + 1}`} />
              ))}
            </div>
          </div>

          <div className="payments">
            <h5>We Accept</h5>
            <div className="methods">
              {[Image8, Image9, Image10, Image11, Image12, Image13, Image14, Image15, Image16, Image17, Image18].map((img, index) => (
                <img key={index} src={img} alt={`Payment ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>

        <div
          className="footer-bottom"
          style={{
            width: window.innerWidth >= 768 && isCartOpen ? "calc(100% - 250px)" : "100%",
            transition: "width 0.3s ease",
            paddingBottom: "10px",
          }}
        >
<p>

  &copy; {new Date().getFullYear()} Al Thakeel General Trading LLC. All rights reserved.


</p>
          <ul className="legal-links">
             <li><Link to="/terms-0f-use">Terms of Use</Link></li>
            <li><Link to="/return-policy">Return Policy</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/cookies-settings">Cookie Settings</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
