/**
 * DatasetConfigView - UI for selecting which datasets to enable/disable
 */
export class DatasetConfigView {
  constructor(datasetManager, onDatasetChange) {
    this.datasetManager = datasetManager;
    this.onDatasetChange = onDatasetChange;
  }

  /**
   * Render the dataset configuration UI in the settings panel
   */
  render(container) {
    if (!container) return;

    const datasets = this.datasetManager.getDatasets();
    
    const section = document.createElement("div");
    section.className = "dataset-config-section";
    
    const title = document.createElement("h3");
    title.textContent = "데이터 소스 선택";
    title.style.marginTop = "15px";
    title.style.marginBottom = "10px";
    section.appendChild(title);

    const description = document.createElement("p");
    description.textContent = "사용할 모드/버전 데이터를 선택하세요:";
    description.style.fontSize = "0.9em";
    description.style.color = "#666";
    description.style.marginBottom = "10px";
    section.appendChild(description);

    const list = document.createElement("div");
    list.className = "dataset-list";
    
    datasets.forEach(dataset => {
      const item = this.createDatasetItem(dataset);
      list.appendChild(item);
    });

    section.appendChild(list);

    const applyButton = document.createElement("button");
    applyButton.textContent = "데이터 적용";
    applyButton.style.marginTop = "10px";
    applyButton.style.padding = "8px 16px";
    applyButton.style.cursor = "pointer";
    applyButton.onclick = async () => {
      applyButton.disabled = true;
      applyButton.textContent = "로딩 중...";
      try {
        await this.onDatasetChange();
        applyButton.textContent = "적용 완료!";
        setTimeout(() => {
          applyButton.textContent = "데이터 적용";
          applyButton.disabled = false;
        }, 1500);
      } catch (error) {
        console.error("Failed to apply dataset changes:", error);
        applyButton.textContent = "오류 발생";
        setTimeout(() => {
          applyButton.textContent = "데이터 적용";
          applyButton.disabled = false;
        }, 1500);
      }
    };
    section.appendChild(applyButton);

    container.appendChild(section);
    return section;
  }

  /**
   * Create a single dataset checkbox item
   */
  createDatasetItem(dataset) {
    const item = document.createElement("div");
    item.className = "dataset-item";
    item.style.marginBottom = "8px";
    item.style.padding = "8px";
    item.style.border = "1px solid #ddd";
    item.style.borderRadius = "4px";
    item.style.backgroundColor = "#f9f9f9";

    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "flex-start";
    label.style.cursor = "pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = this.datasetManager.isEnabled(dataset.id);
    checkbox.style.marginRight = "10px";
    checkbox.style.marginTop = "2px";
    checkbox.onchange = () => {
      this.datasetManager.setEnabled(dataset.id, checkbox.checked);
    };

    const textContainer = document.createElement("div");
    textContainer.style.flex = "1";

    const nameDiv = document.createElement("div");
    nameDiv.textContent = dataset.name;
    nameDiv.style.fontWeight = "bold";
    nameDiv.style.marginBottom = "3px";
    textContainer.appendChild(nameDiv);

    if (dataset.description) {
      const descDiv = document.createElement("div");
      descDiv.textContent = dataset.description;
      descDiv.style.fontSize = "0.85em";
      descDiv.style.color = "#666";
      textContainer.appendChild(descDiv);
    }

    label.appendChild(checkbox);
    label.appendChild(textContainer);
    item.appendChild(label);

    return item;
  }

  /**
   * Update the view to reflect current dataset state
   */
  update() {
    // Re-render if needed
    const checkboxes = document.querySelectorAll('.dataset-item input[type="checkbox"]');
    const datasets = this.datasetManager.getDatasets();
    
    checkboxes.forEach((checkbox, index) => {
      if (datasets[index]) {
        checkbox.checked = this.datasetManager.isEnabled(datasets[index].id);
      }
    });
  }
}
