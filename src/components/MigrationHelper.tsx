import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFindom } from '@/context/FindomContext';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/utils/toast';
import { UploadCloud, Database, Cloud, CheckCircle } from 'lucide-react';

const MigrationHelper = () => {
  const { user } = useAuth();
  const { migrateFromLocalStorage } = useFindom();
  const [hasLocalStorageData, setHasLocalStorageData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    // Check if there's data in localStorage
    const checkLocalStorage = () => {
      const keys = ['findom_subs', 'findom_tributes', 'findom_customPrices', 'findom_calendar', 'findom_redflags', 'findom_checklist', 'findom_apiKey', 'findom_persona', 'findom_goal', 'findom_responses'];
      const hasData = keys.some(key => {
        const value = localStorage.getItem(key);
        return value && value !== 'null' && value !== 'undefined' && value !== '{}';
      });
      setHasLocalStorageData(hasData);
    };

    checkLocalStorage();
  }, []);

  const handleMigration = async () => {
    if (!user) return;

    setIsMigrating(true);
    try {
      await migrateFromLocalStorage();
      setMigrationComplete(true);
      setHasLocalStorageData(false);
      
      // Clear localStorage after successful migration
      const keys = ['findom_subs', 'findom_tributes', 'findom_customPrices', 'findom_calendar', 'findom_redflags', 'findom_checklist', 'findom_apiKey', 'findom_persona', 'findom_goal', 'findom_responses'];
      keys.forEach(key => localStorage.removeItem(key));
      
      toast.success('Migration completed successfully! Your data is now synced across all devices.');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  if (!user) return null;
  if (!hasLocalStorageData && !migrationComplete) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700 p-4 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Cloud className="mr-2 h-5 w-5" />
          Cloud Data Migration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {migrationComplete ? (
          <div className="flex items-center space-x-3 text-white">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div>
              <p className="font-medium">Migration Complete!</p>
              <p className="text-sm text-blue-200">Your data is now synced across all devices.</p>
            </div>
          </div>
        ) : hasLocalStorageData ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-white">
              <Database className="h-6 w-6 text-yellow-400 mt-1" />
              <div>
                <p className="font-medium">Local Data Detected</p>
                <p className="text-sm text-blue-200">
                  We found data in your browser's local storage. Would you like to migrate it to the cloud so it syncs across all your devices?
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleMigration} 
                disabled={isMigrating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {isMigrating ? 'Migrating...' : 'Migrate to Cloud'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setHasLocalStorageData(false)}
                className="border-gray-400 text-gray-300 hover:bg-gray-700"
              >
                Skip
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MigrationHelper;