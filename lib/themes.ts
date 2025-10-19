import fs from 'fs';
import path from 'path';
import { prisma } from './db';

export interface ThemeOntology {
  description: string;
  appeal: string;
  keywords: string[];
  cnc?: boolean;
  tags?: string[]; // mapped to Prisma Theme.categories
}

export interface MantraData {
  text: string; // normalized plain text template
  difficulty: 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME';
  points: number;
}

type RawMantraEntry = {
  line?: string;
  text?: string;
  difficulty?: string;
  dominant?: string | null;
  hasDominant?: boolean;
};

export class ThemeLoader {
  private ontologiesPath = path.join(process.cwd(), 'ontologies');
  private mantrasPath = path.join(process.cwd(), 'hypnosis', 'mantras');

  async loadAllThemes() {
    const ontologyFiles = fs.readdirSync(this.ontologiesPath)
      .filter(file => file.endsWith('.json'));

    for (const file of ontologyFiles) {
      const themeName = path.basename(file, '.json');
      await this.loadTheme(themeName);
    }
  }

  async loadTheme(themeName: string) {
    try {
      // Load ontology
      const ontologyPath = path.join(this.ontologiesPath, `${themeName}.json`);
      const ontologyData: ThemeOntology = JSON.parse(
        fs.readFileSync(ontologyPath, 'utf-8')
      );

      // Check if theme already exists
      let theme = await prisma.theme.findUnique({
        where: { name: themeName }
      });

      if (!theme) {
        // Create theme
        theme = await prisma.theme.create({
          data: {
            name: themeName,
            description: ontologyData.description,
            appeal: ontologyData.appeal,
            keywords: ontologyData.keywords,
            categories: ontologyData.tags || this.categorizeTheme(themeName),
            relatedThemes: [],
            cnc: ontologyData.cnc || false
          }
        });
      } else {
        // Update core fields if ontology changed
        await prisma.theme.update({
          where: { id: theme.id },
          data: {
            description: ontologyData.description,
            appeal: ontologyData.appeal,
            keywords: ontologyData.keywords,
            categories: ontologyData.tags || this.categorizeTheme(themeName),
            cnc: ontologyData.cnc || false
          }
        });
      }

      // Load mantras if available
      await this.loadMantras(theme.id, themeName);

      return theme;
    } catch (error) {
      console.error(`Error loading theme ${themeName}:`, error);
      return null;
    }
  }

  private async loadMantras(themeId: string, themeName: string) {
    // Look for mantra files in different category folders
    const categories = ['Behavior', 'Ds', 'Experience', 'Hypnosis', 'Identity', 'Personality'];
    
    for (const category of categories) {
      const mantraPath = path.join(this.mantrasPath, category, `${themeName}.txt`);
      const jsonPath = path.join(this.mantrasPath, category, `${themeName}.json`);
      
      // Try JSON first (normalized), then TXT
      if (fs.existsSync(jsonPath)) {
        await this.loadNormalizedMantras(themeId, jsonPath);
      } else if (fs.existsSync(mantraPath)) {
        await this.loadTextMantras(themeId, mantraPath);
      }
    }
  }

  private async loadNormalizedMantras(themeId: string, filePath: string) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
      if (!Array.isArray(raw)) {
        console.warn(`Expected array of mantra entries in ${filePath}`);
        return;
      }

      for (const entryRaw of raw) {
        const entry = (entryRaw ?? {}) as RawMantraEntry | string;
        // Support JSON arrays with objects like { type, line, dominant, subject, difficulty }
        const template: string = typeof entry === 'string'
          ? entry
          : (entry.line ?? entry.text ?? '');
        if (!template || typeof template !== 'string') continue;

        const diffRaw: string | undefined = typeof entry === 'string' ? undefined : entry.difficulty;
        const difficulty = this.normalizeDifficulty(diffRaw) ?? this.estimateDifficulty(template).difficulty;
        const points = this.pointsForDifficulty(difficulty);
        const hasDominant = this.detectDominant(typeof entry === 'string' ? undefined : entry, template);

        await prisma.mantra.upsert({
          where: {
            themeId_template: {
              themeId,
              template
            }
          },
          update: {
            difficulty,
            points,
            hasDominant
          },
          create: {
            themeId,
            template,
            difficulty,
            points,
            hasDominant,
            crossThemes: []
          }
        });
      }
    } catch (error) {
      console.error(`Error loading normalized mantras from ${filePath}:`, error);
    }
  }

  private async loadTextMantras(themeId: string, filePath: string) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const { difficulty, points } = this.estimateDifficulty(line);
        
        const template = line.trim();
        await prisma.mantra.upsert({
          where: {
            themeId_template: {
              themeId,
              template
            }
          },
          update: {
            difficulty,
            points
          },
          create: {
            themeId,
            template,
            difficulty,
            points,
            hasDominant: this.detectDominant(undefined, template),
            crossThemes: []
          }
        });
      }
    } catch (error) {
      console.error(`Error loading text mantras from ${filePath}:`, error);
    }
  }

  private estimateDifficulty(text: string): { difficulty: 'BASIC' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXTREME', points: number } {
    const lowerText = text.toLowerCase();
    
    // Extreme keywords (Discord bot learnings)
    if (lowerText.includes('forever') || lowerText.includes('permanent') || 
        lowerText.includes('irreversible') || lowerText.includes('completely')) {
      return { difficulty: 'EXTREME', points: 110 };
    }
    
    // Deep keywords
    if (lowerText.includes('deep') || lowerText.includes('mindless') || 
        lowerText.includes('empty') || lowerText.includes('blank')) {
      return { difficulty: 'DEEP', points: 70 };
    }
    
    // Moderate keywords
    if (lowerText.includes('obey') || lowerText.includes('submit') || 
        lowerText.includes('surrender') || lowerText.includes('focus')) {
      return { difficulty: 'MODERATE', points: 40 };
    }
    
    // Light keywords
    if (lowerText.includes('relax') || lowerText.includes('calm') || 
        lowerText.includes('comfortable') || lowerText.includes('safe')) {
      return { difficulty: 'LIGHT', points: 25 };
    }
    
    // Default to basic
    return { difficulty: 'BASIC', points: 12 };
  }

  private normalizeDifficulty(val?: string): MantraData['difficulty'] | undefined {
    if (!val) return undefined;
    const v = String(val).toUpperCase();
    if ([ 'BASIC','LIGHT','MODERATE','DEEP','EXTREME' ].includes(v)) return v as MantraData['difficulty'];
    return undefined;
  }

  private pointsForDifficulty(diff: MantraData['difficulty']): number {
    switch (diff) {
      case 'EXTREME': return 110;
      case 'DEEP': return 70;
      case 'MODERATE': return 40;
      case 'LIGHT': return 25;
      case 'BASIC':
      default: return 12;
    }
  }

  private detectDominant(entry: RawMantraEntry | undefined, template: string): boolean {
    if (entry && (entry.dominant || typeof entry.hasDominant === 'boolean')) {
      return Boolean(entry.dominant ?? entry.hasDominant);
    }
    const t = template.toLowerCase();
    return t.includes("master") || t.includes("mistress") || t.includes("dominant") || t.includes("{dominant_");
  }

  private categorizeTheme(themeName: string): string[] {
    const categories: Record<string, string[]> = {
      'Experience': ['Dreaming', 'Ego_Loss', 'Emotion_Joy', 'Emotion_Love', 'Emptiness', 'Fear', 'Pleasure', 'Safety'],
      'Personality': ['Addiction', 'Brattiness', 'Confidence', 'Dependency', 'Devotion', 'Feminine', 'Neediness', 'Sluttiness', 'Vanity'],
      'Hypnosis': ['Acceptance', 'Brainwashing', 'Confusion', 'Focus', 'Mindbreak', 'Relaxation', 'Suggestibility'],
      'Identity': ['Bimbo', 'Doll', 'Drone', 'Maid', 'Slave', 'Cheerleader', 'Cultist'],
      'Behavior': ['Anal', 'Chastity', 'Edging', 'Exhibitionism', 'Fitness', 'Nudism', 'Productivity'],
      'Ds': ['Clicker', 'Consent_Erosion', 'Free_Use', 'Gaslighting', 'Obedience', 'Submission', 'Worship']
    };

    for (const [category, themes] of Object.entries(categories)) {
      if (themes.includes(themeName)) {
        return [category];
      }
    }
    
    return ['Uncategorized'];
  }
}
