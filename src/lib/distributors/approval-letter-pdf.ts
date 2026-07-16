import { jsPDF } from "jspdf";

import {
  businessTypeLabels,
  experienceLabels,
  type AdminDistributorApplication,
} from "@/lib/distributors/schemas";
import type { StoreSettings } from "@/lib/settings/schemas";
import { defaultStoreSettings, formatStoreAddress } from "@/lib/settings/schemas";

const FONT = "times" as const;

const BRAND = {
  dark: [11, 77, 58] as [number, number, number],
  green: [22, 135, 93] as [number, number, number],
  gold: [201, 162, 75] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  soft: [232, 245, 238] as [number, number, number],
  line: [229, 231, 235] as [number, number, number],
  text: [26, 29, 31] as [number, number, number],
};

function formatLetterDate(iso?: string | null) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildDistributorReference(applicationId: string) {
  const year = new Date().getFullYear();
  const suffix = applicationId.replace(/\W/g, "").slice(-6).toUpperCase();
  return `WHT-DIST-${year}-${suffix}`;
}

type ApprovalLetterInput = {
  application: Pick<
    AdminDistributorApplication,
    | "id"
    | "fullName"
    | "phone"
    | "email"
    | "division"
    | "district"
    | "businessName"
    | "businessType"
    | "experience"
    | "coverageArea"
    | "reviewedAt"
    | "createdAt"
  >;
  store?: StoreSettings;
};

export function buildDistributorApprovalLetterPdf({
  application,
  store = defaultStoreSettings,
}: ApprovalLetterInput) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const reference = buildDistributorReference(application.id);
  const letterDate = formatLetterDate(application.reviewedAt ?? application.createdAt);

  // Header bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageW, 10, "F");
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 10, pageW, 1.5, "F");

  let y = 20;
  doc.setTextColor(...BRAND.dark);
  doc.setFont(FONT, "bold");
  doc.setFontSize(17);
  doc.text(store.storeName, margin, y);

  y += 6;
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  if (store.tagline) {
    doc.setFont(FONT, "italic");
    doc.text(store.tagline, margin, y);
    doc.setFont(FONT, "normal");
    y += 4;
  }
  doc.text(
    [store.addressLine1, store.addressLine2].filter(Boolean).join(", "),
    margin,
    y
  );
  y += 4;
  doc.text(`${store.city}, ${store.country}`, margin, y);
  y += 4;
  doc.text(`${store.supportPhone}  ·  ${store.supportEmail}`, margin, y);

  // Badge
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.green);
  doc.text("DISTRIBUTOR APPROVAL", pageW - margin, 22, { align: "right" });
  doc.setFont(FONT, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Ref: ${reference}`, pageW - margin, 28, { align: "right" });
  doc.text(`Date: ${letterDate}`, pageW - margin, 33, { align: "right" });

  y = Math.max(y, 38) + 8;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Recipient
  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.text);
  doc.text("To", margin, y);
  y += 5;
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.text(application.fullName, margin, y);
  y += 5;
  if (application.businessName) {
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
    doc.text(application.businessName, margin, y);
    y += 5;
  }
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(`${application.district}, ${application.division}, Bangladesh`, margin, y);
  y += 4;
  doc.text(`${application.phone}  ·  ${application.email}`, margin, y);
  y += 10;

  doc.setFont(FONT, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.dark);
  doc.text("Subject: Authorized Distributor Partnership Approval", margin, y);
  y += 10;

  const paragraphs = [
    `Dear ${application.fullName},`,
    `We are pleased to inform you that Well Health Trade International has approved your application to serve as an authorized distributor / trade partner for our clinical premium health supplement range.`,
    `This letter confirms your partnership status and authorizes you to represent our products within the territory outlined below, subject to our standard distributor terms, brand presentation guidelines, and order coordination policies.`,
    `Our partnership team will contact you shortly regarding onboarding, product catalogue access, pricing, and fulfillment procedures. Please retain this approval letter for your records.`,
  ];

  doc.setFont(FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.text);
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5.2 + 3;
  }

  y += 2;
  doc.setFillColor(...BRAND.soft);
  doc.roundedRect(margin, y, contentW, 34, 2, 2, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.green);
  doc.text("APPROVED TERRITORY & PROFILE", margin + 4, y + 6);

  const details = [
    ["Division", application.division],
    ["District", application.district],
    ["Coverage area", application.coverageArea],
    ["Business type", businessTypeLabels[application.businessType]],
    ["Experience", experienceLabels[application.experience]],
  ];

  let detailY = y + 12;
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  for (const [label, value] of details) {
    doc.setTextColor(...BRAND.muted);
    doc.text(`${label}:`, margin + 4, detailY);
    doc.setTextColor(...BRAND.text);
    doc.setFont(FONT, "bold");
    doc.text(value, margin + 34, detailY, { maxWidth: contentW - 38 });
    doc.setFont(FONT, "normal");
    detailY += 5;
  }

  y += 42;
  doc.setFont(FONT, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.dark);
  doc.text("Partnership conditions", margin, y);
  y += 5;
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.text);

  const terms = [
    "Maintain brand integrity, product storage standards, and ethical sales practices.",
    "Coordinate orders and stock requests through official Well Health channels.",
    "Represent only genuine Well Health Trade International products within the approved territory.",
    "This approval remains valid subject to continued compliance with company policies.",
  ];

  for (const term of terms) {
    const lines = doc.splitTextToSize(`• ${term}`, contentW - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4.5 + 1;
  }

  y += 6;
  doc.text("Congratulations and welcome to the Well Health partner network.", margin, y);
  y += 10;
  doc.text("Yours sincerely,", margin, y);
  y += 14;
  doc.setFont(FONT, "bold");
  doc.text("Partnership & Distribution Team", margin, y);
  y += 5;
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(store.storeName, margin, y);

  const footerH = 28;
  const footerTop = pageH - footerH;
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, footerTop, pageW, footerH, "F");
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, footerTop, pageW, 0.8, "F");

  doc.setFont(FONT, "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Contact for Verification", margin, footerTop + 6);
  doc.setFont(FONT, "normal");
  doc.setFontSize(7.5);
  doc.text(store.storeName, margin, footerTop + 11);
  doc.text(formatStoreAddress(store), margin, footerTop + 15.5, { maxWidth: contentW - 50 });
  doc.text(store.supportPhone, pageW - margin, footerTop + 11, { align: "right" });
  doc.setFontSize(7);
  doc.setTextColor(230, 230, 230);
  doc.text(
    "This is a system-generated approval letter. For verification, quote the reference number above.",
    pageW / 2,
    footerTop + 23,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const filename = `${reference}-approval-letter.pdf`;

  return { filename, base64, reference };
}
