import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  noShadow?: boolean;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  title,
  className,
  padding = 'md',
  noShadow = false,
}) => {
  const { isMobile } = useMobile();

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-5' : 'p-8',
  };

  return (
    <Card
      className={cn(
        'bg-gray-800 border border-gray-700',
        !noShadow && 'shadow-lg',
        isMobile && 'rounded-xl',
        className
      )}
    >
      {title && (
        <CardHeader className={cn(paddingClasses[padding], 'pb-3')}>
          <CardTitle className={cn(
            'text-lg font-semibold text-gray-100',
            isMobile && 'text-base'
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        paddingClasses[padding],
        title && 'pt-0'
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;