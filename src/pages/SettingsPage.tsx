import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';
import { Save, User, Bell, Shield, Palette, Download, Upload, Crown } from 'lucide-react';
import GenderSelector from '@/components/ui/gender-selector';
import { PERSONA_OPTIONS } from '@/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { AppData, Sub, Tribute, CustomPrice, CalendarEvent, RedFlag } from '@/types';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { 
    appData, 
    updateAppData,
    updateSubs,
    updateTributes,
    updateCustomPrices,
    updateCalendar,
    updateRedflags
  } = useFindom();
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile settings
  const [firstName, setFirstName] = useState(appData.profile?.firstName || '');
  const [bio, setBio] = useState(appData.profile?.bio || '');
  const [persona, setPersona] = useState(appData.profile?.persona || 'dominant');
  const [gender, setGender] = useState<'male' | 'female'>(appData.profile?.gender || 'male');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(appData.settings?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(appData.settings?.pushNotifications ?? true);
  const [dailyReminders, setDailyReminders] = useState(appData.settings?.dailyReminders ?? true);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'private' | 'friends' | 'public'>(appData.settings?.profileVisibility || 'private');
  const [dataSharing, setDataSharing] = useState(appData.settings?.dataSharing ?? false);
  
  // Theme settings
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>(appData.settings?.theme || 'dark');

  // Import preview/persistence state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<Partial<AppData> | null>(null);
  const [previewCounts, setPreviewCounts] = useState<{ subs: number; tributes: number; customPrices: number; calendarEvents: number; redflags: number } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  const mergeById = <T extends { id: string }>(current: T[], incoming: T[]): T[] => {
    const map = new Map<string, T>();
    current.forEach(i => map.set(i.id, i));
    incoming.forEach(i => map.set(i.id, i));
    return Array.from(map.values());
  };

  const performImport = async () => {
    if (!pendingImport) return;
    const data = pendingImport;

    // Collections
    if (data.subs) {
      const list = importMode === 'replace' ? data.subs : mergeById(appData.subs, data.subs as Sub[]);
      await updateSubs(list as Sub[]);
    }
    if (data.tributes) {
      const list = importMode === 'replace' ? data.tributes : mergeById(appData.tributes, data.tributes as Tribute[]);
      await updateTributes(list as Tribute[]);
    }
    if (data.customPrices) {
      const list = importMode === 'replace' ? data.customPrices : mergeById(appData.customPrices, data.customPrices as CustomPrice[]);
      await updateCustomPrices(list as CustomPrice[]);
    }
    const incomingCalendar = (data.calendarEvents || data.calendar) as CalendarEvent[] | undefined;
    if (incomingCalendar) {
      const list = importMode === 'replace' ? incomingCalendar : mergeById(appData.calendarEvents, incomingCalendar);
      await updateCalendar(list as CalendarEvent[]);
    }
    if (data.redflags) {
      const list = importMode === 'replace' ? data.redflags : mergeById(appData.redflags, data.redflags as RedFlag[]);
      await updateRedflags(list as RedFlag[]);
    }

    // Singletons and user_data-backed fields
    if (data.profile) await updateAppData('profile', data.profile);
    if (data.settings) await updateAppData('settings', data.settings);
    if (typeof data.persona !== 'undefined') await updateAppData('persona', data.persona);
    if (typeof data.goal !== 'undefined') await updateAppData('goal', data.goal);
    if (typeof data.responses !== 'undefined') await updateAppData('responses', data.responses);
    if (typeof data.apiKey !== 'undefined') await updateAppData('apiKey', data.apiKey);
    if (typeof data.screenTime !== 'undefined') await updateAppData('screenTime', data.screenTime);
    if (typeof data.timerStart !== 'undefined') await updateAppData('timerStart', data.timerStart);
    if (typeof data.uploadedImageData !== 'undefined') await updateAppData('uploadedImageData', data.uploadedImageData);
    if (typeof data.subscription !== 'undefined') await updateAppData('subscription', data.subscription);
    if (data.checklist) await updateAppData('checklist', data.checklist);

    setImportDialogOpen(false);
    setPendingImport(null);
    setPreviewCounts(null);
    toast.success('Import completed.');
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update profile
      await updateAppData('profile', {
        id: user?.id,
        firstName: firstName,
        lastName: appData.profile?.lastName || '',
        bio,
        persona,
        gender,
        energy: gender === 'male' ? 'masculine' : 'feminine',
        avatarUrl: appData.profile?.avatarUrl || null,
        onboardingCompleted: appData.profile?.onboardingCompleted || false,
        onboardingCompletedAt: appData.profile?.onboardingCompletedAt || null,
      });
      
      // Update settings
      await updateAppData('settings', {
        emailNotifications,
        pushNotifications,
        dailyReminders,
        profileVisibility,
        dataSharing,
        theme
      });
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `findom-assistant-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as Partial<AppData>;
        // Basic validation and summary
        const counts = {
          subs: importedData.subs?.length || 0,
          tributes: importedData.tributes?.length || 0,
          customPrices: importedData.customPrices?.length || 0,
          calendarEvents: (importedData.calendarEvents || importedData.calendar || []).length,
          redflags: importedData.redflags?.length || 0,
        };
        setPreviewCounts(counts);
        setPendingImport(importedData);
        setImportMode('replace');
        setImportDialogOpen(true);
      } catch (error) {
        toast.error('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const getPersonaOptions = () => {
    return PERSONA_OPTIONS[gender];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Gender Selection */}
      <GenderSelector />

      {/* Profile Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-400" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Display Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="How you want to be known"
              className="bg-gray-900 border-gray-600 text-gray-200"
            />
          </div>
          <div>
            <Label className="text-gray-300">Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
              className="bg-gray-900 border-gray-600 text-gray-200"
            />
          </div>
          <div>
            <Label className="text-gray-300">Persona</Label>
            <Select value={persona} onValueChange={(value: any) => setPersona(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {getPersonaOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Bell className="mr-2 h-5 w-5 text-yellow-400" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive updates via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Push Notifications</p>
              <p className="text-sm text-gray-400">Browser push notifications</p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Daily Reminders</p>
              <p className="text-sm text-gray-400">Get reminded about daily tasks</p>
            </div>
            <Switch
              checked={dailyReminders}
              onCheckedChange={setDailyReminders}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Shield className="mr-2 h-5 w-5 text-green-400" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Profile Visibility</Label>
            <Select value={profileVisibility} onValueChange={(value: 'private' | 'friends' | 'public') => setProfileVisibility(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Data Sharing</p>
              <p className="text-sm text-gray-400">Share anonymized data to improve service</p>
            </div>
            <Switch
              checked={dataSharing}
              onCheckedChange={setDataSharing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Palette className="mr-2 h-5 w-5 text-purple-400" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Theme</Label>
            <Select value={theme} onValueChange={(value: 'dark' | 'light' | 'auto') => setTheme(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-data"
              />
              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <label htmlFor="import-data" className="cursor-pointer flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Import</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review what will be imported and choose whether to replace or merge with your current data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-gray-200">
            <p>Subs: <span className="text-gray-300">{previewCounts?.subs ?? 0}</span></p>
            <p>Tributes: <span className="text-gray-300">{previewCounts?.tributes ?? 0}</span></p>
            <p>Custom Prices: <span className="text-gray-300">{previewCounts?.customPrices ?? 0}</span></p>
            <p>Calendar Events: <span className="text-gray-300">{previewCounts?.calendarEvents ?? 0}</span></p>
            <p>Red Flags: <span className="text-gray-300">{previewCounts?.redflags ?? 0}</span></p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant={importMode === 'replace' ? 'default' : 'outline'}
              className={importMode === 'replace' ? 'bg-indigo-600' : 'border-gray-600 text-gray-300'}
              onClick={() => setImportMode('replace')}
            >
              Replace
            </Button>
            <Button
              variant={importMode === 'merge' ? 'default' : 'outline'}
              className={importMode === 'merge' ? 'bg-indigo-600' : 'border-gray-600 text-gray-300'}
              onClick={() => setImportMode('merge')}
            >
              Merge
            </Button>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={performImport}>
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;