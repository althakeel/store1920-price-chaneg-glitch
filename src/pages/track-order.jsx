import React, { useState } from "react";
import Truck from "../assets/images/common/truck.png";

// Set to true to use test data while WordPress API is being set up
const USE_TEST_DATA = true;

const TrackDeepOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [truckPosition, setTruckPosition] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [requestedDate, setRequestedDate] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState(""); 
  const [returnReason, setReturnReason] = useState("");
  const [returnImages, setReturnImages] = useState([]);
  const [returnComment, setReturnComment] = useState("");
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showTrackingHistory, setShowTrackingHistory] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [wpOrderData, setWpOrderData] = useState(null);
  const [returnStatus, setReturnStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState(null);
  
  const trackingSteps = [
  "Order Placed",
  "Picked Up",
  "At Facility",
  "With Courier",
  "Out for Delivery",
  "Delivered",
  ];

  const fetchOrder = async () => {
    if (!orderId.trim()) return;
    setHasSearched(true);
    setLoading(true);
    setErrorMsg("");
    setOrderDetails(null);
    setLogs([]);
    setTruckPosition(0);
    setShowSchedule(false);
    setSuccessMsg("");
    setWpOrderData(null);
    
    try {
      // Use test data if enabled
      let trackingData = null;
      
      if (USE_TEST_DATA) {
        console.log("Using test tracking data...");
        // Simulate test tracking data
        trackingData = {
          AirwayBillTrackList: [{
            AirWayBillNo: orderId.trim(),
            ShipmentProgress: "75",
            TrackingLogDetails: [
              {
                Date: new Date().toISOString(),
                Time: "10:30 AM",
                Status: "Out for Delivery",
                Location: "Dubai Distribution Center"
              },
              {
                Date: new Date(Date.now() - 86400000).toISOString(),
                Time: "02:15 PM",
                Status: "With Courier",
                Location: "Main Sorting Facility"
              },
              {
                Date: new Date(Date.now() - 172800000).toISOString(),
                Time: "09:00 AM",
                Status: "Picked Up",
                Location: "Store1920 Warehouse"
              }
            ]
          }]
        };
      } else {
        // Fetch C3X tracking data from API
        const trackingResponse = await fetch(
          "https://db.store1920.com/wp-json/custom/v1/track-c3x-reference",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ TrackingAWB: orderId.trim() }),
          }
        );
        
        if (!trackingResponse.ok) throw new Error("C3X API error");
        trackingData = await trackingResponse.json();
      }
      
      if (trackingData?.AirwayBillTrackList?.length) {
        const trackingInfo = trackingData.AirwayBillTrackList[0];
        if (trackingInfo.AirWayBillNo) {
          setOrderDetails(trackingInfo);
          setLogs(trackingInfo.TrackingLogDetails || []);
          const progress = parseInt(trackingInfo.ShipmentProgress ?? 0);
          setTruckPosition(progress);

          // Fetch WordPress order details
          try {
            console.log("Fetching WordPress order data for:", orderId.trim());
            const orderResponse = await fetch(
              "https://db.store1920.com/wp-json/custom/v1/get-order-by-tracking",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tracking_number: orderId.trim() }),
              }
            );
            
            console.log("WordPress API Response Status:", orderResponse.status);
            
            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              console.log("WordPress Order Data:", orderData);
              
              if (orderData.success) {
                setWpOrderData(orderData.data);
                console.log("Order data set successfully!");
              } else {
                console.log("Order not found or error:", orderData.message);
              }
            } else {
              console.log("WordPress API endpoint not available or returned error");
              
              // Use test data if enabled
              if (USE_TEST_DATA) {
                console.log("Using test data...");
                setWpOrderData({
                  order_id: 12345,
                  order_number: "12345",
                  status: "completed",
                  currency: "AED",
                  total: "183.75",
                  subtotal: "150.00",
                  total_tax: "8.75",
                  shipping_total: "25.00",
                  discount_total: "0.00",
                  payment_method: "cod",
                  payment_method_title: "Cash on Delivery",
                  line_items: [
                    {
                      id: 1,
                      name: "Sample Product - LED Light",
                      quantity: 1,
                      price: "150.00",
                      total: "150.00",
                      image: "",
                      product_id: 123
                    }
                  ],
                  shipping: {
                    first_name: "Ahmed",
                    last_name: "Ali",
                    company: "",
                    address_1: "Building 123, Street 45",
                    address_2: "Apt 4B",
                    city: "Dubai",
                    state: "Dubai",
                    postcode: "12345",
                    country: "United Arab Emirates"
                  },
                  billing: {
                    email: "customer@store1920.com",
                    phone: "+971 50 123 4567"
                  }
                });
              }
            }
          } catch (wpErr) {
            console.log("WordPress order fetch error:", wpErr);
            
            // Use test data if enabled
            if (USE_TEST_DATA) {
              console.log("Using test data due to error...");
              setWpOrderData({
                order_id: 12345,
                order_number: "12345",
                status: "completed",
                currency: "AED",
                total: "183.75",
                subtotal: "150.00",
                total_tax: "8.75",
                shipping_total: "25.00",
                discount_total: "0.00",
                payment_method: "cod",
                payment_method_title: "Cash on Delivery",
                line_items: [
                  {
                    id: 1,
                    name: "Sample Product - LED Light",
                    quantity: 1,
                    price: "150.00",
                    total: "150.00",
                    image: "",
                    product_id: 123
                  }
                ],
                shipping: {
                  first_name: "Ahmed",
                  last_name: "Ali",
                  company: "",
                  address_1: "Building 123, Street 45",
                  address_2: "Apt 4B",
                  city: "Dubai",
                  state: "Dubai",
                  postcode: "12345",
                  country: "United Arab Emirates"
                },
                billing: {
                  email: "customer@store1920.com",
                  phone: "+971 50 123 4567"
                }
              });
            }
          }
        } else {
          setOrderDetails(null);
        }
      } else {
        setOrderDetails(null);
      }
    } catch (err) {
      console.error("C3X Tracking Error:", err);
      setErrorMsg(
        "⚠️ Unable to fetch tracking details at the moment. Please try again later."
      );
    }
    
    // Check for return/replacement status
    try {
      const returnResponse = await fetch(
        `https://db.store1920.com/wp-json/custom/v1/check-return-status/${orderId}`
      );
      if (returnResponse.ok) {
        const returnData = await returnResponse.json();
        console.log('Return/Replacement Status:', returnData);
        if (returnData.has_request) {
          setReturnStatus(returnData.requests);
        } else {
          setReturnStatus(null);
        }
      }
    } catch (err) {
      console.error("Return status check error:", err);
      setReturnStatus(null);
    }
    
    setLoading(false);
  };
  const handleSchedule = () => {
    if (!requestedDate) {
      setErrorMsg("Please select a date first.");
      return;
    }
    setSuccessMsg(
      `✅ Delivery date request submitted for ${requestedDate}. Approval required.`
    );
    setRequestedDate("");
    setShowSchedule(false);
  };

  const handleReturnRequest = async () => {
    if (!returnType || !returnReason) {
      alert("Please select type and reason");
      return;
    }

    // Convert images to base64
    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    };

    try {
      // Convert all images to base64
      const imagePromises = returnImages.map(img => convertToBase64(img));
      const base64Images = await Promise.all(imagePromises);

      const requestData = {
        trackingNumber: orderId,
        orderId: wpOrderData?.order_id || '',
        type: returnType,
        reason: returnReason,
        comments: returnComment,
        images: base64Images,
        customerName: wpOrderData?.customer_name || '',
        customerEmail: wpOrderData?.customer_email || '',
        customerPhone: wpOrderData?.customer_phone || ''
      };

      console.log('Submitting return/replacement request:', requestData);

      const response = await fetch(
        "https://db.store1920.com/wp-json/custom/v1/submit-return-replacement",
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );
      
      const result = await response.json();
      console.log('Response:', result);
      
      if (response.ok && result.success) {
        setSuccessRequestId(result.request_id);
        setShowSuccessModal(true);
        setShowReturnModal(false);
        setReturnType("");
        setReturnReason("");
        setReturnComment("");
        setReturnImages([]);
        
        // Refresh return status
        try {
          const returnResponse = await fetch(
            `https://db.store1920.com/wp-json/custom/v1/check-return-status/${orderId}`
          );
          if (returnResponse.ok) {
            const returnData = await returnResponse.json();
            if (returnData.has_request) {
              setReturnStatus(returnData.requests);
            }
          }
        } catch (err) {
          console.error("Failed to refresh return status:", err);
        }
      } else {
        alert("❌ Failed: " + (result.message || "Please try again."));
      }
    } catch (error) {
      console.error("Return request error:", error);
      alert("❌ Error submitting request.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + returnImages.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }
    setReturnImages([...returnImages, ...files]);
  };

  const isDelivered = orderDetails?.ShipmentProgress === 5 || 
                     orderDetails?.ShipmentProgress === "5" ||
                     truckPosition === 5 ||
                     logs.some(log => log.Remarks?.toLowerCase().includes("delivered"));

  return (
    <div
      className="track-order-container"
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "#ffffffff",
        minHeight:"58vh",
        padding: "40px 25px",
      }}
    >
      <div
        className="track-order-inner"
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: "40px",
       
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1976d2",
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 30,
            letterSpacing: "-0.5px",
          }}
        >
          🚚 Track & Schedule Your Order
        </h1>
        {/* Input Section */}
        <div style={{ marginBottom: 30 }}>
          <input
            type="text"
            placeholder="Enter Tracking Number"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              setHasSearched(false);
              setErrorMsg("");
            }}
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 12,
              border: "2px solid #e0e0e0",
              marginBottom: 12,
              fontSize: 16,
              transition: "all 0.3s",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.border = "2px solid #1976d2"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          />
          <button
            onClick={fetchOrder}
            disabled={loading}
            style={{
              width: "100%",
              padding: 16,
              background: loading ? "#ccc" : "linear-gradient(90deg, #42a5f5, #1e88e5)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 15px rgba(33, 150, 243, 0.3)",
              transition: "all 0.3s",
              transform: loading ? "none" : "translateY(0)",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)")}
          >
            {loading ? "⏳ Loading..." : "🔍 Track Order"}
          </button>
          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "15px 20px",
                borderRadius: 12,
                marginTop: 20,
                textAlign: "center",
                fontSize: 15,
                lineHeight: "1.6",
                fontWeight: 500,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
        {/* Show tracking details if found */}
        {orderDetails && orderDetails.AirWayBillNo && (
          <>
            {/* Tracking Number Display */}
            <div style={{
              background: "#f8f9fa",
              padding: "12px 20px",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
              color: "#666"
            }}>
              <span style={{ fontWeight: 600, color: "#333" }}>{orderDetails.AirWayBillNo}</span>
            </div>

            {/* Redesigned Progress Bar with Animated Truck */}
            <div style={{ position: "relative", marginTop: 30, marginBottom: 60 }}>
              <div className="track-progress-bar-bg">
                <div
                  className="track-progress-bar-fill"
                  style={{ width: `${(truckPosition / (trackingSteps.length - 1)) * 100}%` }}
                ></div>
                <div
                  className="track-truck-anim"
                  style={{ left: `calc(${(truckPosition / (trackingSteps.length - 1)) * 100}% - 28px)` }}
                >
                  <img src={Truck} alt="Truck" style={{ width: 56, height: 56, filter: "drop-shadow(0 2px 8px #4caf50aa)" }} />
                </div>
                {trackingSteps.map((step, idx) => {
                  const active = idx <= truckPosition;
                  return (
                    <div
                      key={idx}
                      className={`track-step-dot${active ? " active" : ""}`}
                      style={{ left: `${(idx / (trackingSteps.length - 1)) * 100}%` }}
                    >
                      <span className="track-step-label">{step}</span>
                    </div>
                  );
                })}
              </div>
              <style>{`
                .track-progress-bar-bg {
                  position: relative;
                  height: 8px;
                  background: #e0e0e0;
                  border-radius: 10px;
                  overflow: visible;
                  margin-bottom: 50px;
                }
                .track-progress-bar-fill {
                  position: absolute;
                  top: 0; 
                  left: 0; 
                  height: 100%;
                  background: linear-gradient(90deg, #66bb6a 0%, #4caf50 100%);
                  border-radius: 10px;
                  z-index: 1;
                  transition: width 1.2s cubic-bezier(.7,.2,.3,1);
                  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
                }
                .track-truck-anim {
                  position: absolute;
                  top: -24px;
                  z-index: 3;
                  animation: truck-bounce 1.2s infinite alternate cubic-bezier(.7,.2,.3,1);
                  transition: left 1.2s cubic-bezier(.7,.2,.3,1);
                }
                @keyframes truck-bounce {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(-8px); }
                }
                .track-step-dot {
                  position: absolute;
                  top: 50%;
                  transform: translate(-50%, -50%);
                  width: 24px; 
                  height: 24px;
                  background: #fff;
                  border: 3px solid #e0e0e0;
                  border-radius: 50%;
                  z-index: 2;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  transition: all 0.3s;
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                }
                .track-step-dot.active {
                  border-color: #4caf50;
                  background: #4caf50;
                  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
                }
                .track-step-dot.active::after {
                  content: '✓';
                  color: #fff;
                  font-size: 12px;
                  font-weight: bold;
                }
                .track-step-dot .track-step-label {
                  position: absolute;
                  top: 40px;
                  left: 50%;
                  transform: translateX(-50%);
                  font-size: 11px;
                  color: #666;
                  font-weight: 500;
                  white-space: nowrap;
                  opacity: 0.9;
                  pointer-events: none;
                  text-align: center;
                  max-width: 100px;
                  line-height: 1.3;
                }
                .track-step-dot.active .track-step-label {
                  color: #4caf50;
                  font-weight: 600;
                  opacity: 1;
                }
              `}</style>
            </div>
            
            {/* Shipment Info - Redesigned */}
            <div style={{ 
              marginBottom: 30,
              background: "#f8f9fa",
              borderRadius: 12,
              padding: "24px",
              border: "1px solid #e0e0e0"
            }}>
              <h2 style={{ 
                color: "#ff6d00", 
                marginBottom: 20,
                fontSize: 18,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                📦 Shipment Details
              </h2>
              <div style={{ 
                display: "grid", 
                gap: "12px",
                background: "#fff",
                padding: "20px",
                borderRadius: 8
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <span style={{ fontWeight: 600, color: "#555" }}>Air Waybill</span>
                  <span style={{ color: "#333" }}>{orderDetails.AirWayBillNo}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <span style={{ fontWeight: 600, color: "#555" }}>Origin</span>
                  <span style={{ color: "#333" }}>{orderDetails.Origin}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <span style={{ fontWeight: 600, color: "#555" }}>Destination</span>
                  <span style={{ color: "#333" }}>{orderDetails.Destination}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ fontWeight: 600, color: "#555" }}>Weight (kg)</span>
                  <span style={{ color: "#333" }}>{orderDetails.ChargeableWeight}</span>
                </div>
              </div>
            </div>

            {/* Return/Replacement Status */}
            {returnStatus && returnStatus.length > 0 && (
              <div style={{ 
                marginBottom: 30,
                background: "#fff3cd",
                borderRadius: 12,
                padding: "24px",
                border: "2px solid #ffc107",
                boxShadow: "0 2px 8px rgba(255,193,7,0.2)"
              }}>
                <h2 style={{ 
                  color: "#ff6d00", 
                  marginBottom: 20,
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  🔄 Return/Replacement Requests
                </h2>
                
                {returnStatus.map((req, index) => {
                  const statusColors = {
                    'Pending': { bg: '#fff3cd', color: '#856404', icon: '⏳' },
                    'Approved': { bg: '#d4edda', color: '#155724', icon: '✅' },
                    'Rejected': { bg: '#f8d7da', color: '#721c24', icon: '❌' },
                    'Completed': { bg: '#d1ecf1', color: '#0c5460', icon: '✔️' }
                  };
                  const statusStyle = statusColors[req.status] || statusColors['Pending'];
                  
                  return (
                    <div key={req.id} style={{
                      background: "#fff",
                      padding: "16px",
                      borderRadius: 8,
                      marginBottom: index < returnStatus.length - 1 ? 12 : 0,
                      border: "1px solid #e0e0e0"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div>
                          <strong style={{ fontSize: 16, color: "#333" }}>
                            {req.request_type === 'Return' ? '↩️ Return Request' : '🔄 Replacement Request'}
                          </strong>
                          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            Submitted: {new Date(req.request_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <span style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          padding: "6px 16px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}>
                          {statusStyle.icon} {req.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: "#555", paddingLeft: 20, borderLeft: "3px solid #ff6d00" }}>
                        <strong>Reason:</strong> {req.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Logs - Redesigned */}
            {logs.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h2 
                  onClick={() => setShowTrackingHistory(!showTrackingHistory)}
                  style={{ 
                    color: "#1976d2", 
                    marginBottom: 15,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    userSelect: "none",
                    fontSize: 18,
                    fontWeight: 700
                  }}
                >
                  Tracking History
                  <span style={{ 
                    fontSize: 14, 
                    transition: "transform 0.3s",
                    transform: showTrackingHistory ? "rotate(90deg)" : "rotate(0deg)"
                  }}>▶</span>
                </h2>
                {showTrackingHistory && (
                <div style={{
                  background: "#f8f9fa",
                  borderRadius: 8,
                  overflow: "hidden"
                }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#e3f2fd" }}>
                      <th
                        style={{
                          borderBottom: "2px solid #1976d2",
                          padding: 12,
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#1976d2"
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          borderBottom: "2px solid #1976d2",
                          padding: 12,
                          fontWeight: 600,
                          color: "#1976d2"
                        }}
                      >
                        Time
                      </th>
                      <th
                        style={{
                          borderBottom: "2px solid #1976d2",
                          padding: 12,
                          fontWeight: 600,
                          color: "#1976d2"
                        }}
                      >
                        Location
                      </th>
                      <th
                        style={{
                          borderBottom: "2px solid #1976d2",
                          padding: 12,
                          fontWeight: 600,
                          color: "#1976d2"
                        }}
                      >
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} style={{ 
                        background: index % 2 === 0 ? "#fff" : "#f8f9fa",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#e8f5e9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#f8f9fa"}
                      >
                        <td style={{ padding: 12, borderBottom: "1px solid #e0e0e0" }}>{log.ActivityDate}</td>
                        <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #e0e0e0" }}>
                          {log.ActivityTime}
                        </td>
                        <td style={{ padding: 12, textAlign: "center", borderBottom: "1px solid #e0e0e0" }}>
                          {log.Location}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #e0e0e0" }}>{log.Remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                )}
              </div>
            )}
            {/* Schedule Section */}
            <div>
              {!isDelivered ? (
                // Show schedule delivery option if NOT delivered
                !showSchedule ? (
                  <div>
                    <button
                      onClick={() => setShowSchedule(true)}
                      style={{
                        width: "100%",
                        padding: 12,
                        background: "linear-gradient(90deg, #ff8f00, #ff6d00)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: 10,
                      }}
                    >
                      Request / Schedule Delivery Date
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = "mailto:support@store1920.com")
                      }
                      style={{
                        width: "100%",
                        padding: 12,
                        background: "linear-gradient(90deg, #757575, #424242)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Contact Support
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ marginBottom: 10, color: "#1976d2" }}>
                      Select a requested delivery date (Approval required):
                    </p>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid #ccc",
                        marginBottom: 15,
                        fontSize: 15,
                      }}
                    />
                    <button
                      onClick={handleSchedule}
                      style={{
                        width: "100%",
                        padding: 12,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#fff",
                        background: "linear-gradient(90deg, #ff8f00, #ff6d00)",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                      }}
                    >
                      Submit Request
                    </button>
                    {successMsg && (
                      <p style={{ color: "green", marginTop: 10 }}>
                        {successMsg}
                      </p>
                    )}
                  </div>
                )
              ) : (
                // Show Return/Replacement options if DELIVERED - Redesigned
                <div style={{ marginTop: 30 }}>
                  {/* Delivered Status with Show Options Button */}
                  <div style={{ 
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                    padding: "20px",
                    background: "#f1f8f4",
                    borderRadius: 12,
                    border: "1px solid #c8e6c9"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 8,
                        marginBottom: 8
                      }}>
                        <span style={{ fontSize: 20 }}>✅</span>
                        <span style={{ 
                          fontSize: 18, 
                          fontWeight: 700, 
                          color: "#2e7d32"
                        }}>
                          Delivered
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: "#666", marginLeft: 28 }}>
                        {logs.length > 0 && logs[0]?.ActivityDate && logs[0]?.ActivityTime && (
                          <>on {logs[0].ActivityDate} at {logs[0].ActivityTime}</>
                        )}
                      </div>
                    </div>
                    
                    {/* Show Options Button */}
                    <button
                      onClick={() => setShowActionButtons(!showActionButtons)}
                      style={{
                        padding: "10px 24px",
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#1565c0";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#1976d2";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.3)";
                      }}
                    >
                      Return / Replacement {showActionButtons ? "▲" : "▼"}
                    </button>
                  </div>

                  {/* Dropdown Options */}
                  {showActionButtons && (
                    <div style={{
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: 12,
                      overflow: "hidden",
                      marginBottom: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}>
                      <button
                        onClick={() => {
                          setReturnType("return");
                          setShowReturnModal(true);
                          setShowActionButtons(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "16px 20px",
                          background: "#fff",
                          border: "none",
                          borderBottom: "1px solid #f0f0f0",
                          textAlign: "left",
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          fontWeight: 500
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                        onMouseLeave={(e) => e.target.style.background = "#fff"}
                      >
                        <span style={{ fontSize: 18 }}>🔄</span>
                        <span>Request Return</span>
                      </button>
                      <button
                        onClick={() => {
                          setReturnType("replacement");
                          setShowReturnModal(true);
                          setShowActionButtons(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "16px 20px",
                          background: "#fff",
                          border: "none",
                          textAlign: "left",
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          fontWeight: 500
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                        onMouseLeave={(e) => e.target.style.background = "#fff"}
                      >
                        <span style={{ fontSize: 18 }}>🔁</span>
                        <span>Request Replacement</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {/* Show no tracking details message only after search */}
        {/* Show no tracking details message only after search completes */}
{hasSearched && !loading && !orderDetails && !errorMsg && (
  <div
    style={{
      background: "#e3f2fd",
      color: "#1976d2",
      padding: "14px 16px",
      borderRadius: 8,
      marginTop: 20,
      textAlign: "center",
      fontSize: 15,
      lineHeight: "1.6",
    }}
  >
    ℹ️ Currently, we don’t have any tracking details for this shipment.
    <br />
    Details will be updated once received. Please check back again later.
  </div>
)}

        {/* Return/Replacement Modal */}
        {showReturnModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20,
            }}
            onClick={() => setShowReturnModal(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 30,
                maxWidth: 600,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: returnType === "return" ? "#d32f2f" : "#ff6d00", marginBottom: 20 }}>
                {returnType === "return" ? "🔄 Return Request" : "🔁 Replacement Request"}
              </h2>

              <p style={{ marginBottom: 15, color: "#666", fontSize: 14 }}>
                AWB: <strong>{orderDetails?.AirWayBillNo}</strong>
              </p>

              {/* Reason Selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Reason for {returnType === "return" ? "Return" : "Replacement"} *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    fontSize: 15,
                  }}
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Defective/Damaged Product</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="not_as_described">Not As Described</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="size_issue">Size/Fit Issue</option>
                  <option value="changed_mind">Changed Mind</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Comments */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Additional Comments
                </label>
                <textarea
                  value={returnComment}
                  onChange={(e) => setReturnComment(e.target.value)}
                  placeholder="Please provide more details..."
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    fontSize: 15,
                    minHeight: 100,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Upload Images (Optional, Max 3)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
                {returnImages.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13, color: "#4caf50", marginBottom: 8 }}>
                      ✓ {returnImages.length} image(s) selected
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {returnImages.map((img, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <img 
                            src={URL.createObjectURL(img)} 
                            alt={`Preview ${idx + 1}`}
                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "2px solid #4caf50" }}
                          />
                          <button
                            onClick={() => setReturnImages(returnImages.filter((_, i) => i !== idx))}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              background: "#f44336",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 24,
                              height: 24,
                              cursor: "pointer",
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleReturnRequest}
                  style={{
                    flex: 1,
                    padding: 14,
                    background: returnType === "return" ? "linear-gradient(90deg, #d32f2f, #c62828)" : "linear-gradient(90deg, #ff8f00, #ff6d00)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnType("");
                    setReturnReason("");
                    setReturnComment("");
                    setReturnImages([]);
                  }}
                  style={{
                    flex: 1,
                    padding: 14,
                    background: "#757575",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes roadMove {
              0% { background-position: 0 0; }
              100% { background-position: 20px 0; }
            }
            
            @media (max-width: 768px) {
              .track-order-container {
                padding: 20px 16px !important;
              }
              .track-order-inner {
                padding: 24px 16px !important;
              }
              h1 {
                font-size: 24px !important;
              }
              .track-step-dot .track-step-label {
                font-size: 10px !important;
              }
            }
            
            @media (max-width: 480px) {
              .track-step-dot .track-step-label {
                display: none;
              }
            }
          `}
        </style>
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: 20,
              animation: "fadeIn 0.3s ease-in",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 24,
                padding: 0,
                maxWidth: 500,
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                animation: "slideUp 0.4s ease-out",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                background: "rgba(255,255,255,0.95)",
                padding: "40px 30px 30px",
                textAlign: "center",
                position: "relative"
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
                  animation: "pulse 2s infinite"
                }}>
                  <span style={{ fontSize: 40 }}>✓</span>
                </div>
                
                <h2 style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 10
                }}>
                  Request Submitted!
                </h2>
                
                <p style={{
                  margin: 0,
                  fontSize: 16,
                  color: "#666",
                  marginBottom: 20
                }}>
                  Your request has been successfully submitted to our team.
                </p>
                
                <div style={{
                  background: "#f8f9fa",
                  padding: "15px 20px",
                  borderRadius: 12,
                  display: "inline-block",
                  marginBottom: 10
                }}>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 5 }}>
                    Request ID
                  </div>
                  <div style={{
                    fontSize: 32,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 2
                  }}>
                    #{successRequestId}
                  </div>
                </div>
                
                <p style={{
                  fontSize: 14,
                  color: "#888",
                  margin: "15px 0 0",
                  lineHeight: 1.6
                }}>
                  We'll review your request and get back to you soon. You can track the status using your tracking number.
                </p>
              </div>
              
              {/* Footer Buttons */}
              <div style={{
                padding: "20px 30px",
                display: "flex",
                gap: 15,
                background: "rgba(255,255,255,0.1)"
              }}>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setShowReturnModal(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.3)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.2)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Submit Another
                </button>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    background: "#fff",
                    color: "#667eea",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              @keyframes slideUp {
                from {
                  transform: translateY(50px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              
              @keyframes pulse {
                0%, 100% {
                  transform: scale(1);
                  box-shadow: 0 8px 20px rgba(102,126,234,0.4);
                }
                50% {
                  transform: scale(1.05);
                  box-shadow: 0 12px 30px rgba(102,126,234,0.6);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};
export default TrackDeepOrder;