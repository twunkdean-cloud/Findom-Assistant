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

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  title,
  className = '',
  mobileClassName = '',
  desktopClassName = '',
}) => {
  const { isMobile } = useMobile();

  const cardClassName = `
    ${className}
    ${isMobile ? mobileClassName : desktopClassName}
    ${isMobile ? 'p-3' : 'p-6'}
    ${isMobile ? 'text-sm' : 'text-base'}
  `.trim();

  return (
    <Card className={`bg-gray-800 border-gray-700 ${cardClassName}`}>
      {title && (
        <CardHeader className={isMobile ? 'pb-2' : 'pb-4'}>
          <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={isMobile ? 'pt-2' : 'pt-4'}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;