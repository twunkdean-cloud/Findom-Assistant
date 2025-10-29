"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFindom } from '@/context/FindomContext';
import { Sub } from '@/types/index';
import { toast } from '@/utils/toast';
import { PlusCircle, Edit, Trash2, UploadCloud, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { uploadConversationHistory, getConversationHistorySignedUrl } from '@/services/storage-service';

const SubTrackerPage = () => {
  const { appData, createSub, updateSub, deleteSub } = useFindom();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<Sub | null>(null);

  const [subName, setSubName] = useState('');
  const [subTotal, setSubTotal] = useState<string | number>(0);
  const [subLastTribute, setSubLastTribute] = useState('');
  const [subPreferences, setSubPreferences] = useState('');
  const [subNotes, setSubNotes] = useState('');
  const [subConversationHistory, setSubConversationHistory] = useState<string | Record<string, any> | undefined>(undefined);
  const [conversationFileName, setConversationFileName] = useState<string | undefined>(undefined);
  const [conversationFile, setConversationFile] = useState<File | null>(null);
  const { user } = useAuth();

  const resetForm = () => {
    setSubName('');
    setSubTotal(0);
    setSubLastTribute('');
    setSubPreferences('');
    setSubNotes('');
    setSubConversationHistory(undefined);
    setConversationFileName(undefined);
    setCurrentSub(null);
    setSubTier('');
    setSubTags('');
  };

  const handleConversationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('json')) {
        toast.error('Please upload a JSON file.');
        return;
      }
      setConversationFile(file);
      setConversationFileName(file.name);
      toast.success('Conversation history ready to upload.');
    } else {
      setConversationFile(null);
      setConversationFileName(undefined);
    }
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      toast.error('Sub name is required.');
      return;
    }
    const parsedTotal = parseFloat(subTotal as string) || 0;
    if (parsedTotal < 0) {
      toast.error('Total tributed must be zero or positive.');
      return;
    }

    const newSubData: Omit<Sub, 'id' | 'created_at' | 'updated_at'> = {
      name: subName.trim(),
      total: parsedTotal,
      lastTribute: subLastTribute || undefined,
      preferences: subPreferences,
      notes: subNotes,
      conversationHistory: undefined,
      tier: subTier,
      tags: subTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    const newSub = await createSub(newSubData);

    if (newSub) {
      // If a conversation file was provided and user is signed in, upload to storage and update the sub
      if (conversationFile && user?.id) {
        try {
          const storagePath = await uploadConversationHistory(user.id, newSub.id, conversationFile);
          await updateSub(newSub.id, { conversationHistory: storagePath });
          toast.success('Conversation history uploaded and linked.');
        } catch (err) {
          console.error(err);
          toast.error('Could not upload conversation history. Ensure a private "conversations" bucket exists.');
        }
      } else if (conversationFile && !user?.id) {
        toast.info('Sign in to upload conversation history; sub saved without it.');
      }
      toast.success(`${newSub.name} added to tracker!`);
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      toast.error('Failed to add sub.');
    }
  };

  const handleEditSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSub || !subName.trim()) {
      toast.error('Sub name is required.');
      return;
    }
    const parsedTotal = parseFloat(subTotal as string) || 0;
    if (parsedTotal < 0) {
      toast.error('Total tributed must be zero or positive.');
      return;
    }

    const updatedSubData: Partial<Sub> = {
      name: subName.trim(),
      total: parsedTotal,
      lastTribute: subLastTribute || undefined,
      preferences: subPreferences,
      notes: subNotes,
      // conversationHistory is managed via storage; only set when uploading a new file
      tier: subTier,
      tags: subTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    const updatedSub = await updateSub(currentSub.id, updatedSubData);

    if (updatedSub) {
      if (conversationFile && user?.id) {
        try {
          const storagePath = await uploadConversationHistory(user.id, currentSub.id, conversationFile);
          await updateSub(currentSub.id, { conversationHistory: storagePath });
          toast.success('Conversation history uploaded and linked.');
        } catch (err) {
          console.error(err);
          toast.error('Could not upload conversation history. Ensure a private "conversations" bucket exists.');
        }
      } else if (conversationFile && !user?.id) {
        toast.info('Sign in to upload conversation history; changes saved without file upload.');
      }
      toast.success(`${updatedSub.name} updated!`);
      setIsEditDialogOpen(false);
      resetForm();
    } else {
      toast.error('Failed to update sub.');
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub?')) {
      await deleteSub(id);
    }
  };

  const openEditDialog = (sub: Sub) => {
    setCurrentSub(sub);
    setSubName(sub.name);
    setSubTotal(sub.total.toString());
    setSubLastTribute(sub.lastTribute || '');
    setSubPreferences(sub.preferences || '');
    setSubNotes(sub.notes || '');
    setSubConversationHistory(sub.conversationHistory);
    setConversationFileName(sub.conversationHistory ? 'conversation.json' : undefined);
    setSubTier(sub.tier || '');
    setSubTags(sub.tags ? sub.tags.join(', ') : '');
    setIsEditDialogOpen(true);
  };

  const handleDownloadHistory = async (path: string) => {
    try {
      const url = await getConversationHistorySignedUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      toast.error('Could not generate download link for conversation history.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sub Tracker</h2>
      <p className="text-sm text-muted-foreground mb-4">Keep track of your loyal subs, their tributes, and preferences.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-primary-foreground">Your Subs</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Sub
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add New Sub</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSub} className="space-y-4">
                <div>
                  <Label htmlFor="sub-name">Name</Label>
                  <Input
                    id="sub-name"
                    placeholder="Sub's Name"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sub-total">Total Tributed ($)</Label>
                  <Input
                    id="sub-total"
                    type="number"
                    placeholder="0"
                    value={subTotal}
                    onChange={(e) => setSubTotal(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-last-tribute">Last Tribute Date</Label>
                  <Input
                    id="sub-last-tribute"
                    type="date"
                    value={subLastTribute}
                    onChange={(e) => setSubLastTribute(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-tier">Tier</Label>
                  <Select value={subTier} onValueChange={setSubTier}>
                    <SelectTrigger className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sub-tags">Tags (comma-separated)</Label>
                  <Input
                    id="sub-tags"
                    placeholder="e.g., long-term, foot-worshipper"
                    value={subTags}
                    onChange={(e) => setSubTags(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-preferences">Preferences</Label>
                  <Textarea
                    id="sub-preferences"
                    placeholder="e.g., loves foot worship, enjoys public humiliation"
                    value={subPreferences}
                    onChange={(e) => setSubPreferences(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-notes">Notes</Label>
                  <Textarea
                    id="sub-notes"
                    placeholder="Any specific notes about this sub"
                    value={subNotes}
                    onChange={(e) => setSubNotes(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversation-history">Conversation History (JSON)</Label>
                  <Input
                    id="conversation-history"
                    type="file"
                    accept=".json"
                    onChange={handleConversationUpload}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {conversationFileName && (
                    <p className="text-xs text-gray-400 flex items-center">
                      <UploadCloud className="h-3 w-3 mr-1" /> {conversationFileName} uploaded.
                    </p>
                  )}
                  {!conversationFileName && currentSub?.conversationHistory && (
                    <p className="text-xs text-gray-400 flex items-center">
                      <UploadCloud className="h-3 w-3 mr-1" /> Existing conversation history present.
                    </p>
                  )}
                </div>
                <DialogFooter className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                    Add Sub
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)} className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {appData.subs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No subs tracked yet. Add your first sub!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-700 hover:bg-gray-700">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Tier</TableHead>
                    <TableHead className="text-muted-foreground">Tags</TableHead>
                    <TableHead className="text-muted-foreground">Total Tributed</TableHead>
                    <TableHead className="text-muted-foreground">Last Tribute</TableHead>
                    <TableHead className="text-muted-foreground">History</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appData.subs.map((sub) => (
                    <TableRow key={sub.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <TableCell className="font-medium text-gray-200">{sub.name}</TableCell>
                      <TableCell>
                        {sub.tier ? <Badge>{sub.tier}</Badge> : <span className="text-gray-500">N/A</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-green-400">${sub.total.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.lastTribute || 'N/A'}</TableCell>
                      <TableCell>
                        {sub.conversationHistory ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Has History</span>
                            {typeof sub.conversationHistory === 'string' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-400 hover:text-blue-300 px-2 h-7"
                                onClick={() => handleDownloadHistory(sub.conversationHistory as string)}
                                title="Download conversation history"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No History</span>
                        )}
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(sub)} className="text-blue-400 hover:text-blue-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSub(sub.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sub Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Sub</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSub} className="space-y-4">
            <div>
              <Label htmlFor="edit-sub-name">Name</Label>
              <Input
                id="edit-sub-name"
                placeholder="Sub's Name"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-sub-total">Total Tributed ($)</Label>
              <Input
                id="edit-sub-total"
                type="number"
                placeholder="0"
                value={subTotal}
                onChange={(e) => setSubTotal(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-sub-last-tribute">Last Tribute Date</Label>
              <Input
                id="edit-sub-last-tribute"
                type="date"
                value={subLastTribute}
                onChange={(e) => setSubLastTribute(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-sub-tier">Tier</Label>
              <Select value={subTier} onValueChange={setSubTier}>
                <SelectTrigger className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                  <SelectItem value="Diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-sub-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-sub-tags"
                placeholder="e.g., long-term, foot-worshipper"
                value={subTags}
                onChange={(e) => setSubTags(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-sub-preferences">Preferences</Label>
              <Textarea
                id="edit-sub-preferences"
                placeholder="e.g., loves foot worship, enjoys public humiliation"
                value={subPreferences}
                onChange={(e) => setSubPreferences(e.target.value)}
                rows={3}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-sub-notes">Notes</Label>
              <Textarea
                id="edit-sub-notes"
                placeholder="Any specific notes about this sub"
                value={subNotes}
                onChange={(e) => setSubNotes(e.target.value)}
                rows={3}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-conversation-history">Conversation History (JSON)</Label>
              <Input
                id="edit-conversation-history"
                type="file"
                accept=".json"
                onChange={handleConversationUpload}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
              {conversationFileName && (
                <p className="text-xs text-gray-400 flex items-center">
                  <UploadCloud className="h-3 w-3 mr-1" /> {conversationFileName} uploaded.
                </p>
              )}
              {!conversationFileName && currentSub?.conversationHistory && (
                <p className="text-xs text-gray-400 flex items-center">
                  <UploadCloud className="h-3 w-3 mr-1" /> Existing conversation history present.
                </p>
              )}
            </div>
            <DialogFooter className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)} className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubTrackerPage;