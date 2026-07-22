import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { AdminOrder } from "@/lib/orders/schemas";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/orders/schemas";
import {
  PDF_BRAND,
  PDF_MARGIN,
  applyFootersToAllPages,
  drawBrandHeaderBar,
  drawOrderCodeMark,
  formatPdfDate,
  formatPdfDateTime,
  moneyBdt,
  saveOrPrintPdf,
  storeContactLines,
} from "@/lib/orders/pdf-shared";
import type { StoreSettings } from "@/lib/settings/schemas";
import { defaultStoreSettings } from "@/lib/settings/schemas";

type PackingSlipOptions = {
  order: AdminOrder;
  store?: StoreSettings;
  openPrint?: boolean;
};

/**
 * Warehouse / courier print-ready packing slip (A4).
 * Focus: large ship-to, pick checklist, COD collect amount — no item prices.
 */
export function downloadOrderPackingSlipPdf({
  order,
  store = defaultStoreSettings,
  openPrint = false,
}: PackingSlipOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - PDF_MARGIN * 2;
  let y = 15;

  drawBrandHeaderBar(doc);

  // Header row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PDF_BRAND.dark);
  doc.text(store.storeName, PDF_MARGIN, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...PDF_BRAND.green);
  doc.text("PACKING SLIP", pageW - PDF_MARGIN, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_BRAND.muted);
  const contact = storeContactLines(store);
  if (contact[0]) doc.text(contact[0], PDF_MARGIN, y, { maxWidth: contentW * 0.55 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_BRAND.text);
  doc.text(order.orderNumber, pageW - PDF_MARGIN, y, { align: "right" });

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_BRAND.muted);
  if (contact[1]) doc.text(contact[1], PDF_MARGIN, y);
  doc.text(`Printed ${formatPdfDateTime(new Date().toISOString())}`, pageW - PDF_MARGIN, y, {
    align: "right",
  });

  y += 6;
  doc.setDrawColor(...PDF_BRAND.line);
  doc.setLineWidth(0.4);
  doc.line(PDF_MARGIN, y, pageW - PDF_MARGIN, y);
  y += 6;

  // Meta chips row
  const chipH = 16;
  const chipGap = 3;
  const chipW = (contentW - chipGap * 2) / 3;
  const chips = [
    { label: "ORDER DATE", value: formatPdfDate(order.createdAt) },
    { label: "FULFILLMENT", value: ORDER_STATUS_LABELS[order.status] },
    { label: "PAYMENT", value: PAYMENT_METHOD_LABELS[order.paymentMethod] },
  ];

  chips.forEach((chip, index) => {
    const cx = PDF_MARGIN + index * (chipW + chipGap);
    doc.setFillColor(...PDF_BRAND.paper);
    doc.roundedRect(cx, y, chipW, chipH, 1.8, 1.8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text(chip.label, cx + 3, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.text);
    doc.text(chip.value, cx + 3, y + 11.5, { maxWidth: chipW - 6 });
  });

  y += chipH + 6;

  // Ship-to — large for courier
  const isCod = order.paymentMethod === "COD";
  const shipBoxH = isCod ? 48 : 42;

  doc.setFillColor(...PDF_BRAND.soft);
  doc.roundedRect(PDF_MARGIN, y, contentW * 0.62, shipBoxH, 2.5, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_BRAND.green);
  doc.text("DELIVER TO", PDF_MARGIN + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PDF_BRAND.text);
  doc.text(order.shippingFullName, PDF_MARGIN + 4, y + 14, {
    maxWidth: contentW * 0.62 - 10,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_BRAND.dark);
  doc.text(order.shippingPhone, PDF_MARGIN + 4, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_BRAND.text);
  const addressBlock = [
    order.shippingDetails,
    `${order.shippingArea}, ${order.shippingDistrict}`,
    order.shippingZoneName ? `Zone: ${order.shippingZoneName}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const addrLines = doc.splitTextToSize(addressBlock, contentW * 0.62 - 10);
  doc.text(addrLines, PDF_MARGIN + 4, y + 28);

  // Right: barcode + COD / units summary
  const rightX = PDF_MARGIN + contentW * 0.62 + 4;
  const rightW = contentW * 0.38 - 4;

  doc.setFillColor(...PDF_BRAND.paper);
  doc.roundedRect(rightX, y, rightW, shipBoxH, 2.5, 2.5, "F");

  drawOrderCodeMark(doc, order.orderNumber, rightX + 4, y + 5, rightW - 8);

  const unitCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.muted);
  doc.text("UNITS / LINES", rightX + 4, y + 24);
  doc.setFontSize(12);
  doc.setTextColor(...PDF_BRAND.dark);
  doc.text(`${unitCount} pcs  ·  ${order.items.length} lines`, rightX + 4, y + 31);

  if (isCod) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_BRAND.amber);
    doc.text("COLLECT COD", rightX + 4, y + 38);
    doc.setFontSize(11);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(moneyBdt(order.total), rightX + 4, y + 44);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text("Prepaid — no cash collection", rightX + 4, y + 40, {
      maxWidth: rightW - 8,
    });
  }

  y += shipBoxH + 7;

  if (isCod && order.paymentStatus !== "PAID") {
    doc.setDrawColor(...PDF_BRAND.gold);
    doc.setLineWidth(0.7);
    doc.setFillColor(...PDF_BRAND.amberBg);
    doc.roundedRect(PDF_MARGIN, y, contentW, 12, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_BRAND.dark);
    doc.text(
      `CASH ON DELIVERY — Collect ${moneyBdt(order.total)} before handover`,
      PDF_MARGIN + 4,
      y + 7.5
    );
    y += 16;
  }

  // Pick checklist — drawn checkboxes for warehouse (Helvetica has no ☐ glyph)
  autoTable(doc, {
    startY: y,
    margin: { left: PDF_MARGIN, right: PDF_MARGIN, bottom: 48 },
    head: [["", "Qty", "SKU", "Product", "Done"]],
    body: order.items.map((item) => [
      "",
      String(item.quantity),
      item.productSku || "—",
      item.productName,
      "",
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      cellPadding: { top: 3.2, bottom: 3.2, left: 2.2, right: 2.2 },
      textColor: PDF_BRAND.text,
      lineColor: PDF_BRAND.line,
      lineWidth: 0.25,
      valign: "middle",
      minCellHeight: 9,
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
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 14, halign: "center", fontStyle: "bold", fontSize: 11 },
      2: { cellWidth: 32, fontSize: 8, textColor: PDF_BRAND.muted },
      3: { cellWidth: "auto", fontStyle: "bold" },
      4: { cellWidth: 16, halign: "center" },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index !== 0 && data.column.index !== 4) return;
      const size = 4.2;
      const cx = data.cell.x + (data.cell.width - size) / 2;
      const cy = data.cell.y + (data.cell.height - size) / 2;
      doc.setDrawColor(...PDF_BRAND.dark);
      doc.setLineWidth(0.45);
      doc.rect(cx, cy, size, size, "S");
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY as number) + 8;

  // Special instructions
  if (order.notes?.trim()) {
    const noteLines = doc.splitTextToSize(order.notes.trim(), contentW - 8);
    const noteH = 10 + noteLines.length * 4;
    ensurePackingSpace(doc, y, noteH + 6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).__pdfY ?? y;

    doc.setDrawColor(...PDF_BRAND.gold);
    doc.setLineWidth(0.45);
    doc.setFillColor(255, 252, 245);
    doc.roundedRect(PDF_MARGIN, y, contentW, noteH, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.amber);
    doc.text("SPECIAL INSTRUCTIONS", PDF_MARGIN + 4, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.text);
    doc.text(noteLines, PDF_MARGIN + 4, y + 11);
    y += noteH + 6;
  }

  // Signature block — print-ready warehouse QC
  ensurePackingSpace(doc, y, 36);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).__pdfY ?? y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_BRAND.green);
  doc.text("WAREHOUSE CHECKLIST", PDF_MARGIN, y);
  y += 5;

  const sigW = (contentW - 6) / 3;
  const labels = ["Packed by", "Checked by", "Dispatched"];
  labels.forEach((label, index) => {
    const sx = PDF_MARGIN + index * (sigW + 3);
    doc.setFillColor(...PDF_BRAND.paper);
    doc.roundedRect(sx, y, sigW, 26, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text(label.toUpperCase(), sx + 3, y + 5);
    doc.setDrawColor(...PDF_BRAND.line);
    doc.setLineWidth(0.3);
    doc.line(sx + 3, y + 14, sx + sigW - 3, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text("Name / Sign", sx + 3, y + 18.5);
    doc.line(sx + 3, y + 23, sx + sigW - 3, y + 23);
  });

  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.muted);
  doc.text(
    "Internal use only — packing slip is not a tax invoice. Verify SKU & quantity before sealing.",
    pageW / 2,
    y,
    { align: "center" }
  );

  applyFootersToAllPages(doc, store.storeName);
  saveOrPrintPdf(doc, `${order.orderNumber}-packing-slip.pdf`, openPrint);
}

function ensurePackingSpace(doc: jsPDF, y: number, needed: number) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 22) {
    doc.addPage();
    drawBrandHeaderBar(doc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).__pdfY = 16;
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).__pdfY = y;
}
