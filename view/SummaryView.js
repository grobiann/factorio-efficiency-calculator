import { buildRecipeNodes } from "../model/NodeBuilder.js";

// Render a summary table for the provided array of top-level recipes (`productRecipes`).
// productId and targetCount are forwarded to `Resolver.compare` to compute
// per-recipe recursive base totals and scaled outputs. `recipesByProduct` is used
// for recursive expansion when building the costs.
export function renderSummaryTable(productRecipes, productId, targetCount, recipesByProduct, locale, multiplier = 1) {
    const container = document.getElementById("summary");
    container.innerHTML = "";

    if (!productRecipes || productRecipes.length === 0) return;

    // Build columns using shared builder
    const columns = productRecipes.map(r => buildRecipeNodes(r, productId, targetCount, recipesByProduct));
    const cols = columns.length;

    const summaryTable = document.createElement("div");
    summaryTable.className = "summary-table";
    summaryTable.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Header row: show each top recipe name and its top-level outputs (same as recipe table)
    const headerRow = document.createElement("div");
    headerRow.className = "summary-header-row";

    // Build header row
    for (let c = 0; c < cols; c++) {
        const col = columns[c];

        const headerCell = document.createElement("div");
        headerCell.className = "col summary-col header-cell";
        const firstNode = (col.recipeNodes || [])[0] || {};

        const name = document.createElement("div");
        name.className = "recipe-name";
        name.textContent = (col.recipe && col.recipe.id) ? locale.recipeName(col.recipe.id) : (col.recipe?.name || "");
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
    }

    // Row 1: outputs totals (생성 아이템)
    const outputsRow = document.createElement("div");
    outputsRow.className = "summary-row outputs-row";
    for (let c = 0; c < cols; c++) {
        const col = columns[c];
        const cell = document.createElement("div");
        cell.className = "col summary-col";
        // Compute produced vs consumed totals across all nodes in this column
        const producedTotals = Object.assign({}, col.outputsTotals || {});
        const consumedTotals = {};
        for (const node of (col.recipeNodes || [])) {
            for (const [inId, amt] of Object.entries(node.inputs || {})) {
                consumedTotals[inId] = (consumedTotals[inId] || 0) + amt;
            }
        }

        const outList = document.createElement("div");
        outList.className = "small-list outputs-totals";
        const outTitle = document.createElement("div");
        outTitle.className = "summary-section-title";
        outTitle.textContent = "생성";
        cell.appendChild(outTitle);

        // Show only net-produced items: produced - consumed > 0
        const prodKeys = Object.keys(producedTotals || {});
        for (const id of prodKeys) {
            const produced = producedTotals[id] || 0;
            const consumed = consumedTotals[id] || 0;
            const net = produced - consumed;
            if (net <= 0) continue;
            const p = document.createElement("div");
            p.textContent = `${locale.itemName(id)}: ${(net * multiplier).toFixed(2)}`;
            if (locale.isRare(id)) p.classList.add("rare");
            outList.appendChild(p);
        }

        cell.appendChild(outList);
        outputsRow.appendChild(cell);
    }
    summaryTable.appendChild(headerRow);
    summaryTable.appendChild(outputsRow);

    // Row 2: materials (재료) - show only net-consumed items: consumed - produced > 0
    const baseRow = document.createElement("div");
    baseRow.className = "summary-row base-row";
    for (let c = 0; c < cols; c++) {
        const col = columns[c];
        const cell = document.createElement("div");
        cell.className = "col summary-col";

        // compute consumed totals
        const consumedTotals = {};
        for (const node of (col.recipeNodes || [])) {
            for (const [inId, amt] of Object.entries(node.inputs || {})) {
                consumedTotals[inId] = (consumedTotals[inId] || 0) + amt;
            }
        }
        const producedTotals = Object.assign({}, col.outputsTotals || {});

        const baseList = document.createElement("div");
        baseList.className = "small-list base-totals";
        const baseTitle = document.createElement("div");
        baseTitle.className = "summary-section-title";
        baseTitle.textContent = "재료";
        cell.appendChild(baseTitle);

        const allKeys = new Set([...Object.keys(consumedTotals), ...Object.keys(producedTotals)]);
        for (const id of allKeys) {
            const consumed = consumedTotals[id] || 0;
            const produced = producedTotals[id] || 0;
            const net = consumed - produced;
            if (net <= 0) continue;
            const p = document.createElement("div");
            p.textContent = `${locale.itemName(id)}: ${(net * multiplier).toFixed(2)}`;
            if (locale.isRare(id)) p.classList.add("rare");
            baseList.appendChild(p);
        }

        cell.appendChild(baseList);
        baseRow.appendChild(cell);
    }
    summaryTable.appendChild(baseRow);

    container.appendChild(summaryTable);
}
