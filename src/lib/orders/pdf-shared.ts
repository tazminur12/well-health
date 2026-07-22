import type { jsPDF } from "jspdf";

import type { StoreSettings } from "@/lib/settings/schemas";
import { formatStoreAddress } from "@/lib/settings/schemas";

export const PDF_BRAND = {
  dark: [11, 77, 58] as [number, number, number],
  green: [22, 135, 93] as [number, number, number],
  gold: [201, 162, 75] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  soft: [232, 245, 238] as [number, number, number],
  line: [229, 231, 235] as [number, number, number],
  text: [26, 29, 31] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  paper: [248, 250, 249] as [number, number, number],
  amberBg: [255, 251, 235] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
};

export const PDF_MARGIN = 14;

export function moneyBdt(value: number) {
  return `Tk ${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPdfDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPdfDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function storeContactLines(store: StoreSettings) {
  return [
    formatStoreAddress(store),
    `${store.supportPhone}  ·  ${store.supportEmail}`,
    store.workingHours ? `Hours: ${store.workingHours}` : "",
  ].filter(Boolean);
}

/** Top brand strip used on invoices / slips */
export function drawBrandHeaderBar(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...PDF_BRAND.dark);
  doc.rect(0, 0, pageW, 7, "F");
  doc.setFillColor(...PDF_BRAND.gold);
  doc.rect(0, 7, pageW, 1.4, "F");
}

/** Bottom brand strip + page number */
export function drawBrandFooter(
  doc: jsPDF,
  storeName: string,
  page: number,
  totalPages: number
) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...PDF_BRAND.line);
  doc.setLineWidth(0.25);
  doc.line(PDF_MARGIN, pageH - 14, pageW - PDF_MARGIN, pageH - 14);

  doc.setFillColor(...PDF_BRAND.dark);
  doc.rect(0, pageH - 9, pageW, 9, "F");

  doc.setTextColor(...PDF_BRAND.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(storeName, PDF_MARGIN, pageH - 3.5);
  doc.text(`Page ${page} of ${totalPages}`, pageW - PDF_MARGIN, pageH - 3.5, {
    align: "right",
  });
}

/** Simple Code39-style bars for visual scan of order number (not a real barcode). */
export function drawOrderCodeMark(
  doc: jsPDF,
  code: string,
  x: number,
  y: number,
  maxWidth = 55
) {
  const pattern = code.replace(/\W/g, "").toUpperCase();
  if (!pattern) return;

  let cursor = x;
  const barH = 8;
  const unit = Math.min(0.55, maxWidth / (pattern.length * 3.2));

  doc.setFillColor(...PDF_BRAND.text);
  for (let i = 0; i < pattern.length; i += 1) {
    const wide = pattern.charCodeAt(i) % 2 === 0;
    const w = wide ? unit * 1.8 : unit;
    doc.rect(cursor, y, w, barH, "F");
    cursor += w + unit * 0.7;
    if (cursor > x + maxWidth) break;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_BRAND.text);
  doc.text(code, x + maxWidth / 2, y + barH + 4, { align: "center" });
}

export function saveOrPrintPdf(doc: jsPDF, filename: string, openPrint: boolean) {
  if (openPrint) {
    const blobUrl = doc.output("bloburl");
    const win = window.open(blobUrl);
    if (win) {
      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch {
          // Viewer print is available if auto-print is blocked
        }
      }, 450);
    } else {
      doc.save(filename);
    }
    return;
  }
  doc.save(filename);
}

export function applyFootersToAllPages(doc: jsPDF, storeName: string) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    drawBrandFooter(doc, storeName, page, total);
  }
}
