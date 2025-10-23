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
import { toast } from 'sonner';
import { Save, User, Bell, Shield, Palette, Download, Upload } from 'lucide-react';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { appData, updateAppData } = useFindom();
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile settings
  const [displayName, setDisplayName] = useState(appData.profile?.displayName || '');
  const [bio, setBio] = useState(appData.profile?.bio || '');
  const [persona, setPersona] = useState(appData.profile?.persona || 'dominant');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(appData.settings?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(appData.settings?.pushNotifications ?? true);
  const [dailyReminders, setDailyReminders] = useState(appData.settings?.dailyReminders ?? true);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(appData.settings?.profileVisibility || 'private');
  const [dataSharing, setDataSharing] = useState(appData.settings?.dataSharing ?? false);
  
  // Theme settings
  const [theme, setTheme] = useState(appData.settings?.theme || 'dark');

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update profile
      await updateAppData('profile', {
        displayName,
        bio,
        persona
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
        const importedData = JSON.parse(e.target?.result as string);
        // Here you would validate and merge the imported data
        toast.success('Data imported successfully!');
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Manage your account and application preferences</p>
      </div>

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
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="dominant">Dominant</SelectItem>
                <SelectItem value="seductive">Seductive</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="caring">Caring</SelectItem>
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
            <Select value={profileVisibility} onValueChange={setProfileVisibility}>
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
              <p className="text-sm text-gray-400">Share anonymized data to improve the service</p>
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
            <Select value={theme} onValueChange={setTheme}>
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