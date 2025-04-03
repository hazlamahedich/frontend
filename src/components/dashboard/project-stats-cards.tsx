'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Search, BarChart2, FileText, Loader2 } from 'lucide-react';

interface ProjectStatsCardsProps {
  projectId: string;
  initialKeywordCount: number;
  initialLatestAudit: any;
}

export default function ProjectStatsCards({
  projectId,
  initialKeywordCount,
  initialLatestAudit,
}: ProjectStatsCardsProps) {
  const [keywordCount, setKeywordCount] = useState<number>(initialKeywordCount || 0);
  const [latestAudit, setLatestAudit] = useState<any>(initialLatestAudit);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState<boolean>(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);

  useEffect(() => {
    // Fetch the latest keyword count
    const fetchKeywordCount = async () => {
      setIsLoadingKeywords(true);
      try {
        const response = await fetch(`/api/keywords/count?projectId=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setKeywordCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching keyword count:', error);
      } finally {
        setIsLoadingKeywords(false);
      }
    };

    // Fetch the latest audit
    const fetchLatestAudit = async () => {
      setIsLoadingAudit(true);
      try {
        const response = await fetch(`/api/audit/latest?projectId=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.audit) {
            setLatestAudit(data.audit);
          }
        }
      } catch (error) {
        console.error('Error fetching latest audit:', error);
      } finally {
        setIsLoadingAudit(false);
      }
    };

    fetchKeywordCount();
    fetchLatestAudit();
  }, [projectId]);

  return (
    <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Globe className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Website Health
                </dt>
                <dd className="flex items-center">
                  {isLoadingAudit ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-medium text-gray-900">
                        {latestAudit ? `${Math.round(latestAudit.score)}%` : 'No data'}
                      </div>
                      {latestAudit && (
                        <div className="ml-2">
                          {latestAudit.score >= 80 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          ) : latestAudit.score >= 50 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Needs Improvement
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Poor
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50">
          <div className="text-sm">
            <Link
              href={`/dashboard/seo/site-audit?projectId=${projectId}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              View details
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Keywords
                </dt>
                <dd className="flex items-center">
                  {isLoadingKeywords ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-medium text-gray-900">
                        {keywordCount || 0}
                      </div>
                      <div className="ml-2 text-sm text-gray-500">tracked</div>
                    </>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50">
          <div className="text-sm">
            <Link
              href={`/dashboard/seo/keyword-research?projectId=${projectId}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Research keywords
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart2 className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Rankings
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-medium text-gray-900">
                    View
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50">
          <div className="text-sm">
            <Link
              href={`/dashboard/seo/rank-tracking?projectId=${projectId}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Track rankings
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Content
                </dt>
                <dd className="flex items-center">
                  <div className="text-lg font-medium text-gray-900">
                    Optimize
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50">
          <div className="text-sm">
            <Link
              href={`/dashboard/seo/content-analysis?projectId=${projectId}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Analyze content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
