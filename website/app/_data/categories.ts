export const ARTICLE_CATEGORIES = [
  { code: 'business', label: 'Бизнес' },
  { code: 'dev', label: 'Разработка' },
  { code: 'design', label: 'Дизайн' },
  { code: 'lifestyle', label: 'Лайфстайл' },
] as const;

export const PROJECT_CATEGORIES = [
  { code: 'e-commerce', label: 'E-commerce' },
  { code: 'identity', label: 'Айдентика' },
  { code: 'corporative', label: 'Корпоративные сайты' },
] as const;

export type ArticleCategoryCode = typeof ARTICLE_CATEGORIES[number]['code'];
export type ProjectCategoryCode = typeof PROJECT_CATEGORIES[number]['code'];

export function getArticleCategoryLabel(code: ArticleCategoryCode): string {
  const found = ARTICLE_CATEGORIES.find(c => c.code === code);
  return found ? found.label : code;
}

export function getProjectCategoryLabel(code: ProjectCategoryCode): string {
  const found = PROJECT_CATEGORIES.find(c => c.code === code);
  return found ? found.label : code;
}
