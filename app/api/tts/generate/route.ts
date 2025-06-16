import { NextRequest, NextResponse } from 'next/server';
import { TemplateProcessor, TEMPLATE_VARIABLES, TTSOptions } from '@/lib/tts/aws-polly';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      template, 
      theme, 
      difficulty,
      ttsOptions = { voiceId: 'Salli', engine: 'neural', outputFormat: 'mp3' },
      generateVariants = true 
    } = body;

    if (!template || !theme) {
      return NextResponse.json(
        { error: 'Template and theme are required' }, 
        { status: 400 }
      );
    }

    const variants = [];

    if (generateVariants) {
      // Generate variants for different POV and dominant combinations
      const povVariants = [
        { name: 'First Person', vars: TEMPLATE_VARIABLES.FIRST_PERSON },
        { name: 'Second Person', vars: TEMPLATE_VARIABLES.SECOND_PERSON },
        { name: 'Third Person (F)', vars: TEMPLATE_VARIABLES.THIRD_PERSON_FEMININE }
      ];

      const dominants = [
        { name: 'Generic', value: undefined },
        { name: 'Master', value: 'Master' },
        { name: 'Mistress', value: 'Mistress' }
      ];

      povVariants.forEach(pov => {
        dominants.forEach(dominant => {
          const variables = {
            ...pov.vars,
            dominant_name: dominant.value
          };

          const processedText = TemplateProcessor.processTemplate(template, variables);
          
          // Generate filename pattern used in the notebook
          const variantKey = `${theme}_Dom-${dominant.name}_Sub-${pov.name.replace(' ', '')}_Progression_Demo`;
          
          variants.push({
            text: processedText,
            variables: `${pov.name} + ${dominant.name}`,
            filename: `${variantKey}.mp3`,
            povType: pov.name,
            dominantType: dominant.name,
            theme: theme,
            difficulty: difficulty
          });
        });
      });
    } else {
      // Single variant with provided variables or defaults
      const processedText = TemplateProcessor.processTemplate(template, TEMPLATE_VARIABLES.SECOND_PERSON);
      variants.push({
        text: processedText,
        variables: 'Second Person + Generic',
        filename: `${theme}_single.mp3`,
        theme: theme,
        difficulty: difficulty
      });
    }

    // In a real implementation, this would:
    // 1. Generate audio using AWS Polly
    // 2. Save files to CDN/storage
    // 3. Update database with audio references
    // 4. Return actual audio URLs

    const response = {
      template,
      theme,
      difficulty,
      ttsOptions,
      variants: variants.map(variant => ({
        ...variant,
        audioUrl: `/audio/${variant.filename}`, // Placeholder URL
        generated: false // Would be true after actual generation
      })),
      totalVariants: variants.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in TTS generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return available TTS options
  return NextResponse.json({
    voices: [
      'Salli', 'Joanna', 'Kendra', 'Kimberly', 'Amy', 'Emma', 'Brian', 'Justin'
    ],
    engines: ['standard', 'neural'],
    formats: ['mp3', 'ogg_vorbis', 'pcm'],
    difficulties: ['BASIC', 'LIGHT', 'MODERATE', 'DEEP', 'EXTREME'],
    templateVariables: {
      'Subject Variables': ['{subject_subjective}', '{subject_objective}', '{subject_possessive}'],
      'Dominant Variables': ['{dominant_name}', '{dominant_title}'],
      'Verb Conjugation': ['[am|are|are|is]', '[love|loves]', '[crave|craves]']
    }
  });
}