export class Locale {
  constructor(itemNames = {}, recipeNames = {}, lang = "ko") {
    this.itemNames = itemNames;
    this.recipeNames = recipeNames;
    this.lang = lang;
  }

  setItemNames(itemNames) {
    this.itemNames = itemNames || {};
  }

  setRecipeNames(recipeNames) {
    this.recipeNames = recipeNames || {};
  }

  itemName(id) {
    return this.itemNames[id] ?? id;
  }

  recipeName(id) {
    return this.recipeNames[id] ?? id;
  }

  isRare(id) {
    return false;
  }
}
