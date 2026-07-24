import { jsPDF } from "jspdf";

import type { AdminOrder } from "@/lib/orders/schemas";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/orders/schemas";
import {
  formatPdfDateTime,
  moneyBdt,
  saveOrPrintPdf,
} from "@/lib/orders/pdf-shared";
import type { StoreSettings } from "@/lib/settings/schemas";
import { defaultStoreSettings, formatStoreAddress } from "@/lib/settings/schemas";

type PackingSlipOptions = {
  order: AdminOrder;
  store?: StoreSettings;
  openPrint?: boolean;
};

/** 80mm thermal roll — printable width leaves small side margins */
const RECEIPT_W = 80;
const MARGIN = 3.5;
const BLACK: [number, number, number] = [0, 0, 0];

/**
 * Black & white thermal packing slip / delivery invoice (80mm).
 * Tuned for POS receipt printers (e.g. G&G 80mm) — no color fills.
 */
export function downloadOrderPackingSlipPdf({
  order,
  store = defaultStoreSettings,
  openPrint = false,
}: PackingSlipOptions) {
  const contentW = RECEIPT_W - MARGIN * 2;
  const pageH = estimateReceiptHeight(order, store);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [RECEIPT_W, pageH],
  });

  let y = MARGIN + 1;

  // ── Header box (POS style) — measure wraps first so lines never overlap
  const headerBlocks = buildHeaderBlocks(doc, store, contentW - 4);
  const headerPadTop = 3.5;
  const headerPadBottom = 3;
  const headerInnerH =
    headerPadTop +
    headerBlocks.reduce((sum, block) => sum + block.height + block.gapAfter, 0) +
    headerPadBottom;

  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.35);
  doc.rect(MARGIN, y, contentW, headerInnerH, "S");

  doc.setTextColor(...BLACK);
  let hy = y + headerPadTop;
  for (const block of headerBlocks) {
    doc.setFont("helvetica", block.bold ? "bold" : "normal");
    doc.setFontSize(block.fontSize);
    for (const line of block.lines) {
      hy += block.lineHeight;
      doc.text(line, RECEIPT_W / 2, hy, { align: "center" });
    }
    hy += block.gapAfter;
  }

  y += headerInnerH + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PACKING SLIP", RECEIPT_W / 2, y, { align: "center" });
  y += 2;
  drawDivider(doc, y);
  y += 5;

  // ── Meta (label : value) ────────────────────────────────────────────
  const isCod = order.paymentMethod === "COD";
  const unitCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  y = drawMetaRow(doc, "Order No", order.orderNumber, y, contentW);
  y = drawMetaRow(doc, "Date", formatPdfDateTime(order.createdAt), y, contentW);
  y = drawMetaRow(
    doc,
    "Payment",
    PAYMENT_METHOD_LABELS[order.paymentMethod],
    y,
    contentW
  );
  y = drawMetaRow(
    doc,
    "Status",
    ORDER_STATUS_LABELS[order.status],
    y,
    contentW
  );
  y = drawMetaRow(doc, "Printed", formatPdfDateTime(new Date().toISOString()), y, contentW);

  y += 1;
  drawDivider(doc, y);
  y += 5;

  // ── Deliver to ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DELIVER TO", MARGIN, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const nameLines = doc.splitTextToSize(order.shippingFullName, contentW);
  doc.text(nameLines, MARGIN, y);
  y += nameLines.length * 4.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(order.shippingPhone, MARGIN, y);
  y += 4.2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const addressBlock = [
    order.shippingDetails,
    `${order.shippingArea}, ${order.shippingDistrict}`,
    order.shippingZoneName ? `Zone: ${order.shippingZoneName}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const addrLines = doc.splitTextToSize(addressBlock, contentW);
  doc.text(addrLines, MARGIN, y);
  y += addrLines.length * 3.6 + 2;

  drawDivider(doc, y);
  y += 4.5;

  // ── Items table header ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("ITEM", MARGIN, y);
  doc.text("QTY", RECEIPT_W - MARGIN - 18, y);
  doc.text("AMT", RECEIPT_W - MARGIN, y, { align: "right" });
  y += 1.5;
  drawDashedLine(doc, y);
  y += 4;

  // ── Line items ──────────────────────────────────────────────────────
  for (const item of order.items) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const nameWrapped = doc.splitTextToSize(item.productName, contentW - 28);
    doc.text(nameWrapped, MARGIN, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(item.quantity), RECEIPT_W - MARGIN - 18, y);
    doc.text(formatCompactMoney(item.lineTotal), RECEIPT_W - MARGIN, y, {
      align: "right",
    });

    y += Math.max(nameWrapped.length * 3.5, 4);

    if (item.productSku) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(`SKU: ${item.productSku}`, MARGIN, y);
      y += 3.2;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(
      `@ ${formatCompactMoney(item.unitPrice)} each`,
      MARGIN,
      y
    );
    y += 4.2;
  }

  drawDashedLine(doc, y);
  y += 4.5;

  // ── Totals ──────────────────────────────────────────────────────────
  y = drawTotalRow(doc, "Subtotal", moneyBdt(order.subtotal), y);
  if (order.discount > 0) {
    y = drawTotalRow(doc, "Discount", `- ${moneyBdt(order.discount)}`, y);
  }
  y = drawTotalRow(doc, "Shipping", moneyBdt(order.shippingFee), y);
  if (order.couponCode) {
    y = drawTotalRow(doc, "Coupon", order.couponCode, y);
  }

  y += 1;
  drawDivider(doc, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL", MARGIN, y);
  doc.text(moneyBdt(order.total), RECEIPT_W - MARGIN, y, { align: "right" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `${unitCount} pcs  ·  ${order.items.length} line${order.items.length === 1 ? "" : "s"}`,
    MARGIN,
    y
  );
  y += 4;

  // COD banner — black outline box only
  if (isCod && order.paymentStatus !== "PAID") {
    y += 1;
    const boxH = 12;
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN, y, contentW, boxH, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CASH ON DELIVERY", RECEIPT_W / 2, y + 4.5, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Collect ${moneyBdt(order.total)}`, RECEIPT_W / 2, y + 9.2, {
      align: "center",
    });
    y += boxH + 4;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Prepaid — no cash collection", MARGIN, y);
    y += 4;
  }

  // Notes
  if (order.notes?.trim()) {
    drawDashedLine(doc, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("NOTES", MARGIN, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const noteLines = doc.splitTextToSize(order.notes.trim(), contentW);
    doc.text(noteLines, MARGIN, y);
    y += noteLines.length * 3.4 + 2;
  }

  drawDivider(doc, y);
  y += 5;

  // Warehouse sign-off
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("WAREHOUSE CHECK", MARGIN, y);
  y += 5;

  y = drawSignLine(doc, "Packed by", y, contentW);
  y = drawSignLine(doc, "Checked by", y, contentW);
  y = drawSignLine(doc, "Dispatched", y, contentW);

  y += 2;
  drawDashedLine(doc, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Thank you for your order!", RECEIPT_W / 2, y, { align: "center" });
  y += 3.8;
  doc.setFontSize(6);
  doc.text(
    "Internal packing slip — not a tax invoice.",
    RECEIPT_W / 2,
    y,
    { align: "center" }
  );
  y += 3.5;
  doc.text("Verify SKU & qty before sealing.", RECEIPT_W / 2, y, {
    align: "center",
  });

  saveOrPrintPdf(doc, `${order.orderNumber}-packing-slip.pdf`, openPrint);
}

type HeaderBlock = {
  lines: string[];
  fontSize: number;
  bold: boolean;
  lineHeight: number;
  height: number;
  gapAfter: number;
};

/** Split store name / tagline / address so wrapped lines never collide. */
function buildHeaderBlocks(
  doc: jsPDF,
  store: StoreSettings,
  maxWidth: number
): HeaderBlock[] {
  const blocks: HeaderBlock[] = [];

  const pushBlock = (
    text: string,
    fontSize: number,
    bold: boolean,
    lineHeight: number,
    gapAfter: number
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    blocks.push({
      lines,
      fontSize,
      bold,
      lineHeight,
      height: lines.length * lineHeight,
      gapAfter,
    });
  };

  // Slightly smaller title if name is long — still wraps cleanly on 80mm
  const title = store.storeName.toUpperCase();
  const titleSize = title.length > 28 ? 9 : 11;
  pushBlock(title, titleSize, true, titleSize >= 11 ? 4.8 : 4.2, 1.5);

  if (store.tagline?.trim()) {
    pushBlock(store.tagline.trim(), 7, false, 3.4, 1);
  }

  const address = formatStoreAddress(store);
  if (address) {
    pushBlock(address, 6.5, false, 3.2, 1);
  }

  if (store.supportPhone) {
    pushBlock(store.supportPhone, 7, false, 3.4, 0);
  }

  return blocks;
}

function estimateReceiptHeight(order: AdminOrder, store: StoreSettings): number {
  // Generous header allowance for wrapped store name on 80mm
  const nameWraps = Math.ceil(store.storeName.length / 22);
  let h = 36 + nameWraps * 5;
  h += 28; // meta
  h += 22; // deliver to base
  h += Math.ceil(order.shippingDetails.length / 36) * 3.6;
  h += 8; // table head
  for (const item of order.items) {
    h += 8 + Math.ceil(item.productName.length / 28) * 3.5;
    if (item.productSku) h += 3.2;
  }
  h += 28; // totals
  if (order.paymentMethod === "COD" && order.paymentStatus !== "PAID") h += 16;
  if (order.notes?.trim()) {
    h += 10 + Math.ceil(order.notes.trim().length / 40) * 3.4;
  }
  h += 42; // signatures + footer
  return Math.max(160, Math.ceil(h + 8));
}

function drawDivider(doc: jsPDF, y: number) {
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y, RECEIPT_W - MARGIN, y);
}

function drawDashedLine(doc: jsPDF, y: number) {
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.25);
  const dash = 1.2;
  const gap = 0.8;
  let x = MARGIN;
  const end = RECEIPT_W - MARGIN;
  while (x < end) {
    const x2 = Math.min(x + dash, end);
    doc.line(x, y, x2, y);
    x += dash + gap;
  }
}

function drawMetaRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  contentW: number
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...BLACK);
  doc.text(`${label}:`, MARGIN, y);
  doc.setFont("helvetica", "bold");
  const valueLines = doc.splitTextToSize(value, contentW - 28);
  doc.text(valueLines, RECEIPT_W - MARGIN, y, { align: "right" });
  return y + Math.max(valueLines.length * 3.6, 4);
}

function drawTotalRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text(label, MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.text(value, RECEIPT_W - MARGIN, y, { align: "right" });
  return y + 4;
}

function drawSignLine(doc: jsPDF, label: string, y: number, contentW: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BLACK);
  doc.text(`${label}:`, MARGIN, y);
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.25);
  doc.line(MARGIN + 22, y + 0.5, MARGIN + contentW, y + 0.5);
  return y + 6;
}

/** Compact money for narrow columns (no "Tk " prefix clutter) */
function formatCompactMoney(value: number) {
  return value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
