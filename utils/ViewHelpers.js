/**
 * ViewHelpers - View 클래스들의 공통 유틸리티 함수들
 */
export class ViewHelpers {
  /**
   * HTML 이스케이프
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 HTML
   */
  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 숫자 포맷팅 (비교 뷰용 - 소수점 정밀도 높음)
   * @param {number} num - 포맷할 숫자
   * @returns {string} 포맷된 문자열
   */
  static formatNumber(num) {
    if (num === 0) return '0';
    if (Math.abs(num) >= 1000) return num.toFixed(0);
    if (Math.abs(num) >= 10) return num.toFixed(1);
    if (Math.abs(num) >= 1) return num.toFixed(2);
    return num.toFixed(3);
  }

  /**
   * 수량 포맷팅 (생산구역용 - k 표기 지원)
   * @param {number} amount - 포맷할 수량
   * @returns {string} 포맷된 문자열
   */
  static formatAmount(amount) {
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'k';
    }
    if (amount % 1 === 0) {
      return amount.toString();
    }
    return amount.toFixed(1);
  }

  /**
   * 아이콘 정보 가져오기
   * @param {Object} loadedData - 데이터셋
   * @param {string} itemId - 아이템 ID
   * @param {string} type - 아이템 타입 (item, fluid, module)
   * @returns {Object|null} 아이콘 정보 객체 또는 null
   */
  static getIconInfo(loadedData, itemId, type = 'item') {
    if (!loadedData || !loadedData.entries) return null;

    const searchTypes = type === 'fluid' 
      ? ['fluid', 'item', 'module'] 
      : ['item', 'module', 'fluid'];

    for (const searchType of searchTypes) {
      const entry = loadedData.entries.find(
        e => e.name === itemId && e.type === searchType
      );
      if (entry && entry.icon) {
        return {
          path: entry.icon,
          size: entry.icon_size || 64,
          mipmaps: entry.mipmap_count || 0,
          name: itemId
        };
      }
      console.warn('[ViewHelpers.getIconInfo] Icon not found in data - itemId:', itemId, 'type:', type, 'entry: ', entry );
    }

    // 타입 무관 검색 (fallback)
    const anyEntry = loadedData.entries.find(e => e.name === itemId);
    if (anyEntry && anyEntry.icon) {
      return {
        path: anyEntry.icon,
        size: anyEntry.icon_size || 64,
        mipmaps: anyEntry.mipmap_count || 0,
        name: itemId
      };
    }

    console.warn('[ViewHelpers.getIconInfo] Icon not found in data - itemId:', itemId, 'type:', type, 'entries count:', loadedData.entries.length,  'entry: ', anyEntry );
    return null;
  }

  /**
   * 통합 아이콘 HTML 생성 (단일 또는 이중 아이콘 지원)
   * @param {Array|Object} icons - 아이콘 정보 배열 또는 단일 객체
   * @param {Object} options - 옵션 { amount, showBorder, formatFn, dataAttrs }
   * @returns {string} 아이콘 HTML
   */
  static createIconHtml(icons, options = {}) {
    const {
      amount = null,
      showBorder = true,
      formatFn = ViewHelpers.formatNumber,
      dataAttrs = ''
    } = options;

    // 단일 객체를 배열로 변환
    const iconArray = Array.isArray(icons) ? icons : [icons];
    const hasAmount = amount !== null && amount !== undefined;
    
    let html = `<div class="item-icon-slot ${showBorder ? 'with-border' : 'no-border'} ${hasAmount ? 'with-amount' : ''}" ${dataAttrs}>`;
    html += '<div class="item-icon-container">';
    
    if (iconArray.length > 0 && iconArray[0]) {
      const mainIcon = iconArray[0];
      
      // 메인 아이콘
      if (mainIcon.path) {
        const iconSize = mainIcon.size || 64;
        const mipmaps = mainIcon.mipmaps || 0;
        
        let totalWidth = iconSize;
        for (let i = 1; i < mipmaps; i++) {
          totalWidth += iconSize / Math.pow(2, i);
        }
        
        const scale = 32 / iconSize;
        const imgWidth = totalWidth * scale;
        const imgHeight = iconSize * scale;
        const offsetX = mipmaps > 0 ? -iconSize * scale : 0;
        
        html += `<img src="${mainIcon.path}" alt="${mainIcon.name || ''}" class="item-icon-main" style="width: ${imgWidth}px; height: ${imgHeight}px;">`;
      } else {
        // 아이콘이 없을 때
        console.warn('[ViewHelpers.createIconHtml] Rendering "No Image" for item:', mainIcon.name || 'unknown', '| Icon object:', JSON.stringify(mainIcon));
        html += '<div class="item-icon-no-image">No<br>Image</div>';
      }
      
      // 오버레이 아이콘 (두 번째 아이콘)
      if (iconArray.length > 1 && iconArray[1] && iconArray[1].path) {
        const overlayIcon = iconArray[1];
        const scale = overlayIcon.scale || 0.5;
        html += `<img src="${overlayIcon.path}" alt="${overlayIcon.name || ''}" class="item-icon-overlay" style="--icon-scale: ${scale};">`;
      }
    }
    
    html += '</div>';
    
    if (hasAmount) {
      html += `<div class="item-icon-amount">${formatFn(amount)}</div>`;
    }
    
    html += '</div>';
    return html;
  }

  /**
   * 아이템 아이콘 HTML 생성 (단일 아이템용 - 하위 호환성)
   * @param {Object} iconInfo - 아이콘 정보 객체
   * @param {number|null} amount - 표시할 수량
   * @param {Function} formatFn - 숫자 포맷 함수 (기본: formatNumber)
   * @returns {string} 아이콘 HTML
   */
  static createItemIconHtml(iconInfo, amount = null, formatFn = ViewHelpers.formatNumber) {
    return ViewHelpers.createIconHtml(iconInfo, {
      amount,
      showBorder: true,
      formatFn
    });
  }

  /**
   * IO 섹션 HTML 생성 (출력/입력)
   * @param {Array} items - 아이템 배열 [{name, amount, type}]
   * @param {string} sectionType - 'outputs' 또는 'inputs'
   * @param {string} title - 섹션 제목
   * @param {Object} loadedData - 데이터셋
   * @param {Function} formatFn - 숫자 포맷 함수
   * @returns {string} IO 섹션 HTML
   */
  static createIOSectionHtml(items, sectionType, title, loadedData, formatFn = ViewHelpers.formatNumber) {
    let html = `<div class="zone-io-section zone-${sectionType}">`;
    html += `<h4>${title}</h4>`;
    html += '<div class="zone-io-items">';
    
    if (items.length === 0) {
      html += '<span style="color: #999;">없음</span>';
    } else {
      for (const item of items) {
        const iconInfo = ViewHelpers.getIconInfo(loadedData, item.name, item.type || 'item');
        html += ViewHelpers.createItemIconHtml(iconInfo, item.amount, formatFn);
      }
    }
    
    html += '</div></div>';
    return html;
  }

  /**
   * 빈 메시지 HTML 생성
   * @param {string} message - 표시할 메시지
   * @returns {string} 메시지 HTML
   */
  static createEmptyMessage(message) {
    return `<p class="compare-empty-message">${ViewHelpers.escapeHtml(message)}</p>`;
  }

  /**
   * 모달 닫기 이벤트 설정
   * @param {HTMLElement} modal - 모달 엘리먼트
   * @param {HTMLElement} closeBtn - 닫기 버튼
   */
  static attachModalCloseEvents(modal, closeBtn) {
    const closeModal = () => modal.remove();
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // 배경 클릭으로 닫기 (mousedown/up 트래킹)
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
  }

  /**
   * 사이드바 목록 아이템 HTML 생성
   * @param {string} name - 항목 이름
   * @param {number|string} count - 카운트 표시
   * @param {boolean} isActive - 선택 여부
   * @param {string} dataAttr - data 속성 (예: data-zone-id="...")
   * @param {string} className - 추가 클래스명
   * @returns {string} 목록 아이템 HTML
   */
  static createSidebarItemHtml(name, count, isActive, dataAttr, className = 'list-item') {
    const activeClass = isActive ? 'active' : '';
    let html = `<div class="${className} ${activeClass}" ${dataAttr}>`;
    html += `<span class="${className}-name">${ViewHelpers.escapeHtml(name)}</span>`;
    html += `<span class="${className}-count">${count}</span>`;
    html += '</div>';
    return html;
  }

  /**
   * 디바운스 함수 생성
   * @param {Function} func - 실행할 함수
   * @param {number} delay - 지연 시간 (ms)
   * @returns {Function} 디바운스된 함수
   */
  static debounce(func, delay) {
    let timeoutId = null;
    return function(...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 배열을 맵으로 변환
   * @param {Array} array - 변환할 배열
   * @param {string|Function} keyGetter - 키를 가져올 속성명 또는 함수
   * @returns {Map} 변환된 맵
   */
  static arrayToMap(array, keyGetter) {
    const map = new Map();
    const getKey = typeof keyGetter === 'function' 
      ? keyGetter 
      : (item) => item[keyGetter];
    
    for (const item of array) {
      map.set(getKey(item), item);
    }
    return map;
  }

  /**
   * 유효한 배열인지 확인
   * @param {*} value - 확인할 값
   * @returns {boolean} 유효한 배열 여부
   */
  static isValidArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * 안전한 숫자 파싱
   * @param {*} value - 파싱할 값
   * @param {number} defaultValue - 기본값
   * @returns {number} 파싱된 숫자
   */
  static parseNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 레시피 아이콘 정보 가져오기
   * @param {Object} recipe - 레시피 객체
   * @param {Object} loadedData - 데이터셋
   * @returns {Array} 아이콘 정보 배열
   */
  static getRecipeIcon(recipe, loadedData) {
    // 레시피에 icons 배열이 있으면 사용
    if (recipe.icons && Array.isArray(recipe.icons) && recipe.icons.length > 0) {
      return recipe.icons.map(iconData => {
        // 문자열인 경우 (아이템 이름)
        if (typeof iconData === 'string') {
          const iconInfo = ViewHelpers.getIconInfo(loadedData, iconData);
          // iconInfo가 null인 경우 기본 아이콘 사용
          if (!iconInfo || !iconInfo.path) {
            return {
              path: '__base__/graphics/icons/signal/signal_info.png',
              name: iconData,
              scale: 1,
              shift: { x: 0, y: 0 },
              hasMipmap: false
            };
          }
          return {
            path: iconInfo.path,
            name: iconInfo.name || iconData,
            scale: 1,
            shift: { x: 0, y: 0 },
            hasMipmap: iconInfo.hasMipmap || false
          };
        }
        // 객체인 경우
        return {
          path: iconData.icon,
          name: recipe.name,
          scale: iconData.scale || 1,
          shift: iconData.shift || { x: 0, y: 0 },
          tint: iconData.tint,
          hasMipmap: iconData.icon_size > 0
        };
      });
    }
    
    // 레시피 자체 단일 아이콘이 있으면 사용
    if (recipe.icon) {
      return [{
        path: recipe.icon,
        name: recipe.name,
        scale: 1,
        shift: { x: 0, y: 0 },
        hasMipmap: recipe.icon_mipmaps > 0
      }];
    }
    
    // 없으면 첫 번째 생산품 아이콘 사용
    if (recipe.results && recipe.results.length > 0) {
      const iconInfo = ViewHelpers.getIconInfo(loadedData, recipe.results[0].name, recipe.results[0].type || 'item');
      if (iconInfo && iconInfo.path) {
        return [{
          path: iconInfo.path,
          name: iconInfo.name,
          scale: 1,
          shift: { x: 0, y: 0 },
          hasMipmap: iconInfo.hasMipmap || false
        }];
      }
    }
    
    // 둘 다 없으면 기본 아이콘
    return [{
      path: '__base__/graphics/icons/signal/signal_info.png',
      name: recipe.name,
      scale: 1,
      shift: { x: 0, y: 0 },
      hasMipmap: false
    }];
  }

  /**
   * 레시피 아이콘 HTML 생성 (icons 배열 지원, 오버레이 포함)
   * @param {Array} icons - 아이콘 정보 배열
   * @param {string} containerClass - 추가 클래스명 (하위 호환성용)
   * @returns {string} 레시피 아이콘 HTML
   */
  static createRecipeIconHtml(icons, containerClass = '') {
    return ViewHelpers.createIconHtml(icons, {
      amount: null,
      showBorder: false
    });
  }
}
