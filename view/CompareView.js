// Old single-column comparison rendering removed — no longer used.

// Render recipe columns: columns is an array where each element is an array of levels,
// and each level is an array of recipe result objects ({ recipeId, name, outputs, inputs, cost }).
import { buildRecipeNodes } from "../model/NodeBuilder.js";

// Helper: find icon info from loaded data
function getIconInfo(type, id, loadedData) {
    try {
        if (type === "recipes" && loadedData && loadedData.recipes) {
            // Search in all recipe categories
            for (const category of Object.values(loadedData.recipes)) {
                if (Array.isArray(category)) {
                    const recipe = category.find(r => r.name === id || r.id === id);
                    if (recipe) {
                        // If recipe has its own icon, use it
                        if (recipe.icon) {
                            return {
                                path: recipe.icon,
                                size: recipe.icon_size || 64,
                                mipmaps: recipe.mipmap_count || 0
                            };
                        }
                        
                        // Otherwise, use the first result's icon
                        if (recipe.results && recipe.results.length > 0) {
                            const firstResult = recipe.results[0];
                            const resultName = firstResult.name || firstResult[0]; // Handle both object and array format
                            if (resultName) {
                                // Recursively get the item's icon
                                return getIconInfo("items", resultName, loadedData);
                            }
                        }
                        
                        return null;
                    }
                }
            }
        }
        else if (loadedData && loadedData.entries) {
            // Search in entries with priority: item > module > fluid
            // If first match has no icon, try other types
            const searchTypes = ['item', 'module', 'fluid'];
            
            for (const searchType of searchTypes) {
                const entry = loadedData.entries.find(e => e.name === id && e.type === searchType);
                if (entry && entry.icon) {
                    // Return icon path and metadata
                    return {
                        path: entry.icon,
                        size: entry.icon_size || 64,
                        mipmaps: entry.mipmap_count || (entry.pictures && entry.pictures[0] ? entry.pictures[0].mipmap_count : 0)
                    };
                }
            }
            
            // If no entry with icon found, return the first matching entry even without icon
            const anyEntry = loadedData.entries.find(e => e.name === id);
            if (anyEntry) {
                return {
                    path: anyEntry.icon || null,
                    size: anyEntry.icon_size || 64,
                    mipmaps: anyEntry.mipmap_count || (anyEntry.pictures && anyEntry.pictures[0] ? anyEntry.pictures[0].mipmap_count : 0)
                };
            }
        }
    } catch (e) {
        console.warn(`Error getting icon info for ${type}/${id}:`, e);
    }
    return null;
}

// Helper: create an icon element with tooltip
function createIconWithTooltip(type, id, amount, locale, multiplier = 1, loadedData = null) {
    const container = document.createElement("div");
    container.className = "icon-container";
    
    const icon = document.createElement("img");
    icon.className = "item-icon";
    icon.alt = locale.itemName(id);
    
    // Start with default icon to avoid 404 errors
    icon.src = "data/default-icon.svg";
    
    // Try to get icon info from data
    const iconInfo = getIconInfo(type, id, loadedData);
    if (iconInfo && iconInfo.path) {
        const testImg = new Image();
        testImg.onload = function() {
            // Icon exists, use it
            icon.src = iconInfo.path;
            
            const iconSize = iconInfo.size || 64;
            icon.style.width = iconSize + "px";
            icon.style.height = iconSize + "px";
            icon.style.objectFit = 'none';
            icon.style.objectPosition = '0 0';
        };
        testImg.onerror = function() {
            // Icon doesn't exist, keep default and log warning
            console.warn(`Icon not found at path: ${iconInfo.path} for ${type}/${id}`);
        };
        testImg.src = iconInfo.path;
    } else {
        console.warn(`No icon path found in data for ${type}/${id}`);
    }
    
    //const amountLabel = document.createElement("div");
    //amountLabel.className = "icon-amount";
    //amountLabel.textContent = (amount * multiplier).toFixed(2);
    
    container.appendChild(icon);
    
    return container;
}

// Render a recipe table. `productRecipes` is an array of top-level Recipe objects.
// This function will build per-recipe expansion columns (levels) internally
// usinolver.compare(..., "per_item")` and then render the grid.
export async function renderRecipeTable(productRecipes, productId, targetCount, recipesByProduct, locale, multiplier = 1, loadedData = null) {
    const container = document.getElementById("result");
    container.innerHTML = "";

    if (!productRecipes || productRecipes.length === 0) return;

    // Build columns using shared builder
    const columns = productRecipes.map(r => buildRecipeNodes(r, productId, targetCount, recipesByProduct));
    const cols = columns.length;

    const table = document.createElement("div");
    table.className = "recipe-compare-table";
    table.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Header row: recipe name + outputs (for each top recipe, take level0 first item)
    const headerRow = document.createElement("div");
    headerRow.className = "recipe-compare-row header";

    const bodyRow = document.createElement("div");
    bodyRow.className = "recipe-compare-row";

    // Build header cell and column body in a single loop so each column's
    // content is created together (clearer logical grouping).
    for (let c = 0; c < cols; c++) {
        const col = columns[c];

        // Header cell
        const headerCell = document.createElement("div");
        headerCell.className = "recipe-compare-cell header-cell";
        const firstNode = (col.recipeNodes || [])[0] || {};

        const name = document.createElement("div");
        name.className = "recipe-name";
        
        // Recipe icon
        if (firstNode.recipeId) {
            const recipeIcon = createIconWithTooltip("recipes", firstNode.recipeId, 1, locale, 1, loadedData);
            recipeIcon.classList.add("recipe-icon");
            name.appendChild(recipeIcon);
        }
        
        const nameText = document.createElement("span");
        nameText.textContent = (firstNode.recipeId ? locale.recipeName(firstNode.recipeId) : firstNode.name) || "";
        name.appendChild(nameText);
        headerCell.appendChild(name);

        const outList = document.createElement("div");
        outList.className = "icon-list outputs-list";
        for (const [outId, amount] of Object.entries(firstNode.outputs || {})) {
            const iconEl = createIconWithTooltip("items", outId, amount, locale, multiplier, loadedData);
            outList.appendChild(iconEl);
        }
        headerCell.appendChild(outList);
        headerRow.appendChild(headerCell);

        // Column body (stack of nodes)
        const cell = document.createElement("div");
        cell.className = "recipe-compare-cell";

        const nodes = col.recipeNodes || [];
        for (const node of nodes) {
            const block = document.createElement("div");
            block.className = "recipe-block";

            const rname = document.createElement("div");
            rname.className = "recipe-name small";
            
            // Recipe icon for sub-recipes (no text)
            if (node.recipeId) {
                const recipeIcon = createIconWithTooltip("recipes", node.recipeId, 1, locale, 1, loadedData);
                recipeIcon.classList.add("recipe-icon-small");
                rname.appendChild(recipeIcon);
            }
            
            block.appendChild(rname);

            const outList2 = document.createElement("div");
            outList2.className = "icon-list outputs-list";
            outList2.style.display = "flex";
            outList2.style.flexDirection = "row";
            outList2.style.flexWrap = "wrap";
            outList2.style.backgroundColor = "#4a9eff";
            outList2.style.border = "none";
            for (const [outId, amount] of Object.entries(node.outputs || {})) {
                const iconEl = createIconWithTooltip("items", outId, amount, locale, multiplier, loadedData);
                outList2.appendChild(iconEl);
            }
            block.appendChild(outList2);

            const ingList = document.createElement("div");
            ingList.className = "icon-list inputs-list";
            ingList.style.display = "flex";
            ingList.style.flexDirection = "row";
            ingList.style.flexWrap = "wrap";
            ingList.style.backgroundColor = "#d4a574";
            ingList.style.border = "none";
            for (const [inputId, amount] of Object.entries(node.inputs || {})) {
                const iconEl = createIconWithTooltip("items", inputId, amount, locale, multiplier, loadedData);
                ingList.appendChild(iconEl);
            }
            block.appendChild(ingList);

            cell.appendChild(block);
        }

        bodyRow.appendChild(cell);
    }

    table.appendChild(headerRow);
    table.appendChild(bodyRow);

    container.appendChild(table);
}
