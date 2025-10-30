import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Download } from 'lucide-react';
import { Sub } from '@/types';

interface SubCardsProps {
  subs: Sub[];
  onEdit: (sub: Sub) => void;
  onDelete: (id: string) => void;
  onDownloadHistory: (path: string) => void;
}

export const SubCards: React.FC<SubCardsProps> = ({
  subs,
  onEdit,
  onDelete,
  onDownloadHistory,
}) => {
  return (
    <div className="space-y-4">
      {subs.map((sub) => (
        <Card key={sub.id} className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {sub.name}
                </h3>
                {sub.tier && (
                  <Badge variant="secondary" className="mt-1">
                    {sub.tier}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sub)}
                  className="text-blue-400 hover:text-blue-300 h-8 w-8"
                  aria-label={`Edit ${sub.name}`}
                  title="Edit sub"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(sub.id)}
                  className="text-red-400 hover:text-red-300 h-8 w-8"
                  aria-label={`Delete ${sub.name}`}
                  title="Delete sub"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Tributed</span>
                <span className="font-semibold text-green-400">
                  ${Number(sub.total).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Tribute</span>
                <span className="text-foreground">
                  {sub.lastTribute || 'N/A'}
                </span>
              </div>

              {sub.conversationHistory && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    Has History
                  </span>
                  {typeof sub.conversationHistory === 'string' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 h-7 px-2"
                      onClick={() => onDownloadHistory(sub.conversationHistory as string)}
                      aria-label={`Download conversation history for ${sub.name}`}
                      title="Download conversation history"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      <span className="text-xs">Download</span>
                    </Button>
                  )}
                </div>
              )}

              {sub.tags && sub.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {sub.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
