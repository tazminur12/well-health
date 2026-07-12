import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { AdminOrder } from "@/lib/orders/schemas";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/orders/schemas";
import type { StoreSettings } from "@/lib/settings/schemas";
import { defaultStoreSettings } from "@/lib/settings/schemas";

const BRAND = {
  dark: [11, 77, 58] as [number, number, number],
  green: [22, 135, 93] as [number, number, number],
  gold: [201, 162, 75] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  soft: [232, 245, 238] as [number, number, number],
  line: [229, 231, 235] as [number, number, number],
  text: [26, 29, 31] as [number, number, number],
};

function money(value: number) {
  return `Tk ${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type InvoicePdfOptions = {
  order: AdminOrder;
  store?: StoreSettings;
  /** open print dialog after generate */
  openPrint?: boolean;
};

/**
 * Builds a professional A4 order invoice PDF and downloads (or opens print).
 */
export function downloadOrderInvoicePdf({
  order,
  store = defaultStoreSettings,
  openPrint = false,
}: InvoicePdfOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 16;

  // Top brand bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageW, 8, "F");
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 8, pageW, 1.2, "F");

  y = 18;

  // Store identity
  doc.setTextColor(...BRAND.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(store.storeName, margin, y);

  y += 6;
  if (store.tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(store.tagline, margin, y);
    y += 5;
  }

  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  const storeLines = [
    [store.addressLine1, store.addressLine2].filter(Boolean).join(", "),
    `${store.city}, ${store.country}`,
    `${store.supportPhone}  ·  ${store.supportEmail}`,
  ].filter(Boolean);
  for (const line of storeLines) {
    doc.text(line, margin, y);
    y += 4;
  }

  // Invoice badge (right)
  const badgeX = pageW - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.green);
  doc.text("INVOICE", badgeX, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(...BRAND.text);
  doc.text(order.orderNumber, badgeX, 28, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Issued ${formatDate(order.createdAt)}`, badgeX, 33, { align: "right" });
  doc.text(
    `Status: ${ORDER_STATUS_LABELS[order.status]}`,
    badgeX,
    37.5,
    { align: "right" }
  );

  y = Math.max(y, 44) + 4;

  // Divider
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Bill to / Ship to boxes
  const colW = (contentW - 6) / 2;
  const boxH = 36;

  doc.setFillColor(...BRAND.soft);
  doc.roundedRect(margin, y, colW, boxH, 2, 2, "F");
  doc.roundedRect(margin + colW + 6, y, colW, boxH, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.green);
  doc.text("BILL TO", margin + 4, y + 6);
  doc.text("SHIP TO", margin + colW + 10, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.text);
  doc.text(order.customerName, margin + 4, y + 12, { maxWidth: colW - 8 });
  doc.text(order.shippingFullName, margin + colW + 10, y + 12, {
    maxWidth: colW - 8,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);

  const billLines = [order.email, order.phone].filter(Boolean);
  let billY = y + 17;
  for (const line of billLines) {
    doc.text(line, margin + 4, billY, { maxWidth: colW - 8 });
    billY += 4;
  }

  const shipLines = [
    order.shippingPhone,
    order.shippingDetails,
    `${order.shippingArea}, ${order.shippingDistrict}`,
    order.shippingZoneName ? `Zone: ${order.shippingZoneName}` : "",
  ].filter(Boolean);
  let shipY = y + 17;
  for (const line of shipLines) {
    doc.text(String(line), margin + colW + 10, shipY, { maxWidth: colW - 8 });
    shipY += 4;
  }

  y += boxH + 8;

  // Meta row: payment
  doc.setFillColor(248, 250, 249);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text("PAYMENT METHOD", margin + 4, y + 5);
  doc.text("PAYMENT STATUS", margin + contentW / 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);
  doc.text(PAYMENT_METHOD_LABELS[order.paymentMethod], margin + 4, y + 9.5);
  doc.text(PAYMENT_STATUS_LABELS[order.paymentStatus], margin + contentW / 2, y + 9.5);

  if (order.paymentMethod === "COD") {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.gold);
    doc.text("Collect cash on delivery", pageW - margin - 4, y + 9.5, {
      align: "right",
    });
  }

  y += 18;

  // Line items
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Product", "Qty", "Unit price", "Line total"]],
    body: order.items.map((item, index) => [
      String(index + 1),
      item.productName,
      String(item.quantity),
      money(item.unitPrice),
      money(item.lineTotal),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.4,
      textColor: BRAND.text,
      lineColor: BRAND.line,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND.dark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 249],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 34, halign: "right" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY as number) + 8;

  // Totals panel (right)
  const totalsW = 72;
  const totalsX = pageW - margin - totalsW;
  const rows: Array<{ label: string; value: string; bold?: boolean; green?: boolean }> = [
    { label: "Subtotal", value: money(order.subtotal) },
  ];
  if (order.discount > 0) {
    rows.push({
      label: order.couponCode ? `Discount (${order.couponCode})` : "Discount",
      value: `− ${money(order.discount)}`,
      green: true,
    });
  }
  rows.push({
    label: "Shipping",
    value: order.shippingFee === 0 ? "Free" : money(order.shippingFee),
  });
  rows.push({ label: "Total due", value: money(order.total), bold: true });

  let ty = y;
  for (const row of rows) {
    if (row.bold) {
      doc.setFillColor(...BRAND.soft);
      doc.roundedRect(totalsX - 2, ty - 4.5, totalsW + 2, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const labelColor = row.green ? BRAND.green : BRAND.muted;
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    }
    doc.text(row.label, totalsX, ty);
    const valueColor = row.green ? BRAND.green : row.bold ? BRAND.dark : BRAND.text;
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    doc.text(row.value, pageW - margin, ty, { align: "right" });
    ty += row.bold ? 8 : 6;
  }

  y = Math.max(y + rows.length * 6 + 6, ty + 4);

  // Notes
  if (order.notes?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.green);
    doc.text("ORDER NOTES", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    const noteLines = doc.splitTextToSize(order.notes.trim(), contentW);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 6;
  }

  // COD cash box
  if (order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
    doc.setDrawColor(...BRAND.gold);
    doc.setLineWidth(0.6);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y, contentW, 16, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    doc.text("CASH ON DELIVERY", margin + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(
      `Please collect ${money(order.total)} from the customer upon delivery.`,
      margin + 4,
      y + 12
    );
    y += 22;
  }

  // Footer
  const footerY = Math.max(y + 10, 270);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageW - margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.dark);
  doc.text("Thank you for choosing Well Health.", pageW / 2, footerY + 7, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    "This is a computer-generated invoice. For support, contact us using the details above.",
    pageW / 2,
    footerY + 12,
    { align: "center" }
  );

  // Bottom brand strip
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 289, pageW, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(store.storeName, pageW / 2, 294, { align: "center" });

  const filename = `${order.orderNumber}.pdf`;

  if (openPrint) {
    const blobUrl = doc.output("bloburl");
    const win = window.open(blobUrl);
    if (win) {
      // Give the browser a moment to load the PDF before print
      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch {
          // user can print from viewer
        }
      }, 400);
    } else {
      doc.save(filename);
    }
    return;
  }

  doc.save(filename);
}
