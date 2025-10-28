import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/utils/toast';
import { Activity, BarChart3, Save } from 'lucide-react';
import { 
  createBaselineSnapshot, 
  loadBaseline, 
  saveBaseline, 
  BaselineMetrics 
} from '@/utils/baseline-metrics';

const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

const MetricRow: React.FC<{ label: string; value?: number }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value !== undefined ? value.toFixed(2) : '—'}</span>
  </div>
);

const BaselineMetricsPanel: React.FC = () => {
  const [current, setCurrent] = useState<BaselineMetrics | null>(null);
  const baseline = useMemo(() => loadBaseline(), []);

  useEffect(() => {
    let mounted = true;
    // Measure after mount
    createBaselineSnapshot().then((snap) => {
      if (mounted) setCurrent(snap);
    });
    return () => { mounted = false; };
  }, []);

  const handleSave = () => {
    if (!current) return;
    saveBaseline(current);
    toast.success('Baseline metrics saved');
  };

  return (
    <Card className="bg-background/80 backdrop-blur border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Baseline Performance Metrics
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {current?.env ?? (import.meta.env.PROD ? 'production' : 'development')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <MetricRow label="FCP" value={current?.coreWebVitals.FCP} />
          <MetricRow label="LCP" value={current?.coreWebVitals.LCP} />
          <MetricRow label="CLS" value={current?.coreWebVitals.CLS} />
          <MetricRow label="FID" value={current?.coreWebVitals.FID} />
          <MetricRow label="TTFB" value={current?.coreWebVitals.TTFB} />
        </div>

        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            Total Bundle (JS resources)
          </span>
          <span className="font-semibold">
            {current ? formatKB(current.bundle.totalSize) : '—'}
          </span>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1">Top Vendor Chunks</p>
          <div className="space-y-1">
            {(current?.bundle.topVendorChunks || []).slice(0, 3).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[180px]">{c.name}</span>
                <span className="font-medium">{formatKB(c.size)}</span>
              </div>
            ))}
            {(!current || current.bundle.topVendorChunks.length === 0) && (
              <p className="text-xs text-muted-foreground">No vendor chunks detected yet.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" onClick={handleSave} disabled={!current} className="gap-2">
            <Save className="h-4 w-4" />
            Save Baseline
          </Button>
          {baseline && (
            <span className="text-xs text-muted-foreground">
              Saved: {new Date(baseline.timestamp).toLocaleString()}
            </span>
          )}
        </div>

        {baseline && current && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-1">Comparison vs. Saved Baseline</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span>Total Bundle Δ</span>
                <span className="font-medium">
                  {formatKB(current.bundle.totalSize - baseline.bundle.totalSize)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>LCP Δ</span>
                <span className="font-medium">
                  {((current.coreWebVitals.LCP ?? 0) - (baseline.coreWebVitals.LCP ?? 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BaselineMetricsPanel;