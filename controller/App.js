import { Recipe } from "../model/Recipe.js";
import { Resolver } from "../model/Resolver.js";
import { renderRecipeTable } from "../view/CompareView.js";
import { renderSummaryTable } from "../view/SummaryView.js";
import { Locale } from "../model/Locale.js";

export async function startApp() {
  const data = await fetch("data/recipes.json").then(r => r.json());
  const items = await fetch("data/items.json").then(r => r.json());
  const locale = new Locale(items, "ko");
  // Build a map productId => [Recipe]. Support recipes that list multiple outputs.
  const recipesByProduct = {};
  for (const [cat, recs] of Object.entries(data)) {
    for (const r of (recs || [])) {
      const recipe = new Recipe(r);
      // Determine which products this recipe produces
      const outputIds = recipe.outputs ? Object.keys(recipe.outputs) : [cat];
      outputIds.forEach(pid => {
        if (!recipesByProduct[pid]) recipesByProduct[pid] = [];
        recipesByProduct[pid].push(recipe);
      });
    }
  }

  // productsWithRecipes are all products that have at least one recipe
  const productsWithRecipes = Object.keys(recipesByProduct);
  let currentProduct = productsWithRecipes[0];
  let currentProductRecipes = (recipesByProduct[currentProduct] || []).slice();

  // Settings UI: toggle panel and allow language selection
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const langSelect = document.getElementById("langSelect");

  // Keep last results so we can re-render when settings change
  let lastResults = null;
  let lastRate = null;
  let inputTimeout = null;

  // Initialize language select
  if (langSelect) {
    langSelect.value = locale.lang;
    langSelect.onchange = () => {
      locale.lang = langSelect.value;
      // Refresh product labels and re-render results in the new language
      buildProductOptions();
      updateTitle();
      if (lastResults !== null) {
        // Re-run the current calculation to reflect locale changes
        performCalculation(lastRate);
      }
    };
  }

  // Removed separate time unit control; display mode now covers per-second vs per-minute
  const displayModeSelect = document.getElementById("displayModeSelect");
  let displayMode = displayModeSelect ? displayModeSelect.value : "per_sec";
  if (displayModeSelect) {
    displayModeSelect.value = displayMode;
    displayModeSelect.onchange = () => {
      displayMode = displayModeSelect.value;
      updateTitle();
      if (lastRate !== null) performCalculation(lastRate);
    };
  }
  const productSelect = document.getElementById("productSelect");

  function buildProductOptions() {
    if (!productSelect) return;
    productSelect.innerHTML = "";
    productsWithRecipes.forEach(prod => {
      const opt = document.createElement("option");
      opt.value = prod;
      opt.textContent = locale.itemName(prod) || prod;
      productSelect.appendChild(opt);
    });
    productSelect.value = currentProduct;
  }

  function updateCurrentRecipes() {
    currentProductRecipes = (recipesByProduct[currentProduct] || []).slice();
  }

  function updateTitle() {
    const title = document.getElementById("pageTitle");
    if (!title) return;
    const name = locale.itemName(currentProduct) || currentProduct;
    // Show unit label depending on display mode and selected time unit
    let titleUnit = "";
    // Determine title unit based on display mode (per second or per minute)
    if (displayMode === "per_min") {
      titleUnit = locale.lang === "ko" ? "분" : "min";
    } else {
      titleUnit = locale.lang === "ko" ? "초" : "sec";
    }
    title.textContent = `${name} 레시피 효율 비교 (${titleUnit})`;

    // Update target input unit label
    const targetLabel = document.getElementById("targetUnitLabel");
    if (targetLabel) {
      if (displayMode === "per_min") {
        targetLabel.textContent = locale.lang === "ko" ? "개 / 분" : "items / min";
      } else {
        targetLabel.textContent = locale.lang === "ko" ? "개 / 초" : "items / sec";
      }
    }
  }

  // Perform a calculation given the user's input (rate). This will set
  // lastRate/lastResults and re-render the views.
  function performCalculation(rate) {
    const target = parseFloat(rate);
    if (Number.isNaN(target)) {
      lastRate = null;
      lastResults = null;
      document.getElementById("result").innerHTML = "";
      return;
    }

    lastRate = target;

    // Compute per-recipe results and also build recursive recipe columns
    let results, multiplier;
    // displayMode selects whether the user's input is per-second or per-minute
    const ratePerSecond = (displayMode === "per_min") ? (target / 60) : target;
    results = Resolver.compare(currentProductRecipes, currentProduct, ratePerSecond, recipesByProduct, "per_sec");
    multiplier = (displayMode === "per_min") ? 60 : 1;

    lastResults = results;

    // Render summary and recipe table (views will build their own columns from recipes)
    const targetCount = (displayMode === "per_min") ? (target / 60) : target;
    renderSummaryTable(currentProductRecipes, currentProduct, targetCount, recipesByProduct, locale, multiplier);
    renderRecipeTable(currentProductRecipes, currentProduct, targetCount, recipesByProduct, locale, multiplier);
  }

  // (Column-building moved into the view layer: renderRecipeTable)

  if (productSelect) {
    buildProductOptions();
    productSelect.onchange = () => {
      currentProduct = productSelect.value;
      updateCurrentRecipes();
      updateTitle();
      // Recompute immediately using the last rate if present
      if (lastRate !== null) {
        performCalculation(lastRate);
      } else {
        // Clear result area if no previous calculation
        document.getElementById("result").innerHTML = "";
      }
    };
  }

  // Toggle settings panel
  if (settingsBtn && settingsPanel) {
    settingsBtn.onclick = () => {
      const opened = settingsPanel.classList.toggle("open");
      settingsPanel.setAttribute("aria-hidden", !opened);
    };
  }

  // Auto-update as user types (debounced)
  const targetInput = document.getElementById("targetRate");
  if (targetInput) {
    targetInput.oninput = () => {
      if (inputTimeout) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        performCalculation(targetInput.value);
      }, 300);
    };
  }

  // Initialize title and product list on load
  buildProductOptions();
  updateTitle();
}
