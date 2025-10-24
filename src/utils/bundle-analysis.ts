export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
  }>;
}

export const analyzeBundle = (): BundleMetrics => {
  // This would typically be done with webpack-bundle-analyzer or similar
  // For now, we'll return mock data
  return {
    totalSize: 2500000, // 2.5MB
    gzippedSize: 750000, // 750KB
    chunkCount: 15,
    largestChunks: [
      { name: 'vendor', size: 1500000, gzippedSize: 450000 },
      { name: 'main', size: 500000, gzippedSize: 150000 },
      { name: 'chat-assistant', size: 300000, gzippedSize: 90000 },
      { name: 'dashboard', size: 200000, gzippedSize: 60000 },
    ]
  };
};

export const getOptimizationSuggestions = (metrics: BundleMetrics): string[] => {
  const suggestions: string[] = [];
  
  if (metrics.totalSize > 3000000) {
    suggestions.push('Consider implementing more aggressive code splitting');
  }
  
  if (metrics.gzippedSize > 1000000) {
    suggestions.push('Optimize images and assets further');
  }
  
  if (metrics.largestChunks[0].size > 1000000) {
    suggestions.push('Break down the largest chunk into smaller pieces');
  }
  
  return suggestions;
};

export const logBundleMetrics = () => {
  if (process.env.NODE_ENV === 'development') {
    const metrics = analyzeBundle();
    console.group('📦 Bundle Analysis');
    console.log('Total Size:', `${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('Gzipped Size:', `${(metrics.gzippedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('Chunk Count:', metrics.chunkCount);
    console.log('Largest Chunks:', metrics.largestChunks);
    
    const suggestions = getOptimizationSuggestions(metrics);
    if (suggestions.length > 0) {
      console.log('Optimization Suggestions:', suggestions);
    }
    console.groupEnd();
  }
};