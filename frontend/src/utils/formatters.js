export const getCategoryLabel = (category, fallback = '-') => {
  if (!category) {
    return fallback;
  }

  if (typeof category === 'string') {
    return category || fallback;
  }

  return category.name || category.slug || fallback;
};
