/**
 * Updates live store_settings.supportEmail to the production inbox.
 * Run: node scripts/update-support-email.js
 */
const { PrismaClient } = require("@prisma/client");

const EMAIL = "info@wellhealthtradeinternational.com";
const prisma = new PrismaClient();

async function main() {
  const key = "store_settings";
  const existing = await prisma.siteSetting.findUnique({ where: { key } });

  if (!existing) {
    console.log("No store_settings row yet — defaults will use the new email.");
    return;
  }

  const value =
    existing.value && typeof existing.value === "object" && !Array.isArray(existing.value)
      ? { ...existing.value }
      : {};

  value.supportEmail = EMAIL;

  await prisma.siteSetting.update({
    where: { key },
    data: { value },
  });

  console.log("Updated store_settings.supportEmail →", EMAIL);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
