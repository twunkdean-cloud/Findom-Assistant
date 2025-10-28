import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

export type CoreWebVitals = {
  FCP?: number;
  LCP?: number;
  CLS?: number;
  INP?: number;
  TTFB?: number;
};

export type BundleChunk = {
  name: string;
  size: number; // bytes
};

export type BundleMetrics = {
  totalSize: number; // bytes
  chunks: BundleChunk[];
  topVendorChunks: BundleChunk[];
};

export type BaselineMetrics = {
  timestamp: string;
  env: 'development' | 'production';
  coreWebVitals: CoreWebVitals;
  bundle: BundleMetrics;
};

const BASELINE_KEY = 'baselineMetrics:v1';

const fileNameFromUrl = (url: string) => {
  try {
    const u = new URL(url, window.location.origin);
    const parts = u.pathname.split('/');
    return parts[parts.length - 1] || u.pathname;
  } catch {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }
};

export const collectCoreWebVitals = (): Promise<CoreWebVitals> => {
  return new Promise((resolve) => {
    const vitals: CoreWebVitals = {};
    const checkDone = () => {
      if (
        vitals.FCP !== undefined &&
        vitals.LCP !== undefined &&
        vitals.CLS !== undefined &&
        vitals.INP !== undefined &&
        vitals.TTFB !== undefined
      ) {
        resolve(vitals);
      }
    };

    const wrap = (name: keyof CoreWebVitals) => (metric: Metric) => {
      vitals[name] = Number(metric.value);
      checkDone();
    };

    onFCP(wrap('FCP'));
    onLCP(wrap('LCP'));
    onCLS(wrap('CLS'));
    onINP(wrap('INP'));
    onTTFB(wrap('TTFB'));
  });
};

export const collectBundleMetrics = (): BundleMetrics => {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsLike = entries.filter((e) => {
    const n = e.name;
    return (
      e.initiatorType === 'script' ||
      n.endsWith('.js') ||
      n.includes('/node_modules/') ||
      n.includes('/assets/') ||
      n.includes('vendor-')
    );
  });

  const sizesByName: Record<string, number> = {};
  let total = 0;

  jsLike.forEach((e) => {
    // Prefer transferSize; fallback to encodedBodySize
    const size = e.transferSize || e.encodedBodySize || 0;
    total += size;
    const name = fileNameFromUrl(e.name);
    sizesByName[name] = (sizesByName[name] || 0) + size;
  });

  const chunks: BundleChunk[] = Object.entries(sizesByName)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size);

  const topVendorChunks = chunks.filter(
    (c) => c.name.startsWith('vendor-') || c.name.includes('node_modules')
  ).slice(0, 5);

  return {
    totalSize: total,
    chunks,
    topVendorChunks,
  };
};

export const saveBaseline = (metrics: BaselineMetrics) => {
  localStorage.setItem(BASELINE_KEY, JSON.stringify(metrics));
};

export const loadBaseline = (): BaselineMetrics | null => {
  const raw = localStorage.getItem(BASELINE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const createBaselineSnapshot = async (): Promise<BaselineMetrics> => {
  const coreWebVitals = await collectCoreWebVitals();
  // Wait a tick to ensure resources are recorded
  setTimeout(() => {}, 0);
  const bundle = collectBundleMetrics();
  return {
    timestamp: new Date().toISOString(),
    env: import.meta.env.PROD ? 'production' : 'development',
    coreWebVitals,
    bundle,
  };
};