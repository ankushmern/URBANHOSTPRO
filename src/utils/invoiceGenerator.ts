import { jsPDF } from 'jspdf';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  paymentId: string;
  orderId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  serviceDetail: string;
  quantity: number;
  serviceDate: string;
  serviceTime: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
}

export const downloadInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(180, 83, 9); // Amber-700
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CookMantra', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Executive Culinary & Home Chef Services', 15, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', 160, 20);

  // Invoice Meta Section
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${data.invoiceNumber}`, 15, 45);
  doc.text(`Invoice Date: ${new Date(data.date).toLocaleDateString('en-IN')}`, 15, 52);
  doc.text(`Booking ID: ${data.bookingId}`, 15, 59);

  doc.text(`Payment ID: ${data.paymentId}`, 120, 45);
  doc.text(`Payment Status: ${data.status.toUpperCase()}`, 120, 52);
  doc.text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, 120, 59);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 66, 195, 66);

  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text('Billed To:', 15, 75);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Customer Name: ${data.customerName}`, 15, 83);
  doc.text(`Mobile Number: ${data.customerPhone}`, 15, 90);
  if (data.customerEmail) {
    doc.text(`Email Address: ${data.customerEmail}`, 15, 97);
  }

  // Service Details Header Box
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 108, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Service Description', 20, 114);
  doc.text('Qty', 130, 114);
  doc.text('Amount (INR)', 160, 114);

  // Service Details Row
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.serviceDetail} (${data.serviceType.toUpperCase()})`, 20, 126);
  doc.text(`Date: ${data.serviceDate} | Time: ${data.serviceTime}`, 20, 132);
  doc.text(`${data.quantity}`, 133, 126);
  doc.text(`Rs. ${data.subtotal.toLocaleString('en-IN')}`, 160, 126);

  doc.line(15, 142, 195, 142);

  // Financial Breakdown
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 125, 152);
  doc.text(`Rs. ${data.subtotal.toLocaleString('en-IN')}`, 160, 152);

  doc.text('GST / Taxes (18%):', 125, 160);
  doc.text(`Rs. ${data.gstAmount.toLocaleString('en-IN')}`, 160, 160);

  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.5);
  doc.line(125, 166, 195, 166);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text('Total Amount Paid:', 125, 174);
  doc.text(`Rs. ${data.totalAmount.toLocaleString('en-IN')}`, 160, 174);

  // Footnote / Terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for booking with CookMantra Executive Chef Services!', 15, 210);
  doc.text('For queries or support, reach us at support@cookmantra.com or +91 98765 43210.', 15, 216);
  doc.text('This is a computer-generated tax invoice and requires no physical signature.', 15, 222);

  // Save PDF file
  doc.save(`Invoice_${data.invoiceNumber}_CookMantra.pdf`);
};
