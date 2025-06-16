/**
 * Intelligent mantra generation logic
 * Determines optimal difficulty distribution based on theme characteristics
 */

export interface DifficultyProfile {
  BASIC: number;
  LIGHT: number;
  MODERATE: number;
  DEEP: number;
  EXTREME: number;
}

export interface ThemeCharacteristics {
  name: string;
  categories: string[];
  intensity: 'gentle' | 'moderate' | 'intense';
  complexity: 'simple' | 'moderate' | 'complex';
  hasDominant: boolean;
}

/**
 * Calculate optimal difficulty distribution for a theme
 */
export function calculateDifficultyDistribution(theme: ThemeCharacteristics): DifficultyProfile {
  const base = {
    BASIC: 8,
    LIGHT: 8, 
    MODERATE: 8,
    DEEP: 8,
    EXTREME: 8
  };
  
  // Adjust based on theme intensity
  switch (theme.intensity) {
    case 'gentle':
      return {
        BASIC: 12,
        LIGHT: 10,
        MODERATE: 8,
        DEEP: 6,
        EXTREME: 4
      };
    
    case 'intense':
      return {
        BASIC: 6,
        LIGHT: 7,
        MODERATE: 9,
        DEEP: 10,
        EXTREME: 8
      };
    
    default: // moderate
      return base;
  }
}

/**
 * Classify theme characteristics for generation
 */
export function analyzeTheme(name: string, description: string, categories: string[]): ThemeCharacteristics {
  const lowerDesc = description.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Determine intensity
  let intensity: 'gentle' | 'moderate' | 'intense' = 'moderate';
  
  if (isGentleTheme(lowerName, lowerDesc)) {
    intensity = 'gentle';
  } else if (isIntenseTheme(lowerName, lowerDesc)) {
    intensity = 'intense';
  }
  
  // Determine complexity  
  let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
  
  if (isSimpleTheme(lowerName, categories)) {
    complexity = 'simple';
  } else if (isComplexTheme(lowerName, categories)) {
    complexity = 'complex';
  }
  
  // Check if theme naturally includes dominant
  const hasDominant = categories.includes('Ds') || 
                     lowerDesc.includes('master') || 
                     lowerDesc.includes('dominant') ||
                     lowerDesc.includes('control') ||
                     lowerDesc.includes('command');
  
  return {
    name,
    categories,
    intensity,
    complexity,
    hasDominant
  };
}

function isGentleTheme(name: string, description: string): boolean {
  const gentleKeywords = [
    'relaxation', 'calm', 'peaceful', 'gentle', 'soothing',
    'comfort', 'safety', 'reassurance', 'acceptance', 'trust'
  ];
  
  return gentleKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
}

function isIntenseTheme(name: string, description: string): boolean {
  const intenseKeywords = [
    'extreme', 'intense', 'break', 'destroy', 'complete',
    'total', 'absolute', 'mindbreak', 'brainwash', 'overload',
    'ego_loss', 'dissolution', 'transformation'
  ];
  
  return intenseKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  );
}

function isSimpleTheme(name: string, categories: string[]): boolean {
  const simpleThemes = ['hygiene', 'fitness', 'productivity', 'cooking'];
  const simpleCategories = ['Behavior'];
  
  return simpleThemes.includes(name) || 
         categories.some(cat => simpleCategories.includes(cat));
}

function isComplexTheme(name: string, categories: string[]): boolean {
  const complexThemes = ['gaslighting', 'mindbreak', 'ego_loss'];
  const complexCategories = ['Identity', 'Experience'];
  
  return complexThemes.includes(name) ||
         categories.some(cat => complexCategories.includes(cat));
}

/**
 * Generate category-specific language modifiers
 */
export function getCategoryModifiers(categories: string[]): string {
  const modifiers: string[] = [];
  
  if (categories.includes('Hypnosis')) {
    modifiers.push('Use trance-inducing language: "sink deeper", "let go", "drift"');
  }
  
  if (categories.includes('Ds')) {
    modifiers.push('Include power dynamics: submission, control, obedience');
  }
  
  if (categories.includes('Identity')) {
    modifiers.push('Focus on self-transformation: "I am becoming", "I transform into"');
  }
  
  if (categories.includes('Behavior')) {
    modifiers.push('Use action-oriented language: specific behaviors and habits');
  }
  
  if (categories.includes('Experience')) {
    modifiers.push('Emphasize sensations and feelings: emotional and physical experiences');
  }
  
  if (categories.includes('Personality')) {
    modifiers.push('Focus on character traits: "I am", personality characteristics');
  }
  
  return modifiers.join('\n- ');
}

/**
 * Example usage for prompt generation
 */
export function generatePromptContext(
  themeName: string, 
  description: string, 
  categories: string[]
): {
  characteristics: ThemeCharacteristics;
  distribution: DifficultyProfile;
  categoryModifiers: string;
} {
  const characteristics = analyzeTheme(themeName, description, categories);
  const distribution = calculateDifficultyDistribution(characteristics);
  const categoryModifiers = getCategoryModifiers(categories);
  
  return {
    characteristics,
    distribution,
    categoryModifiers
  };
}