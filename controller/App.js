import { Recipe } from "../model/Recipe.js";
import { Resolver } from "../model/Resolver.js";
import { renderSummaryTable } from "../view/SummaryView.js";
import { Locale } from "../model/Locale.js";
import { DatasetManager } from "../model/DatasetManager.js";
import { DatasetConfigView } from "../view/DatasetConfigView.js";
import { RecipeGroupView } from "../view/RecipeGroupView.js";
import { CustomRecipeView } from "../view/CustomRecipeView.js";
import { CustomRecipeManager } from "../model/CustomRecipe.js";
import { CompareView } from "../view/CompareView.js";
import { FactoryConfigView } from "../view/FactoryConfigView.js";
import { updateUILanguage } from "../utils/Translations.js";

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
    
    // Recalculate if we had a previous calculation
    if (lastRate !== null) {
      performCalculation(lastRate);
    } else {
      const resultElement = document.getElementById("result");
      if (resultElement) {
        resultElement.innerHTML = "";
      }
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
  const savedLang = localStorage.getItem('uiLanguage') || 'ko';
  locale.lang = savedLang;
  
  if (langSelect) {
    langSelect.value = savedLang;
    updateUILanguage(savedLang);
    
    langSelect.onchange = async () => {
      locale.lang = langSelect.value;
      const next = await loadLocale(locale.lang);
      locale.setItemNames(next.items);
      locale.setRecipeNames(next.recipes);
      
      // Update UI language
      updateUILanguage(locale.lang);
      
      // Update DatasetConfigView language
      if (datasetConfigView) {
        datasetConfigView.updateLanguage();
      }
      
      // Refresh views
      buildProductOptions();
      updateTitle();
      
      // Re-render all views
      recipeGroupView.render(document.getElementById('recipe-group-tab'));
      customRecipeView.render(document.getElementById('custom-recipe-tab'));
      factoryConfigView.render(document.getElementById('factory-config-tab'));
      compareView.render(document);
      
      if (lastResults !== null) {
        // Re-run the current calculation to reflect locale changes
        performCalculation(lastRate);
      }
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

    // Compute per-recipe results (always per-second)
    const results = Resolver.compare(currentProductRecipes, currentProduct, target, recipesByProduct, "per_sec");
    const multiplier = 1;

    lastResults = results;

    // Render summary table
    renderSummaryTable(currentProductRecipes, currentProduct, target, recipesByProduct, locale, multiplier);
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
  let datasetConfigView = null;
  if (settingsBtn && settingsPanel) {
    settingsBtn.onclick = () => {
      const opened = settingsPanel.classList.toggle("open");
      settingsPanel.setAttribute("aria-hidden", !opened);
    };
    
    // Add dataset configuration UI to settings panel
    datasetConfigView = new DatasetConfigView(datasetManager, reloadDatasets);
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
      }
      
      // Load sample custom recipes
      const existingRecipes = localStorage.getItem('customRecipes');
      const recipesArray = existingRecipes ? JSON.parse(existingRecipes) : null;
      if (samples.customRecipes && (!recipesArray || recipesArray.length === 0)) {
        localStorage.setItem('customRecipes', JSON.stringify(samples.customRecipes));
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
      }
      
      // Load sample factory config
      if (samples.factoryConfig) {
        const existingMachines = localStorage.getItem('preferredMachines');
        const existingModule = localStorage.getItem('selectedModule');
        
        if (samples.factoryConfig.preferredMachines && (!existingMachines || JSON.parse(existingMachines).length === 0)) {
          localStorage.setItem('preferredMachines', JSON.stringify(samples.factoryConfig.preferredMachines));
        }
        
        if (samples.factoryConfig.selectedModule && !existingModule) {
          localStorage.setItem('selectedModule', samples.factoryConfig.selectedModule);
        }
      }
    } catch (e) {
      // 샘플 데이터 로드 실패 시 무시
    }
  }
  
  await loadSampleData();
  
  const customRecipeManager = new CustomRecipeManager();
      
  const recipeGroupView = new RecipeGroupView(allRecipes, recipesByProduct, locale, loadedData, customRecipeManager);
  recipeGroupView.render(document.getElementById('recipe-group-tab'));

  // Initialize custom recipe view
  const customRecipeView = new CustomRecipeView(loadedData, locale, customRecipeManager);
  customRecipeView.render(document.getElementById('custom-recipe-tab'));

  // Initialize factory config view
  const factoryConfigView = new FactoryConfigView(loadedData, locale);
  factoryConfigView.render(document.getElementById('factory-config-tab'));

  // Initialize compare view (needs factoryConfigView for productivity bonus)
  const compareView = new CompareView(recipeGroupView.groups, customRecipeView.manager, allRecipes, locale, loadedData, recipesByProduct, recipeGroupView, factoryConfigView);
  compareView.render(document);

  // RecipeGroupView에 factoryConfigView 참조 전달
  recipeGroupView.factoryConfigView = factoryConfigView;

  // Export/Import data functionality
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importFileInput = document.getElementById('importFileInput');

  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      const exportData = {
        compareGroups: JSON.parse(localStorage.getItem('compareGroups') || '{"groups":[],"nextGroupId":1,"selectedIndex":0}').groups,
        recipeGroups: JSON.parse(localStorage.getItem('recipeGroups') || '[]'),
        customRecipes: JSON.parse(localStorage.getItem('customRecipes') || '[]'),
        factoryConfig: {
          preferredMachines: JSON.parse(localStorage.getItem('preferredMachines') || '[]'),
          selectedModule: localStorage.getItem('selectedModule') || ''
        }
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
        if (importData.factoryConfig) {
          if (importData.factoryConfig.preferredMachines) {
            localStorage.setItem('preferredMachines', JSON.stringify(importData.factoryConfig.preferredMachines));
          }
          if (importData.factoryConfig.selectedModule !== undefined) {
            localStorage.setItem('selectedModule', importData.factoryConfig.selectedModule);
          }
        }

        const { getTranslation } = await import('../utils/Translations.js');
        const t = (key) => getTranslation(locale.lang, key);
        alert(t('msgImportSuccess'));
        location.reload();
      } catch (err) {
        const { getTranslation } = await import('../utils/Translations.js');
        const t = (key) => getTranslation(locale.lang, key);
        alert(t('msgImportError') + err.message);
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
      } else if (targetTab === 'factory-config') {
        factoryConfigView.render(document.getElementById('factory-config-tab'));
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
