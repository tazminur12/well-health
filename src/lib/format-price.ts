/** Display prices as `৳ X,XXX.XX` for Bangladesh market. */
export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}
