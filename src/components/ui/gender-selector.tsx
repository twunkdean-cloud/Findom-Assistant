import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Crown, Heart, Sparkles, Users } from 'lucide-react';

const GenderSelector = () => {
  const { appData, updateAppData } = useFindom();

  const handleGenderSelect = async (gender: 'male' | 'female') => {
    try {
      await updateAppData('profile', {
        ...appData.profile,
        gender,
        energy: gender === 'male' ? 'masculine' : 'feminine',
      });
      
      const genderLabel = gender === 'male' ? 'Findom (Male Dominant)' : 'Femdom (Female Dominant)';
      toast.success(`Switched to ${genderLabel} mode`);
    } catch (error) {
      toast.error('Failed to update gender preference');
    }
  };

  const currentGender = appData.profile?.gender || 'male';

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-200 flex items-center">
          <Crown className="mr-2 h-5 w-5 text-purple-400" />
          Choose Your Dominant Style
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400">
          Select your dominant identity to personalize AI content, tone, and energy throughout the app.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Male Dominant Option */}
          <div
            className={`relative cursor-pointer rounded-lg border-2 transition-all ${
              currentGender === 'male'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
            }`}
            onClick={() => handleGenderSelect('male')}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">Findom</h3>
                    <p className="text-xs text-gray-400">Male Dominant</p>
                  </div>
                </div>
                {currentGender === 'male' && (
                  <Badge className="bg-blue-600 text-white">Active</Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
                  Masculine energy
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  Male-for-male dynamics
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Heart className="h-4 w-4 mr-2 text-blue-400" />
                  Direct, commanding tone
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  Perfect for male dominants seeking male subs with powerful, assertive content
                </p>
              </div>
            </div>
          </div>

          {/* Female Dominant Option */}
          <div
            className={`relative cursor-pointer rounded-lg border-2 transition-all ${
              currentGender === 'female'
                ? 'border-pink-500 bg-pink-900/20'
                : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
            }`}
            onClick={() => handleGenderSelect('female')}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">Femdom</h3>
                    <p className="text-xs text-gray-400">Female Dominant</p>
                  </div>
                </div>
                {currentGender === 'female' && (
                  <Badge className="bg-pink-600 text-white">Active</Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <Sparkles className="h-4 w-4 mr-2 text-pink-400" />
                  Feminine energy
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Users className="h-4 w-4 mr-2 text-pink-400" />
                  Female-for-male dynamics
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Heart className="h-4 w-4 mr-2 text-pink-400" />
                  Seductive, powerful tone
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  Ideal for female dominants with captivating, empowering content
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            💡 Your choice affects AI-generated content, response templates, and suggested tones across all features
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenderSelector;