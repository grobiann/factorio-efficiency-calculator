import { Calculator } from "./Calculator.js";

export class Resolver {
  /**
   * Compare multiple recipes that produce the same product.
   * recipes: array of Recipe instances (all producing the same productId)
   * productId: id of the produced item (used for recursive expansion)
   * targetPerSecond: desired output (per second) of the product
   * recipesByProduct: map of productId -> [Recipe, ...] used for recursion
   */
  static compare(recipes, productId, target, recipesByProduct, mode = "per_sec") {
    return recipes.map(recipe => {
      // Determine how many crafts are needed to satisfy the target for productId
      const resultsMap = recipe.getResultsMap();
      const producedPerCraft = resultsMap[productId] || 0;
      const craftsNeeded = producedPerCraft ? (target / producedPerCraft) : 0;

      // scaled ingredients for this recipe (direct inputs)
      const ingredientsScaled = {};
      const ingredientsMap = recipe.getIngredientsMap();
      for (const [itemId, amount] of Object.entries(ingredientsMap)) {
        ingredientsScaled[itemId] = amount * craftsNeeded;
      }

      // scaled outputs produced when making `target` units of productId
      const outputsScaled = {};
      for (const [outId, amount] of Object.entries(resultsMap)) {
        outputsScaled[outId] = amount * craftsNeeded;
      }

      const cost = mode === "per_item"
        ? Calculator.calculateRecursivePerItem(productId, recipe, target, recipesByProduct)
        : Calculator.calculateRecursiveBaseCost(productId, recipe, target, recipesByProduct);

      return {
        recipeId: recipe.id,
        name: recipe.name,
        outputs: outputsScaled,
        ingredients: ingredientsScaled,
        cost
      };
    });
  }
}
