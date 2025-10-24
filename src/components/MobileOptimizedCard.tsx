import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  swipeable?: boolean;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  className,
  title,
  subtitle,
  footer,
  onClick,
  swipeable = false,
}) => {
  const { isMobile } = useMobile();

  const cardClasses = cn(
    'transition-all duration-200',
    {
      'hover:shadow-lg active:scale-[0.98] cursor-pointer': onClick,
      'touch-pan-y': swipeable && isMobile,
    },
    className
  );

  return (
    <Card className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <CardHeader className={cn('pb-3', { 'pb-2': isMobile })}>
          {title && (
            <CardTitle className={cn('text-lg', { 'text-base': isMobile })}>
              {title}
            </CardTitle>
          )}
          {subtitle && (
            <p className={cn('text-sm text-gray-500', { 'text-xs': isMobile })}>
              {subtitle}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className={cn('pt-0', { 'pt-0': isMobile })}>
        {children}
      </CardContent>
      {footer && (
        <div className={cn('px-6 pb-4', { 'px-4 pb-3': isMobile })}>
          {footer}
        </div>
      )}
    </Card>
  );
};

export default MobileOptimizedCard;