export class Calculator {
  static calculateBaseCost(recipe, productId, targetPerSecond) {
    const producedPerSecond = recipe.outputPerSecond(productId);
    if (!producedPerSecond) {
      console.warn(`Recipe ${recipe.id} does not produce ${productId} (or has zero output); skipping.`);
      return {};
    }
    const scale = targetPerSecond / producedPerSecond;
    const result = {};

    for (const [item, amount] of Object.entries(recipe.inputs || {})) {
      result[item] = amount * scale;
    }

    return result;
  }

  /**
   * Recursively compute base resources per produced item (ignore time) —
   * targetCount is number of product units desired (not per second).
   * Uses outputs[productId] to compute crafts needed.
   */
  static calculateRecursivePerItem(productId, recipe, targetCount, recipesByProduct, visited = new Set()) {
    if (visited.has(productId)) {
      //console.warn(`Cycle detected while expanding ${productId}; stopping recursion.`);
      return {};
    }
    const nextVisited = new Set(visited);
    nextVisited.add(productId);

    // how many of this recipe's crafts are required to produce targetCount units of productId
    const producedPerCraft = recipe.outputs && (productId in recipe.outputs) ? recipe.outputs[productId] : (recipe.output || 0);
    if (!producedPerCraft) {
      console.warn(`Recipe ${recipe.id} does not produce ${productId} (or zero output); skipping per-item expansion.`);
      return {};
    }

    const craftsNeeded = targetCount / producedPerCraft;
    const result = {};

    for (const [itemId, amount] of Object.entries(recipe.inputs || {})) {
      const required = amount * craftsNeeded;

      const subRecipes = recipesByProduct[itemId];
      if (subRecipes && subRecipes.length > 0) {
        const subRecipe = subRecipes[0];
        const subCosts = Calculator.calculateRecursivePerItem(itemId, subRecipe, required, recipesByProduct, nextVisited);
        for (const [baseId, baseAmt] of Object.entries(subCosts)) {
          result[baseId] = (result[baseId] || 0) + baseAmt;
        }
      } else {
        result[itemId] = (result[itemId] || 0) + required;
      }
    }

    return result;
  }

  /**
   * Recursively expand a recipe into base resources.
   * - productId: the id of the product this recipe produces (used to detect cycles)
   * - recipe: Recipe instance that produces productId
   * - targetPerSecond: desired output of productId in units per second
   * - recipesByProduct: map { productId: [Recipe, ...] }
   * Returns a map { baseItemId: amountPerSecond }
   * NOTE: when multiple recipes exist for an intermediate item, this implementation
   * picks the first recipe found. This is a simple, deterministic choice.
   */
  static calculateRecursiveBaseCost(productId, recipe, targetPerSecond, recipesByProduct, visited = new Set()) {
    // Time is intentionally ignored: compute base resource needs by expanding
    // the recipe per produced unit and then scale by `targetPerSecond` (treated
    // as a simple count here). This ensures the calculation only considers
    // counts (items) and not crafting time.
    return Calculator.calculateRecursivePerItem(productId, recipe, targetPerSecond, recipesByProduct, visited);
  }
}
