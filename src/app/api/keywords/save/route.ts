import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface KeywordData {
  keyword: string;
  searchVolume: string | number;
  difficulty: string | number;
  intent: string;
  competition: string;
  seasonality?: string;
  relatedKeywords?: string;
  recommendation?: string;
}

interface SaveKeywordsRequest {
  projectId: string;
  keywords: KeywordData[];
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: SaveKeywordsRequest = await request.json();
    const { projectId, keywords } = body;

    // Validate required fields
    if (!projectId || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user information from session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the project belongs to the user
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or not authorized' },
        { status: 404 }
      );
    }

    // Prepare the keywords for insertion
    const keywordsToInsert = keywords.map(keyword => ({
      project_id: projectId,
      keyword: keyword.keyword,
      search_volume: typeof keyword.searchVolume === 'string' 
        ? parseInt(keyword.searchVolume.replace(/[^0-9]/g, '')) || 0 
        : keyword.searchVolume || 0,
      difficulty: typeof keyword.difficulty === 'string'
        ? parseFloat(keyword.difficulty) || 0
        : keyword.difficulty || 0,
      intent: keyword.intent || '',
      is_tracked: true,
    }));

    // Insert the keywords
    const { data, error } = await supabase
      .from('keywords')
      .insert(keywordsToInsert)
      .select();

    if (error) {
      console.error('Error saving keywords:', error);
      return NextResponse.json(
        { error: 'Failed to save keywords' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      savedKeywords: data,
    });
  } catch (error) {
    console.error('Error in save keywords API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
