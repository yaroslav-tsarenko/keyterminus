export function boardTitle(title: string, cells: number): string {
  const upper = title.toUpperCase().replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
  if (upper.length <= cells) return upper;
  const cut = upper.slice(0, cells + 1);
  const space = cut.lastIndexOf(" ");
  return (space > cells * 0.5 ? cut.slice(0, space) : upper.slice(0, cells)).replace(/[\s:–—-]+$/, "");
}

export function boardPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, useGrouping: false }).format(amount);
}
