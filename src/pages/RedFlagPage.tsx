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
import { RedFlag } from '@/types/index';
import { toast } from '@/utils/toast';
import { PlusCircle, Edit, Trash2, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RedFlagPage = () => {
  const { appData, updateRedflags } = useFindom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFlag, setCurrentFlag] = useState<RedFlag | null>(null);

  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const resetForm = () => {
    setUsername('');
    setReason('');
    setSeverity('medium');
    setCurrentFlag(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !reason.trim()) {
      toast.error('Username and reason are required.');
      return;
    }

    if (isEditing && currentFlag) {
      const updatedFlag: RedFlag = { ...currentFlag, username, reason, severity };
      await updateRedflags(appData.redflags.map(flag => (flag.id === updatedFlag.id ? updatedFlag : flag)));
      toast.success(`Flag for ${username} updated.`);
    } else {
      const newFlag: RedFlag = {
        id: Date.now().toString(),
        username,
        reason,
        severity,
      };
      await updateRedflags([...appData.redflags, newFlag]);
      toast.success(`Flag for ${username} added.`);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (flag: RedFlag) => {
    setCurrentFlag(flag);
    setUsername(flag.username);
    setReason(flag.reason);
    setSeverity(flag.severity || 'medium');
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this red flag?')) {
      await updateRedflags(appData.redflags.filter(flag => flag.id !== id));
      toast.success('Red flag deleted.');
    }
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high' | undefined) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white">Low</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Red Flag System</h2>
      <p className="text-sm text-muted-foreground mb-4">Keep a private record of users to avoid.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Flagged Users</CardTitle>
          <Button onClick={openAddDialog} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Flag
          </Button>
        </CardHeader>
        <CardContent>
          {appData.redflags.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users flagged yet. Your list is clean!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-700 hover:bg-gray-700">
                    <TableHead className="text-muted-foreground">Username</TableHead>
                    <TableHead className="text-muted-foreground">Reason</TableHead>
                    <TableHead className="text-muted-foreground">Severity</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appData.redflags.map((flag) => (
                    <TableRow key={flag.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <TableCell className="font-medium text-gray-200">{flag.username}</TableCell>
                      <TableCell className="text-gray-400 max-w-md truncate">{flag.reason}</TableCell>
                      <TableCell>{getSeverityBadge(flag.severity)}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(flag)} className="text-blue-400 hover:text-blue-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(flag.id)} className="text-red-400 hover:text-red-300">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{isEditing ? 'Edit Red Flag' : 'Add New Red Flag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g., timewaster22"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Why are you flagging this user?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(value) => setSeverity(value as 'low' | 'medium' | 'high')}>
                <SelectTrigger className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                {isEditing ? 'Save Changes' : 'Add Flag'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)} className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RedFlagPage;