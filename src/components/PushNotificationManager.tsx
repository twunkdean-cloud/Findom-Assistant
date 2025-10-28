import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/utils/toast';
import { Bell, BellOff, Settings, CheckCircle } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { userDataService } from '@/services/user-data-service';

interface NotificationSettings {
  enabled: boolean;
  newTributes: boolean;
  newSubs: boolean;
  reminders: boolean;
  weeklyReports: boolean;
}

const PushNotificationManager: React.FC = () => {
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    newTributes: true,
    newSubs: true,
    reminders: true,
    weeklyReports: false,
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load settings: prefer Supabase; fallback to localStorage for legacy users
    const load = async () => {
      const local = localStorage.getItem('notificationSettings');
      try {
        if (user) {
          const remote = await userDataService.getNotificationSettings(user.id);
          setSettings(remote);
          // Optional: migrate local to remote if remote looks default but local exists
          if (local) {
            const parsed = JSON.parse(local) as NotificationSettings;
            const looksDefault = !remote.enabled && remote.newTributes && remote.newSubs && remote.reminders && !remote.weeklyReports;
            if (looksDefault && (parsed.enabled || parsed.weeklyReports !== false)) {
              await userDataService.setNotificationSettings(user.id, parsed);
              setSettings(parsed);
              localStorage.removeItem('notificationSettings');
            }
          }
        } else if (local) {
          setSettings(JSON.parse(local));
        }
      } catch (e) {
        console.error('Failed to load notification settings:', e);
        if (local) {
          setSettings(JSON.parse(local));
        }
      }
    };
    load();
  }, [user]);

  const persistSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    if (user) {
      await userDataService.setNotificationSettings(user.id, newSettings);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notifications are not supported on this device');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        const updated = { ...settings, enabled: true };
        await persistSettings(updated);

        // Send a test notification
        new Notification('Findom Assistant', {
          body: 'Notifications are now enabled!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        const updated = { ...settings, enabled: false };
        await persistSettings(updated);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    await persistSettings(newSettings);
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Findom Assistant!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test',
      });
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable notifications first');
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <BellOff className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Notifications Not Supported</h3>
          <p className="text-gray-500">Your browser or device doesn't support push notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-indigo-400" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-200">Notification Status</h4>
            <p className="text-sm text-gray-500">
              {permission === 'granted' ? 'Enabled' : 
               permission === 'denied' ? 'Blocked' : 
               'Not requested'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={permission === 'granted' ? 'default' : 'secondary'}
              className={permission === 'granted' ? 'bg-green-600' : 'bg-gray-600'}
            >
              {permission === 'granted' && <CheckCircle className="h-3 w-3 mr-1" />}
              {permission === 'granted' ? 'Enabled' : 'Disabled'}
            </Badge>
            {permission !== 'granted' && (
              <Button onClick={requestPermission} size="sm">
                Enable
              </Button>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        {permission === 'granted' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-200">Notification Types</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">New Tributes</label>
                  <p className="text-xs text-gray-500">Get notified when you receive a new tribute</p>
                </div>
                <Switch
                  checked={settings.newTributes}
                  onCheckedChange={(checked) => updateSetting('newTributes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">New Subs</label>
                  <p className="text-xs text-gray-500">Notify when a new sub joins</p>
                </div>
                <Switch
                  checked={settings.newSubs}
                  onCheckedChange={(checked) => updateSetting('newSubs', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Reminders</label>
                  <p className="text-xs text-gray-500">Daily reminders for tasks and goals</p>
                </div>
                <Switch
                  checked={settings.reminders}
                  onCheckedChange={(checked) => updateSetting('reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Weekly Reports</label>
                  <p className="text-xs text-gray-500">Weekly performance summaries</p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Notification */}
        {permission === 'granted' && (
          <div className="pt-4 border-t border-gray-700">
            <Button 
              onClick={sendTestNotification} 
              variant="outline" 
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Mobile App Info */}
        {isMobile && permission === 'granted' && (
          <div className="p-3 bg-indigo-900/20 border border-indigo-700 rounded-lg">
            <p className="text-sm text-indigo-300">
              💡 For the best experience, make sure to enable notifications in your device settings as well.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;