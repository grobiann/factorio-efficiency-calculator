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

      console.log("Load dataset config:\ndatasets:", this.datasets);
      console.log("Load dataset config:\nenabledDatasets:", this.enabledDatasets);

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
  }

  /**
   * Load and merge all enabled datasets
   */
  async loadData() {
    const allEntries = [];
    const recipesObjects = [];
    const allCategories = [];

    // Load enabled datasets in order
    const enabledList = this.datasets
      .filter(ds => this.enabledDatasets.has(ds.id))
      .sort((a, b) => a.order - b.order);

    for (const dataset of enabledList) {
      try {
        const filePath = Array.isArray(dataset.files) ? dataset.files[0] : dataset.files;
        const dataRaw = await fetch(`data/${filePath}`).then(r => r.json());
        
        // Process each type in data.raw
        let totalItems = 0;
        let totalRecipes = 0;
        let totalCategories = 0;
        
        // Process items (item, tool, ammo, capsule, module, etc.)
        const itemTypes = ['item', 'tool', 'ammo', 'capsule', 'module', 'armor', 'gun', 
                          'rail-planner', 'spidertron-remote', 'selection-tool'];
        for (const itemType of itemTypes) {
          if (dataRaw[itemType]) {
            const itemCount = Object.keys(dataRaw[itemType]).length;
            console.log(`  Processing ${itemType}: ${itemCount} entries`);
            const items = Object.entries(dataRaw[itemType]).map(([id, data]) => ({
              ...data,
              id: id,
              type: 'item',
              originalType: itemType,
              name: data.name || id
            }));
            allEntries.push(...items);
            totalItems += items.length;
          }
        }
        
        // Process fluids
        if (dataRaw['fluid']) {
          console.log(`  Processing fluid: ${Object.keys(dataRaw['fluid']).length} entries`);
          const fluids = Object.entries(dataRaw['fluid']).map(([id, data]) => ({
            ...data,
            id: id,
            type: 'fluid',
            name: data.name || id
          }));
          allEntries.push(...fluids);
          totalItems += fluids.length;
        }
        
        // Process recipes
        if (dataRaw['recipe']) {
          console.log(`  Processing recipe: ${Object.keys(dataRaw['recipe']).length} entries`);
          const recipes = Object.entries(dataRaw['recipe']).map(([id, data]) => {
            // subgroup이 없으면 결과 아이템의 subgroup을 찾아서 보정
            let subgroup = data.subgroup;
            if (!subgroup && data.results && Array.isArray(data.results) && data.results.length > 0) {
              // 첫 번째 결과 아이템의 subgroup을 찾아본다
              const resultName = data.results[0].name || data.results[0][0];
              // allEntries에는 아직 아이템이 다 안 들어왔을 수 있으니 dataRaw에서 직접 찾음
              let found = null;
              for (const itemType of ['item', 'tool', 'ammo', 'capsule', 'module', 'armor', 'gun', 'rail-planner', 'spidertron-remote', 'selection-tool', 'fluid']) {
                if (dataRaw[itemType] && dataRaw[itemType][resultName]) {
                  found = dataRaw[itemType][resultName];
                  break;
                }
              }
              if (found && found.subgroup) subgroup = found.subgroup;
            }
            return {
              ...data,
              id: id,
              type: 'recipe',
              name: data.name || id,
              subgroup: subgroup
            };
          });
          allEntries.push(...recipes);
          recipesObjects.push({ recipes: recipes });
          totalRecipes = recipes.length;
        }
        
        // Process categories (item-group, item-subgroup, recipe-category)
        if (dataRaw['item-group']) {
          console.log(`  Processing item-group: ${Object.keys(dataRaw['item-group']).length} entries`);
          const groups = Object.entries(dataRaw['item-group']).map(([id, data]) => ({
            ...data,
            id: id,
            type: 'item-group',
            name: data.name || id
          }));
          allEntries.push(...groups);
          allCategories.push(...groups);
          totalCategories += groups.length;
        }
        
        if (dataRaw['item-subgroup']) {
          const subgroups = Object.entries(dataRaw['item-subgroup']).map(([id, data]) => ({
            ...data,
            id: id,
            type: 'item-subgroup',
            name: data.name || id
          }));
          allEntries.push(...subgroups);
          totalCategories += subgroups.length;
        }
        
        if (dataRaw['recipe-category']) {
          console.log(`  Processing recipe-category: ${Object.keys(dataRaw['recipe-category']).length} entries`);
          const recipeCategories = Object.entries(dataRaw['recipe-category']).map(([id, data]) => ({
            ...data,
            id: id,
            type: 'recipe-category',
            name: data.name || id
          }));
          allEntries.push(...recipeCategories);
          totalCategories += recipeCategories.length;
        }
      } catch (error) {
        console.error(`Failed to load dataset ${dataset.id}:`, error);
      }
    }

    // Merge recipes - later datasets can override earlier ones
    const mergedRecipes = this.mergeRecipes(recipesObjects);

    // 타입별로 데이터 분류
    const items = [];
    const fluids = [];
    const modules = [];
    const itemGroups = [];
    const itemSubgroups = [];
    const technologies = [];
    const entities = [];
    const equipment = [];
    const others = [];

    for (const entry of allEntries) {
      if (!entry.type) {
        others.push(entry);
        continue;
      }

      switch (entry.type) {
        case 'item':
          items.push(entry);
          break;
        case 'fluid':
          fluids.push(entry);
          break;
        case 'module':
          modules.push(entry);
          break;
        case 'item-group':
          itemGroups.push(entry);
          break;
        case 'item-subgroup':
          itemSubgroups.push(entry);
          break;
        case 'technology':
          technologies.push(entry);
          break;
        case 'recipe':
          // 레시피는 이미 mergedRecipes에 있음
          break;
        default:
          // entity, equipment 등 기타
          if (entry.type.includes('entity') || entry.type.includes('assembling-machine') || 
              entry.type.includes('furnace') || entry.type.includes('mining-drill')) {
            entities.push(entry);
          } else if (entry.type.includes('equipment')) {
            equipment.push(entry);
          } else {
            others.push(entry);
          }
          break;
      }
    }

    this.loadedData = {
      entries: allEntries,
      recipes: mergedRecipes,
      categories: allCategories,
      items: items,
      fluids: fluids,
      modules: modules,
      itemGroups: itemGroups,
      itemSubgroups: itemSubgroups,
      technologies: technologies,
      entities: entities,
      equipment: equipment,
      others: others
    };
    
    console.log("Loaded data:", this.loadedData);
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
          const recipeId = recipe.id || recipe.name;
          if (recipeId) {
            recipeMap.set(recipeId, recipe);
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
              const recipeId = recipe.id || recipe.name;
              if (recipeId) {
                recipeMap.set(recipeId, { ...recipe, category });
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
