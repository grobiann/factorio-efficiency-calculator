// Old single-column comparison rendering removed — no longer used.

// Render recipe columns: columns is an array where each element is an array of levels,
// and each level is an array of recipe result objects ({ recipeId, name, outputs, inputs, cost }).
import { buildRecipeNodes } from "../model/NodeBuilder.js";

// Render a recipe table. `productRecipes` is an array of top-level Recipe objects.
// This function will build per-recipe expansion columns (levels) internally
// using `Resolver.compare(..., "per_item")` and then render the grid.
export function renderRecipeTable(productRecipes, productId, targetCount, recipesByProduct, locale, multiplier = 1) {
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
        name.textContent = (firstNode.recipeId ? locale.recipeName(firstNode.recipeId) : firstNode.name) || "";
        headerCell.appendChild(name);

        const outList = document.createElement("div");
        outList.className = "small-list outputs";
        for (const [outId, amount] of Object.entries(firstNode.outputs || {})) {
            const p = document.createElement("div");
            p.textContent = `${locale.itemName(outId)}: ${(amount * multiplier).toFixed(2)}`;
            if (locale.isRare(outId)) p.classList.add("rare");
            outList.appendChild(p);
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
            rname.textContent = (node.recipeId ? locale.recipeName(node.recipeId) : node.name) || "";
            block.appendChild(rname);

            const outList2 = document.createElement("div");
            outList2.className = "small-list outputs";
            for (const [outId, amount] of Object.entries(node.outputs || {})) {
                const p = document.createElement("div");
                p.textContent = `${locale.itemName(outId)}: ${(amount * multiplier).toFixed(2)}`;
                if (locale.isRare(outId)) p.classList.add("rare");
                outList2.appendChild(p);
            }
            block.appendChild(outList2);

            const ingList = document.createElement("div");
            ingList.className = "small-list inputs";
            for (const [inputId, amount] of Object.entries(node.inputs || {})) {
                const p = document.createElement("div");
                p.textContent = `${locale.itemName(inputId)}: ${(amount * multiplier).toFixed(2)}`;
                if (locale.isRare(inputId)) p.classList.add("rare");
                ingList.appendChild(p);
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
