import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface AnalyticsData {
  statusDistribution: Record<string, number>;
  priorityDistribution: { bucket: string; count: number }[];
  dailyTrend: { date: string; count: number; avgPriority: number }[];
  domainBreakdown: { domain: string; category: string; count: number }[];
  districtPriorityMap: any[];
  aiPerformance: { avgConfidence: number; totalAnalyzed: number; avgPriorityScore: number };
  impactMetrics: { totalProjects: number; totalBeneficiaries: number; totalDeployments: number };
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [
          sRes, pRes, dRes, domRes, aiRes, impRes, distRes,
        ] = await Promise.all([
          apiClient.getAnalyticsStatus ? apiClient.getAnalyticsStatus() : Promise.resolve({ ok: true, data: {} }),
          apiClient.getAnalyticsPriority ? apiClient.getAnalyticsPriority() : Promise.resolve({ ok: true, data: [] }),
          apiClient.getAnalyticsTrend ? apiClient.getAnalyticsTrend() : Promise.resolve({ ok: true, data: [] }),
          apiClient.getAnalyticsDomains ? apiClient.getAnalyticsDomains() : Promise.resolve({ ok: true, data: [] }),
          apiClient.getAnalyticsAIPerformance ? apiClient.getAnalyticsAIPerformance() : Promise.resolve({ ok: true, data: {} }),
          apiClient.getAnalyticsImpact ? apiClient.getAnalyticsImpact() : Promise.resolve({ ok: true, data: {} }),
          apiClient.getDistrictHeatmap ? apiClient.getDistrictHeatmap() : Promise.resolve({ ok: true, data: [] }),
        ]);
        if (cancelled) return;
        setData({
          statusDistribution: sRes.ok ? sRes.data?.distribution || {} : {},
          priorityDistribution: pRes.ok ? pRes.data || [] : [],
          dailyTrend: dRes.ok ? dRes.data || [] : [],
          domainBreakdown: domRes.ok ? domRes.data || [] : [],
          districtHeatmap: distRes.ok ? (distRes.data as any) || [] : [],
          districtPriorityMap: [],
          aiPerformance: aiRes.ok ? aiRes.data || { avgConfidence: 0, totalAnalyzed: 0, avgPriorityScore: 0 } : { avgConfidence: 0, totalAnalyzed: 0, avgPriorityScore: 0 },
          impactMetrics: impRes.ok ? impRes.data || { totalProjects: 0, totalBeneficiaries: 0, totalDeployments: 0 } : { totalProjects: 0, totalBeneficiaries: 0, totalDeployments: 0 },
        });
        setError(null);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Failed to load analytics');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error, refresh: () => {}};
}
