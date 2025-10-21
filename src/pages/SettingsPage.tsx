"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFindom, AppData } from '@/context/FindomContext';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { appData, updateAppData, saveAllAppData, clearAllData, exportData, importData } = useFindom();
  const [apiKeyInput, setApiKeyInput] = useState(appData.apiKey);
  const [personaName, setPersonaName] = useState(appData.persona.name);
  const [personaSpecialties, setPersonaSpecialties] = useState(appData.persona.specialties);
  const [personaStyle, setPersonaStyle] = useState(appData.persona.style);

  const handleSaveApiKey = () => {
    updateAppData('apiKey', apiKeyInput);
    toast.success('API Key saved!');
  };

  const handleSavePersona = () => {
    updateAppData('persona', {
      name: personaName,
      specialties: personaSpecialties,
      style: personaStyle,
    });
    toast.success('Persona settings saved!');
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData: AppData = JSON.parse(e.target?.result as string);
          importData(importedData);
        } catch (error) {
          console.error('Error parsing imported file:', error);
          toast.error('Failed to import data. Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Settings</h2>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Gemini API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Your Gemini API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            />
          </div>
          <Button onClick={handleSaveApiKey} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            Save API Key
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Persona Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">Persona Name</Label>
            <Input
              id="persona-name"
              placeholder="e.g., Switch Dean"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-specialties">Specialties</Label>
            <Input
              id="persona-specialties"
              placeholder="e.g., male findom, foot worship, wallet drain"
              value={personaSpecialties}
              onChange={(e) => setPersonaSpecialties(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-style">Style</Label>
            <Select value={personaStyle} onValueChange={(value: 'strict' | 'playful' | 'cruel' | 'sensual') => setPersonaStyle(value)}>
              <SelectTrigger className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
                <SelectItem value="cruel">Cruel</SelectItem>
                <SelectItem value="sensual">Sensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSavePersona} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            Save Persona Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportData} className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
              Export All Data
            </Button>
            <Button onClick={clearAllData} className="flex-1 bg-red-600 px-4 py-2 rounded hover:bg-red-700">
              Clear All Data
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-data">Import Data (JSON file)</Label>
            <Input
              id="import-data"
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;