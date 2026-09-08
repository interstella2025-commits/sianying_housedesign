export type VendorTradeSuggestion = {
  vendor: string;
  trade: string;
};

function normalizeSuggestion(value: string) {
  return value.trim().toLocaleLowerCase("zh-TW");
}

export function vendorsForTrade(
  suggestions: VendorTradeSuggestion[],
  trade: string,
  limit = 4,
) {
  const normalizedTrade = normalizeSuggestion(trade);
  if (!normalizedTrade || limit <= 0) return [];

  const exact: VendorTradeSuggestion[] = [];
  const partial: VendorTradeSuggestion[] = [];

  for (const suggestion of suggestions) {
    const suggestionTrade = normalizeSuggestion(suggestion.trade);
    if (suggestionTrade === normalizedTrade) {
      exact.push(suggestion);
    } else if (
      suggestionTrade.includes(normalizedTrade) ||
      normalizedTrade.includes(suggestionTrade)
    ) {
      partial.push(suggestion);
    }
  }

  const seen = new Set<string>();
  const vendors: string[] = [];
  for (const suggestion of [...exact, ...partial]) {
    const vendor = suggestion.vendor.trim();
    const key = normalizeSuggestion(vendor);
    if (!vendor || seen.has(key)) continue;
    seen.add(key);
    vendors.push(vendor);
    if (vendors.length >= limit) break;
  }

  return vendors;
}
