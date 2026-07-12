import type { Metadata } from "next";

import { LegalPage } from "@/components/public/legal-page";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

export const metadata: Metadata = {
  title: "Privacy Policy | Well Health Trade International",
  description:
    "How Well Health Trade International collects, uses, and protects your personal information.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getPublicStoreSettings();

  return (
    <LegalPage
      description="Learn how we collect, use, store, and protect your personal information when you shop or contact Well Health."
      kind="privacy"
      sections={[
        {
          title: "Who we are",
          body: (
            <p>
              {settings.storeName} (“we”, “us”, or “our”) operates this website and online store.
              We sell health supplements and related products to customers in Bangladesh and provide
              customer support through phone, email, WhatsApp, and our contact forms.
            </p>
          ),
        },
        {
          title: "Information we collect",
          body: (
            <>
              <p>We may collect the following information when you use our services:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Name, email address, phone number, and delivery address</li>
                <li>Order details, payment method preference, and communication history</li>
                <li>Account details if you register (including profile preferences)</li>
                <li>Messages you send through our contact forms or support channels</li>
                <li>
                  Basic technical data such as browser type, device information, and pages visited
                  (for security and site improvement)
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "How we use your information",
          body: (
            <>
              <p>We use your information to:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Process and deliver orders, including shipping and payment confirmation</li>
                <li>Respond to enquiries, complaints, and product support requests</li>
                <li>Manage your customer account, wishlist, and order history</li>
                <li>Send important service updates related to your orders</li>
                <li>
                  Improve our website, product experience, and customer care (in anonymised or
                  aggregated form where possible)
                </li>
                <li>Comply with legal and regulatory obligations in Bangladesh</li>
              </ul>
            </>
          ),
        },
        {
          title: "Sharing of information",
          body: (
            <p>
              We do not sell your personal data. We may share limited information with trusted
              partners who help us operate — such as payment gateways (e.g. SSLCommerz / bKash),
              courier partners, email/SMS providers, and hosting services — only as needed to fulfil
              your order or support request. These partners are expected to protect your data and use
              it only for the agreed purpose.
            </p>
          ),
        },
        {
          title: "Cookies and similar technologies",
          body: (
            <p>
              Our site may use cookies or local storage to keep you signed in, remember cart and
              wishlist items, and improve site performance. You can control cookies through your
              browser settings; some features may not work fully if cookies are disabled.
            </p>
          ),
        },
        {
          title: "Data retention and security",
          body: (
            <p>
              We keep personal information only as long as needed for orders, support, legal
              compliance, and legitimate business records. We use reasonable technical and
              organisational safeguards to protect your data. No online transmission is completely
              secure, but we work continuously to reduce risk.
            </p>
          ),
        },
        {
          title: "Your choices and rights",
          body: (
            <p>
              You may request access to, correction of, or deletion of your personal information
              where applicable, subject to legal and operational requirements (for example, we may
              retain order records). To make a request, contact us at{" "}
              <a
                className="font-medium text-brand-green-600 hover:text-brand-green-900"
                href={`mailto:${settings.supportEmail}`}
              >
                {settings.supportEmail}
              </a>{" "}
              or via our{" "}
              <a className="font-medium text-brand-green-600 hover:text-brand-green-900" href="/contact">
                Contact page
              </a>
              .
            </p>
          ),
        },
        {
          title: "Policy updates",
          body: (
            <p>
              We may update this Privacy Policy from time to time. The “Last updated” date at the
              top of this page will change when we do. Continued use of our website after updates
              means you acknowledge the revised policy.
            </p>
          ),
        },
      ]}
      storeName={settings.storeName}
      supportEmail={settings.supportEmail}
      title="Privacy Policy"
      updatedAt="13 July 2026"
    />
  );
}
