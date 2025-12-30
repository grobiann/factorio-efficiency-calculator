import { CustomRecipe, CustomRecipeManager } from "../model/CustomRecipe.js";

/**
 * CustomRecipeView - 커스텀 레시피 관리 UI
 */
export class CustomRecipeView {
  constructor(loadedData, locale) {
    this.manager = new CustomRecipeManager();
    this.loadedData = loadedData;
    this.locale = locale;
  }

  /**
   * 아이템 아이콘 생성
   */
  createItemIcon(itemId, amount = 1) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-flex; flex-direction: column; align-items: center; gap: 2px;';
    
    const container = document.createElement('div');
    container.style.cssText = 'width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border: 1px solid #ccc; border-radius: 2px; overflow: hidden;';
    
    const icon = document.createElement('img');
    icon.alt = this.locale.itemName(itemId);
    icon.title = this.locale.itemName(itemId);
    
    // 아이콘 정보 가져오기
    const iconInfo = this.getIconInfo(itemId);
    if (iconInfo && iconInfo.path) {
      icon.src = iconInfo.path;
      
      // Mipmap 처리: 원본 크기로 표시하되 첫 번째 mipmap만 보이도록
      if (iconInfo.mipmaps > 0) {
        const iconSize = iconInfo.size || 64;
        // Mipmap 이미지의 총 너비 계산
        let totalWidth = iconSize;
        for (let i = 1; i < iconInfo.mipmaps; i++) {
          totalWidth += iconSize / Math.pow(2, i);
        }
        
        // 원본 크기 유지, 32x32 영역만 보이도록 crop
        const scale = 32 / iconSize; // 32px 표시 크기 / 원본 아이콘 크기
        icon.style.cssText = `width: ${totalWidth * scale}px; height: ${iconSize * scale}px; object-fit: none; object-position: -64px 0;`;
      } else {
        // 일반 아이콘: 32x32로 표시
        icon.style.cssText = 'width: 32px; height: 32px; object-fit: none; object-position: -64px 0;';
      }
    } else {
      icon.src = 'data/default-icon.svg';
      icon.style.cssText = 'width: 32px; height: 32px; object-fit: contain;';
    }
    
    container.appendChild(icon);
    wrapper.appendChild(container);
    
    // 수량 표시
    const amountLabel = document.createElement('div');
    amountLabel.style.cssText = 'font-size: 11px; color: #666; font-weight: 500;';
    amountLabel.textContent = amount;
    wrapper.appendChild(amountLabel);
    
    return wrapper;
  }

  /**
   * 아이콘 정보 가져오기
   */
  getIconInfo(itemId) {
    if (!this.loadedData || !this.loadedData.entries) return null;
    
    const searchTypes = ['item', 'module', 'fluid'];
    
    for (const searchType of searchTypes) {
      const entry = this.loadedData.entries.find(e => e.name === itemId && e.type === searchType);
      if (entry && entry.icon) {
        return {
          path: entry.icon,
          size: entry.icon_size || 64,
          mipmaps: entry.mipmap_count || 0
        };
      }
    }
    
    const anyEntry = this.loadedData.entries.find(e => e.name === itemId);
    if (anyEntry) {
      return {
        path: anyEntry.icon || null,
        size: anyEntry.icon_size || 64,
        mipmaps: anyEntry.mipmap_count || 0
      };
    }
    
    return null;
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    const recipeList = container.querySelector('#customRecipeList');
    if (!recipeList) return;

    recipeList.innerHTML = '';

    const recipes = this.manager.getAllRecipes();
    if (recipes.length === 0) {
      recipeList.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">커스텀 레시피가 없습니다. 새로 추가해보세요!</p>';
      return;
    }

    for (const recipe of recipes) {
      const recipeItem = this.createRecipeItem(recipe);
      recipeList.appendChild(recipeItem);
    }
  }

  /**
   * 레시피 아이템 생성
   */
  createRecipeItem(recipe) {
    const div = document.createElement('div');
    div.className = 'recipe-item';

    const info = document.createElement('div');
    info.className = 'recipe-info';

    const name = document.createElement('div');
    name.className = 'recipe-name';
    name.textContent = recipe.name;

    const details = document.createElement('div');
    details.className = 'recipe-details';
    details.style.cssText = 'display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';
    
    // 재료 아이콘들
    recipe.ingredients.forEach(ing => {
      const icon = this.createItemIcon(ing.name, ing.amount);
      details.appendChild(icon);
    });
    
    // 화살표
    const arrow = document.createElement('span');
    arrow.textContent = '→';
    arrow.style.cssText = 'margin: 0 4px; color: #666;';
    details.appendChild(arrow);
    
    // 결과물 아이콘들
    recipe.results.forEach(res => {
      const icon = this.createItemIcon(res.name, res.amount);
      details.appendChild(icon);
    });

    info.appendChild(name);
    info.appendChild(details);

    const actions = document.createElement('div');
    actions.className = 'recipe-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-secondary';
    editBtn.textContent = '수정';
    editBtn.onclick = () => this.editRecipe(recipe.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger';
    deleteBtn.textContent = '삭제';
    deleteBtn.onclick = () => this.deleteRecipe(recipe.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(info);
    div.appendChild(actions);

    return div;
  }

  /**
   * 새 레시피 추가
   */
  addRecipe() {
    this.showRecipeModal();
  }

  /**
   * 레시피 수정
   */
  editRecipe(recipeId) {
    const recipe = this.manager.getRecipe(recipeId);
    if (recipe) {
      this.showRecipeModal(recipe);
    }
  }

  /**
   * 레시피 삭제
   */
  deleteRecipe(recipeId) {
    if (confirm('정말 이 레시피를 삭제하시겠습니까?')) {
      this.manager.deleteRecipe(recipeId);
      this.render(document.getElementById('custom-recipe-tab'));
    }
  }

  /**
   * 레시피 모달 표시
   */
  showRecipeModal(recipe = null) {
    const isEdit = recipe !== null;
    const currentRecipe = recipe || new CustomRecipe();

    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? '레시피 수정' : '새 레시피 추가'}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>레시피 이름</label>
            <input type="text" id="recipeName" value="${currentRecipe.name}" placeholder="예: 고급 철판">
          </div>
          <div class="form-group">
            <label>제작 시간 (초)</label>
            <input type="number" id="recipeTime" value="${currentRecipe.energy_required}" step="0.1" min="0.1">
          </div>
          <div class="form-group">
            <label>재료 (Ingredients)</label>
            <div id="ingredientsList"></div>
            <button type="button" class="btn-secondary" id="addIngredientBtn">재료 추가</button>
          </div>
          <div class="form-group">
            <label>결과물 (Results)</label>
            <div id="resultsList"></div>
            <button type="button" class="btn-secondary" id="addResultBtn">결과물 추가</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary modal-cancel">취소</button>
          <button class="btn-primary modal-save">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 아이템 목록 (entries에서 가져오기)
    const allItems = this.loadedData?.entries ? 
      this.loadedData.entries.filter(e => ['item', 'fluid', 'module'].includes(e.type)) : [];

    // 재료 렌더링
    const renderIngredients = () => {
      const list = modal.querySelector('#ingredientsList');
      list.innerHTML = '';

      currentRecipe.ingredients.forEach((ing, index) => {
        const ingDiv = document.createElement('div');
        ingDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
        ingDiv.innerHTML = `
          <select class="ing-item" data-index="${index}" style="flex: 2;">
            ${allItems.map(item => 
              `<option value="${item.name}" ${ing.name === item.name ? 'selected' : ''}>${this.locale.itemName(item.name)}</option>`
            ).join('')}
          </select>
          <input type="number" class="ing-amount" data-index="${index}" value="${ing.amount}" min="0.1" step="0.1" placeholder="수량" style="flex: 1; width: 100px;">
          <button type="button" class="btn-danger" data-index="${index}" style="padding: 8px 12px;">삭제</button>
        `;
        list.appendChild(ingDiv);
      });

      // 이벤트 리스너
      list.querySelectorAll('.ing-item').forEach(select => {
        select.onchange = (e) => {
          const idx = parseInt(e.target.dataset.index);
          currentRecipe.ingredients[idx].name = e.target.value;
        };
      });

      list.querySelectorAll('.ing-amount').forEach(input => {
        input.onchange = (e) => {
          const idx = parseInt(e.target.dataset.index);
          currentRecipe.ingredients[idx].amount = parseFloat(e.target.value) || 1;
        };
      });

      list.querySelectorAll('button[data-index]').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.target.dataset.index);
          currentRecipe.removeIngredient(idx);
          renderIngredients();
        };
      });
    };

    // 결과물 렌더링
    const renderResults = () => {
      const list = modal.querySelector('#resultsList');
      list.innerHTML = '';

      currentRecipe.results.forEach((res, index) => {
        const resDiv = document.createElement('div');
        resDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
        resDiv.innerHTML = `
          <select class="res-item" data-index="${index}" style="flex: 2;">
            ${allItems.map(item => 
              `<option value="${item.name}" ${res.name === item.name ? 'selected' : ''}>${this.locale.itemName(item.name)}</option>`
            ).join('')}
          </select>
          <input type="number" class="res-amount" data-index="${index}" value="${res.amount}" min="0.1" step="0.1" placeholder="수량" style="flex: 1; width: 100px;">
          <button type="button" class="btn-danger" data-index="${index}" style="padding: 8px 12px;">삭제</button>
        `;
        list.appendChild(resDiv);
      });

      // 이벤트 리스너
      list.querySelectorAll('.res-item').forEach(select => {
        select.onchange = (e) => {
          const idx = parseInt(e.target.dataset.index);
          currentRecipe.results[idx].name = e.target.value;
        };
      });

      list.querySelectorAll('.res-amount').forEach(input => {
        input.onchange = (e) => {
          const idx = parseInt(e.target.dataset.index);
          currentRecipe.results[idx].amount = parseFloat(e.target.value) || 1;
        };
      });

      list.querySelectorAll('button[data-index]').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(e.target.dataset.index);
          currentRecipe.removeResult(idx);
          renderResults();
        };
      });
    };

    renderIngredients();
    renderResults();

    // 재료 추가 버튼
    modal.querySelector('#addIngredientBtn').onclick = () => {
      const firstItem = allItems[0]?.name || 'iron-plate';
      currentRecipe.addIngredient(firstItem, 1);
      renderIngredients();
    };

    // 결과물 추가 버튼
    modal.querySelector('#addResultBtn').onclick = () => {
      const firstItem = allItems[0]?.name || 'iron-plate';
      currentRecipe.addResult(firstItem, 1);
      renderResults();
    };

    // 모달 닫기
    const closeModal = () => {
      modal.remove();
    };

    modal.querySelector('.modal-close').onclick = closeModal;
    modal.querySelector('.modal-cancel').onclick = closeModal;
    
    // 모달 배경 클릭으로 닫기 (드래그 방지)
    let mouseDownTarget = null;
    modal.addEventListener('mousedown', (e) => {
      mouseDownTarget = e.target;
    });
    modal.addEventListener('mouseup', (e) => {
      if (e.target === modal && mouseDownTarget === modal) {
        closeModal();
      }
      mouseDownTarget = null;
    });

    // 저장
    modal.querySelector('.modal-save').onclick = () => {
      currentRecipe.name = modal.querySelector('#recipeName').value || 'Unnamed Recipe';
      currentRecipe.energy_required = parseFloat(modal.querySelector('#recipeTime').value) || 1;

      if (currentRecipe.ingredients.length === 0) {
        alert('재료를 최소 1개 이상 추가해주세요.');
        return;
      }

      if (currentRecipe.results.length === 0) {
        alert('결과물을 최소 1개 이상 추가해주세요.');
        return;
      }

      this.manager.addRecipe(currentRecipe);
      this.render(document.getElementById('custom-recipe-tab'));
      closeModal();
    };
  }

  /**
   * CustomRecipeManager 반환
   */
  getManager() {
    return this.manager;
  }
}
