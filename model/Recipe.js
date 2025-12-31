export class Recipe {
  constructor(data) {
    this.id = data.id || data.name;  // Use 'name' as fallback for id
    this.name = data.name;
    this.type = data.type || "recipe";
    this.time = data.energy_required;

    // Factorio-style schema support:
    // - ingredients: [ { type: "item"|"fluid", name: "id", amount: n }, ... ] or single object
    // - results:     [ { type: "item"|"fluid", name: "id", amount: n }, ... ] or single object
    // Normalize single objects to arrays
    this.ingredients = data.ingredients ? 
      (Array.isArray(data.ingredients) ? data.ingredients : [data.ingredients]) : [];
    this.results = data.results ? 
      (Array.isArray(data.results) ? data.results : [data.results]) : [];
    
    // Icon data preservation
    this.icon = data.icon;
    this.icon_size = data.icon_size;
    this.icon_mipmaps = data.icon_mipmaps;
    this.icons = data.icons;
  }

  static #expectedAmount(entry) {
    if (!entry) return 0;

    const probability = entry.probability === undefined ? 1 : Number(entry.probability);
    if (!Number.isFinite(probability) || probability <= 0) return 0;

    const amount = entry.amount !== undefined ? Number(entry.amount) : NaN;
    if (Number.isFinite(amount)) return amount * probability;

    const amountMin = entry.amount_min !== undefined ? Number(entry.amount_min) : NaN;
    const amountMax = entry.amount_max !== undefined ? Number(entry.amount_max) : NaN;
    if (Number.isFinite(amountMin) && Number.isFinite(amountMax)) {
      return ((amountMin + amountMax) / 2) * probability;
    }

    if (Number.isFinite(amountMin)) return amountMin * probability;
    if (Number.isFinite(amountMax)) return amountMax * probability;

    return 0;
  }

  static #ioArrayToMap(list) {
    if (!Array.isArray(list) || list.length === 0) return null;
    const map = {};
    for (const entry of list) {
      if (!entry) continue;
      const id = entry.name;
      if (!id) continue;
      const expected = Recipe.#expectedAmount(entry);
      if (!expected) continue;

      map[id] = (map[id] || 0) + expected;
    }
    return Object.keys(map).length ? map : null;
  }

  /**
   * Amount of a specific product produced per second by this recipe.
   * productId is expected to be provided by the caller (the product being queried).
   */
  outputPerSecond(productId) {
    const outputs = Recipe.#ioArrayToMap(this.results);
    if (outputs && productId && (productId in outputs)) {
      return outputs[productId] / this.time;
    }
    return 0;
  }

  /**
   * Get ingredients as a map { itemId: amount }
   */
  getIngredientsMap() {
    return Recipe.#ioArrayToMap(this.ingredients) || {};
  }

  /**
   * Get results as a map { itemId: amount }
   */
  getResultsMap() {
    return Recipe.#ioArrayToMap(this.results) || {};
  }
}
