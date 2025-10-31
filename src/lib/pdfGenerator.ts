/**
 * PDF Generator for Invoices and Devis
 * Generates professional PDF documents with TND currency support
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatTND } from './currency';

interface InvoicePDFData {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  type: string;
  status: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  client_tax_id?: string;
  invoice_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount_percent: number;
    total: number;
  }>;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  payment_conditions?: string;
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
  const grayColor: [number, number, number] = [100, 100, 100];
  
  // Document title based on type
  const docType = data.type === 'devis' ? 'DEVIS' : 
                  data.type === 'avoir' ? 'AVOIR' :
                  data.type === 'complementaire' ? 'FACTURE COMPLÉMENTAIRE' :
                  'FACTURE';
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(docType, 15, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoice_number, 15, 30);
  
  // Company info (right side of header)
  doc.setFontSize(10);
  doc.text('HEKMA-FACTURES', 210 - 15, 15, { align: 'right' });
  doc.text('Gestion de Facturation', 210 - 15, 21, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Client Information
  let yPos = 50;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  yPos += 7;
  doc.text(data.client_name, 15, yPos);
  yPos += 5;
  
  if (data.client_email) {
    doc.text(data.client_email, 15, yPos);
    yPos += 5;
  }
  
  if (data.client_phone) {
    doc.text(`Tél: ${data.client_phone}`, 15, yPos);
    yPos += 5;
  }
  
  if (data.client_address) {
    doc.text(data.client_address, 15, yPos);
    yPos += 5;
  }
  
  if (data.client_city) {
    doc.text(data.client_city, 15, yPos);
    yPos += 5;
  }
  
  if (data.client_tax_id) {
    doc.text(`Matricule fiscal: ${data.client_tax_id}`, 15, yPos);
    yPos += 5;
  }
  
  // Invoice Details (right side)
  yPos = 50;
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS', 210 - 15, yPos, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  doc.text(`Date: ${new Date(data.invoice_date).toLocaleDateString('fr-FR')}`, 210 - 15, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Échéance: ${new Date(data.due_date).toLocaleDateString('fr-FR')}`, 210 - 15, yPos, { align: 'right' });
  yPos += 5;
  
  const statusLabels: Record<string, string> = {
    brouillon: 'Brouillon',
    envoyée: 'Envoyée',
    payée: 'Payée',
    en_retard: 'En retard',
    annulée: 'Annulée',
  };
  doc.text(`Statut: ${statusLabels[data.status] || data.status}`, 210 - 15, yPos, { align: 'right' });
  
  // Items Table
  yPos = Math.max(yPos, 95);
  
  const tableData = data.invoice_items.map(item => [
    item.description,
    item.quantity.toFixed(3),
    formatTND(item.unit_price),
    `${item.tax_rate}%`,
    item.discount_percent > 0 ? `${item.discount_percent}%` : '-',
    formatTND(item.total),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qté', 'Prix HT', 'TVA', 'Remise', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: 'right', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 35 },
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  yPos = finalY + 10;
  
  const totalsX = 210 - 15 - 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text('Sous-total HT:', totalsX, yPos);
  doc.text(formatTND(data.subtotal), 210 - 15, yPos, { align: 'right' });
  yPos += 6;
  
  if (data.discount_amount > 0) {
    doc.setTextColor(...grayColor);
    doc.text('Remise:', totalsX, yPos);
    doc.text(`-${formatTND(data.discount_amount)}`, 210 - 15, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos += 6;
  }
  
  doc.text('Montant TVA:', totalsX, yPos);
  doc.text(formatTND(data.tax_amount), 210 - 15, yPos, { align: 'right' });
  yPos += 8;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total TTC:', totalsX, yPos);
  doc.text(formatTND(data.total), 210 - 15, yPos, { align: 'right' });
  
  // Payment conditions
  if (data.payment_conditions) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Conditions de paiement:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    doc.text(data.payment_conditions, 15, yPos);
  }
  
  // Notes
  if (data.notes) {
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    
    const splitNotes = doc.splitTextToSize(data.notes, 180);
    doc.text(splitNotes, 15, yPos);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(
    `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
  
  return doc;
}

export function downloadInvoicePDF(data: InvoicePDFData) {
  const doc = generateInvoicePDF(data);
  const filename = `${data.invoice_number.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}

export function printInvoicePDF(data: InvoicePDFData) {
  const doc = generateInvoicePDF(data);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

export function getInvoicePDFBlob(data: InvoicePDFData): Blob {
  const doc = generateInvoicePDF(data);
  return doc.output('blob');
}
