/**
 * DatasetManager - Manages multiple datasets (mods/versions) and merges them based on user selection
 */
export class DatasetManager {
  constructor() {
    this.datasets = [];
    this.enabledDatasets = new Set();
    this.loadedData = null;
  }

  /**
   * Load dataset configuration from datasets.json
   */
  async loadDatasetConfig() {
    try {
      const config = await fetch("data/datasets.json").then(r => r.json());
      this.datasets = config.datasets || [];
      
      // Initialize enabled datasets based on config
      this.enabledDatasets.clear();
      this.datasets.forEach(ds => {
        if (ds.enabled) {
          this.enabledDatasets.add(ds.id);
        }
      });

      // Try to load from localStorage
      const saved = localStorage.getItem("enabledDatasets");
      if (saved) {
        try {
          const savedSet = JSON.parse(saved);
          this.enabledDatasets = new Set(savedSet);
        } catch (e) {
          console.warn("Failed to load saved dataset preferences:", e);
        }
      }

      return this.datasets;
    } catch (error) {
      console.error("Failed to load dataset config:", error);
      return [];
    }
  }

  /**
   * Get list of all available datasets
   */
  getDatasets() {
    return this.datasets.slice().sort((a, b) => a.order - b.order);
  }

  /**
   * Check if a dataset is enabled
   */
  isEnabled(datasetId) {
    return this.enabledDatasets.has(datasetId);
  }

  /**
   * Enable or disable a dataset
   */
  setEnabled(datasetId, enabled) {
    if (enabled) {
      this.enabledDatasets.add(datasetId);
    } else {
      this.enabledDatasets.delete(datasetId);
    }
    
    // Save to localStorage
    localStorage.setItem("enabledDatasets", JSON.stringify([...this.enabledDatasets]));
  }

  /**
   * Load and merge all enabled datasets
   */
  async loadData() {
    const itemsArrays = [];
    const recipesObjects = [];

    // Load enabled datasets in order
    const enabledList = this.datasets
      .filter(ds => this.enabledDatasets.has(ds.id))
      .sort((a, b) => a.order - b.order);

    for (const dataset of enabledList) {
      try {
        // Support both old format (object with items/recipes keys) and new format (array of files)
        const files = Array.isArray(dataset.files) 
          ? dataset.files 
          : [dataset.files.items, dataset.files.recipes].filter(Boolean);

        // Load each file
        for (const filePath of files) {
          const data = await fetch(`data/${filePath}`).then(r => r.json());
          
          // Process data based on type field
          if (Array.isArray(data)) {
            // Array format: separate by type
            for (const entry of data) {
              if (entry.type === 'item') {
                itemsArrays.push(entry);
              } else if (entry.type === 'recipe') {
                // Convert to recipe object format for merging
                if (!recipesObjects.length || !recipesObjects[recipesObjects.length - 1]._isArrayFormat) {
                  recipesObjects.push({ recipes: [], _isArrayFormat: true });
                }
                recipesObjects[recipesObjects.length - 1].recipes.push(entry);
              }
            }
          } else if (data && typeof data === 'object') {
            // Object format (old recipes.json format)
            if (data.recipes) {
              recipesObjects.push(data);
            } else {
              // Assume it's a category-based recipe object
              recipesObjects.push(data);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to load dataset ${dataset.id}:`, error);
      }
    }

    // Merge recipes - later datasets can override earlier ones
    const mergedRecipes = this.mergeRecipes(recipesObjects);

    this.loadedData = {
      items: itemsArrays,
      recipes: mergedRecipes
    };

    return this.loadedData;
  }

  /**
   * Merge multiple recipe objects into one
   * Later datasets override earlier ones if they have the same recipe ID
   */
  mergeRecipes(recipesObjects) {
    const result = {};
    const recipeMap = new Map();

    // Process all recipe objects
    for (const recipeObj of recipesObjects) {
      if (recipeObj.recipes && Array.isArray(recipeObj.recipes)) {
        // Handle recipes array format
        for (const recipe of recipeObj.recipes) {
          if (recipe.id) {
            recipeMap.set(recipe.id, recipe);
          }
        }
      } else {
        // Handle category-based format (legacy)
        for (const [category, recipes] of Object.entries(recipeObj)) {
          if (Array.isArray(recipes)) {
            if (!result[category]) {
              result[category] = [];
            }
            for (const recipe of recipes) {
              if (recipe.id) {
                recipeMap.set(recipe.id, { ...recipe, category });
              }
            }
          }
        }
      }
    }

    // Group recipes by category if they have one, otherwise put in "recipes"
    const categorized = {};
    for (const [id, recipe] of recipeMap.entries()) {
      const category = recipe.category || "recipes";
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(recipe);
    }

    // If everything is in "recipes" category, return it directly
    if (Object.keys(categorized).length === 1 && categorized.recipes) {
      return { recipes: categorized.recipes };
    }

    return categorized;
  }

  /**
   * Get the currently loaded data
   */
  getData() {
    return this.loadedData;
  }

  /**
   * Reload data after changing enabled datasets
   */
  async reloadData() {
    return await this.loadData();
  }
}
