import * as React from "react";
import { Button } from "./ui/button";

export interface VoiceInputButtonProps {
  languageCode: string;
  onSpeechResult: (text: string) => void;
  onError?: (err: string) => void;
}

const localeMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-PT",
  ar: "ar-SA",
  hi: "hi-IN",
};

interface SpeechRecognitionResult {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function VoiceInputButton({
  languageCode,
  onSpeechResult,
  onError,
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<ISpeechRecognition | null>(null);

  React.useEffect(() => {
    // Prefer standard SpeechRecognition (Chrome 110+), fallback to webkit-prefixed for older browsers
    const SpeechRecognitionCtor =
      (typeof window !== "undefined" &&
        ((window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ??
         (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition)) ||
      null;

    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          onSpeechResult(transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (onError) {
          onError(event.error || "Speech recognition error");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onSpeechResult, onError]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      if (onError) {
        onError("Speech recognition is not supported in this browser.");
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const locale = localeMap[languageCode] || "en-US";
      recognitionRef.current.lang = locale;
      try {
        recognitionRef.current.start();
      } catch (err) {
        if (onError) {
          onError("Failed to start speech recognition.");
        }
      }
    }
  };

  return (
    <Button
      variant="default"
      type="button"
      onClick={toggleListening}
      aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
      className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(233,195,73,0.2)] transition-all duration-300 ${
        isListening
          ? "bg-error text-on-error animate-pulse shadow-[0_4px_16px_rgba(255,180,171,0.4)]"
          : "bg-tertiary text-on-tertiary hover:bg-tertiary-fixed hover:shadow-[0_6px_16px_rgba(233,195,73,0.3)]"
      }`}
    >
      {isListening ? (
        // Stop icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
        </svg>
      ) : (
        // Mic icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      )}
    </Button>
  );
}
