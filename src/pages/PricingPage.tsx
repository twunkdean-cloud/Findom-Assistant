import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Check, Crown, Zap, Star, CreditCard } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  limitations: string[];
  icon: React.ComponentType<any>;
  color: string;
  popular?: boolean;
}

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const { appData, updateAppData } = useFindom();
  const [selectedPlan, setSelectedPlan] = useState(appData.subscription || 'free');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      icon: Star,
      features: [
        'Basic task generation',
        'Up to 10 subs',
        'Up to 50 tributes/month',
        'Basic response templates',
        'Limited AI usage'
      ],
      limitations: [
        'No advanced analytics',
        'Limited content generation',
        'No priority support'
      ],
      color: 'from-gray-600 to-gray-500'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      description: 'For serious findoms',
      icon: Zap,
      features: [
        'Advanced task generation',
        'Unlimited subs',
        'Unlimited tributes',
        'Premium response templates',
        'Unlimited AI usage',
        'Advanced analytics',
        'Content calendar',
        'Priority support'
      ],
      limitations: [],
      color: 'from-indigo-600 to-purple-600',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$99',
      description: 'For top-tier creators',
      icon: Crown,
      features: [
        'Everything in Pro',
        'Custom AI training',
        'White-label options',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Advanced automation',
        'Personal coaching session'
      ],
      limitations: [],
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      updateAppData('subscription', planId);
      setSelectedPlan(planId);
      setIsProcessing(false);
      toast.success(`Successfully subscribed to ${plans.find(p => p.id === planId)?.name} plan!`);
    }, 2000);
  };

  const handleCancelSubscription = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      updateAppData('subscription', 'free');
      setSelectedPlan('free');
      setIsProcessing(false);
      toast.success('Subscription cancelled. You will keep access until end of your billing period.');
    }, 1000);
  };

  const currentPlan = plans.find(p => p.id === selectedPlan);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
        <p className="text-xl text-gray-400 mb-2">Unlock full potential of your findom empire</p>

        {/* Current Plan Status */}
        {user && currentPlan && (
          <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <currentPlan.icon className="h-6 w-6 text-indigo-400" />
                  <div>
                    <p className="text-sm text-gray-400">Current Plan</p>
                    <p className="text-lg font-semibold text-white">{currentPlan.name}</p>
                  </div>
                </div>
                {selectedPlan !== 'free' && (
                  <Button
                    onClick={handleCancelSubscription}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 ${
                plan.popular ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-3 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-4 h-4 text-gray-500 flex-shrink-0">×</div>
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || selectedPlan === plan.id}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity ${
                    selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : selectedPlan === plan.id ? (
                    'Current Plan'
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Can I change plans anytime?</h4>
            <p className="text-sm text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-400">We accept all major credit cards, PayPal, and various cryptocurrency options.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Is there a free trial?</h4>
            <p className="text-sm text-gray-400">The Free plan is available indefinitely with no time limit. You can upgrade to Pro or Elite whenever you're ready.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">What happens if I cancel?</h4>
            <p className="text-sm text-gray-400">You'll keep access to your current plan until end of your billing period, then revert to Free plan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingPage;