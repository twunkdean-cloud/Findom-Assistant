import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({ 
  children, 
  title, 
  className = '' 
}) => {
  const { isMobile } = useMobile();

  const cardClasses = `
    ${isMobile ? 'rounded-none shadow-none border-l-0 border-r-0' : 'rounded-lg shadow-md'}
    bg-gray-800 border-gray-700
    ${className}
  `.trim();

  return (
    <Card className={cardClasses}>
      {title && (
        <CardHeader className={isMobile ? 'px-4 py-3' : 'px-6 py-4'}>
          <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={isMobile ? 'px-4 py-3' : 'px-6 py-4'}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;