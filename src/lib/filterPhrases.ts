import { CategoryId, DotPhrase } from '@/data/dotPhrases';

export function filterDotPhrases(
  phrases: readonly DotPhrase[],
  activeCategory: CategoryId,
  searchQuery: string
): DotPhrase[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return phrases.filter((phrase) => {
    const matchesCategory = activeCategory === 'all' || phrase.category === activeCategory;
    const matchesSearch =
      normalizedQuery === '' ||
      phrase.trigger.toLowerCase().includes(normalizedQuery) ||
      phrase.name.toLowerCase().includes(normalizedQuery) ||
      phrase.description.toLowerCase().includes(normalizedQuery) ||
      phrase.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    return matchesCategory && matchesSearch;
  });
}
