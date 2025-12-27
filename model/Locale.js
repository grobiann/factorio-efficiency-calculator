export class Locale {
  constructor(items, lang = "ko") {
    this.items = items;
    this.lang = lang;
  }

  itemName(id) {
    return this.items[id]?.name?.[this.lang] ?? id;
  }

  isRare(id) {
    return this.items[id]?.rarity === "rare";
  }
}
