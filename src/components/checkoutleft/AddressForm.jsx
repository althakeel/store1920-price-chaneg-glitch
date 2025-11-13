import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CustomMap from '../../components/checkoutleft/CustomMap';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../utils/firebase';

const LOCAL_STORAGE_KEY = 'checkoutAddressData';

const UAE_EMIRATES = [
  { code: 'AUH', name: 'Abu Dhabi' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'SHJ', name: 'Sharjah' },
  { code: 'AJM', name: 'Ajman' },
  { code: 'UAQ', name: 'Umm Al Quwain' },
  { code: 'RAK', name: 'Ras Al Khaimah' },
  { code: 'FUJ', name: 'Fujairah' },
];

const UAE_CITIES = {
  ABU: ['Abu Dhabi', 'Al Ain', 'Madinat Zayed', 'Sweihan', 'Liwa Oasis', 'Ruways', 'Ghayathi', 'Jebel Dhanna', 'Al Yahar', 'Al Khazna', 'Al Mahdar', 'Al Falah', 'Al Shuwaib', 'Al Rafaah', 'Al Salamah', 'Al Hayer', 'Al Khari', 'Al Ghashban', 'Al Ghabah', 'Al Fara\'', 'Al Fulayyah', 'Al Awdah', 'Al Ghabam', 'Al Hamraniyah', 'Al Hamriyah', 'Al Haybah', 'Al Hayl', 'Al Hayr', 'Al Hayrah', 'Al Hulaylah', 'Al Jaddah', 'Al Khashfah', 'Al Mahamm', 'Al Masafirah', 'Al Mataf', 'Al Mu\'amurah', 'Al Naslah', 'Al Qir', 'Al Quwayz', 'Al Usayli', 'Khalifa City', 'Shakhbout City', 'Corniche', 'Mussafah', 'Reem Island', 'Yas Island', 'Saadiyat Island'],
  DXB: ['Dubai', 'Deira', 'Bur Dubai', 'Jebel Ali', 'Al Barsha', 'Al Quoz', 'Al Safa', 'Dubai Marina', 'Jumeirah', 'Satwa', 'Al Karama', 'Al Nahda', 'Al Qusais', 'Al Rashidiya', 'Al Jaddaf', 'Al Khawaneej', 'Al Warqa', 'Al Muhaisnah', 'Al Mizhar', 'Al Garhoud', 'Al Satwa', 'Business Bay', 'Mirdif', 'Jumeirah Beach Residences', 'International City', 'Discovery Gardens', 'Dubai Silicon Oasis', 'Dubai Investment Park', 'Dubai Festival City', 'Downtown Dubai', 'Palm Jumeirah', 'Jumeirah Lakes Towers (JLT)', 'DIFC', 'Emirates Towers', 'Trade Centre 2', 'Sheikh Zayed Road', 'Al Sufouh', 'Dubai Sports City', 'Dubai Hills Estate', 'Al Barsha South', 'Dubai Industrial City'],
  SHJ: ['Sharjah', 'Al Dhaid', 'Khor Fakkan', 'Kalba', 'Mleiha', 'Al Hamriyah', 'Al Madam', 'Al Bataeh', 'Al Khan', 'Al Layyah', 'Al Yarmook', 'Industrial Area', 'Sharjah City Center', 'University City', 'Al Nahda'],
  AJM: ['Ajman', 'Masfout', 'Manama', 'Al Jurf', 'Al Rashidiya', 'Al Nuaimia', 'Al Rawda', 'Al Rumailah', 'Al Mowaihat', 'Al Tallah', 'Al Sheikh Maktoum', 'Al Hamidiyah'],
  UAQ: ['Umm Al Quwain', 'Falaj Al Mualla', 'Al Sinniyah', 'Al Rumailah', 'Al Kharran', 'Al Jurf', 'Al Rahbah', 'Al Raas', 'Al Tallah', 'Al Bu Falah', 'Al Qawasim'],
  RAK: ['Ras Al Khaimah', 'Dibba Al-Hisn', 'Khatt', 'Al Jazirah Al Hamra', 'Al Rams', 'Dhayah', 'Ghalilah', 'Al Nakheel', 'Al Hamra Village', 'Al Nakheel Industrial', 'Al Qusaidat', 'Al Maarid', 'Al Hudaibah'],
  FSH: ['Fujairah', 'Dibba Al-Fujairah', 'Khor Fakkan', 'Masafi', 'Bidiyah', 'Dibba Al-Hisn', 'Al Aqah', 'Al Bithnah', 'Al Faseel', 'Al Hala', 'Al Madhah', 'Al Sharqiyah', 'Al Sakamkam', 'Al Twar', 'Al Jurf']
};

const AddressForm = ({ formData, onChange, onSubmit, onClose, saving, error, cartItems }) => {
  const [formErrors, setFormErrors] = useState({});
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapSelected, setMapSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);


  // --- City/Area Google Places Autocomplete ---
  const [cityInput, setCityInput] = useState(formData.shipping.city || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);

  // Fetch Google Places predictions for city/area
  const fetchCitySuggestions = (input) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    setCityLoading(true);
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input, types: ['(regions)'], componentRestrictions: { country: 'ae' } }, (predictions) => {
      setCitySuggestions(predictions ? predictions.map(p => p.description) : []);
      setCityLoading(false);
    });
  };

  useEffect(() => {
    if (cityInput && cityInput.length > 1) {
      fetchCitySuggestions(cityInput);
    } else {
      setCitySuggestions([]);
    }
  }, [cityInput]);

  useEffect(() => {
    setCityInput(formData.shipping.city || '');
  }, [formData.shipping.city]);

  // --------------------------
  // Load saved address
  // --------------------------
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.shipping) {
          Object.keys(data.shipping).forEach((key) =>
            onChange({ target: { name: key, value: data.shipping[key] } }, 'shipping')
          );
        }
        if (data.saveAsDefault !== undefined) {
          onChange({ target: { name: 'saveAsDefault', value: data.saveAsDefault } });
        }
      } catch (err) {
        console.warn('Failed to parse saved checkout address:', err);
      }
    }
  }, []);

  // --------------------------
  // Validation Logic
  // --------------------------
  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
      case 'last_name':
      case 'street':
      case 'city':
      case 'state':
        if (!value || value.trim() === '') return 'This field is required';
        break;
      case 'delivery_type':
        if (!value || value.trim() === '') return 'Please select delivery type';
        break;
      case 'phone_number':
        if (!value || value.trim() === '') return 'Phone number is required';
        // Accept exactly 7 digits for the phone number field
        if (!/^[0-9]{7}$/.test(value)) return 'Invalid phone number';
        break;
      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleFieldChange = (e) => {
    onChange(e, 'shipping');
    const errorMsg = validateField(e.target.name, e.target.value);
    setFormErrors((prev) => ({ ...prev, [e.target.name]: errorMsg }));
  };

  // --------------------------
  // PHONE FIX: reliable update
  // --------------------------
  const handlePhoneChange = (phone) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    onChange({ target: { name: 'phone_number', value: normalizedPhone } }, 'shipping');
    const errorMsg = validateField('phone_number', normalizedPhone);
    setFormErrors((prev) => ({ ...prev, phone_number: errorMsg }));
  };

  // --------------------------
  // Handle Map Selection
  // --------------------------
  const handlePlaceSelected = ({ street, city, state, lat, lng }) => {
    const stateObj = UAE_EMIRATES.find((s) => s.name.toLowerCase() === state?.toLowerCase());
    const stateCode = stateObj ? stateObj.code : '';
    onChange({ target: { name: 'street', value: street } }, 'shipping');
    onChange({ target: { name: 'city', value: city } }, 'shipping');
    onChange({ target: { name: 'state', value: stateCode } }, 'shipping');
    setMarkerPosition({ lat, lng });
    setMapSelected(true);
  };

  // --------------------------
  // SAVE ADDRESS (fixed)
  // --------------------------

  // OTP: Send OTP using Firebase
  const sendOtp = async (fullPhone) => {
    setOtpError('');
    try {
      // Use Firebase RecaptchaVerifier if available
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
        });
      }
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await window.firebase.auth().signInWithPhoneNumber(fullPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpModalOpen(true);
    } catch (err) {
      setOtpError('Failed to send OTP. Please try again.');
    }
  };

  // OTP: Verify OTP
  const verifyOtp = async () => {
    setOtpError('');
    if (!otp || otp.length < 4) {
      setOtpError('Please enter the OTP code.');
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      setOtpModalOpen(false);
      onSubmit(formData);
    } catch (err) {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double clicks
    setIsSubmitting(true);

    // Validate phone: must be 7 digits
    const phone = formData.shipping.phone_number?.trim() || '';
    if (!phone || phone.length !== 7 || !/^[0-9]{7}$/.test(phone)) {
      alert('Please enter a valid 7-digit phone number before submitting.');
      setFormErrors((prev) => ({ ...prev, phone_number: 'Invalid or incomplete phone number' }));
      setIsSubmitting(false);
      return;
    }

    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'phone_number', 'street', 'state', 'city', 'delivery_type'];
    requiredFields.forEach((field) => {
      const errorMsg = validateField(field, formData.shipping[field]);
      if (errorMsg) errors[field] = errorMsg;
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert('Please fill all required fields correctly.');
      setIsSubmitting(false);
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));

      const payload = {
        ...formData,
        cart: cartItems?.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      };

      // small delay to ensure phone input updates last digit
      await new Promise((res) => setTimeout(res, 200));

      await fetch('https://db.store1920.com/wp-json/abandoned-checkouts/v1/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: formData.shipping,
          cart: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        }),
      });

      // Compose full phone number for OTP
      const fullPhone = `${formData.shipping.country_code || '+971'}${formData.shipping.phone_prefix || '50'}${formData.shipping.phone_number}`;
      await sendOtp(fullPhone);
    } catch (err) {
      alert('Something went wrong while saving your address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '18px',
          width: '96vw',
          maxWidth: '950px',
          maxHeight: '96vh',
          overflow: 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px #0003',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '22px',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#555',
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            gap: 0,
          }}
        >
          <h2 style={{ margin: '16px 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#333', textAlign: 'center' }}>
            Edit Address
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0,
                width: '100%',
                minHeight: 500,
                padding: '12px 16px 0 16px',
                boxSizing: 'border-box',
              }}
            >
              {/* Map section (left) */}
              {/* Only show the map if the form is hidden (before address mode selection) */}
              {!mapSelected && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    width: '100%',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '320px',
                      minHeight: 220,
                      maxWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <style>{`
                      @media (min-width: 900px) {
                        .address-map-area {
                          height: 100% !important;
                          min-height: 400px !important;
                          max-height: none !important;
                        }
                        .address-modal-map-container {
                          height: 420px !important;
                        }
                      }
                    `}</style>
                    <div className="address-map-area address-modal-map-container" style={{ width: '100%', height: '100%' }}>
                      <CustomMap initialPosition={markerPosition} onPlaceSelected={handlePlaceSelected} />
                    </div>
                  </div>
                </div>
              )}
              {/* Form section (right) - only show if mapSelected */}
              <div
                style={{
                  flex: 1.2,
                  minWidth: 320,
                  background: '#fafbfc',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #0001',
                  padding: '32px 28px',
                  display: mapSelected ? 'flex' : 'none',
                  flexDirection: 'column',
                  gap: 0,
                  maxHeight: '76vh',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ fontWeight: 700, color: '#444', fontSize: '1.1rem', letterSpacing: 0.2, flex: 1 }}>SHIPPING ADDRESS</div>
                  <button
                    type="button"
                    onClick={() => setMapSelected(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      padding: '4px 12px',
                      borderRadius: 6,
                      transition: 'background 0.2s',
                    }}
                    tabIndex={0}
                  >
                    ← Back to Map
                  </button>
                </div>
                {mapSelected && (
                    <form onSubmit={saveAddress} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
              {/* Delivery Type Selector at the top of the form */}
              <div style={{ margin: '0 0 18px 0', gridColumn: '1 / -1' }}>
                <div style={{ fontWeight: 600, color: '#444', marginBottom: 8 }}>Delivery Type<span style={{ color: 'red' }}>*</span></div>
                <style>{`
                  @media (max-width: 600px) {
                    .delivery-type-group {
                      flex-direction: column !important;
                      gap: 10px !important;
                    }
                    .delivery-type-radio {
                      width: 100% !important;
                      justify-content: flex-start !important;
                      padding: 12px 10px !important;
                      font-size: 1.08rem !important;
                    }
                  }
                `}</style>
                <div className="delivery-type-group" style={{ display: 'flex', gap: '16px' }}>
                  {['Office', 'Home', 'Apartment'].map((type) => (
                    <label
                      key={type}
                      className="delivery-type-radio"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: formData.shipping.delivery_type === type ? '2px solid #ff5100' : '2px solid #eee',
                        background: formData.shipping.delivery_type === type ? '#fff6f0' : '#fafbfc',
                        borderRadius: 10,
                        padding: '10px 22px',
                        fontWeight: 500,
                        color: formData.shipping.delivery_type === type ? '#ff5100' : '#444',
                        boxShadow: formData.shipping.delivery_type === type ? '0 2px 8px #ff510033' : 'none',
                        transition: 'all 0.2s',
                        fontSize: '1rem',
                        width: 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery_type"
                        value={type}
                        checked={formData.shipping.delivery_type === type}
                        onChange={handleFieldChange}
                        style={{ marginRight: 8, accentColor: '#ff5100', width: 18, height: 18 }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
                {/* Delivery time info below selector */}
                {formData.shipping.delivery_type && (
                  <div style={{ marginTop: 8, color: '#1976d2', fontWeight: 500, fontSize: '1.05rem' }}>
                    {formData.shipping.delivery_type === 'Office' && 'Delivery Time: 9 am to 6 pm'}
                    {formData.shipping.delivery_type === 'Home' && 'Delivery Time: 9 am to 9 pm'}
                    {formData.shipping.delivery_type === 'Apartment' && 'Delivery Time: 9 am to 9 pm'}
                  </div>
                )}
                {formErrors.delivery_type && <div style={{ color: 'red', fontSize: '0.95em', marginTop: 4 }}>{formErrors.delivery_type}</div>}
              </div>

              <label>
                First Name*
                <input type="text" name="first_name" value={formData.shipping.first_name} onChange={handleFieldChange} />
                {formErrors.first_name && <span style={{ color: 'red' }}>{formErrors.first_name}</span>}
              </label>

              <label>
                Last Name*
                <input type="text" name="last_name" value={formData.shipping.last_name} onChange={handleFieldChange} />
                {formErrors.last_name && <span style={{ color: 'red' }}>{formErrors.last_name}</span>}
              </label>

              <label>
                Mobile Number*
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#f7f7f7', fontWeight: 500, fontSize: '1rem', minWidth: 54, textAlign: 'center' }}>+971</span>
                  <select
                    value={formData.shipping.phone_prefix || '50'}
                    onChange={e => onChange({ target: { name: 'phone_prefix', value: e.target.value } }, 'shipping')}
                    style={{ padding: '8px 6px', borderRadius: 6, border: '1px solid #ccc', fontWeight: 500, fontSize: '1rem', width: 60 }}
                  >
                    <option value="50">50</option>
                    <option value="52">52</option>
                    <option value="54">54</option>
                    <option value="55">55</option>
                    <option value="56">56</option>
                    <option value="58">58</option>
                  </select>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.shipping.phone_number ? formData.shipping.phone_number.slice(0, 7).replace(/[^0-9]/g, '') : ''}
                    onChange={e => {
                      // Only allow numbers, max 7 digits
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 7) val = val.slice(0, 7);
                      onChange({ target: { name: 'phone_number', value: val } }, 'shipping');
                    }}
                    maxLength={7}
                    inputMode="numeric"
                    pattern="[0-9]{7}"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}
                    placeholder="1234567"
                  />
                </div>
                {formErrors.phone_number && <span style={{ color: 'red' }}>{formErrors.phone_number}</span>}
              </label>
      {/* OTP Modal */}
      <Modal
        isOpen={otpModalOpen}
        onRequestClose={() => setOtpModalOpen(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 },
          content: {
            maxWidth: 400,
            margin: 'auto',
            borderRadius: 12,
            padding: 32,
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          },
        }}
        ariaHideApp={false}
      >
        <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Verify Mobile Number</h3>
        <div style={{ fontSize: '1rem', color: '#444', marginBottom: 8 }}>Enter the OTP sent to your mobile</div>
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          maxLength={6}
          style={{ fontSize: '1.2rem', padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', width: 180, textAlign: 'center', letterSpacing: 4 }}
          placeholder="Enter OTP"
        />
        {otpError && <div style={{ color: 'red', fontSize: '0.97em' }}>{otpError}</div>}
        <button
          onClick={verifyOtp}
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', marginTop: 8 }}
        >
          Verify
        </button>
        <div id="recaptcha-container" />
      </Modal>

              <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#444' }}> 
                Email*
                <input type="email" name="email" value={formData.shipping.email} onChange={handleFieldChange} 
                  style={{ marginTop: '6px', padding: '10px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }} />
                {formErrors.email && <span style={{ color: 'red', fontSize: '0.85rem' }}>{formErrors.email}</span>} 
              </label>

              <label>
                Street*
                <input type="text" name="street" value={formData.shipping.street} onChange={handleFieldChange} />
                {formErrors.street && <span style={{ color: 'red' }}>{formErrors.street}</span>}
              </label>

              <label>
                Apartment / Floor
                <input type="text" name="apartment" value={formData.shipping.apartment} onChange={handleFieldChange} />
              </label>

              <label>
                Province / Emirates*
                <select name="state" value={formData.shipping.state} onChange={handleFieldChange}>
                  <option value="">Select state</option>
                  {UAE_EMIRATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {formErrors.state && <span style={{ color: 'red' }}>{formErrors.state}</span>}
              </label>

              <label style={{ position: 'relative' }}>
                City / Area*
                <input
                  type="text"
                  name="city"
                  autoComplete="off"
                  value={cityInput}
                  onChange={e => {
                    setCityInput(e.target.value);
                    onChange({ target: { name: 'city', value: e.target.value } }, 'shipping');
                  }}
                  placeholder="Search your city or area..."
                  style={{ padding: '10px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: 4 }}
                />
                {cityLoading && <div style={{ position: 'absolute', top: '100%', left: 0, color: '#888', fontSize: '0.95em' }}>Loading...</div>}
                {citySuggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '0 0 6px 6px',
                    zIndex: 10,
                    maxHeight: 180,
                    overflowY: 'auto',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}>
                    {citySuggestions.map((suggestion, idx) => (
                      <li
                        key={suggestion}
                        onClick={() => {
                          setCityInput(suggestion);
                          onChange({ target: { name: 'city', value: suggestion } }, 'shipping');
                          setCitySuggestions([]);
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          background: suggestion === cityInput ? '#f0f0f0' : '#fff',
                          borderBottom: idx === citySuggestions.length - 1 ? 'none' : '1px solid #eee',
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
                {formErrors.city && <span style={{ color: 'red' }}>{formErrors.city}</span>}
              </label>




              <label>
                Country
                <input type="text" value="United Arab Emirates" readOnly />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="saveAsDefault"
                checked={formData.saveAsDefault || false}
                onChange={(e) => onChange({ target: { name: 'saveAsDefault', value: e.target.checked } })}
              />
              Save this address as default for future orders
            </label>

            {error && <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 16, marginTop: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#fff',
                  color: '#1976d2',
                  border: '2px solid #1976d2',
                  padding: '12px 22px',
                  fontSize: '1.1rem',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                GO BACK
              </button>
              <button
                type="submit"
                disabled={isSubmitting || saving}
                style={{
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  padding: '12px 22px',
                  fontSize: '1.1rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                {isSubmitting ? 'Saving...' : 'SAVE ADDRESS'}
              </button>
            </div>
          </form>
        )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
