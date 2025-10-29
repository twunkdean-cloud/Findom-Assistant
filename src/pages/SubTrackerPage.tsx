"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useFindom } from "@/context/FindomContext";
import { Sub } from "@/types";
import { toast } from "@/utils/toast";
import { getConversationHistorySignedUrl } from "@/services/storage-service";
import SubForm from "@/components/subs/SubForm";
import SubTable from "@/components/subs/SubTable";

const SubTrackerPage = () => {
  const { appData, createSub, updateSub, deleteSub } = useFindom();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<Sub | null>(null);

  const openEditDialog = (sub: Sub) => {
    setCurrentSub(sub);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSub = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sub?")) {
      await deleteSub(id);
      toast.success("Sub deleted.");
    }
  };

  const handleDownloadHistory = async (path: string) => {
    try {
      const url = await getConversationHistorySignedUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate download link for conversation history.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sub Tracker</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Keep track of your loyal subs, their tributes, and preferences.
      </p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-primary-foreground">
            Your Subs
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Sub
              </Button>
            </DialogTrigger>
            <SubForm
              mode="add"
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onCreate={createSub}
              onUpdate={updateSub}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          <SubTable
            subs={appData.subs}
            onEdit={(sub) => openEditDialog(sub)}
            onDelete={(id) => handleDeleteSub(id)}
            onDownloadHistory={(path) => handleDownloadHistory(path)}
          />
        </CardContent>
      </Card>

      {/* Edit Sub Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SubForm
          mode="edit"
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialSub={currentSub || undefined}
          onCreate={createSub}
          onUpdate={updateSub}
        />
      </Dialog>
    </div>
  );
};

export default SubTrackerPage;