import React from 'react';
import { downloadInvoicePDF, InvoiceData } from '../utils/invoiceGenerator';
import { CookMantraLogo } from './CookMantraLogo';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;

  const handleDownload = () => {
    downloadInvoicePDF(invoiceData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-xl w-full border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative my-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CookMantraLogo size="sm" showText={false} />
            <div>
              <h3 className="font-extrabold text-lg text-white">TAX INVOICE</h3>
              <p className="text-xs text-amber-100">Invoice #{invoiceData.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Invoice Body Preview */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Invoice Date</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {new Date(invoiceData.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Booking ID</span>
              <span className="font-bold text-gray-900 dark:text-white">{invoiceData.bookingId}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Payment ID</span>
              <span className="font-mono text-gray-900 dark:text-white">{invoiceData.paymentId}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Status</span>
              <span className="inline-block px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 uppercase">
                {invoiceData.status}
              </span>
            </div>
          </div>

          {/* Customer Billed To */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              Billed To
            </h4>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {invoiceData.customerName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Phone: +91 {invoiceData.customerPhone} {invoiceData.customerEmail ? `| Email: ${invoiceData.customerEmail}` : ''}
            </div>
          </div>

          {/* Service Table */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold">
                <tr>
                  <th className="p-3">Service</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-800 dark:text-gray-200">
                <tr>
                  <td className="p-3">
                    <div className="font-bold">{invoiceData.serviceDetail}</div>
                    <div className="text-[11px] text-gray-400">
                      {invoiceData.serviceDate} at {invoiceData.serviceTime}
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold">{invoiceData.quantity}</td>
                  <td className="p-3 text-right font-bold">₹{invoiceData.subtotal.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs text-right border-t border-gray-200 dark:border-zinc-800 pt-3">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal:</span>
              <span>₹{invoiceData.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>GST (18%):</span>
              <span>₹{invoiceData.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-black text-amber-600 dark:text-amber-400 pt-1 border-t border-gray-200 dark:border-zinc-800">
              <span>Total Paid:</span>
              <span>₹{invoiceData.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <i className="fas fa-file-pdf"></i> Download PDF Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
