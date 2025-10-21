"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFindom, CustomPrice } from '@/context/FindomContext';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const PricingPage = () => {
  const { appData, updateAppData } = useFindom();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<CustomPrice | null>(null);

  const [serviceName, setServiceName] = useState('');
  const [priceAmount, setPriceAmount] = useState<number>(0);

  const resetForm = () => {
    setServiceName('');
    setPriceAmount(0);
    setCurrentPrice(null);
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      toast.error('Service name is required.');
      return;
    }

    const newPrice: CustomPrice = {
      id: Date.now(),
      service: serviceName.trim(),
      price: priceAmount,
    };

    updateAppData('customPrices', [...appData.customPrices, newPrice]);
    toast.success(`${newPrice.service} price added!`);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrice || !serviceName.trim()) {
      toast.error('Service name is required.');
      return;
    }

    const updatedPrice: CustomPrice = {
      ...currentPrice,
      service: serviceName.trim(),
      price: priceAmount,
    };

    updateAppData('customPrices', appData.customPrices.map(item =>
      item.id === updatedPrice.id ? updatedPrice : item
    ));
    toast.success(`${updatedPrice.service} price updated!`);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeletePrice = (id: number) => {
    if (window.confirm('Are you sure you want to delete this custom price?')) {
      updateAppData('customPrices', appData.customPrices.filter(item => item.id !== id));
      toast.success('Custom price deleted.');
    }
  };

  const openEditDialog = (price: CustomPrice) => {
    setCurrentPrice(price);
    setServiceName(price.service);
    setPriceAmount(price.price);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Service Pricing</h2>
      <p className="text-sm text-gray-400 mb-4">Manage your custom service pricing here.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Custom Prices</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Price
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add New Custom Price</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPrice} className="space-y-4">
                <div>
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input
                    id="service-name"
                    placeholder="e.g., Custom Video, Private Chat"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price-amount">Price ($)</Label>
                  <Input
                    id="price-amount"
                    type="number"
                    placeholder="0.00"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                    required
                  />
                </div>
                <DialogFooter className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                    Add Price
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
          {appData.customPrices.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No custom prices added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-700 hover:bg-gray-700">
                    <TableHead className="text-gray-300">Service</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appData.customPrices.map((item) => (
                    <TableRow key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <TableCell className="font-medium text-gray-200">{item.service}</TableCell>
                      <TableCell className="text-green-400">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} className="text-blue-400 hover:text-blue-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePrice(item.id)} className="text-red-400 hover:text-red-300">
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

      {/* Edit Price Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Custom Price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPrice} className="space-y-4">
            <div>
              <Label htmlFor="edit-service-name">Service Name</Label>
              <Input
                id="edit-service-name"
                placeholder="e.g., Custom Video, Private Chat"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-price-amount">Price ($)</Label>
              <Input
                id="edit-price-amount"
                type="number"
                placeholder="0.00"
                value={priceAmount}
                onChange={(e) => setPriceAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                required
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

export default PricingPage;