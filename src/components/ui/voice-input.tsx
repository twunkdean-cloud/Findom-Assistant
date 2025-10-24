import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from './button';
import { useMobile } from '@/hooks/use-mobile';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled = false, className = '' }) => {
  const { isMobile } = useMobile();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        if (transcript.trim()) {
          onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      setIsSupported(true);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Voice input not supported on this device
      </div>
    );
  }

  return (
    <Button
      onClick={toggleListening}
      disabled={disabled || !isSupported}
      variant={isListening ? 'destructive' : 'outline'}
      size={isMobile ? 'sm' : 'default'}
      className={`${className} ${
        isListening ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          {isMobile ? '' : <span className="ml-2">Stop</span>}
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          {isMobile ? '' : <span className="ml-2">Voice</span>}
        </>
      )}
      {isListening && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
};

export default VoiceInput;