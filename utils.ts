import { VocabularyItem } from './types';

// Define word families to avoid consecutive appearance
const wordFamilies: Record<string, string> = {
  'abuse': 'abuse',
  'highlight': 'highlight',
  'economy': 'economy',
  'economic': 'economy',
  'economical': 'economy',
  'demand': 'demand',
  'illegally': 'legal',
  'illegal': 'legal',
  'legal': 'legal',
  'lure': 'lure',
  'herd': 'herd',
  'brutal': 'brutal',
  'operator': 'operate',
  'operate': 'operate',
  'operation': 'operate',
  'mercilessly': 'mercy',
  'merciless': 'mercy',
  'mercy': 'mercy',
  'strike': 'strike',
  'commit': 'commit',
  'commitment': 'commit',
  'obedient': 'obey',
  'obedience': 'obey',
  'tame': 'tame',
  'vulnerable': 'vulnerable',
  'permanent': 'permanent',
  'adequate': 'adequate',
  'exhaustion': 'exhaust',
  'exhaust': 'exhaust',
  'complex': 'complex',
  'intelligent': 'intelligent',
  'intelligence': 'intelligent'
};

function getWordRoot(word: string): string {
  return wordFamilies[word] || word;
}

export function smartShuffle(array: VocabularyItem[], count: number): VocabularyItem[] {
  // Group words by their root form
  const wordGroups: Record<string, VocabularyItem[]> = {};
  
  array.forEach(item => {
    const root = getWordRoot(item.word);
    if (!wordGroups[root]) {
      wordGroups[root] = [];
    }
    wordGroups[root].push(item);
  });

  // Create shuffled result avoiding consecutive related words
  const result: VocabularyItem[] = [];
  const availableGroups = Object.keys(wordGroups);
  let lastUsedRoot: string | null = null;

  while (result.length < count && availableGroups.length > 0) {
    // Filter out the last used root to avoid consecutive related words
    const eligibleGroups = availableGroups.filter(root => root !== lastUsedRoot);
    
    // If no eligible groups, allow any group (fallback)
    const groupsToChooseFrom = eligibleGroups.length > 0 ? eligibleGroups : availableGroups;
    
    // Randomly select a group
    const randomGroupIndex = Math.floor(Math.random() * groupsToChooseFrom.length);
    const selectedRoot = groupsToChooseFrom[randomGroupIndex];
    const selectedGroup = wordGroups[selectedRoot];

    // Randomly select a word from the group
    const randomWordIndex = Math.floor(Math.random() * selectedGroup.length);
    const selectedWord = selectedGroup[randomWordIndex];

    result.push(selectedWord);
    lastUsedRoot = selectedRoot;

    // Remove the used word from its group
    selectedGroup.splice(randomWordIndex, 1);

    // Remove empty groups
    if (selectedGroup.length === 0) {
      delete wordGroups[selectedRoot];
      const groupIndex = availableGroups.indexOf(selectedRoot);
      if (groupIndex > -1) {
        availableGroups.splice(groupIndex, 1);
      }
    }
  }

  return result;
}