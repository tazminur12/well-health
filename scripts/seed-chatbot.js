const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.chatbotQa.count();
  if (count > 0) {
    console.log("Chatbot QAs already present:", count);
    return;
  }

  await prisma.chatbotQa.createMany({
    data: [
      {
        question: "How long does delivery take?",
        aliases: ["delivery time", "shipping time", "কতদিনে ডেলিভারি"],
        keywords: ["delivery", "shipping", "ডেলিভারি"],
        answer:
          "Most orders are processed within 24 hours and typically delivered in 2–5 business days across Bangladesh, depending on your district. Dhaka orders are often faster.",
        category: "Shipping",
        isQuickReply: true,
        sortOrder: 0,
      },
      {
        question: "Do you offer Cash on Delivery?",
        aliases: ["COD available?", "ক্যাশ অন ডেলিভারি আছে?", "cash on delivery"],
        keywords: ["cod", "cash", "ক্যাশ"],
        answer:
          "Yes — Cash on Delivery (COD) is available for eligible areas. You will see COD as a payment option at checkout when it is supported for your address.",
        category: "Payment",
        isQuickReply: true,
        sortOrder: 1,
      },
      {
        question: "How can I track my order?",
        aliases: ["track order", "order status", "অর্ডার ট্র্যাক"],
        keywords: ["track", "order", "status", "ট্র্যাক"],
        answer:
          "Sign in and open My Orders to see live status. Guest checkout? Use your confirmation email or contact us with your order number (WHT-…).",
        category: "Orders",
        isQuickReply: true,
        sortOrder: 2,
      },
      {
        question: "Are your products lab tested?",
        aliases: ["lab tested?", "quality"],
        keywords: ["lab", "tested", "quality", "GMP"],
        answer:
          "Yes. Our supplements follow quality-focused sourcing and lab-tested standards so you can trust what is in every bottle.",
        category: "Products",
        isQuickReply: false,
        sortOrder: 3,
      },
      {
        question: "What is your return policy?",
        aliases: ["return", "refund", "রিটার্ন"],
        keywords: ["return", "refund", "রিটার্ন"],
        answer:
          "If there is an issue with your order or product condition, contact support within the return window with your order number and we will help resolve it quickly.",
        category: "Support",
        isQuickReply: false,
        sortOrder: 4,
      },
      {
        question: "How do I contact support?",
        aliases: ["contact", "whatsapp", "যোগাযোগ"],
        keywords: ["contact", "support", "phone", "whatsapp"],
        answer:
          "Reach us via the Contact page, WhatsApp (see top bar / contact details), or email. Share your order number if you already placed an order.",
        category: "Support",
        isQuickReply: true,
        sortOrder: 5,
      },
      {
        question: "Do you ship outside Dhaka?",
        aliases: ["outside dhaka", "ঢাকার বাইরে"],
        keywords: ["dhaka", "outside", "bangladesh", "ঢাকা"],
        answer:
          "Yes — we deliver across Bangladesh. Shipping fees and ETA depend on your zone. Exact options appear at checkout.",
        category: "Shipping",
        isQuickReply: false,
        sortOrder: 6,
      },
      {
        question: "How do I become a distributor?",
        aliases: ["distributor", "wholesale", "ডিস্ট্রিবিউটর"],
        keywords: ["distributor", "wholesale", "partner"],
        answer:
          "Visit the Become a Distributor page, submit the partnership form, and our team will review your application.",
        category: "Business",
        isQuickReply: false,
        sortOrder: 7,
      },
      {
        question: "What payment methods do you accept?",
        aliases: ["payment methods", "bkash"],
        keywords: ["payment", "bkash", "card", "cod"],
        answer:
          "We support Cash on Delivery where available, plus online options such as SSLCommerz and bKash when enabled in checkout.",
        category: "Payment",
        isQuickReply: false,
        sortOrder: 8,
      },
      {
        question: "Where can I browse all products?",
        aliases: ["product list", "shop", "প্রোডাক্ট লিস্ট"],
        keywords: ["shop", "products", "catalog"],
        answer:
          "Browse Shop for the curated store experience, or open Product List for the full catalog directory with filters.",
        category: "Products",
        isQuickReply: false,
        sortOrder: 9,
      },
    ],
  });

  console.log("Seeded chatbot Q&A");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
