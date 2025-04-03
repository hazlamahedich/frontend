import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get the website ID from the query parameters
    const websiteId = request.nextUrl.searchParams.get('websiteId');
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!websiteId && !projectId) {
      return NextResponse.json(
        { error: 'Either websiteId or projectId is required' },
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

    let websiteIdToUse = websiteId;

    // If projectId is provided but not websiteId, get the first website for the project
    if (!websiteIdToUse && projectId) {
      const { data: websites } = await supabase
        .from('websites')
        .select('id, project_id, projects!inner(user_id)')
        .eq('project_id', projectId)
        .eq('projects.user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (websites && websites.length > 0) {
        websiteIdToUse = websites[0].id;
      } else {
        return NextResponse.json(
          { error: 'No websites found for this project' },
          { status: 404 }
        );
      }
    }

    // Verify the website belongs to the user
    const { data: website } = await supabase
      .from('websites')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', websiteIdToUse)
      .eq('projects.user_id', session.user.id)
      .single();

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or not authorized' },
        { status: 404 }
      );
    }

    // Get the latest audit for the website
    const { data: latestAudit } = await supabase
      .from('audits')
      .select('*')
      .eq('website_id', websiteIdToUse)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestAudit) {
      return NextResponse.json({
        audit: null,
      });
    }

    // Get the audit issues
    const { data: auditIssues } = await supabase
      .from('audit_issues')
      .select('*')
      .eq('audit_id', latestAudit.id);

    return NextResponse.json({
      audit: {
        ...latestAudit,
        issues: auditIssues || [],
      },
    });
  } catch (error) {
    console.error('Error in latest audit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
