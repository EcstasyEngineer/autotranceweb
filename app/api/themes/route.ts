import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ThemeLoader } from '@/lib/themes';

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      include: {
        mantras: {
          select: {
            id: true,
            template: true,
            difficulty: true,
            points: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Shape response to match UI expectations (tags + mantra.text)
    const shaped = themes.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      keywords: t.keywords,
      tags: t.categories, // UI expects `tags`
      cnc: t.cnc,
      mantras: t.mantras.map(m => ({
        id: m.id,
        text: m.template, // UI expects `text`
        difficulty: m.difficulty,
        points: m.points
      }))
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const themeLoader = new ThemeLoader();
    await themeLoader.loadAllThemes();
    
    return NextResponse.json({ message: 'Themes loaded successfully' });
  } catch (error) {
    console.error('Error loading themes:', error);
    return NextResponse.json({ error: 'Failed to load themes' }, { status: 500 });
  }
}
