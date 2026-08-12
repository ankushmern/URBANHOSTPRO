import React, { useState, useEffect } from 'react';
import { InvoiceModal } from './InvoiceModal';
import { InvoiceData } from '../utils/invoiceGenerator';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails?: {
    itemTitle: string;
    amount: string;
    date?: string;
    time?: string;
    bookingId?: string;
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  onPaymentSuccess: (method: string, bookingId?: string, utrNumber?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
}) => {
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'upi' | 'cod'>('razorpay');
  const [utrNumber, setUtrNumber] = useState('');
  const [hasPaidChecked, setHasPaidChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);

  const OWNER_UPI_ID = 'aankushrajput672@okhdfcbank';
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const itemTitle = bookingDetails?.itemTitle || 'Gourmet Culinary Chef Service';
  const basePrice = bookingDetails?.amount || '₹2,499';
  const numericPrice = parseInt(basePrice.replace(/[^0-9]/g, '')) || 2499;
  const gstAmount = Math.round((numericPrice * 0.18) * 100) / 100;
  const totalAmount = Math.round(numericPrice + gstAmount);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(OWNER_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const generateDemoUtr = () => {
    const randomUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setUtrNumber(randomUtr);
    setHasPaidChecked(true);
    setErrorMessage('');
  };

  const launchRazorpayCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderRes = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingDetails?.bookingId || `BK_${Date.now()}`,
          amount: totalAmount,
          currency: 'INR',
          customerName: bookingDetails?.name || 'CookMantra Guest',
          customerPhone: bookingDetails?.phone || '9999999999',
          customerEmail: bookingDetails?.email || '',
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize Razorpay payment order.');
      }

      const { orderId, paymentId: initPaymentId, keyId, invoiceNumber } = orderData;

      if (window.Razorpay) {
        const options = {
          key: keyId || 'rzp_test_cookmantra2026',
          amount: totalAmount * 100,
          currency: 'INR',
          name: 'CookMantra Executive Chefs',
          description: itemTitle,
          image: '/logo.png',
          order_id: orderId,
          handler: async function (response: any) {
            await handleVerifyBackendPayment({
              orderId,
              paymentId: response.razorpay_payment_id || initPaymentId,
              razorpaySignature: response.razorpay_signature,
              bookingId: bookingDetails?.bookingId,
              method: 'razorpay',
              invoiceNumber,
            });
          },
          prefill: {
            name: bookingDetails?.name || 'CookMantra Guest',
            contact: bookingDetails?.phone || '9876543210',
            email: bookingDetails?.email || 'guest@cookmantra.com',
          },
          notes: {
            bookingId: bookingDetails?.bookingId || 'BK_GENERAL',
          },
          theme: {
            color: '#d97706',
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        await handleVerifyBackendPayment({
          orderId,
          paymentId: initPaymentId,
          bookingId: bookingDetails?.bookingId,
          method: 'razorpay_simulated',
          invoiceNumber,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing payment.');
      setIsProcessing(false);
    }
  };

  const handleVerifyBackendPayment = async (verifyPayload: any) => {
    try {
      const verifyRes = await fetch('/api/v1/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Payment verification failed.');
      }

      const invData: InvoiceData = {
        invoiceNumber: verifyData.invoiceNumber || verifyPayload.invoiceNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(),
        paymentId: verifyPayload.paymentId,
        orderId: verifyPayload.orderId,
        bookingId: verifyPayload.bookingId || 'BK-2026-CONFIRMED',
        customerName: bookingDetails?.name || 'CookMantra Guest',
        customerPhone: bookingDetails?.phone || '9876543210',
        customerEmail: bookingDetails?.email || '',
        serviceType: 'culinary',
        serviceDetail: itemTitle,
        quantity: 1,
        serviceDate: bookingDetails?.date || 'As scheduled',
        serviceTime: bookingDetails?.time || '12:00 PM',
        subtotal: numericPrice,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
        paymentMethod: verifyPayload.method || 'Razorpay',
        status: 'Success',
      };

      setActiveInvoice(invData);
      setIsProcessing(false);
      setPaymentCompleted(true);

      onPaymentSuccess(verifyPayload.method, bookingDetails?.bookingId, verifyPayload.utrNumber);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed.');
      setIsProcessing(false);
    }
  };

  const handleCustomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (paymentMode === 'razorpay') {
      await launchRazorpayCheckout();
      return;
    }

    if (paymentMode === 'upi') {
      if (!hasPaidChecked) {
        setErrorMessage('Please check the box confirming you transferred via UPI App.');
        return;
      }

      if (!/^\d{12}$/.test(utrNumber.trim())) {
        setErrorMessage('Please enter a valid 12-digit UPI UTR ID.');
        return;
      }
    }

    setIsProcessing(true);

    const generatedOrderId = `order_upi_${Date.now()}`;
    const generatedPaymentId = `pay_upi_${Date.now()}`;
    const generatedInvoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await handleVerifyBackendPayment({
      orderId: generatedOrderId,
      paymentId: generatedPaymentId,
      razorpay_order_id: generatedOrderId,
      razorpay_payment_id: generatedPaymentId,
      bookingId: bookingDetails?.bookingId,
      method: paymentMode === 'cod' ? 'CASH_ON_ARRIVAL' : 'DIRECT_UPI',
      utrNumber: paymentMode === 'cod' ? 'CASH_ON_DELIVERY' : utrNumber.trim(),
      invoiceNumber: generatedInvoiceNumber,
    });
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800 shadow-2xl relative my-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-5 flex items-center justify-between border-b border-amber-500/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-md border border-amber-300/40">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-wide">Razorpay Gateway</span>
                  <span className="text-[10px] bg-amber-400/30 text-amber-100 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-amber-300/30">
                    Test Mode Active
                  </span>
                </div>
                <p className="text-[11px] text-amber-200">Secure 256-bit SSL Encrypted Payment</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>

          {paymentCompleted ? (
            <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                <i className="fas fa-check-circle"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Confirmed!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Amount Paid: <strong className="text-emerald-600 dark:text-emerald-400 text-base">₹{totalAmount.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              {activeInvoice && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-left space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Invoice Number:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{activeInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Payment ID:</span>
                    <span className="font-mono">{activeInvoice.paymentId}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (18% Included):</span>
                    <span>₹{activeInvoice.gstAmount}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {activeInvoice && (
                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 py-3 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-file-invoice"></i> View Tax Invoice
                  </button>
                )}
                <button
                  onClick={() => {
                    setPaymentCompleted(false);
                    onClose();
                  }}
                  className="flex-1 bg-gray-900 dark:bg-zinc-800 hover:bg-black text-white py-3 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="p-10 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-900/40 border-t-amber-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <i className="fas fa-lock"></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Initializing Razorpay Order...</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Verifying credentials and creating invoice</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Order Summary Box */}
              <div className="bg-gray-50 dark:bg-zinc-900/80 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span>Order Item</span>
                  <span>Amount</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white">
                  <span className="truncate pr-2">{itemTitle}</span>
                  <span>₹{numericPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-zinc-800">
                  <span>GST & Culinary Service Tax (18%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex items-center justify-between text-base font-extrabold text-amber-600 dark:text-amber-400 pt-2 border-t border-gray-200 dark:border-zinc-800">
                  <span>Total Payable</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPaymentMode('razorpay')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMode === 'razorpay'
                      ? 'bg-amber-500 text-gray-950 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-credit-card"></i>
                  <span>Razorpay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMode === 'upi'
                      ? 'bg-amber-500 text-gray-950 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-qrcode"></i>
                  <span>Direct UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('cod')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMode === 'cod'
                      ? 'bg-amber-500 text-gray-950 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-hand-holding-usd"></i>
                  <span>Pay Cash</span>
                </button>
              </div>

              <form onSubmit={handleCustomFormSubmit} className="space-y-4">
                {paymentMode === 'razorpay' ? (
                  <div className="p-5 bg-gradient-to-br from-amber-50/90 to-yellow-50/50 dark:from-zinc-900 dark:to-zinc-900/90 rounded-2xl border-2 border-amber-500/80 space-y-3">
                    <div className="flex items-center gap-3 text-gray-900 dark:text-white font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-gray-950 flex items-center justify-center">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <span>Razorpay Smart Popup</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Supports all major Indian Cards (Visa, MasterCard, RuPay), UPI (GPay, PhonePe, Paytm), NetBanking, and Wallets.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-semibold pt-1">
                      <span className="bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">UPI</span>
                      <span className="bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">Visa</span>
                      <span className="bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">MasterCard</span>
                      <span className="bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">NetBanking</span>
                    </div>
                  </div>
                ) : paymentMode === 'upi' ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900/90 rounded-2xl border-2 border-amber-500/80 shadow-md space-y-4">
                      <div className="flex items-center justify-between p-3 bg-amber-100/60 dark:bg-zinc-800/80 rounded-xl border border-amber-200 dark:border-zinc-700">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Receiver UPI ID
                          </span>
                          <p className="text-sm font-extrabold text-gray-900 dark:text-white font-mono selection:bg-amber-200">
                            {OWNER_UPI_ID}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <i className={`fas ${copiedUpi ? 'fa-check' : 'fa-copy'}`}></i>
                          <span>{copiedUpi ? 'Copied!' : 'Copy ID'}</span>
                        </button>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-amber-200 dark:border-zinc-700/80 flex flex-col sm:flex-row items-center gap-4 shadow-xs text-center sm:text-left">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            `upi://pay?pa=${OWNER_UPI_ID}&pn=CookMantra&am=${totalAmount}&cu=INR`
                          )}`}
                          alt="CookMantra Payment UPI QR"
                          className="w-32 h-32 rounded-xl shadow-md border-2 border-amber-400 bg-white p-1 shrink-0"
                        />
                        <div className="flex-1 space-y-2">
                          <p className="font-extrabold text-gray-900 dark:text-white text-sm">
                            Scan QR with any UPI App
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Pay ₹{totalAmount.toLocaleString('en-IN')} instantly
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="hasPaidCheck"
                          checked={hasPaidChecked}
                          onChange={e => setHasPaidChecked(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="hasPaidCheck" className="text-xs text-gray-800 dark:text-gray-200 font-semibold cursor-pointer">
                          I transferred ₹{totalAmount.toLocaleString('en-IN')} to <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{OWNER_UPI_ID}</span>
                        </label>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            12-Digit UPI UTR / Ref No. <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={generateDemoUtr}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fas fa-magic"></i> Auto-fill Test UTR
                          </button>
                        </div>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          placeholder="e.g. 102938475612"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50/60 dark:bg-zinc-900/90 rounded-2xl border border-amber-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-bold text-sm">
                      <i className="fas fa-hand-holding-usd text-xl"></i>
                      <span>Pay Cash to Chef After Meal</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      No online payment needed right now! Your booking will be instantly confirmed, and you can pay ₹{totalAmount.toLocaleString('en-IN')} directly in cash when the chef arrives.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-rose-500"></i>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-gray-950 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition cursor-pointer flex items-center justify-center gap-2.5 active:scale-98"
                >
                  <i className="fas fa-lock text-gray-950 text-base"></i>
                  <span>
                    {paymentMode === 'razorpay'
                      ? `Pay ₹${totalAmount.toLocaleString('en-IN')} via Razorpay`
                      : paymentMode === 'cod'
                      ? `Confirm Booking (Pay ₹${totalAmount.toLocaleString('en-IN')} Cash)`
                      : `Verify UPI Payment (₹${totalAmount.toLocaleString('en-IN')})`}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoiceData={activeInvoice}
      />
    </>
  );
};