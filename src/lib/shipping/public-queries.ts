import { prisma } from "@/lib/prisma";

export type PublicShippingZone = {
  id: string;
  name: string;
  slug: string;
  baseFee: number;
  freeShippingMin: number | null;
  etaMinDays: number;
  etaMaxDays: number;
  codAvailable: boolean;
};

export async function getPublicShippingZones(): Promise<PublicShippingZone[]> {
  try {
    const rows = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      baseFee: Number(row.baseFee),
      freeShippingMin: row.freeShippingMin != null ? Number(row.freeShippingMin) : null,
      etaMinDays: row.etaMinDays,
      etaMaxDays: row.etaMaxDays,
      codAvailable: row.codAvailable,
    }));
  } catch {
    return [];
  }
}
