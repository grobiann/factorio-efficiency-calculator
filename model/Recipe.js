export class Recipe {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.time = data.time;
    this.output = data.output;
    this.input = data.input;
    // Support multiple outputs: `outputs` is an object { itemId: amount }
    // Backwards-compatible: if `outputs` is not present, recipes may use `output` (single output)
    this.outputs = data.outputs || null;
    this.inputs = data.inputs || null;
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
