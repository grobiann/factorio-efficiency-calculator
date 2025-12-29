// Old single-column comparison rendering removed — no longer used.

// Render recipe columns: columns is an array where each element is an array of levels,
// and each level is an array of recipe result objects ({ recipeId, name, outputs, inputs, cost }).
import { buildRecipeNodes } from "../model/NodeBuilder.js";

// Helper: find icon path from loaded data
function getIconPath(type, id, loadedData) {
    try {
        if (type === "items" && loadedData && loadedData.items) {
            const item = loadedData.items.find(i => i.name === id);
            if (item && item.icon) {
                // __base__ is already in the correct folder structure
                return item.icon;
            }
        } else if (type === "recipes" && loadedData && loadedData.recipes) {
            // Search in all recipe categories
            for (const category of Object.values(loadedData.recipes)) {
                if (Array.isArray(category)) {
                    const recipe = category.find(r => r.name === id || r.id === id);
                    if (recipe && recipe.icon) {
                        return recipe.icon;
                    }
                }
            }
        }
    } catch (e) {
        console.warn(`Error getting icon path for ${type}/${id}:`, e);
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
    
    // Try to get icon path from data
    const iconPath = getIconPath(type, id, loadedData);
    
    if (iconPath) {
        const testImg = new Image();
        testImg.onload = function() {
            // Icon exists, use it
            icon.src = iconPath;
        };
        testImg.onerror = function() {
            // Icon doesn't exist, keep default and log warning
            console.warn(`Icon not found at path: ${iconPath} for ${type}/${id}`);
        };
        testImg.src = iconPath;
    } else {
        console.warn(`No icon path found in data for ${type}/${id}`);
    }
    
    const amountLabel = document.createElement("div");
    amountLabel.className = "icon-amount";
    amountLabel.textContent = (amount * multiplier).toFixed(2);
    
    const tooltip = document.createElement("div");
    tooltip.className = "icon-tooltip";
    tooltip.innerHTML = `<strong>${locale.itemName(id)}</strong><br>${(amount * multiplier).toFixed(2)}`;
    
    container.appendChild(icon);
    container.appendChild(amountLabel);
    container.appendChild(tooltip);
    
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
            
            // Recipe icon for sub-recipes
            if (node.recipeId) {
                const recipeIcon = createIconWithTooltip("recipes", node.recipeId, 1, locale, 1, loadedData);
                recipeIcon.classList.add("recipe-icon-small");
                rname.appendChild(recipeIcon);
            }
            
            const nameText = document.createElement("span");
            nameText.textContent = (node.recipeId ? locale.recipeName(node.recipeId) : node.name) || "";
            rname.appendChild(nameText);
            block.appendChild(rname);

            const outList2 = document.createElement("div");
            outList2.className = "icon-list outputs-list";
            for (const [outId, amount] of Object.entries(node.outputs || {})) {
                const iconEl = createIconWithTooltip("items", outId, amount, locale, multiplier, loadedData);
                outList2.appendChild(iconEl);
            }
            block.appendChild(outList2);

            const ingList = document.createElement("div");
            ingList.className = "icon-list inputs-list";
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
