import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AuditIssue {
  issue: string;
  description: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
}

interface AuditResult {
  score: number;
  summary: string;
  issues: AuditIssue[];
  strengths: string[];
}

interface SaveAuditRequest {
  websiteId: string;
  result: AuditResult;
  pagesCrawled?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body: SaveAuditRequest = await request.json();
    const { websiteId, result, pagesCrawled = 1 } = body;

    // Validate required fields
    if (!websiteId || !result) {
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

    // Verify the website belongs to the user
    const { data: website } = await supabase
      .from('websites')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', websiteId)
      .eq('projects.user_id', session.user.id)
      .single();

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or not authorized' },
        { status: 404 }
      );
    }

    // Insert the audit record
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        website_id: websiteId,
        status: 'completed',
        score: result.score,
        pages_crawled: pagesCrawled,
        issues_found: result.issues.length,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (auditError) {
      console.error('Error saving audit:', auditError);
      return NextResponse.json(
        { error: 'Failed to save audit' },
        { status: 500 }
      );
    }

    // Insert audit issues
    if (result.issues && result.issues.length > 0) {
      const auditIssues = result.issues.map(issue => ({
        audit_id: audit.id,
        issue_type: issue.issue,
        description: issue.description,
        impact: issue.impact,
        recommendation: issue.recommendation,
        affected_urls: JSON.stringify([website.id]),
      }));

      const { error: issuesError } = await supabase
        .from('audit_issues')
        .insert(auditIssues);

      if (issuesError) {
        console.error('Error saving audit issues:', issuesError);
        // Continue anyway, we at least saved the main audit
      }
    }

    return NextResponse.json({
      success: true,
      auditId: audit.id,
    });
  } catch (error) {
    console.error('Error in save audit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
