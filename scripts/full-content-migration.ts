#!/usr/bin/env tsx
/**
 * Comprehensive migration script for AI Conditioner content system
 * Migrates ontologies → themes and mantras → template format in database
 * Usage: tsx scripts/full-content-migration.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Types for ontology data
interface OntologyData {
  description: string;
  appeal?: string;
  keywords: string[];
  tags: string[];
  cnc: boolean;
}

// Types for existing JSON mantras
interface ExistingMantraObject {
  type: string;
  line: string;
  theme: string;
  dominant: string | null;
  subject: string | null;
  difficulty: string;
}

// Types for new template system
interface TemplateMantra {
  template: string;
  difficulty: string;
  hasDominant: boolean;
  crossThemes: string[];
  points: number;
}

interface ThemeDefinition {
  name: string;
  description: string;
  appeal: string;
  categories: string[];
  relatedThemes: string[];
  keywords: string[];
  cnc: boolean;
}

// Category mapping
const tagToCategoryMap: Record<string, string> = {
  'Hypnosis': 'Hypnosis',
  'Experience': 'Experience', 
  'Identity': 'Identity',
  'Personality': 'Personality',
  'Behavior': 'Behavior',
  'Ds': 'Ds',
  'D/s': 'Ds',
};

// Theme relationships for cross-tagging
const themeRelationships: Record<string, string[]> = {
  'Acceptance': ['Openness', 'Suggestibility', 'Trust', 'Submission'],
  'Mindbreak': ['Brainwashing', 'Confusion', 'Overload', 'Ego_Loss'],
  'Bimbo': ['IQ_Reduction', 'Feminine', 'Sluttiness', 'Mindlessness'],
  'Obedience': ['Submission', 'Surrender', 'Training', 'Discipline'],
  'Gaslighting': ['Confusion', 'Trust', 'Dependency', 'Helplessness'],
  'Relaxation': ['PMR', 'Stillness', 'Focus', 'Calm'],
  'Suggestibility': ['Acceptance', 'Openness', 'Hypnosis', 'Trust'],
  'Brainwashing': ['Conditioning', 'Programming', 'Mindbreak', 'Training'],
  'Addiction': ['Dependency', 'Neediness', 'Obsession', 'Craving'],
  'Feminine': ['Bimbo', 'Gracious', 'Vanity', 'Beauty'],
  'Slave': ['Submission', 'Obedience', 'Property', 'Devotion'],
  'Doll': ['Puppet', 'Toy', 'Objectification', 'Stillness'],
  'Dreaming': ['Mental_Vacation', 'Float', 'Dissociation', 'Trance'],
};

// Keywords for cross-theme detection
const themeKeywords: Record<string, string[]> = {
  'Acceptance': ['accept', 'embrace', 'open', 'welcome'],
  'Trust': ['trust', 'faith', 'believe'],
  'Submission': ['submit', 'serve', 'obey', 'surrender'],
  'Mindlessness': ['empty', 'blank', 'thoughtless', 'mindless'],
  'Suggestibility': ['suggest', 'influence', 'mold', 'shape'],
  'Obedience': ['obey', 'comply', 'follow', 'command'],
  'Pleasure': ['pleasure', 'enjoy', 'feel good', 'bliss'],
  'Relaxation': ['relax', 'calm', 'peaceful', 'serene'],
  'Focus': ['focus', 'concentrate', 'attention'],
  'Bimbo': ['bimbo', 'dumb', 'silly', 'giggly'],
  'Slave': ['slave', 'property', 'owned'],
  'Doll': ['doll', 'puppet', 'toy', 'plaything'],
  'Hypnosis': ['trance', 'hypno', 'deep', 'sink'],
  'Brainwashing': ['program', 'condition', 'train', 'brainwash'],
  'Addiction': ['addict', 'need', 'crave', 'depend'],
};

/**
 * PHASE 1: Migrate Ontologies to Themes
 */
async function migrateOntologiesToThemes(): Promise<ThemeDefinition[]> {
  const ontologiesDir = path.join(process.cwd(), 'ontologies');
  const files = await fs.readdir(ontologiesDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const themes: ThemeDefinition[] = [];
  
  console.log(`📚 Processing ${jsonFiles.length} ontology files...\n`);
  
  for (const file of jsonFiles) {
    const themeName = path.basename(file, '.json');
    const filePath = path.join(ontologiesDir, file);
    
    try {
      const ontologyData: OntologyData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      
      // Convert tags to categories
      const categories = ontologyData.tags
        .map(tag => tagToCategoryMap[tag])
        .filter(Boolean);
      
      // Get related themes
      const relatedThemes = themeRelationships[themeName] || [];
      
      const theme: ThemeDefinition = {
        name: themeName,
        description: ontologyData.description,
        appeal: ontologyData.appeal || generateAppeal(ontologyData.description),
        categories: [...new Set(categories)],
        relatedThemes,
        keywords: ontologyData.keywords,
        cnc: ontologyData.cnc,
      };
      
      themes.push(theme);
      console.log(`  ✓ ${themeName} (${categories.length} categories, ${relatedThemes.length} related themes)`);
      
    } catch (error) {
      console.error(`  ✗ Error processing ${themeName}:`, error);
    }
  }
  
  return themes;
}

/**
 * PHASE 2: Convert existing JSON mantras to templates
 */
async function convertExistingJsonMantras(): Promise<Map<string, TemplateMantra[]>> {
  const mantrasDir = path.join(process.cwd(), 'hypnosis/mantras');
  const templatesByTheme = new Map<string, TemplateMantra[]>();
  
  // Find existing JSON files
  const jsonFiles = await findJsonMantras(mantrasDir);
  console.log(`\n🔄 Processing ${jsonFiles.length} JSON mantra files...\n`);
  
  for (const filePath of jsonFiles) {
    const themeName = getThemeNameFromPath(filePath);
    
    try {
      const mantras: ExistingMantraObject[] = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      const templates = convertMantrasToTemplates(mantras, themeName);
      
      templatesByTheme.set(themeName, templates);
      console.log(`  ✓ ${themeName}: converted ${mantras.length} → ${templates.length} templates`);
      
    } catch (error) {
      console.error(`  ✗ Error processing ${themeName}:`, error);
    }
  }
  
  return templatesByTheme;
}

/**
 * Convert existing mantra objects to template format
 */
function convertMantrasToTemplates(mantras: ExistingMantraObject[], themeName: string): TemplateMantra[] {
  const templateMap = new Map<string, TemplateMantra>();
  
  for (const mantra of mantras) {
    // Skip if it's a "Bambi" version - we only want first person to convert
    if (mantra.subject === 'Bambi') continue;
    
    // Find the corresponding Bambi version to help with template creation
    const bambiVersion = mantras.find(m => 
      m.difficulty === mantra.difficulty && 
      m.subject === 'Bambi' && 
      m.dominant === mantra.dominant
    );
    
    // Convert to template
    const template = convertLineToTemplate(mantra.line, bambiVersion?.line);
    const crossThemes = detectCrossThemes(mantra.line, themeName);
    
    const templateMantra: TemplateMantra = {
      template,
      difficulty: mantra.difficulty,
      hasDominant: mantra.dominant !== null,
      crossThemes,
      points: calculatePoints(mantra.difficulty),
    };
    
    // Use template + difficulty as key to avoid duplicates
    const key = `${template}-${mantra.difficulty}`;
    if (!templateMap.has(key)) {
      templateMap.set(key, templateMantra);
    }
  }
  
  return Array.from(templateMap.values());
}

/**
 * Convert a first-person line to template format
 */
function convertLineToTemplate(firstPerson: string, thirdPerson?: string): string {
  let template = firstPerson;
  
  // Replace pronouns with template variables
  const replacements = [
    { pattern: /\bI\b/gi, replacement: '{subject_subjective}' },
    { pattern: /\bmy\b/gi, replacement: '{subject_possessive}' },
    { pattern: /\bmine\b/gi, replacement: '{subject_possessive}' },
    { pattern: /\bme\b/gi, replacement: '{subject_objective}' },
    { pattern: /\bMaster\b/g, replacement: '{dominant_name}' },
    { pattern: /\bMaster's\b/gi, replacement: "{dominant_name}'s" },
  ];
  
  for (const { pattern, replacement } of replacements) {
    template = template.replace(pattern, replacement);
  }
  
  // If we have both versions, try to detect verb differences
  if (thirdPerson) {
    template = addVerbConjugations(template, firstPerson, thirdPerson);
  }
  
  return template;
}

/**
 * Add verb conjugation patterns by comparing first and third person
 */
function addVerbConjugations(template: string, firstPerson: string, thirdPerson: string): string {
  const words1 = firstPerson.split(/\s+/);
  const words3 = thirdPerson.split(/\s+/);
  
  if (words1.length !== words3.length) return template;
  
  const templateWords = template.split(/\s+/);
  
  for (let i = 0; i < words1.length; i++) {
    if (words1[i] !== words3[i] && !words1[i].match(/^(I|my|mine|me|Master)$/i)) {
      const verb1 = words1[i].toLowerCase();
      const verb3 = words3[i].toLowerCase();
      
      // Check if this follows a subject variable
      if (i > 0 && templateWords[i-1]?.includes('{subject_')) {
        templateWords[i] = `[${verb1}|${verb3}]`;
      }
    }
  }
  
  return templateWords.join(' ');
}

/**
 * Helper functions
 */
async function findJsonMantras(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  const traverse = async (currentDir: string) => {
    const entries = await fs.readdir(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.endsWith('.json')) {
        // Check file size to identify mantra files (should be large)
        if (stat.size > 50000) { // 50KB+ indicates mantra content
          files.push(fullPath);
        }
      }
    }
  };
  
  await traverse(dir);
  return files;
}

function getThemeNameFromPath(filePath: string): string {
  return path.basename(filePath, '.json');
}

function detectCrossThemes(text: string, currentTheme: string): string[] {
  const crossThemes: Set<string> = new Set();
  const lowerText = text.toLowerCase();
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (theme === currentTheme) continue;
    
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        crossThemes.add(theme);
        break;
      }
    }
  }
  
  return Array.from(crossThemes);
}

function calculatePoints(difficulty: string): number {
  const pointMap: Record<string, number> = {
    'BASIC': 10,
    'LIGHT': 20,
    'MODERATE': 30,
    'DEEP': 40,
    'EXTREME': 50,
  };
  return pointMap[difficulty] || 10;
}

function generateAppeal(description: string): string {
  return `This theme provides ${description.substring(0, 100).toLowerCase()}...`;
}

/**
 * PHASE 3: Generate SQL migration
 */
async function generateCompleteMigrationSQL(
  themes: ThemeDefinition[], 
  templatesByTheme: Map<string, TemplateMantra[]>
) {
  const sqlStatements: string[] = [];
  
  sqlStatements.push(`-- Complete AI Conditioner Content Migration
-- Generated: ${new Date().toISOString()}
-- Migrates ontologies → themes and mantras → templates

BEGIN;

-- Clear existing data
TRUNCATE TABLE "Mantra" CASCADE;
TRUNCATE TABLE "Theme" CASCADE;

-- Insert themes
`);
  
  // Insert themes
  for (const theme of themes) {
    const categories = theme.categories.length > 0
      ? `ARRAY[${theme.categories.map(c => `'${c}'`).join(', ')}]::text[]`
      : 'ARRAY[]::text[]';
    
    const relatedThemes = theme.relatedThemes.length > 0
      ? `ARRAY[${theme.relatedThemes.map(t => `'${t}'`).join(', ')}]::text[]`
      : 'ARRAY[]::text[]';
    
    const keywords = theme.keywords.length > 0
      ? `ARRAY[${theme.keywords.map(k => `'${k.replace(/'/g, "''")}'`).join(', ')}]::text[]`
      : 'ARRAY[]::text[]';
    
    sqlStatements.push(`
INSERT INTO "Theme" (id, name, description, appeal, categories, "relatedThemes", keywords, cnc, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  '${theme.name}',
  '${theme.description.replace(/'/g, "''")}',
  '${theme.appeal.replace(/'/g, "''")}',
  ${categories},
  ${relatedThemes},
  ${keywords},
  ${theme.cnc},
  NOW(),
  NOW()
);`);
  }
  
  sqlStatements.push(`\n-- Insert template mantras\n`);
  
  // Insert mantras
  for (const [themeName, mantras] of templatesByTheme) {
    for (const mantra of mantras) {
      const crossThemes = mantra.crossThemes.length > 0
        ? `ARRAY[${mantra.crossThemes.map(t => `'${t}'`).join(', ')}]::text[]`
        : 'ARRAY[]::text[]';
      
      sqlStatements.push(`
INSERT INTO "Mantra" (id, "themeId", template, difficulty, points, "hasDominant", "crossThemes", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  t.id,
  '${mantra.template.replace(/'/g, "''")}',
  '${mantra.difficulty}'::Difficulty,
  ${mantra.points},
  ${mantra.hasDominant},
  ${crossThemes},
  NOW(),
  NOW()
FROM "Theme" t WHERE t.name = '${themeName}'
ON CONFLICT ("themeId", template) DO NOTHING;`);
    }
  }
  
  sqlStatements.push(`\nCOMMIT;\n`);
  
  const sqlPath = path.join(process.cwd(), 'prisma/migrations/complete_content_migration.sql');
  await fs.writeFile(sqlPath, sqlStatements.join('\n'));
  console.log(`\n📝 Migration SQL written to: ${sqlPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting comprehensive content migration...\n');
  
  try {
    // Phase 1: Migrate ontologies
    const themes = await migrateOntologiesToThemes();
    
    // Phase 2: Convert mantras
    const templatesByTheme = await convertExistingJsonMantras();
    
    // Phase 3: Generate SQL
    await generateCompleteMigrationSQL(themes, templatesByTheme);
    
    // Summary
    const totalThemes = themes.length;
    const totalMantras = Array.from(templatesByTheme.values()).reduce((sum, mantras) => sum + mantras.length, 0);
    
    console.log('\n✅ Migration preparation completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${totalThemes} themes processed`);
    console.log(`   - ${totalMantras} template mantras generated`);
    console.log(`   - ${templatesByTheme.size} themes with mantra content`);
    
    console.log('\n🔧 Next steps (see GitHub issue):');
    console.log('1. Set up database connection');
    console.log('2. Run: npx prisma migrate dev --name content_template_system');
    console.log('3. Execute: prisma/migrations/complete_content_migration.sql');
    console.log('4. Test template rendering');
    console.log('5. Archive old ontologies/ and hypnosis/mantras/ directories');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { 
  migrateOntologiesToThemes, 
  convertExistingJsonMantras, 
  convertLineToTemplate,
  detectCrossThemes 
};