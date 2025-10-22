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
import { useFindom, Tribute } from '@/context/FindomContext';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const TributeTrackerPage = () => {
  const { appData, updateTributes } = useFindom();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTribute, setCurrentTribute] = useState<Tribute | null>(null);

  const [tributeAmount, setTributeAmount] = useState<string | number>(0);
  const [tributeDate, setTributeDate] = useState('');
  const [tributeFrom, setTributeFrom] = useState('');
  const [tributeReason, setTributeReason] = useState('');
  const [tributeNotes, setTributeNotes] = useState('');
  const [tributeSource, setTributeSource] = useState('');
  const [tributeSourceDetail, setTributeSourceDetail] = useState('');

  const resetForm = () => {
    setTributeAmount(0);
    setTributeDate('');
    setTributeFrom('');
    setTributeReason('');
    setTributeNotes('');
    setTributeSource('');
    setTributeSourceDetail('');
    setCurrentTribute(null);
  };

  const handleAddTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(tributeAmount as string);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !tributeDate || !tributeFrom.trim() || !tributeSource) {
      toast.error('Amount (must be greater than 0), Date, From, and Source fields are required.');
      return;
    }

    let finalSource = tributeSource;
    if (tributeSource === 'Wishlist Gift' || tributeSource === 'Other') {
      if (!tributeSourceDetail.trim()) {
        toast.error(`Please specify the ${tributeSource.toLowerCase()}.`);
        return;
      }
      finalSource = `${tributeSource}: ${tributeSourceDetail.trim()}`;
    }

    const newTribute: Tribute = {
      id: Date.now().toString(),
      amount: parsedAmount,
      date: tributeDate,
      from: tributeFrom.trim(),
      reason: tributeReason.trim() || undefined,
      notes: tributeNotes.trim() || undefined,
      source: finalSource,
    };

    await updateTributes([...appData.tributes, newTribute]);
    toast.success(`Tribute of $${newTribute.amount.toFixed(2)} added!`);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(tributeAmount as string);
    if (!currentTribute || isNaN(parsedAmount) || parsedAmount <= 0 || !tributeDate || !tributeFrom.trim() || !tributeSource) {
      toast.error('Amount (must be greater than 0), Date, From, and Source fields are required.');
      return;
    }

    let finalSource = tributeSource;
    if (tributeSource === 'Wishlist Gift' || tributeSource === 'Other') {
      if (!tributeSourceDetail.trim()) {
        toast.error(`Please specify the ${tributeSource.toLowerCase()}.`);
        return;
      }
      finalSource = `${tributeSource}: ${tributeSourceDetail.trim()}`;
    }

    const updatedTribute: Tribute = {
      ...currentTribute,
      amount: parsedAmount,
      date: tributeDate,
      from: tributeFrom.trim(),
      reason: tributeReason.trim() || undefined,
      notes: tributeNotes.trim() || undefined,
      source: finalSource,
    };

    await updateTributes(appData.tributes.map(tribute =>
      tribute.id === updatedTribute.id ? updatedTribute : tribute
    ));
    toast.success(`Tribute from ${updatedTribute.from} updated!`);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteTribute = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tribute record?')) {
      const updatedTributes = appData.tributes.filter(tribute => tribute.id !== id);
      await updateTributes(updatedTributes);
      toast.success('Tribute record deleted.');
    }
  };

  const openEditDialog = (tribute: Tribute) => {
    setCurrentTribute(tribute);
    setTributeAmount(tribute.amount.toString());
    setTributeDate(tribute.date);
    setTributeFrom(tribute.from);
    setTributeReason(tribute.reason || '');
    setTributeNotes(tribute.notes || '');

    // Parse source for editing
    if (tribute.source.startsWith('Wishlist Gift:')) {
      setTributeSource('Wishlist Gift');
      setTributeSourceDetail(tribute.source.replace('Wishlist Gift:', '').trim());
    } else if (tribute.source.startsWith('Other:')) {
      setTributeSource('Other');
      setTributeSourceDetail(tribute.source.replace('Other:', '').trim());
    } else {
      setTributeSource(tribute.source);
      setTributeSourceDetail('');
    }
    setIsEditDialogOpen(true);
  };

  const sortedTributes = [...appData.tributes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Tribute Tracker</h2>
      <p className="text-sm text-gray-400 mb-4">Keep a detailed record of all tributes received.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">All Tributes</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Tribute
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add New Tribute</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTribute} className="space-y-4">
                <div>
                  <Label htmlFor="tribute-amount">Amount ($)</Label>
                  <Input
                    id="tribute-amount"
                    type="number"
                    placeholder="0.00"
                    value={tributeAmount}
                    onChange={(e) => setTributeAmount(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tribute-date">Date of Tribute</Label>
                  <Input
                    id="tribute-date"
                    type="date"
                    value={tributeDate}
                    onChange={(e) => setTributeDate(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tribute-from">From (Sub's Name/Alias)</Label>
                  <Select value={tributeFrom} onValueChange={setTributeFrom} disabled={appData.subs.length === 0}>
                    <SelectTrigger id="tribute-from" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                      <SelectValue placeholder="Select a sub" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                        {appData.subs.length === 0 ? (
                            <SelectItem value="no-subs" disabled>No subs available. Add some in Sub Tracker!</SelectItem>
                        ) : (
                            appData.subs.map(sub => (
                                <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                            ))
                        )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tribute-source">Source</Label>
                  <Select value={tributeSource} onValueChange={setTributeSource}>
                    <SelectTrigger id="tribute-source" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="CashApp">CashApp</SelectItem>
                      <SelectItem value="Revolut">Revolut</SelectItem>
                      <SelectItem value="Wise">Wise</SelectItem>
                      <SelectItem value="Venmo">Venmo</SelectItem>
                      <SelectItem value="Throne">Throne</SelectItem>
                      <SelectItem value="Wishlist Gift">Wishlist Gift</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(tributeSource === 'Wishlist Gift' || tributeSource === 'Other') && (
                  <div>
                    <Label htmlFor="tribute-source-detail">{tributeSource === 'Wishlist Gift' ? 'Gift Description' : 'Specify Other Source'}</Label>
                    <Input
                      id="tribute-source-detail"
                      placeholder={tributeSource === 'Wishlist Gift' ? 'e.g., new phone, designer bag' : 'e.g., Bank Transfer, Crypto'}
                      value={tributeSourceDetail}
                      onChange={(e) => setTributeSourceDetail(e.target.value)}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="tribute-reason">Reason (Optional)</Label>
                  <Input
                    id="tribute-reason"
                    placeholder="e.g., for a task, just because"
                    value={tributeReason}
                    onChange={(e) => setTributeReason(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="tribute-notes">Notes (Optional)</Label>
                  <Textarea
                    id="tribute-notes"
                    placeholder="Any specific notes about this tribute"
                    value={tributeNotes}
                    onChange={(e) => setTributeNotes(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  />
                </div>
                <DialogFooter className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                    Add Tribute
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
          {appData.tributes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tributes tracked yet. Add your first tribute!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-700 hover:bg-gray-700">
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">From</TableHead>
                    <TableHead className="text-gray-300">Source</TableHead>
                    <TableHead className="text-gray-300">Reason</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTributes.map((tribute) => (
                    <TableRow key={tribute.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <TableCell className="font-medium text-green-400">${tribute.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-400">{tribute.date}</TableCell>
                      <TableCell className="text-gray-200">{tribute.from}</TableCell>
                      <TableCell className="text-gray-400">{tribute.source}</TableCell>
                      <TableCell className="text-gray-400">{tribute.reason || 'N/A'}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(tribute)} className="text-blue-400 hover:text-blue-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTribute(tribute.id)} className="text-red-400 hover:text-red-300">
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

      {/* Edit Tribute Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Tribute</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTribute} className="space-y-4">
            <div>
              <Label htmlFor="edit-tribute-amount">Amount ($)</Label>
              <Input
                id="edit-tribute-amount"
                type="number"
                placeholder="0.00"
                value={tributeAmount}
                onChange={(e) => setTributeAmount(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-tribute-date">Date of Tribute</Label>
              <Input
                id="edit-tribute-date"
                type="date"
                value={tributeDate}
                onChange={(e) => setTributeDate(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-tribute-from">From (Sub's Name/Alias)</Label>
              <Select value={tributeFrom} onValueChange={setTributeFrom} disabled={appData.subs.length === 0}>
                <SelectTrigger id="edit-tribute-from" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                  <SelectValue placeholder="Select a sub" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                    {appData.subs.length === 0 ? (
                        <SelectItem value="no-subs" disabled>No subs available. Add some in Sub Tracker!</SelectItem>
                    ) : (
                        appData.subs.map(sub => (
                            <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                        ))
                    )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-tribute-source">Source</Label>
              <Select value={tributeSource} onValueChange={setTributeSource}>
                <SelectTrigger id="edit-tribute-source" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="CashApp">CashApp</SelectItem>
                  <SelectItem value="Revolut">Revolut</SelectItem>
                  <SelectItem value="Wise">Wise</SelectItem>
                  <SelectItem value="Venmo">Venmo</SelectItem>
                  <SelectItem value="Throne">Throne</SelectItem>
                  <SelectItem value="Wishlist Gift">Wishlist Gift</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(tributeSource === 'Wishlist Gift' || tributeSource === 'Other') && (
              <div>
                <Label htmlFor="edit-tribute-source-detail">{tributeSource === 'Wishlist Gift' ? 'Gift Description' : 'Specify Other Source'}</Label>
                <Input
                  id="edit-tribute-source-detail"
                  placeholder={tributeSource === 'Wishlist Gift' ? 'e.g., new phone, designer bag' : 'e.g., Bank Transfer, Crypto'}
                  value={tributeSourceDetail}
                  onChange={(e) => setTributeSourceDetail(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit-tribute-reason">Reason (Optional)</Label>
              <Input
                id="edit-tribute-reason"
                placeholder="e.g., for a task, just because"
                value={tributeReason}
                onChange={(e) => setTributeReason(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-tribute-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-tribute-notes"
                placeholder="Any specific notes about this tribute"
                value={tributeNotes}
                onChange={(e) => setTributeNotes(e.target.value)}
                rows={3}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              />
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

export default TributeTrackerPage;