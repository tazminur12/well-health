import { prisma } from "@/lib/prisma";
import { slugifyUnit } from "@/lib/units/schemas";

/** Ensure a unit catalog row exists for a product unit name (auto-create if missing). */
export async function ensureUnitByName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Unit name is required");

  const slug = slugifyUnit(trimmed) || "unit";
  const existing = await prisma.unit.findFirst({
    where: {
      OR: [{ name: trimmed }, { slug }],
    },
  });
  if (existing) return existing;

  return prisma.unit.create({
    data: {
      name: trimmed,
      slug,
      description: `Product unit: ${trimmed}`,
      isActive: true,
    },
  });
}
