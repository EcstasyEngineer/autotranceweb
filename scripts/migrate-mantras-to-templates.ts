#!/usr/bin/env tsx
/**
 * Comprehensive migration script for AI Conditioner content system
 * Migrates both ontologies and mantras to database with template format
 * Usage: tsx scripts/migrate-mantras-to-templates.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

interface MantraLine {
  difficulty: string;
  firstPerson: string;
  thirdPerson: string;
  dominantFlag: string;
}

interface TemplatedMantra {
  template: string;
  difficulty: string;
  hasDominant: boolean;
  crossThemes: string[];
}

// Theme keywords for cross-theme detection
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

// Convert first-person mantra to template format
function convertToTemplate(firstPerson: string, thirdPerson: string): string {
  let template = firstPerson;
  
  // Replace pronouns with template variables
  const pronounPatterns = [
    // Subject pronouns
    { pattern: /\bI\b/gi, replacement: '{subject_subjective}' },
    { pattern: /\bmy\b/gi, replacement: '{subject_possessive}' },
    { pattern: /\bmine\b/gi, replacement: '{subject_possessive}' },
    { pattern: /\bme\b/gi, replacement: '{subject_objective}' },
    
    // Dominant references
    { pattern: /\bMaster\b/g, replacement: '{dominant_name}' },
    { pattern: /\bMaster's\b/gi, replacement: "{dominant_name}'s" },
  ];
  
  // Apply pronoun replacements
  for (const { pattern, replacement } of pronounPatterns) {
    template = template.replace(pattern, replacement);
  }
  
  // Handle verb conjugations by comparing first and third person
  const words1 = firstPerson.split(/\s+/);
  const words3 = thirdPerson.split(/\s+/);
  
  // Find verb differences and create conjugation patterns
  if (words1.length === words3.length) {
    const templateWords = template.split(/\s+/);
    
    for (let i = 0; i < words1.length; i++) {
      if (words1[i] !== words3[i] && !words1[i].match(/^(I|my|mine|me|Master)$/i)) {
        // This is likely a verb that needs conjugation
        const verb1 = words1[i].toLowerCase();
        const verb3 = words3[i].toLowerCase();
        
        // Check if this follows a subject variable
        if (i > 0 && templateWords[i-1]?.includes('{subject_')) {
          templateWords[i] = `[${verb1}|${verb3}]`;
        }
      }
    }
    
    template = templateWords.join(' ');
  }
  
  return template;
}

// Detect cross-theme references in a mantra
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

// Parse a mantra txt file
async function parseMantraFile(filePath: string, themeName: string): Promise<TemplatedMantra[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const mantras: TemplatedMantra[] = [];
  
  // Skip the description line
  const startIndex = lines[0].startsWith('Description:') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split('\t');
    
    if (parts.length >= 4) {
      const [difficulty, firstPerson, thirdPerson, dominantFlag] = parts;
      
      // Convert to template format
      const template = convertToTemplate(firstPerson.trim(), thirdPerson.trim());
      
      // Detect cross-themes
      const crossThemes = detectCrossThemes(firstPerson, themeName);
      
      mantras.push({
        template,
        difficulty: difficulty.trim(),
        hasDominant: dominantFlag.trim() === 'Dom',
        crossThemes,
      });
    }
  }
  
  // Remove duplicates based on template
  const uniqueMantras = new Map<string, TemplatedMantra>();
  for (const mantra of mantras) {
    const key = `${mantra.template}-${mantra.difficulty}`;
    if (!uniqueMantras.has(key)) {
      uniqueMantras.set(key, mantra);
    }
  }
  
  return Array.from(uniqueMantras.values());
}

// Process all mantra files
async function migrateAllMantras() {
  const mantrasDir = path.join(process.cwd(), 'hypnosis/mantras');
  const outputDir = path.join(process.cwd(), 'content/mantras');
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all category directories
  const categories = await fs.readdir(mantrasDir);
  
  for (const category of categories) {
    const categoryPath = path.join(mantrasDir, category);
    const stat = await fs.stat(categoryPath);
    
    if (!stat.isDirectory()) continue;
    
    // Get all .txt files in category
    const files = await fs.readdir(categoryPath);
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    
    for (const txtFile of txtFiles) {
      const themeName = path.basename(txtFile, '.txt');
      const filePath = path.join(categoryPath, txtFile);
      
      console.log(`Processing ${category}/${themeName}...`);
      
      try {
        // Parse mantras
        const mantras = await parseMantraFile(filePath, themeName);
        
        // Write templated mantras
        const outputPath = path.join(outputDir, `${themeName.toLowerCase()}.json`);
        const output = {
          theme: themeName,
          category,
          mantras: mantras.map((m, index) => ({
            id: index + 1,
            ...m,
            points: calculatePoints(m.difficulty),
          })),
        };
        
        await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
        console.log(`  ✓ Converted ${mantras.length} mantras`);
        
      } catch (error) {
        console.error(`  ✗ Error processing ${themeName}:`, error);
      }
    }
  }
}

// Calculate points based on difficulty
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

// Create migration SQL
async function generateMigrationSQL() {
  const mantrasDir = path.join(process.cwd(), 'content/mantras');
  const files = await fs.readdir(mantrasDir);
  const sqlStatements: string[] = [];
  
  // Add SQL header
  sqlStatements.push(`-- Mantra Template Migration
-- Generated: ${new Date().toISOString()}

BEGIN;
`);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const content = await fs.readFile(path.join(mantrasDir, file), 'utf-8');
    const data = JSON.parse(content);
    
    for (const mantra of data.mantras) {
      const crossThemes = mantra.crossThemes.length > 0 
        ? `ARRAY[${mantra.crossThemes.map((t: string) => `'${t}'`).join(', ')}]::text[]`
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
FROM "Theme" t WHERE t.name = '${data.theme}'
ON CONFLICT (themeId, template) DO NOTHING;`);
    }
  }
  
  sqlStatements.push(`
COMMIT;
`);
  
  const sqlPath = path.join(process.cwd(), 'prisma/migrations/mantra_templates.sql');
  await fs.writeFile(sqlPath, sqlStatements.join('\n'));
  console.log(`\nMigration SQL written to: ${sqlPath}`);
}

// Main execution
async function main() {
  console.log('Starting mantra migration to template format...\n');
  
  try {
    await migrateAllMantras();
    await generateMigrationSQL();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated files in content/mantras/');
    console.log('2. Run: npx prisma migrate dev --name add_template_mantras');
    console.log('3. Execute the migration SQL: prisma/migrations/mantra_templates.sql');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { convertToTemplate, detectCrossThemes, parseMantraFile };