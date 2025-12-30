import { Calculator } from "./Calculator.js";

// Build a node object representing a scaled recipe result for a target count.
export function buildSingleRecipeNode(recipe, productId, targetCount, recipesByProduct) {
    const resultsMap = recipe.getResultsMap();
    const producedPerCraft = resultsMap[productId] || 0;
    if (!producedPerCraft) {
        console.warn(`Recipe ${recipe.id} does not produce ${productId} (or has zero output); skipping.`);
        return { recipeId: recipe.id, name: recipe.name, outputs: {}, inputs: {}, cost: {} };
    }

    const craftsNeeded = targetCount / producedPerCraft;

    // scaled inputs
    const inputsScaled = {};
    const ingredientsMap = recipe.getIngredientsMap();
    for (const [itemId, amount] of Object.entries(ingredientsMap)) {
        inputsScaled[itemId] = amount * craftsNeeded;
    }

    // scaled outputs
    const outputsScaled = {};
    for (const [outId, amount] of Object.entries(resultsMap)) {
        outputsScaled[outId] = amount * craftsNeeded;
    }

    const cost = Calculator.calculateRecursivePerItem(productId, recipe, targetCount, recipesByProduct);

    return {
        recipeId: recipe.id,
        name: recipe.name,
        outputs: outputsScaled,
        inputs: inputsScaled,
        cost
    };
}

// Build a column (levels) for a top-level recipe
export function buildRecipeNodes(recipe, productId, targetCount, recipesByProduct, maxDepth = 12) {
    // recipeNodes is a flat array of nodes (each node represents running a recipe
    // to produce a certain amount). We iteratively expand the inputs of
    // nodes (breadth-first) and append child nodes. If a recipe already exists
    // in recipeNodes we merge quantities into the existing node and move it to
    // the end (so its final position is the last occurrence).

    const recipeNodes = [];
    const depths = []; // parallel array to track depth of each node

    const firstNode = buildSingleRecipeNode(recipe, productId, targetCount, recipesByProduct);
    recipeNodes.push(firstNode);
    depths.push(0);

    // Helpers
    function mergeMaps(target = {}, src = {}) {
        for (const [k, v] of Object.entries(src || {})) {
            target[k] = (target[k] || 0) + v;
        }
        return target;
    }

    function mergeInto(target, src) {
        target.outputs = mergeMaps(target.outputs, src.outputs);
        target.inputs = mergeMaps(target.inputs, src.inputs);
        target.cost = mergeMaps(target.cost, src.cost);
        // Keep recipeId/name as the recipe identity (they should be same)
        target.recipeId = src.recipeId;
        target.name = src.name;
    }

    // Process nodes breadth-first; i moves forward while new nodes may be pushed
    for (let i = 0; i < recipeNodes.length; i++) {
        const node = recipeNodes[i];
        const nodeDepth = depths[i];
        if (nodeDepth >= maxDepth) continue; // respect depth guard

        for (const [itemId, amountNeeded] of Object.entries(node.inputs || {})) {
            const producers = recipesByProduct[itemId];
            if (!producers || producers.length === 0) continue;

            const producer = producers[0];
            const childNode = buildSingleRecipeNode(producer, itemId, amountNeeded, recipesByProduct);

            // check if this recipe already exists in recipeNodes (by recipeId)
            const existingIndex = recipeNodes.findIndex(n => n.recipeId === childNode.recipeId);
            if (existingIndex !== -1) {
                // merge quantities into the existing node
                const existingNode = recipeNodes[existingIndex];
                mergeInto(existingNode, childNode);

                // remove existing node and re-append it at the end with the new depth
                recipeNodes.splice(existingIndex, 1);
                depths.splice(existingIndex, 1);
                recipeNodes.push(existingNode);
                depths.push(nodeDepth + 1);
            } else {
                // add as new node
                recipeNodes.push(childNode);
                depths.push(nodeDepth + 1);
            }
        }
    }

    const top = firstNode || {};
    const baseTotals = top.cost || {};

    const outputsTotals = {};
    for (const node of recipeNodes) {
        for (const [outId, amt] of Object.entries(node.outputs || {})) {
            outputsTotals[outId] = (outputsTotals[outId] || 0) + amt;
        }
    }

    return { recipe, recipeNodes, top, baseTotals, outputsTotals };
}
