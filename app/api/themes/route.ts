import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ThemeLoader } from '@/lib/themes';

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      include: {
        mantras: {
          select: {
            id: true,
            text: true,
            difficulty: true,
            points: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(themes);
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