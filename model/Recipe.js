export class Recipe {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type || "recipe";
    this.time = data.energy_required;
    this.output = data.output;
    this.input = data.input;

    // Factorio-style schema support:
    // - ingredients: [ { type: "item"|"fluid", name: "id", amount: n }, ... ]
    // - results:     [ { type: "item"|"fluid", name: "id", amount: n }, ... ]
    this.ingredients = Array.isArray(data.ingredients) ? data.ingredients : null;
    this.results = Array.isArray(data.results) ? data.results : null;

    // Normalize to maps used internally by the calculator/views.
    // Backwards-compatible: accept legacy `inputs`/`outputs` maps.
    this.inputs = data.inputs || Recipe.#ioArrayToMap(this.ingredients);
    this.outputs = data.outputs || Recipe.#ioArrayToMap(this.results);
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
   * If `outputs` contains the productId, use that; otherwise fall back to `output`.
  * productId is expected to be provided by the caller (the product being queried).
   */
  outputPerSecond(productId) {
    if (this.outputs && productId && (productId in this.outputs)) {
      return this.outputs[productId] / this.time;
    }

    if (this.output !== undefined && this.output !== null) {
      return this.output / this.time;
    }

    // no output information for requested product
    return 0;
  }
}
