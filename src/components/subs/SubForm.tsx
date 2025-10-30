"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadCloud } from "lucide-react";
import { Sub } from "@/types";
import { toast } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { uploadConversationHistory } from "@/services/storage-service";

type Mode = "add" | "edit";

const DEFAULT_TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

interface SubFormProps {
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSub?: Sub | null;
  onCreate: (sub: Omit<Sub, "id" | "created_at" | "updated_at">) => Promise<Sub | null>;
  onUpdate: (id: string, updates: Partial<Sub>) => Promise<Sub | null>;
}

const SubForm: React.FC<SubFormProps> = ({
  mode,
  open,
  onOpenChange,
  initialSub,
  onCreate,
  onUpdate,
}) => {
  const isEdit = mode === "edit";
  const { user } = useAuth();

  const [subName, setSubName] = useState("");
  const [subTotal, setSubTotal] = useState<string | number>(0);
  const [subLastTribute, setSubLastTribute] = useState("");
  const [subPreferences, setSubPreferences] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [subTier, setSubTier] = useState("");
  const [subTags, setSubTags] = useState("");
  const [conversationFileName, setConversationFileName] = useState<string | undefined>(undefined);
  const [conversationFile, setConversationFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEdit && initialSub) {
      setSubName(initialSub.name);
      setSubTotal(initialSub.total.toString());
      setSubLastTribute(initialSub.lastTribute || "");
      setSubPreferences(initialSub.preferences || "");
      setSubNotes(initialSub.notes || "");
      setSubTier(initialSub.tier || "");
      setSubTags(initialSub.tags ? initialSub.tags.join(", ") : "");
      setConversationFileName(undefined);
      setConversationFile(null);
    } else if (!open) {
      // When closing, reset fields
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, initialSub?.id]);

  const resetForm = () => {
    setSubName("");
    setSubTotal(0);
    setSubLastTribute("");
    setSubPreferences("");
    setSubNotes("");
    setSubTier("");
    setSubTags("");
    setConversationFileName(undefined);
    setConversationFile(null);
  };

  const handleConversationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes("json")) {
        toast.error("Please upload a JSON file.");
        return;
      }
      setConversationFile(file);
      setConversationFileName(file.name);
      toast.success("Conversation history ready to upload.");
    } else {
      setConversationFile(null);
      setConversationFileName(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subName.trim()) {
      toast.error("Sub name is required.");
      return;
    }
    const parsedTotal = parseFloat(subTotal as string) || 0;
    if (parsedTotal < 0) {
      toast.error("Total tributed must be zero or positive.");
      return;
    }

    if (isEdit && initialSub) {
      const updates: Partial<Sub> = {
        name: subName.trim(),
        total: parsedTotal,
        lastTribute: subLastTribute || undefined,
        preferences: subPreferences,
        notes: subNotes,
        tier: subTier,
        tags: subTags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const updatedSub = await onUpdate(initialSub.id, updates);
      if (updatedSub) {
        // Upload conversation history if provided
        if (conversationFile && user?.id) {
          try {
            const storagePath = await uploadConversationHistory(user.id, initialSub.id, conversationFile);
            await onUpdate(initialSub.id, { conversationHistory: storagePath });
            toast.success("Conversation history uploaded and linked.");
          } catch (err) {
            logger.error(err);
            toast.error('Could not upload conversation history. Ensure a private "conversations" bucket exists.');
          }
        } else if (conversationFile && !user?.id) {
          toast.info("Sign in to upload conversation history; changes saved without file upload.");
        }
        toast.success(`${updatedSub.name} updated!`);
        onOpenChange(false);
        resetForm();
      } else {
        toast.error("Failed to update sub.");
      }
      return;
    }

    // Add new sub
    const newSubData: Omit<Sub, "id" | "created_at" | "updated_at"> = {
      name: subName.trim(),
      total: parsedTotal,
      lastTribute: subLastTribute || undefined,
      preferences: subPreferences,
      notes: subNotes,
      conversationHistory: undefined,
      tier: subTier,
      tags: subTags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    const newSub = await onCreate(newSubData);
    if (newSub) {
      if (conversationFile && user?.id) {
        try {
          const storagePath = await uploadConversationHistory(user.id, newSub.id, conversationFile);
          await onUpdate(newSub.id, { conversationHistory: storagePath });
          toast.success("Conversation history uploaded and linked.");
        } catch (err) {
          logger.error(err);
          toast.error('Could not upload conversation history. Ensure a private "conversations" bucket exists.');
        }
      } else if (conversationFile && !user?.id) {
        toast.info("Sign in to upload conversation history; sub saved without it.");
      }
      toast.success(`${newSub.name} added to tracker!`);
      onOpenChange(false);
      resetForm();
    } else {
      toast.error("Failed to add sub.");
    }
  };

  return (
    <DialogContent
      className="bg-gray-800 border border-gray-700 text-gray-200"
      aria-labelledby="sub-form-title"
      aria-describedby="sub-form-description"
    >
      <DialogHeader>
        <DialogTitle id="sub-form-title" className="text-lg font-semibold">
          {isEdit ? "Edit Sub" : "Add New Sub"}
        </DialogTitle>
        <p id="sub-form-description" className="sr-only">
          {isEdit
            ? "Edit the details of an existing sub in your tracker"
            : "Add a new sub to your tracker with their details and preferences"}
        </p>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4" aria-label={isEdit ? "Edit sub form" : "Add new sub form"}>
        <div>
          <Label htmlFor="sub-name">Name</Label>
          <Input
            id="sub-name"
            placeholder="Sub's Name"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            required
            aria-required="true"
            aria-label="Sub's name"
            aria-describedby="sub-name-description"
          />
          <span id="sub-name-description" className="sr-only">
            Enter the name or username of the sub
          </span>
        </div>
        <div>
          <Label htmlFor="sub-total">Total Tributed ($)</Label>
          <Input
            id="sub-total"
            type="number"
            placeholder="0"
            value={subTotal}
            onChange={(e) => setSubTotal(e.target.value)}
            min={0}
            step="0.01"
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            aria-label="Total amount tributed in dollars"
            aria-describedby="sub-total-description"
          />
          <span id="sub-total-description" className="sr-only">
            The cumulative total amount this sub has tributed
          </span>
        </div>
        <div>
          <Label htmlFor="sub-last-tribute">Last Tribute Date</Label>
          <Input
            id="sub-last-tribute"
            type="date"
            value={subLastTribute}
            onChange={(e) => setSubLastTribute(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            aria-label="Date of last tribute"
            aria-describedby="sub-last-tribute-description"
          />
          <span id="sub-last-tribute-description" className="sr-only">
            The date when this sub last made a tribute
          </span>
        </div>
        <div>
          <Label htmlFor="sub-tier">Tier</Label>
          <Select value={subTier} onValueChange={setSubTier}>
            <SelectTrigger
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              aria-label="Sub tier level"
              aria-describedby="sub-tier-description"
            >
              <SelectValue placeholder="Select a tier" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              {DEFAULT_TIERS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span id="sub-tier-description" className="sr-only">
            Choose a tier level: Bronze, Silver, Gold, Platinum, or Diamond
          </span>
        </div>
        <div>
          <Label htmlFor="sub-tags">Tags (comma-separated)</Label>
          <Input
            id="sub-tags"
            placeholder="e.g., long-term, foot-worshipper"
            value={subTags}
            onChange={(e) => setSubTags(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            aria-label="Sub tags"
            aria-describedby="sub-tags-description"
          />
          <span id="sub-tags-description" className="sr-only">
            Add tags separated by commas to categorize this sub
          </span>
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
            aria-label="Sub preferences and interests"
            aria-describedby="sub-preferences-description"
          />
          <span id="sub-preferences-description" className="sr-only">
            Describe this sub's preferences, kinks, and interests
          </span>
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
            aria-label="Additional notes"
            aria-describedby="sub-notes-description"
          />
          <span id="sub-notes-description" className="sr-only">
            Add any additional notes or information about this sub
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="conversation-history">Conversation History (JSON)</Label>
          <Input
            id="conversation-history"
            type="file"
            accept=".json"
            onChange={handleConversationUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            aria-label="Upload conversation history JSON file"
            aria-describedby="conversation-history-description"
          />
          <span id="conversation-history-description" className="sr-only">
            Upload a JSON file containing the conversation history with this sub. Must be a valid JSON file.
          </span>
          {conversationFileName && (
            <p className="text-xs text-gray-400 flex items-center" role="status" aria-live="polite">
              <UploadCloud className="h-3 w-3 mr-1" aria-hidden="true" /> {conversationFileName} uploaded.
            </p>
          )}
          {!conversationFileName && initialSub?.conversationHistory && (
            <p className="text-xs text-gray-400 flex items-center" role="status">
              <UploadCloud className="h-3 w-3 mr-1" aria-hidden="true" /> Existing conversation history present.
            </p>
          )}
        </div>
        <DialogFooter className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            aria-label={isEdit ? "Save changes to sub" : "Add new sub to tracker"}
          >
            {isEdit ? "Save Changes" : "Add Sub"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            aria-label="Cancel and close dialog"
          >
            Cancel
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default SubForm;