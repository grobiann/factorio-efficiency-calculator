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
      const producedPerCraft = recipe.outputs && (productId in recipe.outputs) ? recipe.outputs[productId] : (recipe.output || 0);
      const craftsNeeded = producedPerCraft ? (target / producedPerCraft) : 0;

      // scaled ingredients for this recipe (direct inputs)
      const ingredientsScaled = {};
      for (const [itemId, amount] of Object.entries(recipe.ingredients || {})) {
        ingredientsScaled[itemId] = amount * craftsNeeded;
      }

      // scaled outputs produced when making `target` units of productId
      const outputsScaled = {};
      const outputsDef = recipe.outputs || (recipe.output ? { [productId]: recipe.output } : {});
      for (const [outId, amount] of Object.entries(outputsDef)) {
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
