import allDivisionData from "@/jsondata/AllDivision.json";

type UpazilaDistrict = {
  District: string;
  Upazilas: string[];
};

type DivisionBlock = {
  Division: string;
  Districts: UpazilaDistrict[];
};

const divisions = (allDivisionData as { Bangladesh: DivisionBlock[] }).Bangladesh;

const districtToThanas = new Map<string, string[]>();
const districtToDivision = new Map<string, string>();
const divisionToDistricts = new Map<string, string[]>();

for (const division of divisions) {
  const districtNames = division.Districts.map((district) => district.District).sort((a, b) =>
    a.localeCompare(b)
  );
  divisionToDistricts.set(division.Division, districtNames);

  for (const district of division.Districts) {
    districtToThanas.set(
      district.District,
      [...district.Upazilas].sort((a, b) => a.localeCompare(b))
    );
    districtToDivision.set(district.District, division.Division);
  }
}

/** All 8 Bangladesh divisions (sorted A–Z). */
export const bdDivisions = Array.from(divisionToDistricts.keys()).sort((a, b) =>
  a.localeCompare(b)
);

/** All 64 Bangladesh districts (sorted A–Z). */
export const bdDistricts = Array.from(districtToThanas.keys()).sort((a, b) =>
  a.localeCompare(b)
);

/** Districts for a division. Empty array if unknown. */
export function getBdDistricts(division: string): string[] {
  if (!division) return [];
  return divisionToDistricts.get(division) ?? [];
}

/** Thanas / upazilas for a district. Empty array if unknown. */
export function getBdThanas(district: string): string[] {
  if (!district) return [];
  return districtToThanas.get(district) ?? [];
}

/** Parent division for a district, or empty string if unknown. */
export function getBdDivisionForDistrict(district: string): string {
  if (!district) return "";
  return districtToDivision.get(district) ?? "";
}
