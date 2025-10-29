"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';
import { Plus, Edit, Trash2, DollarSign, Calendar } from 'lucide-react';
import { Tribute } from '@/types';
import { useLocation } from 'react-router-dom';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Skeleton } from '@/components/ui/skeleton';

const TributeTrackerPage = () => {
  const { appData, updateTributes, loading } = useFindom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTribute, setEditingTribute] = useState<Tribute | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setIsDialogOpen(true);
    }
  }, [location.search]);
  
  // Form states
  const [tributeAmount, setTributeAmount] = useState('');
  const [tributeDate, setTributeDate] = useState(new Date().toISOString().split('T')[0]);
  const [tributeFrom, setTributeFrom] = useState('');
  const [tributeReason, setTributeReason] = useState('');
  const [tributeSource, setTributeSource] = useState<'cashapp' | 'venmo' | 'paypal' | 'other'>('cashapp');

  const resetForm = () => {
    setTributeAmount('');
    setTributeDate(new Date().toISOString().split('T')[0]);
    setTributeFrom('');
    setTributeReason('');
    setTributeSource('cashapp');
  };

  const handleAddTribute = async () => {
    const amountNum = parseFloat(tributeAmount);
    if (!tributeFrom) {
      toast.error('Please select a sub.');
      return;
    }
    if (!tributeAmount || isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTribute: Tribute = {
      id: Date.now().toString(),
      amount: parseFloat(amountNum.toFixed(2)),
      date: tributeDate,
      from_sub: tributeFrom.trim(),
      reason: tributeReason.trim() || undefined,
      source: tributeSource,
    };

    const updatedTributes = [...appData.tributes, newTribute];
    await updateTributes(updatedTributes);
    
    resetForm();
    setIsDialogOpen(false);
    toast.success(`Tribute of $${newTribute.amount.toFixed(2)} added!`);
  };

  const handleEditTribute = async () => {
    const amountNum = parseFloat(tributeAmount);
    if (!editingTribute || !tributeFrom) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!tributeAmount || isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedTribute: Tribute = {
      ...editingTribute,
      amount: parseFloat(amountNum.toFixed(2)),
      date: tributeDate,
      from_sub: tributeFrom.trim(),
      reason: tributeReason.trim() || undefined,
      source: tributeSource,
    };

    const updatedTributes = appData.tributes.map(t => 
      t.id === editingTribute.id ? updatedTribute : t
    );
    
    await updateTributes(updatedTributes);
    
    resetForm();
    setIsEditDialogOpen(false);
    setEditingTribute(null);
    toast.success(`Tribute from ${updatedTribute.from_sub} updated!`);
  };

  const handleDeleteTribute = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tribute?')) {
      const updatedTributes = appData.tributes.filter(t => t.id !== id);
      await updateTributes(updatedTributes);
      toast.success('Tribute deleted successfully!');
    }
  };

  const openEditDialog = (tribute: Tribute) => {
    setEditingTribute(tribute);
    setTributeAmount(tribute.amount.toString());
    setTributeDate(tribute.date);
    setTributeFrom(tribute.from_sub);
    setTributeReason(tribute.reason || '');
    setTributeSource(tribute.source);
    setIsEditDialogOpen(true);
  };

  // Calculate totals
  const totalTributes = appData.tributes.reduce((sum, t) => sum + t.amount, 0);
  const monthlyTotal = appData.tributes
    .filter(t => {
      const tributeDate = new Date(t.date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return tributeDate.getMonth() === currentMonth && tributeDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const Row = ({ index, style, data }: ListChildComponentProps) => {
    const tribute = (data as Tribute[])[index];
    return (
      <div style={style} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
        <div>
          <p className="text-white font-medium">{tribute.from_sub}</p>
          <p className="text-gray-400 text-sm">{new Date(tribute.date).toLocaleDateString()}</p>
          {tribute.reason && <p className="text-gray-500 text-sm">{tribute.reason}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-bold">${tribute.amount.toFixed(2)}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditDialog(tribute)}
            className="text-gray-400 hover:text-white"
            aria-label={`Edit tribute from ${tribute.from_sub}`}
            title="Edit tribute"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteTribute(tribute.id)}
            className="text-red-400 hover:text-red-300"
            aria-label={`Delete tribute from ${tribute.from_sub}`}
            title="Delete tribute"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tribute Tracker</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Tribute
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Tribute</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={tributeAmount}
                  onChange={(e) => setTributeAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="from">From</Label>
                <Select value={tributeFrom} onValueChange={setTributeFrom}>
                  <SelectTrigger id="from" className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder={appData.subs.length ? 'Select a sub' : 'No subs available'} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {appData.subs.length === 0 ? (
                      <SelectItem value="" disabled>No subs yet</SelectItem>
                    ) : (
                      appData.subs.map((s) => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={tributeDate}
                  onChange={(e) => setTributeDate(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Select value={tributeSource} onValueChange={(value) => setTributeSource(value as any)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="cashapp">Cash App</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={tributeReason}
                  onChange={(e) => setTributeReason(e.target.value)}
                  placeholder="Reason for tribute..."
                  rows={3}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <Button onClick={handleAddTribute} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Add Tribute
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Tributes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalTributes.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Monthly Total</CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${monthlyTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tributes List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Tributes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-gray-700" />
              ))}
            </div>
          ) : appData.tributes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tributes yet. Add your first tribute!</p>
          ) : (
            <div className="space-y-4">
              <List
                height={480}
                width={"100%"}
                itemCount={appData.tributes.length}
                itemSize={80}
                itemData={appData.tributes
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
              >
                {Row}
              </List>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Tribute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={tributeAmount}
                onChange={(e) => setTributeAmount(e.target.value)}
                placeholder="0.00"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-from">From</Label>
              <Select value={tributeFrom} onValueChange={setTributeFrom}>
                <SelectTrigger id="edit-from" className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue placeholder={appData.subs.length ? 'Select a sub' : 'No subs available'} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {appData.subs.length === 0 ? (
                    <SelectItem value="" disabled>No subs yet</SelectItem>
                  ) : (
                    appData.subs.map((s) => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={tributeDate}
                onChange={(e) => setTributeDate(e.target.value)}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-source">Source</Label>
              <Select value={tributeSource} onValueChange={(value) => setTributeSource(value as any)}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="cashapp">Cash App</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-reason">Reason (Optional)</Label>
              <Textarea
                id="edit-reason"
                value={tributeReason}
                onChange={(e) => setTributeReason(e.target.value)}
                placeholder="Reason for tribute..."
                rows={3}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <Button onClick={handleEditTribute} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Update Tribute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TributeTrackerPage;