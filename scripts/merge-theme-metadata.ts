#!/usr/bin/env tsx
/**
 * Script to merge ontology files with theme metadata
 * Creates unified theme definitions in content/themes/
 */

import fs from 'fs/promises';
import path from 'path';

interface OntologyData {
  description: string;
  appeal?: string;
  keywords: string[];
  tags: string[];
  cnc: boolean;
}

interface ThemeDefinition extends OntologyData {
  name: string;
  categories: string[];
  relatedThemes: string[];
}

// Map old tags to new categories
const tagToCategoryMap: Record<string, string> = {
  'Hypnosis': 'Hypnosis',
  'Experience': 'Experience',
  'Identity': 'Identity',
  'Personality': 'Personality',
  'Behavior': 'Behavior',
  'Ds': 'Ds',
};

// Theme relationships (manually curated based on common patterns)
const themeRelationships: Record<string, string[]> = {
  'Acceptance': ['Openness', 'Suggestibility', 'Trust', 'Submission'],
  'Mindbreak': ['Brainwashing', 'Confusion', 'Overload', 'Ego_Loss'],
  'Bimbo': ['IQ_Reduction', 'Feminine', 'Sluttiness', 'Mindlessness'],
  'Obedience': ['Submission', 'Surrender', 'Training', 'Discipline'],
  'Gaslighting': ['Confusion', 'Trust', 'Dependency', 'Helplessness'],
  'Relaxation': ['PMR', 'Stillness', 'Calm', 'Peace'],
  'Suggestibility': ['Acceptance', 'Openness', 'Hypnosis', 'Trust'],
  'Brainwashing': ['Conditioning', 'Programming', 'Mindbreak', 'Training'],
  'Addiction': ['Dependency', 'Neediness', 'Obsession', 'Craving'],
  'Feminine': ['Bimbo', 'Gracious', 'Vanity', 'Beauty'],
  'Slave': ['Submission', 'Obedience', 'Property', 'Devotion'],
  'Doll': ['Puppet', 'Toy', 'Objectification', 'Stillness'],
  'Dreaming': ['Mental_Vacation', 'Float', 'Dissociation', 'Trance'],
  // Add more relationships as needed
};

async function loadOntologyFile(filePath: string): Promise<OntologyData> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function mergeThemeData() {
  const ontologiesDir = path.join(process.cwd(), 'ontologies');
  const outputDir = path.join(process.cwd(), 'content/themes');
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all ontology files
  const files = await fs.readdir(ontologiesDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  console.log(`Found ${jsonFiles.length} ontology files to process\n`);
  
  for (const file of jsonFiles) {
    const themeName = path.basename(file, '.json');
    const filePath = path.join(ontologiesDir, file);
    
    console.log(`Processing ${themeName}...`);
    
    try {
      // Load ontology data
      const ontologyData = await loadOntologyFile(filePath);
      
      // Convert tags to categories
      const categories = ontologyData.tags
        .map(tag => tagToCategoryMap[tag])
        .filter(Boolean);
      
      // Get related themes
      const relatedThemes = themeRelationships[themeName] || [];
      
      // Create unified theme definition
      const themeDefinition: ThemeDefinition = {
        name: themeName,
        description: ontologyData.description,
        appeal: ontologyData.appeal || generateAppeal(ontologyData.description),
        categories: [...new Set(categories)], // Remove duplicates
        relatedThemes,
        keywords: ontologyData.keywords,
        cnc: ontologyData.cnc,
      };
      
      // Write theme definition
      const outputPath = path.join(outputDir, `${themeName.toLowerCase()}.json`);
      await fs.writeFile(outputPath, JSON.stringify(themeDefinition, null, 2));
      
      console.log(`  ✓ Created theme definition with ${categories.length} categories and ${relatedThemes.length} related themes`);
      
    } catch (error) {
      console.error(`  ✗ Error processing ${themeName}:`, error);
    }
  }
}

// Generate appeal text from description if not provided
function generateAppeal(description: string): string {
  // Simple heuristic: extract the psychological aspect from the description
  const appealPhrases = [
    'provides a sense of',
    'offers relief from',
    'allows exploration of',
    'creates space for',
    'enables experience of',
    'facilitates journey into',
  ];
  
  // Default appeal based on description length
  const shortDesc = description.substring(0, 100);
  return `This theme ${appealPhrases[0]} ${shortDesc.toLowerCase()}...`;
}

// Generate database migration for themes
async function generateThemeMigrationSQL() {
  const themesDir = path.join(process.cwd(), 'content/themes');
  const files = await fs.readdir(themesDir);
  const sqlStatements: string[] = [];
  
  sqlStatements.push(`-- Theme Metadata Migration
-- Generated: ${new Date().toISOString()}

BEGIN;

-- Clear existing themes
TRUNCATE TABLE "Theme" CASCADE;

-- Insert updated themes
`);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const content = await fs.readFile(path.join(themesDir, file), 'utf-8');
    const theme: ThemeDefinition = JSON.parse(content);
    
    const categories = theme.categories.length > 0
      ? `ARRAY[${theme.categories.map(c => `'${c}'`).join(', ')}]::text[]`
      : 'ARRAY[]::text[]';
    
    const relatedThemes = theme.relatedThemes.length > 0
      ? `ARRAY[${theme.relatedThemes.map(t => `'${t}'`).join(', ')}]::text[]`
      : 'ARRAY[]::text[]';
    
    const keywords = theme.keywords.length > 0
      ? `ARRAY[${theme.keywords.map(k => `'${k}'`).join(', ')}]::text[]`
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
  
  sqlStatements.push(`
COMMIT;
`);
  
  const sqlPath = path.join(process.cwd(), 'prisma/migrations/theme_metadata.sql');
  await fs.writeFile(sqlPath, sqlStatements.join('\n'));
  console.log(`\nTheme migration SQL written to: ${sqlPath}`);
}

// Main execution
async function main() {
  console.log('Starting theme metadata merge...\n');
  
  try {
    await mergeThemeData();
    await generateThemeMigrationSQL();
    
    console.log('\n✅ Theme merge completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated theme definitions in content/themes/');
    console.log('2. Execute the theme migration SQL: prisma/migrations/theme_metadata.sql');
    console.log('3. Run the mantra migration script: tsx scripts/migrate-mantras-to-templates.ts');
    
  } catch (error) {
    console.error('\n❌ Theme merge failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}