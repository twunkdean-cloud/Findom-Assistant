import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/context/FindomContext';
import { useAI } from '@/hooks/use-ai';
import { toast } from '@/utils/toast';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Target,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: () => void;
}

const AIInsightsDashboard = () => {
  const appData = useAppData();
  const { isLoading } = useAI();
  const { isMobile } = useMobile();
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    generateInsights();
  }, [appData]);

  const generateInsights = () => {
    const newInsights: AIInsight[] = [];

    // Analyze tribute trends
    const recentTributes = appData.tributes.filter(t => {
      const tributeDate = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return tributeDate >= thirtyDaysAgo;
    });

    const totalRecent = recentTributes.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgTribute = recentTributes.length > 0 ? totalRecent / recentTributes.length : 0;

    // High-value sub identification
    const highValueSubs = appData.subs.filter(sub => sub.total > 1000);
    if (highValueSubs.length > 0) {
      newInsights.push({
        id: 'high-value-subs',
        type: 'opportunity',
        title: `${highValueSubs.length} High-Value Subs Detected`,
        description: `You have ${highValueSubs.length} subs who have contributed over $1000. Consider premium content for them.`,
        impact: 'high',
        actionable: true,
        action: () => toast.info('Navigate to Subs page to manage high-value subs')
      });
    }

    // Inactive sub warning
    const inactiveSubs = appData.subs.filter(sub => {
      if (!sub.lastTribute) return true;
      const lastTributeDate = new Date(sub.lastTribute);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastTributeDate < thirtyDaysAgo;
    });

    if (inactiveSubs.length > 0) {
      newInsights.push({
        id: 'inactive-subs',
        type: 'warning',
        title: `${inactiveSubs.length} Inactive Subs`,
        description: `${inactiveSubs.length} subs haven't contributed in 30+ days. Consider re-engagement strategies.`,
        impact: 'medium',
        actionable: true,
        action: () => toast.info('Check Sentiment Analysis for re-engagement ideas')
      });
    }

    // Tribute trend analysis
    if (avgTribute > 100) {
      newInsights.push({
        id: 'high-avg-tribute',
        type: 'trend',
        title: 'High Average Tribute Amount',
        description: `Your average tribute is $${avgTribute.toFixed(2)}. Consider increasing minimum tribute requirements.`,
        impact: 'medium',
        actionable: false
      });
    }

    // Content opportunity
    if (appData.tributes.length > 10) {
      newInsights.push({
        id: 'content-opportunity',
        type: 'recommendation',
        title: 'Create Premium Content',
        description: 'With your current engagement, consider creating exclusive content for your top contributors.',
        impact: 'high',
        actionable: true,
        action: () => toast.info('Try the AI Content Generator for personalized ideas')
      });
    }

    // Weekly goal tracking
    const weeklyGoal = appData.goal?.weekly || 0;
    const currentWeekTotal = recentTributes
      .filter(t => {
        const tributeDate = new Date(t.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return tributeDate >= sevenDaysAgo;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (weeklyGoal > 0) {
      const progress = (currentWeekTotal / weeklyGoal) * 100;
      if (progress < 50) {
        newInsights.push({
          id: 'weekly-goal-behind',
          type: 'warning',
          title: 'Weekly Goal Behind Schedule',
          description: `You're at ${progress.toFixed(0)}% of your weekly goal. Consider sending reminders or special offers.`,
          impact: 'high',
          actionable: true,
          action: () => toast.info('Use AI Chatbot for reminder message ideas')
        });
      }
    }

    setInsights(newInsights);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'recommendation': return <Sparkles className="h-4 w-4 text-purple-400" />;
      default: return <Brain className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return 'border-green-600 bg-green-900/20';
      case 'warning': return 'border-yellow-600 bg-yellow-900/20';
      case 'trend': return 'border-blue-600 bg-blue-900/20';
      case 'recommendation': return 'border-purple-600 bg-purple-900/20';
      default: return 'border-gray-600 bg-gray-900/20';
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${appData.tributes.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}`,
      icon: DollarSign,
      trend: '+12%',
      color: 'text-green-400'
    },
    {
      title: 'Active Subs',
      value: appData.subs.length.toString(),
      icon: Users,
      trend: '+3',
      color: 'text-blue-400'
    },
    {
      title: 'Avg Tribute',
      value: `$${appData.tributes.length > 0 ? (appData.tributes.reduce((sum, t) => sum + Number(t.amount), 0) / appData.tributes.length).toFixed(2) : '0'}`,
      icon: Target,
      trend: '+8%',
      color: 'text-purple-400'
    },
    {
      title: 'Engagement',
      value: '87%',
      icon: Activity,
      trend: '+5%',
      color: 'text-indigo-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">AI Insights</h2>
          <p className="text-sm text-gray-400 mt-1">Intelligent analysis of your findom business</p>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isLoading}
          variant="outline"
          size={isMobile ? 'sm' : 'default'}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Brain className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs text-green-400 font-medium">{stat.trend}</span>
                </div>
                <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">AI-Generated Insights</h3>
        {insights.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No insights available yet</p>
              <p className="text-sm text-gray-600 mt-2">Start adding subs and tributes to get AI-powered insights</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-200">{insight.title}</h4>
                          <Badge className={`${getImpactColor(insight.impact)} text-white text-xs`}>
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{insight.description}</p>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={insight.action}
                        className="text-gray-400 hover:text-white ml-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsDashboard;