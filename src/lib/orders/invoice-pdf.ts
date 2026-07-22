import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { AdminOrder } from "@/lib/orders/schemas";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/orders/schemas";
import {
  PDF_BRAND,
  PDF_MARGIN,
  applyFootersToAllPages,
  drawBrandHeaderBar,
  drawOrderCodeMark,
  formatPdfDateTime,
  moneyBdt,
  saveOrPrintPdf,
  storeContactLines,
} from "@/lib/orders/pdf-shared";
import type { StoreSettings } from "@/lib/settings/schemas";
import { defaultStoreSettings } from "@/lib/settings/schemas";

type InvoicePdfOptions = {
  order: AdminOrder;
  store?: StoreSettings;
  openPrint?: boolean;
};

/**
 * Professional A4 tax-style order invoice (download or print).
 */
export function downloadOrderInvoicePdf({
  order,
  store = defaultStoreSettings,
  openPrint = false,
}: InvoicePdfOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - PDF_MARGIN * 2;
  let y = 16;

  drawBrandHeaderBar(doc);

  // Store identity
  doc.setTextColor(...PDF_BRAND.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(store.storeName, PDF_MARGIN, y);

  y += 5.5;
  if (store.tagline) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text(store.tagline, PDF_MARGIN, y);
    y += 4.5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_BRAND.muted);
  for (const line of storeContactLines(store)) {
    doc.text(line, PDF_MARGIN, y, { maxWidth: contentW * 0.55 });
    y += 3.6;
  }

  // Invoice title + meta (right)
  const metaX = pageW - PDF_MARGIN;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...PDF_BRAND.green);
  doc.text("INVOICE", metaX, 18, { align: "right" });

  doc.setFillColor(...PDF_BRAND.soft);
  doc.roundedRect(pageW - PDF_MARGIN - 58, 22, 58, 28, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.muted);
  doc.text("INVOICE NO.", pageW - PDF_MARGIN - 54, 27);
  doc.setFontSize(9);
  doc.setTextColor(...PDF_BRAND.text);
  doc.text(order.orderNumber, pageW - PDF_MARGIN - 54, 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.muted);
  doc.text("ISSUED", pageW - PDF_MARGIN - 54, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_BRAND.text);
  doc.text(formatPdfDateTime(order.createdAt), pageW - PDF_MARGIN - 54, 42.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.muted);
  doc.text("STATUS", pageW - PDF_MARGIN - 54, 47.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_BRAND.green);
  doc.text(ORDER_STATUS_LABELS[order.status], pageW - PDF_MARGIN - 54, 51.5);

  y = Math.max(y, 54) + 4;

  doc.setDrawColor(...PDF_BRAND.line);
  doc.setLineWidth(0.35);
  doc.line(PDF_MARGIN, y, pageW - PDF_MARGIN, y);
  y += 7;

  // Bill / Ship boxes
  const colW = (contentW - 5) / 2;
  const boxTop = y;
  let billH = 14;
  let shipH = 14;

  const billLines = [order.email, order.phone].filter(Boolean);
  const shipLines = [
    order.shippingPhone,
    order.shippingDetails,
    `${order.shippingArea}, ${order.shippingDistrict}`,
    order.shippingZoneName ? `Zone: ${order.shippingZoneName}` : "",
  ].filter(Boolean);

  billH = 14 + billLines.length * 4 + 2;
  shipH = 14 + shipLines.length * 4 + 2;
  const boxH = Math.max(billH, shipH, 32);

  doc.setFillColor(...PDF_BRAND.paper);
  doc.roundedRect(PDF_MARGIN, boxTop, colW, boxH, 2, 2, "F");
  doc.roundedRect(PDF_MARGIN + colW + 5, boxTop, colW, boxH, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_BRAND.green);
  doc.text("BILL TO", PDF_MARGIN + 3.5, boxTop + 5.5);
  doc.text("SHIP TO", PDF_MARGIN + colW + 8.5, boxTop + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_BRAND.text);
  doc.text(order.customerName, PDF_MARGIN + 3.5, boxTop + 11.5, {
    maxWidth: colW - 7,
  });
  doc.text(order.shippingFullName, PDF_MARGIN + colW + 8.5, boxTop + 11.5, {
    maxWidth: colW - 7,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_BRAND.muted);
  let by = boxTop + 17;
  for (const line of billLines) {
    doc.text(line, PDF_MARGIN + 3.5, by, { maxWidth: colW - 7 });
    by += 4;
  }
  let sy = boxTop + 17;
  for (const line of shipLines) {
    doc.text(String(line), PDF_MARGIN + colW + 8.5, sy, { maxWidth: colW - 7 });
    sy += 4;
  }

  y = boxTop + boxH + 6;

  // Payment strip
  doc.setFillColor(...PDF_BRAND.soft);
  doc.roundedRect(PDF_MARGIN, y, contentW, 14, 2, 2, "F");

  const third = contentW / 3;
  const paymentCols = [
    { label: "PAYMENT METHOD", value: PAYMENT_METHOD_LABELS[order.paymentMethod] },
    { label: "PAYMENT STATUS", value: PAYMENT_STATUS_LABELS[order.paymentStatus] },
    {
      label: "AMOUNT DUE",
      value:
        order.paymentStatus === "PAID" ? "Paid in full" : moneyBdt(order.total),
    },
  ];

  paymentCols.forEach((col, index) => {
    const cx = PDF_MARGIN + third * index + 3.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text(col.label, cx, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(
      ...(index === 2 && order.paymentStatus !== "PAID"
        ? PDF_BRAND.dark
        : PDF_BRAND.text)
    );
    doc.text(col.value, cx, y + 10.5);
  });

  y += 18;

  // Paid stamp
  if (order.paymentStatus === "PAID") {
    doc.setDrawColor(...PDF_BRAND.green);
    doc.setLineWidth(0.7);
    doc.setTextColor(...PDF_BRAND.green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const stampX = pageW - PDF_MARGIN - 28;
    doc.roundedRect(stampX - 4, y - 2, 32, 10, 1.5, 1.5, "S");
    doc.text("PAID", stampX + 12, y + 5, { align: "center" });
  }

  // Line items
  autoTable(doc, {
    startY: y + (order.paymentStatus === "PAID" ? 10 : 0),
    margin: { left: PDF_MARGIN, right: PDF_MARGIN, bottom: 22 },
    head: [["#", "Item", "Qty", "Unit price", "Amount"]],
    body: order.items.map((item, index) => [
      String(index + 1),
      item.productSku
        ? `${item.productName}\nSKU: ${item.productSku}`
        : item.productName,
      String(item.quantity),
      moneyBdt(item.unitPrice),
      moneyBdt(item.lineTotal),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 2.6, bottom: 2.6, left: 2.2, right: 2.2 },
      textColor: PDF_BRAND.text,
      lineColor: PDF_BRAND.line,
      lineWidth: 0.18,
      valign: "middle",
    },
    headStyles: {
      fillColor: PDF_BRAND.dark,
      textColor: PDF_BRAND.white,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: PDF_BRAND.paper,
    },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY as number) + 7;

  // Totals
  const totalsW = 74;
  const totalsX = pageW - PDF_MARGIN - totalsW;
  const rows: Array<{
    label: string;
    value: string;
    bold?: boolean;
    accent?: boolean;
  }> = [{ label: "Subtotal", value: moneyBdt(order.subtotal) }];

  if (order.discount > 0) {
    rows.push({
      label: order.couponCode ? `Discount (${order.couponCode})` : "Discount",
      value: `− ${moneyBdt(order.discount)}`,
      accent: true,
    });
  }
  rows.push({
    label: "Shipping",
    value: order.shippingFee === 0 ? "Free" : moneyBdt(order.shippingFee),
  });
  rows.push({ label: "Total", value: moneyBdt(order.total), bold: true });

  // Order code mark on left of totals
  drawOrderCodeMark(doc, order.orderNumber, PDF_MARGIN, y, 52);

  let ty = y;
  for (const row of rows) {
    if (row.bold) {
      doc.setFillColor(...PDF_BRAND.soft);
      doc.roundedRect(totalsX - 2, ty - 4.2, totalsW + 2, 9.5, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...PDF_BRAND.dark);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...(row.accent ? PDF_BRAND.green : PDF_BRAND.muted));
    }
    doc.text(row.label, totalsX, ty);
    doc.setTextColor(
      ...(row.accent ? PDF_BRAND.green : row.bold ? PDF_BRAND.dark : PDF_BRAND.text)
    );
    doc.text(row.value, pageW - PDF_MARGIN, ty, { align: "right" });
    ty += row.bold ? 9 : 6;
  }

  y = Math.max(y + 18, ty + 4);

  if (order.notes?.trim()) {
    ensureSpace(doc, y, 28);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).__pdfY ?? y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.green);
    doc.text("ORDER NOTES", PDF_MARGIN, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.muted);
    const noteLines = doc.splitTextToSize(order.notes.trim(), contentW);
    doc.text(noteLines, PDF_MARGIN, y);
    y += noteLines.length * 3.8 + 5;
  }

  if (order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
    ensureSpace(doc, y, 22);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).__pdfY ?? y;
    doc.setDrawColor(...PDF_BRAND.gold);
    doc.setLineWidth(0.55);
    doc.setFillColor(...PDF_BRAND.amberBg);
    doc.roundedRect(PDF_MARGIN, y, contentW, 16, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text("CASH ON DELIVERY", PDF_MARGIN + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.amber);
    doc.text(
      `Please collect ${moneyBdt(order.total)} from the customer upon delivery.`,
      PDF_MARGIN + 4,
      y + 12
    );
    y += 20;
  }

  ensureSpace(doc, y, 20);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).__pdfY ?? y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_BRAND.dark);
  doc.text(`Thank you for choosing ${store.storeName}.`, pageW / 2, y, {
    align: "center",
  });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.muted);
  doc.text(
    "This is a computer-generated invoice and does not require a signature.",
    pageW / 2,
    y,
    { align: "center" }
  );

  applyFootersToAllPages(doc, store.storeName);
  saveOrPrintPdf(doc, `${order.orderNumber}-invoice.pdf`, openPrint);
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 20) {
    doc.addPage();
    drawBrandHeaderBar(doc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).__pdfY = 16;
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).__pdfY = y;
}
