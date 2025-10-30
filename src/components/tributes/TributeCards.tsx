import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { Tribute } from '@/types';

interface TributeCardsProps {
  tributes: Tribute[];
  onEdit: (tribute: Tribute) => void;
  onDelete: (id: string) => void;
}

export const TributeCards: React.FC<TributeCardsProps> = ({
  tributes,
  onEdit,
  onDelete,
}) => {
  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'cashapp':
        return 'bg-green-600';
      case 'venmo':
        return 'bg-blue-600';
      case 'paypal':
        return 'bg-indigo-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'cashapp':
        return 'Cash App';
      case 'venmo':
        return 'Venmo';
      case 'paypal':
        return 'PayPal';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-3">
      {tributes.map((tribute) => (
        <Card key={tribute.id} className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="font-bold text-xl text-green-400">
                    {tribute.amount.toFixed(2)}
                  </span>
                </div>
                <p className="font-medium text-foreground">
                  {tribute.from_sub}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(tribute)}
                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                  aria-label={`Edit tribute from ${tribute.from_sub}`}
                  title="Edit tribute"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(tribute.id)}
                  className="text-red-400 hover:text-red-300 h-8 w-8"
                  aria-label={`Delete tribute from ${tribute.from_sub}`}
                  title="Delete tribute"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {new Date(tribute.date).toLocaleDateString()}
              </span>
              <Badge className={`${getSourceBadgeColor(tribute.source)} text-white text-xs`}>
                {getSourceLabel(tribute.source)}
              </Badge>
            </div>

            {tribute.reason && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {tribute.reason}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
