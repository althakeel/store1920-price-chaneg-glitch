import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Truck from "../assets/images/common/truck.png";

const TrackDeepOrder = () => {
  const location = useLocation();
  const [orderId, setOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [truckPosition, setTruckPosition] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ New states to strictly control UI
  const [hasTrackingData, setHasTrackingData] = useState(false); // only when C3X data is present
  const [orderExistsOnly, setOrderExistsOnly] = useState(false); // only when order exists in Woo but C3X not available

  // Return & Replacement states
  const [showRRModal, setShowRRModal] = useState(false);
  const [rrType, setRrType] = useState("Return");
  const [rrReason, setRrReason] = useState("");
  const [rrComments, setRrComments] = useState("");
  const [rrImages, setRrImages] = useState([]); // array of base64 strings
  const [rrCustomerName, setRrCustomerName] = useState("");
  const [rrCustomerEmail, setRrCustomerEmail] = useState("");
  const [rrCustomerPhone, setRrCustomerPhone] = useState("");
  const [submittingRR, setSubmittingRR] = useState(false);
  const [rrSuccessMsg, setRrSuccessMsg] = useState("");
  const [rrErrorMsg, setRrErrorMsg] = useState("");
  const [statusResults, setStatusResults] = useState(null);
  const [showRRDropdown, setShowRRDropdown] = useState(false);

  const trackingSteps = [
    "Shipment Info Received",
    "Picked Up",
    "Arrived Facility",
    "With Delivery Courier",
    "Out for Delivery",
    "Delivered",
  ];

  // ✅ Check if order exists in your system (WooCommerce backend)
  const checkOrderExists = async (tracking) => {
    try {
      const res = await fetch(
        "https://db.store1920.com/wp-json/custom/v1/check-order-exists",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracking }),
        }
      );

      if (!res.ok) return false;
      const json = await res.json();
      return json?.exists === true;
    } catch {
      return false;
    }
  };

  const fetchOrder = async () => {
    if (!orderId.trim()) return;

    setHasSearched(true);
    setLoading(true);

    // reset
    setErrorMsg("");
    setOrderDetails(null);
    setLogs([]);
    setTruckPosition(0);
    setStatusResults(null);
    setRrSuccessMsg("");
    setRrErrorMsg("");

    setHasTrackingData(false);
    setOrderExistsOnly(false);

    const tracking = orderId.trim();

    // 1️⃣ Try C3X tracking first
    let gotC3X = false;

    try {
      const response = await fetch(
        "https://db.store1920.com/wp-json/custom/v1/track-c3x-reference",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ TrackingAWB: tracking }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data?.AirwayBillTrackList?.length) {
          const trackingData = data.AirwayBillTrackList[0];

          if (trackingData?.AirWayBillNo) {
            gotC3X = true;

            setOrderDetails(trackingData);
            const logArr = trackingData.TrackingLogDetails || [];
            setLogs(logArr);

            const progress = parseInt(trackingData.ShipmentProgress ?? 0);
            setTruckPosition(Number.isFinite(progress) ? progress : 0);

            // ✅ Mark that we have real tracking data
            setHasTrackingData(true);
            setOrderExistsOnly(false);

            // fetch RR status (only if we have AirWayBillNo)
            try {
              await fetchRRStatus(trackingData.AirWayBillNo);
            } catch {}

            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      // ignore — fallback to order-exists check
      console.error("C3X Tracking Error:", err);
    }

    // 2️⃣ If NO tracking data found, check if order exists in our system
    if (!gotC3X) {
      const exists = await checkOrderExists(tracking);

      if (exists) {
        // ✅ Show ONLY progress bar at step 0
        setHasTrackingData(false);
        setOrderExistsOnly(true);
        setTruckPosition(0);

        // IMPORTANT: do not set fake Shipment Details
        setOrderDetails(null);
        setLogs([]);

        setLoading(false);
        return;
      }

      // 3️⃣ Order not found => show ONLY info message (no progress)
      setHasTrackingData(false);
      setOrderExistsOnly(false);
      setOrderDetails(null);
      setLogs([]);
    }

    setLoading(false);
  };

  // Fetch existing return/replacement requests for a tracking number
  const fetchRRStatus = async (tracking) => {
    if (!tracking) return;
    setRrErrorMsg("");
    try {
      const res = await fetch(
        `https://db.store1920.com/wp-json/custom/v1/check-return-status/${encodeURIComponent(
          tracking
        )}`
      );
      if (!res.ok) throw new Error("Failed to fetch status");
      const json = await res.json();
      setStatusResults(json);
      return json;
    } catch (err) {
      console.error("fetchRRStatus", err);
      setRrErrorMsg("Unable to fetch return/replacement status right now.");
      return null;
    }
  };

  // Handle image files and convert to base64 data URLs
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRrImages((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeImage = (index) => {
    setRrImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-fill and auto-track when order_id is in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderIdFromUrl = queryParams.get('order_id');
    
    if (orderIdFromUrl) {
      console.log('🔍 Auto-filling order ID from URL:', orderIdFromUrl);
      setOrderId(orderIdFromUrl);
      
      // Auto-trigger tracking after a short delay to ensure state is set
      setTimeout(() => {
        console.log('🚀 Auto-triggering track order...');
        // Manually trigger the fetch with the order ID from URL
        triggerAutoTrack(orderIdFromUrl);
      }, 100);
    }
  }, [location.search]);

  // Helper function to trigger tracking programmatically
  const triggerAutoTrack = async (trackingId) => {
    if (!trackingId.trim()) return;

    setHasSearched(true);
    setLoading(true);

    // reset
    setErrorMsg("");
    setOrderDetails(null);
    setLogs([]);
    setTruckPosition(0);
    setStatusResults(null);
    setRrSuccessMsg("");
    setRrErrorMsg("");

    setHasTrackingData(false);
    setOrderExistsOnly(false);

    const tracking = trackingId.trim();

    // 1️⃣ Try C3X tracking first
    let gotC3X = false;

    try {
      const response = await fetch(
        "https://db.store1920.com/wp-json/custom/v1/track-c3x-reference",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ TrackingAWB: tracking }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data?.AirwayBillTrackList?.length) {
          const trackingData = data.AirwayBillTrackList[0];

          if (trackingData?.AirWayBillNo) {
            gotC3X = true;

            setOrderDetails(trackingData);
            const logArr = trackingData.TrackingLogDetails || [];
            setLogs(logArr);

            const progress = parseInt(trackingData.ShipmentProgress ?? 0);
            setTruckPosition(Number.isFinite(progress) ? progress : 0);

            setHasTrackingData(true);
            setOrderExistsOnly(false);

            try {
              await fetchRRStatus(trackingData.AirWayBillNo);
            } catch {}

            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("C3X Tracking Error:", err);
    }

    // 2️⃣ If NO tracking data found, check if order exists in our system
    if (!gotC3X) {
      const exists = await checkOrderExists(tracking);

      if (exists) {
        setHasTrackingData(false);
        setOrderExistsOnly(true);
        setTruckPosition(0);
        setOrderDetails(null);
        setLogs([]);
        setLoading(false);
        return;
      }

      // 3️⃣ Order not found
      setHasTrackingData(false);
      setOrderExistsOnly(false);
      setOrderDetails(null);
      setLogs([]);
    }

    setLoading(false);
  };

  const submitReturnRequest = async () => {
    setRrErrorMsg("");
    setRrSuccessMsg("");

    // Return/Replace requires tracking details (delivered)
    if (!orderDetails?.AirWayBillNo && !orderId) {
      setRrErrorMsg("Missing tracking number.");
      return;
    }
    if (!rrType || !rrReason) {
      setRrErrorMsg("Please select type and reason.");
      return;
    }

    setSubmittingRR(true);
    try {
      const payload = {
        trackingNumber: orderDetails?.AirWayBillNo || orderId,
        orderId: orderDetails?.OrderNo || orderDetails?.Reference || "",
        type: rrType,
        reason: rrReason,
        comments: rrComments,
        images: rrImages,
        customerName: rrCustomerName,
        customerEmail: rrCustomerEmail,
        customerPhone: rrCustomerPhone,
      };

      const res = await fetch(
        "https://db.store1920.com/wp-json/custom/v1/submit-return-replacement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message || json?.error || "Submission failed";
        throw new Error(msg);
      }

      setRrSuccessMsg(
        "Request submitted successfully. Reference ID: " +
          (json.request_id || "—")
      );
      setShowRRModal(false);

      try {
        await fetchRRStatus(payload.trackingNumber);
      } catch {}

      // clear form
      setRrType("Return");
      setRrReason("");
      setRrComments("");
      setRrImages([]);
      setRrCustomerName("");
      setRrCustomerEmail("");
      setRrCustomerPhone("");
    } catch (err) {
      console.error("RR Submit Error", err);
      setRrErrorMsg(err.message || "Failed to submit request");
    }
    setSubmittingRR(false);
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        padding: 20,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          background: "#fff",
          borderRadius: 16,
          padding: 25,
        }}
      >
        <h1 style={{ textAlign: "center", color: "#1976d2", marginBottom: 20 }}>
          🚚 Track & Schedule Your Order
        </h1>

        {/* Fixed Small Buttons Top Right */}
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 500,
          }}
        ></div>

        <div style={{ marginBottom: 20 }}>
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
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              marginBottom: 10,
              fontSize: 15,
            }}
          />

          <button
            onClick={fetchOrder}
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: "linear-gradient(90deg, #42a5f5, #1e88e5)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Track Order"}
          </button>

          {/* Return/Replace and Contact Support Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {/* Show Return/Replacement Buttons if delivered (only when tracking data exists) */}
            {hasTrackingData &&
              ((truckPosition >= trackingSteps.length - 1) ||
                logs.some((l) =>
                  /delivered/i.test(l.Remarks || l.Activity || "")
                )) && (
                <>
                  <button
                    onClick={() => {
                      setRrType("Return");
                      setShowRRModal(true);
                      setRrErrorMsg("");
                      setRrSuccessMsg("");
                      setShowRRDropdown(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "#fff",
                      color: "#1976d2",
                      border: "2px solid #1976d2",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e3f2fd";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    Return /Replacement
                  </button>
                </>
              )}

<button
  onClick={() =>
    window.open(
      "https://wa.me/9718007861920?text=Hello%20Store1920%20Support,%20I%20need%20help%20with%20my%20order.",
      "_blank"
    )
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

          {errorMsg && (
            <div
              style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "12px 15px",
                borderRadius: 8,
                marginTop: 15,
                textAlign: "center",
                fontSize: 14,
                lineHeight: "1.5",
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>

        {/* ✅ Progress Bar should show if:
              - has real tracking data (C3X)
              - OR order exists in system but no tracking yet
        */}
        {(hasTrackingData || orderExistsOnly) && (
          <>
            {/* Tracking Progress Bar */}
            <div style={{ position: "relative", marginTop: 30, marginBottom: 30 }}>
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  overflow: "hidden",
                  background:
                    "repeating-linear-gradient(to right, #ddd 0 10px, transparent 10px 20px)",
                  animation: "roadMove 1s linear infinite",
                }}
              ></div>

              <div
                style={{
                  position: "absolute",
                  top: -18,
                  left: `calc(${(truckPosition / (trackingSteps.length - 1)) * 100}% - 16px)`,
                  fontSize: 32,
                  transform: "rotate(0deg)",
                  transition: "left 1.5s ease-in-out",
                }}
              >
                <img src={Truck} style={{ width: "45px", height: "45px" }} />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                }}
              >
                {trackingSteps.map((step, idx) => {
                  const active = idx <= truckPosition;
                  return (
                    <div
                      key={idx}
                      style={{
                        textAlign: "center",
                        width: `${100 / trackingSteps.length}%`,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          margin: "0 auto",
                          background: active ? "#1e88e5" : "#ccc",
                          marginBottom: 6,
                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: 11,
                          color: active ? "#1e88e5" : "#888",
                        }}
                      >
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ✅ Shipment Details + Tracking History should show ONLY when real C3X tracking exists */}
        {hasTrackingData && orderDetails && orderDetails.AirWayBillNo && (
          <>
            {/* Shipment Info */}
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ color: "#ff6d00", marginBottom: 15 }}>
                Shipment Details
              </h2>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: 8, fontWeight: "bold" }}>
                      Air Waybill
                    </td>
                    <td style={{ padding: 8 }}>{orderDetails.AirWayBillNo}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, fontWeight: "bold" }}>Origin</td>
                    <td style={{ padding: 8 }}>{orderDetails.Origin}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, fontWeight: "bold" }}>
                      Destination
                    </td>
                    <td style={{ padding: 8 }}>{orderDetails.Destination}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, fontWeight: "bold" }}>
                      Weight (kg)
                    </td>
                    <td style={{ padding: 8 }}>{orderDetails.ChargeableWeight}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Activity Logs */}
            {logs.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h2 style={{ color: "#1e88e5", marginBottom: 15 }}>
                  Tracking History
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "left" }}>
                        Date
                      </th>
                      <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                        Time
                      </th>
                      <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                        Location
                      </th>
                      <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td style={{ padding: 8 }}>{log.ActivityDate}</td>
                        <td style={{ padding: 8, textAlign: "center" }}>
                          {log.ActivityTime}
                        </td>
                        <td style={{ padding: 8, textAlign: "center" }}>
                          {log.Location}
                        </td>
                        <td style={{ padding: 8 }}>{log.Remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* RR banners */}
            <div>
              {statusResults?.has_request && (
                <div
                  style={{
                    background: "#fff3e0",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                    color: "#bf360c",
                  }}
                >
                  A return/replacement request already exists for this order. You can{" "}
                  <strong>Check Return/Replacement Status</strong> below.
                </div>
              )}

              {rrSuccessMsg && (
                <div
                  style={{
                    background: "#e8f5e9",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                    color: "#2e7d32",
                  }}
                >
                  {rrSuccessMsg}
                </div>
              )}
            </div>
          </>
        )}

        {/* Return/Replacement Modal */}
        {showRRModal && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
            onClick={() => setShowRRModal(false)}
          >
            <div
              role="dialog"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 520,
                maxWidth: "95%",
                background: "#fff",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Return / Replacement Request</h3>
              <p style={{ color: "#666", marginTop: 0, marginBottom: 10 }}>
                Tracking: <strong>{orderDetails?.AirWayBillNo || orderId}</strong>
              </p>

              {rrErrorMsg && (
                <div style={{ background: "#ffebee", color: "#c62828", padding: 8, borderRadius: 6, marginBottom: 10 }}>
                  {rrErrorMsg}
                </div>
              )}
              {rrSuccessMsg && (
                <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: 8, borderRadius: 6, marginBottom: 10 }}>
                  {rrSuccessMsg}
                </div>
              )}

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ fontWeight: 600 }}>Type</label>
                <select value={rrType} onChange={(e) => setRrType(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
                  <option value="Return">Return</option>
                  <option value="Replacement">Replacement</option>
                </select>

                <label style={{ fontWeight: 600 }}>Reason</label>
                <input
                  value={rrReason}
                  onChange={(e) => setRrReason(e.target.value)}
                  placeholder="Reason (e.g. Damaged, Wrong Item)"
                  style={{ padding: 8, borderRadius: 6 }}
                />

                <label style={{ fontWeight: 600 }}>Comments</label>
                <textarea value={rrComments} onChange={(e) => setRrComments(e.target.value)} rows={3} style={{ padding: 8, borderRadius: 6 }} />

                <label style={{ fontWeight: 600 }}>Upload Images (optional)</label>
                <input type="file" accept="image/*" multiple onChange={handleFilesChange} />

                {rrImages.length > 0 && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                    {rrImages.map((src, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <img src={src} alt={`img-${idx}`} style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
                        <button
                          onClick={() => removeImage(idx)}
                          style={{
                            position: "absolute",
                            right: -6,
                            top: -6,
                            background: "#fff",
                            borderRadius: "50%",
                            border: "1px solid #ccc",
                            width: 26,
                            height: 26,
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    onClick={submitReturnRequest}
                    disabled={submittingRR}
                    style={{ flex: 1, padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 8 }}
                  >
                    {submittingRR ? "Submitting..." : "Submit Request"}
                  </button>
                  <button onClick={() => setShowRRModal(false)} style={{ flex: 1, padding: 10, background: "#f1f1f1", border: "none", borderRadius: 8 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return/Replacement Status Results */}
        {statusResults && hasTrackingData && (
          <div style={{ marginTop: 16, padding: 12, background: "#f7f9fc", borderRadius: 8 }}>
            {statusResults.has_request ? (
              <div>
                <h4 style={{ marginTop: 0 }}>Requests</h4>
                {statusResults.requests.map((r) => (
                  <div key={r.id} style={{ padding: 10, border: "1px solid #e6e9ef", borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong>{r.request_type}</strong>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        {new Date(r.request_date).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ color: "#333" }}>Reason: {r.reason}</div>
                    <div style={{ marginTop: 6 }}>
                      Status: <strong>{r.status}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#444" }}>No return/replacement requests found for this tracking number.</div>
            )}
          </div>
        )}

        {/* ✅ Show info message ONLY if:
              - searched
              - not loading
              - no tracking data
              - order does NOT exist
        */}
        {hasSearched && !loading && !hasTrackingData && !orderExistsOnly && !errorMsg && (
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

        <style>
          {`
            @keyframes roadMove {
              0% { background-position: 0 0; }
              100% { background-position: 20px 0; }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TrackDeepOrder;
