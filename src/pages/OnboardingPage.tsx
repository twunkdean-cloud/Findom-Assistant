import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindom } from '@/context/FindomContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Crown, Heart, Sparkles, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const OnboardingPage = () => {
  const { appData, updateAppData } = useFindom();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<'dominant' | 'seductive' | 'strict' | 'caring'>('dominant');

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
  };

  const handleNext = async () => {
    if (step === 1 && selectedGender) {
      setStep(2);
    } else if (step === 2) {
      if (!displayName.trim()) {
        toast.error('Please enter a display name');
        return;
      }
      
      try {
        await updateAppData('profile', {
          first_name: displayName.trim(),
          gender: selectedGender!,
          energy: selectedGender === 'male' ? 'masculine' : 'feminine',
          persona: selectedPersona,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });
        
        await refreshProfile();
        
        toast.success('Welcome! Your profile has been set up.');
        navigate('/', { replace: true });
      } catch (error) {
        toast.error('Failed to save profile');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const genderOptions = [
    {
      value: 'male' as const,
      title: 'Findom',
      subtitle: 'Male Dominant',
      description: 'Commanding male energy for male subs',
      icon: Crown,
      color: 'blue',
      energy: 'Masculine',
      audience: 'Male-for-male dynamics'
    },
    {
      value: 'female' as const,
      title: 'Femdom',
      subtitle: 'Female Dominant',
      description: 'Powerful feminine energy for male subs',
      icon: Crown,
      color: 'pink',
      energy: 'Feminine',
      audience: 'Female-for-male dynamics'
    }
  ];

  const personaOptions = [
    {
      value: 'dominant' as const,
      title: 'Dominant',
      description: selectedGender === 'male' 
        ? 'Commanding, assertive, direct control'
        : 'Goddess-like, supreme, commanding',
      icon: Crown
    },
    {
      value: 'seductive' as const,
      title: 'Seductive',
      description: selectedGender === 'male'
        ? 'Charismatic, confident, alluring'
        : 'Enchanting, captivating, irresistible',
      icon: Heart
    },
    {
      value: 'strict' as const,
      title: 'Strict',
      description: selectedGender === 'male'
        ? 'Authoritative, demanding, uncompromising'
        : 'Demanding, unforgiving, exacting',
      icon: Users
    },
    {
      value: 'caring' as const,
      title: 'Caring',
      description: selectedGender === 'male'
        ? 'Protective, guiding, firm but fair'
        : 'Nurturing, guiding, maternal dominance',
      icon: Sparkles
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-center mt-2 space-x-8 text-xs text-gray-400">
            <span>Choose Style</span>
            <span>Complete Profile</span>
          </div>
        </div>

        {/* Step 1: Gender Selection */}
        {step === 1 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-100">
                Choose Your Dominant Style
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Select your identity to personalize your AI content and experience
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {genderOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedGender === option.value;
                  
                  return (
                    <div
                      key={option.value}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${option.color}-500 bg-${option.color}-900/20`
                          : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                      }`}
                      onClick={() => handleGenderSelect(option.value)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-${option.color}-600 rounded-full flex items-center justify-center`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-100">{option.title}</h3>
                              <p className="text-sm text-gray-400">{option.subtitle}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className={`w-6 h-6 bg-${option.color}-600 rounded-full flex items-center justify-center`}>
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-300">
                            <Sparkles className={`h-4 w-4 mr-2 text-${option.color}-400`} />
                            {option.energy} energy
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Users className={`h-4 w-4 mr-2 text-${option.color}-400`} />
                            {option.audience}
                          </div>
                        </div>
                        
                        <p className="mt-4 text-sm text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!selectedGender}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Profile Completion */}
        {step === 2 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-100">
                Complete Your Profile
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Tell us about yourself to personalize your experience
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be known"
                  className="bg-gray-900 border-gray-600 text-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Your Persona</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personaOptions.map((persona) => {
                    const Icon = persona.icon;
                    const isSelected = selectedPersona === persona.value;
                    
                    return (
                      <div
                        key={persona.value}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all p-4 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-900/20'
                            : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedPersona(persona.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-100">{persona.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{persona.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!displayName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;