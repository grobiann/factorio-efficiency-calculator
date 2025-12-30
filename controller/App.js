import { Recipe } from "../model/Recipe.js";
import { Resolver } from "../model/Resolver.js";
import { renderSummaryTable } from "../view/SummaryView.js";
import { Locale } from "../model/Locale.js";
import { DatasetManager } from "../model/DatasetManager.js";
import { DatasetConfigView } from "../view/DatasetConfigView.js";
import { RecipeGroupView } from "../view/RecipeGroupView.js";
import { CustomRecipeView } from "../view/CustomRecipeView.js";
import { CompareView } from "../view/CompareView.js";

export async function startApp() {
  // Initialize dataset manager
  const datasetManager = new DatasetManager();
  await datasetManager.loadDatasetConfig();
  
  // Load initial data from enabled datasets
  let loadedData = await datasetManager.loadData();
  let data = loadedData.recipes;

  async function loadLocale(lang) {
    const items = await fetch(`locale/${lang}/items.json`).then(r => r.json()).catch(() => ({}));
    const recipes = await fetch(`locale/${lang}/recipes.json`).then(r => r.json()).catch(() => ({}));
    return { items, recipes };
  }

  const initialLocale = await loadLocale("ko");
  const locale = new Locale(initialLocale.items, initialLocale.recipes, "ko");
  
  // Function to rebuild recipe map from data
  function buildRecipeMap(recipeData) {
    const recipesByProduct = {};
    for (const [cat, recs] of Object.entries(recipeData)) {
      for (const r of (recs || [])) {
        const recipe = new Recipe(r);
        // Determine which products this recipe produces
        const resultsMap = recipe.getResultsMap();
        const outputIds = Object.keys(resultsMap);
        outputIds.forEach(pid => {
          if (!recipesByProduct[pid]) recipesByProduct[pid] = [];
          recipesByProduct[pid].push(recipe);
        });
      }
    }
    console.log("Built recipesByProduct map:", recipesByProduct);
    return recipesByProduct;
  }

  // Build a map productId => [Recipe]. Support recipes that list multiple outputs.
  let recipesByProduct = buildRecipeMap(data);

  // productsWithRecipes are all products that have at least one recipe
  let productsWithRecipes = Object.keys(recipesByProduct);
  let currentProduct = productsWithRecipes[0];
  let currentProductRecipes = (recipesByProduct[currentProduct] || []).slice();

  // Function to reload data when datasets change
  async function reloadDatasets() {
    loadedData = await datasetManager.reloadData();
    data = loadedData.recipes;
    recipesByProduct = buildRecipeMap(data);
    productsWithRecipes = Object.keys(recipesByProduct);
    
    // Reset current product if it no longer exists
    if (!recipesByProduct[currentProduct]) {
      currentProduct = productsWithRecipes[0];
    }
    
    // Update UI
    buildProductOptions();
    updateCurrentRecipes();
    updateTitle();
    
    // Recalculate if we had a previous calculation
    if (lastRate !== null) {
      performCalculation(lastRate);
    } else {
      document.getElementById("result").innerHTML = "";
    }
  }

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
    langSelect.onchange = async () => {
      locale.lang = langSelect.value;
      const next = await loadLocale(locale.lang);
      locale.setItemNames(next.items);
      locale.setRecipeNames(next.recipes);
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

    // Render summary table
    const targetCount = (displayMode === "per_min") ? (target / 60) : target;
    renderSummaryTable(currentProductRecipes, currentProduct, targetCount, recipesByProduct, locale, multiplier);
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
    
    // Add dataset configuration UI to settings panel
    const datasetConfigView = new DatasetConfigView(datasetManager, reloadDatasets);
    datasetConfigView.render(settingsPanel);
  }

  // Auto-update as user types (debounced)
  const targetInput = document.getElementById("targetRate");
  if (targetInput) {
    performCalculation(targetInput.value);
    targetInput.oninput = () => {
      if (inputTimeout) clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        performCalculation(targetInput.value);
      }, 300);
    };
  }

  // Initialize production zone view
  const allRecipes = {};
  for (const [cat, recs] of Object.entries(data)) {
    for (const r of (recs || [])) {
      const recipe = new Recipe(r);
      allRecipes[recipe.id] = recipe;
    }
  }
  
  // Load sample data first
  async function loadSampleData() {
    try {
      const samples = await fetch('data/samples.json').then(r => r.json());
      
      // Load sample recipe groups
      const existingZones = localStorage.getItem('recipeGroups');
      const zonesArray = existingZones ? JSON.parse(existingZones) : null;
      if (samples.recipeGroups && (!zonesArray || zonesArray.length === 0)) {
        localStorage.setItem('recipeGroups', JSON.stringify(samples.recipeGroups));
        console.log('Loaded sample recipe groups:', samples.recipeGroups);
      }
      
      // Load sample custom recipes
      const existingRecipes = localStorage.getItem('customRecipes');
      const recipesArray = existingRecipes ? JSON.parse(existingRecipes) : null;
      if (samples.customRecipes && (!recipesArray || recipesArray.length === 0)) {
        localStorage.setItem('customRecipes', JSON.stringify(samples.customRecipes));
        console.log('Loaded sample custom recipes:', samples.customRecipes);
      }
      
      // Load sample compare groups
      const existingGroups = localStorage.getItem('compareGroups');
      const groupsData = existingGroups ? JSON.parse(existingGroups) : null;
      if (samples.compareGroups && (!groupsData || !groupsData.groups || groupsData.groups.length === 0)) {
        const newGroupsData = {
          groups: samples.compareGroups,
          nextGroupId: samples.compareGroups.length + 1,
          selectedIndex: 0
        };
        localStorage.setItem('compareGroups', JSON.stringify(newGroupsData));
        console.log('Loaded sample compare groups:', samples.compareGroups);
      }
    } catch (e) {
      console.error('Failed to load sample data:', e);
    }
  }
  
  await loadSampleData();
  
  const recipeGroupView = new RecipeGroupView(allRecipes, recipesByProduct, locale, loadedData);
  recipeGroupView.render(document.getElementById('recipe-group-tab'));

  // Initialize custom recipe view
  const customRecipeView = new CustomRecipeView(loadedData, locale);
  customRecipeView.render(document.getElementById('custom-recipe-tab'));

  // Initialize compare view
  const compareView = new CompareView(recipeGroupView.zones, customRecipeView.manager, allRecipes, locale, loadedData);
  compareView.render(document);

  // Export/Import data functionality
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importFileInput = document.getElementById('importFileInput');

  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      const exportData = {
        compareGroups: JSON.parse(localStorage.getItem('compareGroups') || '{"groups":[],"nextGroupId":1,"selectedIndex":0}').groups,
        recipeGroups: JSON.parse(localStorage.getItem('recipeGroups') || '[]'),
        customRecipes: JSON.parse(localStorage.getItem('customRecipes') || '[]')
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factorio-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (importDataBtn && importFileInput) {
    importDataBtn.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        // Validate and import
        if (importData.recipeGroups) {
          localStorage.setItem('recipeGroups', JSON.stringify(importData.recipeGroups));
        }
        if (importData.customRecipes) {
          localStorage.setItem('customRecipes', JSON.stringify(importData.customRecipes));
        }
        if (importData.compareGroups) {
          const groupsData = {
            groups: importData.compareGroups,
            nextGroupId: importData.compareGroups.length + 1,
            selectedIndex: 0
          };
          localStorage.setItem('compareGroups', JSON.stringify(groupsData));
        }

        alert('데이터를 성공적으로 가져왔습니다. 페이지를 새로고침합니다.');
        location.reload();
      } catch (err) {
        alert('데이터 가져오기 실패: ' + err.message);
      }

      // Reset file input
      importFileInput.value = '';
    });
  }

  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // Update active states
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');

      // Render tab content if needed
      if (targetTab === 'recipe-group') {
        recipeGroupView.render(document.getElementById('recipe-group-tab'));
      } else if (targetTab === 'custom-recipe') {
        customRecipeView.render(document.getElementById('custom-recipe-tab'));
      } else if (targetTab === 'compare') {
        compareView.render(document);
      }
    });
  });

  // Integrate custom recipes and production zones into recipesByProduct
  function integrateCustomContent() {
    // Reset to base recipes
    recipesByProduct = buildRecipeMap(data);
    
    // Rebuild allRecipes map
    const allRecipes = {};
    for (const [cat, recs] of Object.entries(data)) {
      for (const r of (recs || [])) {
        const recipe = new Recipe(r);
        allRecipes[recipe.id] = recipe;
      }
    }
    recipeGroupView.allRecipes = allRecipes;
    recipeGroupView.loadedData = loadedData;
    
    // Integrate custom recipes
    customRecipeView.getManager().integrateIntoRecipeMap(recipesByProduct);
    
    // Integrate recipe groups
    recipeGroupView.integrateIntoRecipeMap(recipesByProduct);
    
    // Update products list
    productsWithRecipes = Object.keys(recipesByProduct);
    buildProductOptions();
  }

  // Call integration initially
  integrateCustomContent();

  // Re-integrate when switching back to production line tab
  window.addEventListener('custom-content-updated', () => {
    integrateCustomContent();
    if (lastRate !== null) {
      performCalculation(lastRate);
    }
  });

  // Initialize title and product list on load
  buildProductOptions();
}
