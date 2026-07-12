import type { Metadata } from "next";

import { LegalPage } from "@/components/public/legal-page";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

export const metadata: Metadata = {
  title: "Terms of Service | Well Health Trade International",
  description:
    "Terms and conditions for using the Well Health Trade International website and online store.",
};

export default async function TermsOfServicePage() {
  const settings = await getPublicStoreSettings();

  return (
    <LegalPage
      description="Please read these terms carefully before using our website, placing an order, or creating an account."
      kind="terms"
      sections={[
        {
          title: "Agreement to these terms",
          body: (
            <p>
              By accessing {settings.storeName}’s website or placing an order, you agree to these
              Terms of Service and our{" "}
              <a className="font-medium text-brand-green-600 hover:text-brand-green-900" href="/privacy">
                Privacy Policy
              </a>
              . If you do not agree, please do not use our services.
            </p>
          ),
        },
        {
          title: "Eligibility and accounts",
          body: (
            <p>
              You must provide accurate information when registering or checking out. You are
              responsible for keeping your login credentials secure and for activity under your
              account. We may suspend accounts that appear fraudulent, abusive, or in breach of
              these terms.
            </p>
          ),
        },
        {
          title: "Products and information",
          body: (
            <p>
              Product descriptions, images, and prices are provided for information and may change
              without notice. Supplements are not intended to diagnose, treat, cure, or prevent any
              disease. Always follow label directions and consult a qualified healthcare
              professional if you have medical conditions, are pregnant, or take medication.
            </p>
          ),
        },
        {
          title: "Orders, pricing, and payment",
          body: (
            <>
              <p>
                An order is an offer to purchase. We may accept or decline an order (for example, due
                to stock, pricing errors, or suspected fraud). Prices are shown in Bangladeshi Taka
                (৳) unless stated otherwise.
              </p>
              <p>
                Available payment methods may include Cash on Delivery (COD) and online gateways such
                as SSLCommerz or bKash, subject to availability and our store settings. You agree to
                provide accurate billing and delivery details.
              </p>
            </>
          ),
        },
        {
          title: "Shipping and delivery",
          body: (
            <p>
              Delivery times and fees depend on your location and our current shipping zones
              (for example within Dhaka and outside Dhaka). Estimated delivery windows are
              indicative, not guarantees. Risk of loss passes according to our courier arrangements
              once the order is handed over for delivery, except where law requires otherwise.
            </p>
          ),
        },
        {
          title: "Cancellations, returns, and refunds",
          body: (
            <p>
              You may request cancellation before an order is shipped, subject to processing status.
              For damaged, incorrect, or defective products, contact us promptly with order details
              and photos where helpful. Refunds or replacements are handled case-by-case in line with
              applicable consumer protections in Bangladesh and our support policies. Opened or used
              supplements may not be returnable for hygiene and safety reasons, except where required
              by law.
            </p>
          ),
        },
        {
          title: "Promotions and coupons",
          body: (
            <p>
              Coupons and promotions are subject to their stated rules (validity dates, minimum
              order value, product exclusions, and usage limits). We may modify or withdraw offers
              at any time. Misuse of codes may result in cancellation of the related discount or
              order.
            </p>
          ),
        },
        {
          title: "Intellectual property",
          body: (
            <p>
              Website content, branding, logos, product photography, and copy belong to{" "}
              {settings.storeName} or our licensors. You may not copy, redistribute, or commercially
              exploit our content without prior written permission.
            </p>
          ),
        },
        {
          title: "Limitation of liability",
          body: (
            <p>
              To the fullest extent permitted by law, we are not liable for indirect, incidental, or
              consequential losses arising from use of the site or products, except where liability
              cannot be limited under Bangladeshi law. Our total liability related to any order is
              generally limited to the amount you paid for that order.
            </p>
          ),
        },
        {
          title: "Governing law",
          body: (
            <p>
              These terms are governed by the laws of Bangladesh. Disputes will first be addressed
              through our customer support team. If unresolved, disputes may be handled by the
              competent courts in Bangladesh.
            </p>
          ),
        },
        {
          title: "Contact",
          body: (
            <p>
              Questions about these Terms? Email{" "}
              <a
                className="font-medium text-brand-green-600 hover:text-brand-green-900"
                href={`mailto:${settings.supportEmail}`}
              >
                {settings.supportEmail}
              </a>{" "}
              or visit our{" "}
              <a className="font-medium text-brand-green-600 hover:text-brand-green-900" href="/contact">
                Contact page
              </a>
              .
            </p>
          ),
        },
      ]}
      storeName={settings.storeName}
      supportEmail={settings.supportEmail}
      title="Terms of Service"
      updatedAt="13 July 2026"
    />
  );
}
