import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  title,
  className = '',
  mobileClassName = '',
  desktopClassName = ''
}) => {
  const isMobile = useMobile();

  const cardClassName = [
    className,
    isMobile ? mobileClassName : desktopClassName
  ].filter(Boolean).join(' ');

  return (
    <Card className={cardClassName}>
      {title && (
        <CardHeader>
          <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
        {children}
      </CardContent>
    </Card>
  );
};