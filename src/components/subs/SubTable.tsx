"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Download } from "lucide-react";
import { Sub } from "@/types";
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

interface SubTableProps {
  subs: Sub[];
  onEdit: (sub: Sub) => void;
  onDelete: (id: string) => void;
  onDownloadHistory: (path: string) => void;
}

const ROW_HEIGHT = 64;

function VirtualRow({
  index,
  style,
  data,
}: ListChildComponentProps) {
  const { items, onEdit, onDelete, onDownloadHistory } = data as {
    items: Sub[];
    onEdit: (s: Sub) => void;
    onDelete: (id: string) => void;
    onDownloadHistory: (path: string) => void;
  };
  const sub = items[index];
  return (
    <div style={style} className="border-b border-gray-700 flex items-center px-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-200">{sub.name}</div>
        <div className="text-xs text-muted-foreground">
          {sub.lastTribute || "N/A"} • ${Number(sub.total).toFixed(2)}
        </div>
        {sub.tags && sub.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {sub.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {sub.conversationHistory ? (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Has History</span>
            {typeof sub.conversationHistory === "string" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 px-2 h-7"
                onClick={() => onDownloadHistory(sub.conversationHistory as string)}
                aria-label={`Download conversation history for ${sub.name}`}
                title="Download conversation history"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-500">No History</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(sub)}
          className="text-blue-400 hover:text-blue-300"
          aria-label={`Edit ${sub.name}`}
          title="Edit sub"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(sub.id)}
          className="text-red-400 hover:text-red-300"
          aria-label={`Delete ${sub.name}`}
          title="Delete sub"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const SubTable: React.FC<SubTableProps> = ({ subs, onEdit, onDelete, onDownloadHistory }) => {
  if (!subs || subs.length === 0) {
    return <p className="text-gray-500 text-center py-4">No subs tracked yet. Add your first sub!</p>;
  }

  // Virtualize when the list is large; otherwise use a simple table.
  if (subs.length > 50) {
    return (
      <div className="rounded-md border border-gray-700">
        <div className="bg-gray-700 px-3 py-2 text-sm text-muted-foreground">Subs</div>
        <List
          height={480}
          width={"100%"}
          itemCount={subs.length}
          itemSize={ROW_HEIGHT}
          itemData={{ items: subs, onEdit, onDelete, onDownloadHistory }}
        >
          {VirtualRow}
        </List>
      </div>
    );
  }

  return (
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
          {subs.map((sub) => (
            <TableRow key={sub.id} className="border-b border-gray-700 hover:bg-gray-700">
              <TableCell className="font-medium text-gray-200">{sub.name}</TableCell>
              <TableCell>
                {sub.tier ? <Badge>{sub.tier}</Badge> : <span className="text-gray-500">N/A</span>}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {sub.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-green-400">${Number(sub.total).toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">{sub.lastTribute || "N/A"}</TableCell>
              <TableCell>
                {sub.conversationHistory ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Has History</span>
                    {typeof sub.conversationHistory === "string" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 px-2 h-7"
                        onClick={() => onDownloadHistory(sub.conversationHistory as string)}
                        aria-label={`Download conversation history for ${sub.name}`}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sub)}
                  className="text-blue-400 hover:text-blue-300"
                  aria-label={`Edit ${sub.name}`}
                  title="Edit sub"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(sub.id)}
                  className="text-red-400 hover:text-red-300"
                  aria-label={`Delete ${sub.name}`}
                  title="Delete sub"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubTable;