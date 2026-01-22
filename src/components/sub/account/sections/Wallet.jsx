import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Wallet.css";

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [amountError, setAmountError] = useState("");

  const [form, setForm] = useState({
    amount: "",
    bank_name: "",
    account_title: "",
    account_number: "",
    iban: "",
  });

  // -------------------------
  // Load wallet
  // -------------------------
  useEffect(() => {
    if (!user) return;

    axios
      .get(
        `https://db.store1920.com/wp-json/custom/v3/wallet?user_id=${user.id}`,
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          setWallet(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  // -------------------------
  // Safe derived values
  // -------------------------
  const balance = Number(wallet?.balance || 0);
  const reserved = Number(wallet?.reserved || 0);
  const availableBalance = balance - reserved;

  const hasBalance = availableBalance > 0;
  const hasPendingWithdrawal = wallet?.has_pending_withdrawal === true;

  const isInvalidAmount =
    !form.amount ||
    Number(form.amount) <= 0 ||
    Number(form.amount) > availableBalance;

  // -------------------------
  // Withdraw request
  // -------------------------
  const handleWithdraw = async () => {
    setMessage("");

    if (
      !form.amount ||
      !form.bank_name ||
      !form.account_title ||
      !form.account_number ||
      !form.iban
    ) {
      setMessageType("error");
      setMessage("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(
        "https://db.store1920.com/wp-json/custom/v3/wallet-withdraw",
        {
          email: user.email, // ✅ SAME LOGIN FLOW
          ...form,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessageType("success");
        setMessage("✅ Your withdrawal request has been sent successfully.");

        // refresh wallet
        setWallet({
          ...wallet,
          reserved: reserved + Number(form.amount),
          has_pending_withdrawal: true,
        });

        setShowWithdraw(false);
        setForm({
          amount: "",
          bank_name: "",
          account_title: "",
          account_number: "",
          iban: "",
        });
      }
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message || "Withdrawal request failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------
  // UI states
  // -------------------------
  if (!user) return <p className="wallet-info">Please login to view wallet.</p>;
  if (loading) return <p className="wallet-info">Loading wallet...</p>;
  if (!wallet) return <p className="wallet-info">Wallet not available.</p>;

  return (
    <div className="wallet-page">
      {/* Alert */}
      {message && (
        <div className={`wallet-alert ${messageType}`}>
          {message}
        </div>
      )}

      {/* Balance */}
      <div className="wallet-balance-card">
        <div>
          <h4>Your Wallet Balance</h4>
          <h1>AED {balance.toFixed(2)}</h1>

          {reserved > 0 && (
            <p className="wallet-info">
              Reserved for withdrawal: AED {reserved.toFixed(2)}
            </p>
          )}
        </div>

        <div className="wallet-actions">
          <button
            className="btn-primary"
            disabled={!hasBalance}
            onClick={() => hasBalance && navigate("/")}
            style={{
              opacity: hasBalance ? 1 : 0.5,
              cursor: hasBalance ? "pointer" : "not-allowed",
            }}
          >
            Use for Purchase
          </button>

          <button
            className="btn-outline"
            disabled={!hasBalance || hasPendingWithdrawal}
            onClick={() =>
              !hasPendingWithdrawal && setShowWithdraw(true)
            }
            style={{
              opacity:
                hasBalance && !hasPendingWithdrawal ? 1 : 0.5,
              cursor:
                hasBalance && !hasPendingWithdrawal
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            Withdraw to Bank
          </button>
        </div>

        
      </div>

      {/* Transactions */}
      <div className="wallet-transactions">
        <h3>Transaction History</h3>

        {wallet.transactions?.length === 0 ? (
          <p className="empty">No wallet transactions yet.</p>
        ) : (
          wallet.transactions?.map((tx) => (
            <div className="wallet-transaction" key={tx.id}>
              <div>
                <span className={`type ${tx.type}`}>
                  {tx.type === "credit" ? "+" : "-"} AED {tx.amount}
                </span>
                <p>{tx.reason}</p>
              </div>
              <span className="date">
                {new Date(tx.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <h3>Withdraw to Bank</h3>

            <input
              type="number"
              placeholder="Amount (AED)"
              min="1"
              value={form.amount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > availableBalance) {
                  setAmountError(
                    "Entered amount exceeds available balance"
                  );
                } else {
                  setAmountError("");
                  setForm({ ...form, amount: value });
                }
              }}
            />

            {amountError && (
              <p className="wallet-error">{amountError}</p>
            )}

            <input
              type="text"
              placeholder="Bank Name"
              value={form.bank_name}
              onChange={(e) =>
                setForm({ ...form, bank_name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Account Title"
              value={form.account_title}
              onChange={(e) =>
                setForm({
                  ...form,
                  account_title: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Account Number"
              value={form.account_number}
              onChange={(e) =>
                setForm({
                  ...form,
                  account_number: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="IBAN"
              value={form.iban}
              onChange={(e) =>
                setForm({ ...form, iban: e.target.value })
              }
            />

            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setShowWithdraw(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleWithdraw}
                disabled={submitting || isInvalidAmount}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
