import AWS from 'aws-sdk';
import crypto from 'crypto';

export interface TTSOptions {
  voiceId: string;
  engine: 'standard' | 'neural';
  outputFormat: 'mp3' | 'ogg_vorbis' | 'pcm';
  sampleRate?: string;
  speechMarkTypes?: string[];
}

export interface AudioFile {
  hash: string;
  filename: string;
  url: string;
  duration?: number;
  text: string;
}

export class AWSPollyTTS {
  private polly: AWS.Polly;
  private processedLines: Set<string> = new Set();

  constructor(region = 'us-east-1') {
    this.polly = new AWS.Polly({ region });
  }

  private generateLineHash(text: string): string {
    // Normalize text for consistent hashing (remove punctuation, spaces, lowercase)
    const normalized = text
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  async generateAudio(
    text: string, 
    options: TTSOptions = {
      voiceId: 'Salli',
      engine: 'neural',
      outputFormat: 'mp3'
    }
  ): Promise<AudioFile> {
    const hash = this.generateLineHash(text);
    
    // Check if already processed
    if (this.processedLines.has(hash)) {
      return {
        hash,
        filename: `${hash}.${options.outputFormat}`,
        url: `/audio/${hash}.${options.outputFormat}`,
        text
      };
    }

    try {
      const params: AWS.Polly.SynthesizeSpeechInput = {
        Text: text,
        OutputFormat: options.outputFormat,
        VoiceId: options.voiceId,
        Engine: options.engine
      };

      if (options.sampleRate) {
        params.SampleRate = options.sampleRate;
      }

      if (options.speechMarkTypes) {
        params.SpeechMarkTypes = options.speechMarkTypes;
      }

      const response = await this.polly.synthesizeSpeech(params).promise();
      
      if (!response.AudioStream) {
        throw new Error('No audio stream returned from Polly');
      }

      const filename = `${hash}.${options.outputFormat}`;
      
      // In a real implementation, you'd save this to a CDN or file system
      // For now, we'll return the metadata
      this.processedLines.add(hash);

      return {
        hash,
        filename,
        url: `/audio/${filename}`,
        text,
        duration: this.estimateAudioDuration(text)
      };

    } catch (error) {
      console.error('Error generating TTS audio:', error);
      throw error;
    }
  }

  private estimateAudioDuration(text: string): number {
    // Rough estimation: ~150 words per minute, ~5 characters per word
    const wordsPerMinute = 150;
    const charactersPerWord = 5;
    const estimatedWords = text.length / charactersPerWord;
    const durationMinutes = estimatedWords / wordsPerMinute;
    return Math.max(1, durationMinutes * 60); // At least 1 second
  }

  async batchGenerateAudio(
    texts: string[],
    options: TTSOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<AudioFile[]> {
    const results: AudioFile[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const audioFile = await this.generateAudio(texts[i], options);
        results.push(audioFile);
        
        if (onProgress) {
          onProgress(i + 1, texts.length);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing text ${i}: ${texts[i]}`, error);
      }
    }
    
    return results;
  }

  // Check if audio file exists for a given text
  hasAudio(text: string): boolean {
    const hash = this.generateLineHash(text);
    return this.processedLines.has(hash);
  }

  // Add existing processed files to the set
  addProcessedFile(text: string): void {
    const hash = this.generateLineHash(text);
    this.processedLines.add(hash);
  }
}

// Template processing utilities
export interface TemplateVariables {
  subject_subjective: string;  // I, you, he, she, they
  subject_objective: string;   // me, you, him, her, them  
  subject_possessive: string;  // my, your, his, her, their
  dominant_name?: string;      // Master, Mistress, etc.
  dominant_title?: string;     // Sir, Ma'am, etc.
}

export class TemplateProcessor {
  static processTemplate(template: string, variables: TemplateVariables): string {
    let processed = template;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`{${key}}`, 'g');
        processed = processed.replace(regex, value);
      }
    });
    
    // Handle verb conjugation patterns like [am|are|are|is]
    processed = processed.replace(/\[([^\]]+)\]/g, (match, options) => {
      const choices = options.split('|');
      
      // Simple conjugation logic based on subject
      switch (variables.subject_subjective.toLowerCase()) {
        case 'i':
          return choices[0] || choices[0]; // am, love, etc.
        case 'you':
          return choices[1] || choices[0]; // are, love, etc.
        case 'he':
        case 'she':
        case 'it':
          return choices[3] || choices[2] || choices[0]; // is, loves, etc.
        case 'we':
        case 'they':
          return choices[2] || choices[1] || choices[0]; // are, love, etc.
        default:
          return choices[0];
      }
    });
    
    return processed;
  }

  static generateMantraVariants(
    template: string, 
    subjectVariants: TemplateVariables[],
    dominantVariants: string[] = []
  ): string[] {
    const variants: string[] = [];
    
    for (const subjectVar of subjectVariants) {
      if (dominantVariants.length > 0) {
        for (const dominant of dominantVariants) {
          const fullVariables = {
            ...subjectVar,
            dominant_name: dominant
          };
          variants.push(this.processTemplate(template, fullVariables));
        }
      } else {
        variants.push(this.processTemplate(template, subjectVar));
      }
    }
    
    return variants;
  }
}

// Predefined template variable sets
export const TEMPLATE_VARIABLES = {
  FIRST_PERSON: {
    subject_subjective: 'I',
    subject_objective: 'me', 
    subject_possessive: 'my'
  },
  SECOND_PERSON: {
    subject_subjective: 'you',
    subject_objective: 'you',
    subject_possessive: 'your'
  },
  THIRD_PERSON_FEMININE: {
    subject_subjective: 'she',
    subject_objective: 'her',
    subject_possessive: 'her'
  },
  THIRD_PERSON_MASCULINE: {
    subject_subjective: 'he', 
    subject_objective: 'him',
    subject_possessive: 'his'
  }
};

export const DOMINANT_TITLES = [
  'Master',
  'Mistress', 
  'Sir',
  'Ma\'am',
  'Daddy',
  'Mommy'
];

export const SUBJECT_NAMES = [
  'pet',
  'slave', 
  'toy',
  'doll',
  'baby',
  'kitten',
  'puppy',
  'princess',
  'slut',
  'whore'
];