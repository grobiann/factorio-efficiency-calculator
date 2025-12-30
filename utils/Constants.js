/**
 * Constants - 애플리케이션 전역 상수
 */

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  RECIPE_GROUPS: 'recipeGroups',
  CUSTOM_RECIPES: 'customRecipes',
  COMPARE_GROUPS: 'compareGroups',
  SETTINGS: 'appSettings'
};

// 아이템 타입
export const ITEM_TYPES = {
  ITEM: 'item',
  FLUID: 'fluid',
  MODULE: 'module'
};

// 엔트리 타입
export const ENTRY_TYPES = {
  GROUP: 'group',
  RECIPE: 'recipe'
};

// 디스플레이 모드
export const DISPLAY_MODES = {
  PER_SECOND: 'per_sec',
  PER_MINUTE: 'per_min'
};

// 기본 아이콘 경로
export const DEFAULT_ICON_PATH = '__base__/graphics/icons/signal/signal_info.png';

// 아이콘 크기
export const ICON_CONFIG = {
  DEFAULT_SIZE: 64,
  DISPLAY_SIZE: 32,
  MIPMAP_OFFSET: '0 0'
};

// UI 상수
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_COMPARE_GROUPS: 0,
  SIDEBAR_WIDTH: '250px',
  GRID_MIN_WIDTH: '320px'
};

// CSS 클래스명
export const CSS_CLASSES = {
  ACTIVE: 'active',
  SELECTED: 'selected',
  EMPTY: 'empty',
  FILLED: 'filled',
  DANGER: 'btn-danger',
  PRIMARY: 'btn-primary',
  SECONDARY: 'btn-secondary'
};

// 에러 메시지
export const ERROR_MESSAGES = {
  NO_GROUPS: '레시피 그룹이 없습니다',
  NO_RECIPES: '커스텀 레시피가 없습니다',
  NO_ITEMS: '레시피 그룹이나 커스텀 레시피가 없습니다',
  MIN_GROUPS: '최소 1개의 비교 그룹이 필요합니다',
  GROUP_NOT_FOUND: '레시피 그룹을 찾을 수 없습니다',
  RECIPE_NOT_FOUND: '레시피를 찾을 수 없습니다',
  INVALID_DATA: '잘못된 데이터입니다'
};

// IO 섹션 타입
export const IO_SECTION_TYPES = {
  OUTPUTS: 'outputs',
  INPUTS: 'inputs'
};

// IO 섹션 제목
export const IO_SECTION_TITLES = {
  OUTPUTS: '출력',
  INPUTS: '입력'
};
