import React, { useState } from 'react';
import { Mic, MicOff, Loader2, Check } from 'lucide-react';
import { voiceService, VoiceState } from '../../services/voiceService';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
  contextPrompt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  customFallbackText?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  lang = 'en',
  contextPrompt,
  size = 'md',
  className = '',
  label,
  customFallbackText
}) => {
  const [state, setState] = useState<VoiceState>('ready');
  const [interimText, setInterimText] = useState<string>('');

  const handleClick = async () => {
    if (state === 'listening' || state === 'processing' || state === 'transcribing') {
      return;
    }

    try {
      const result = await voiceService.recordAndTranscribe(lang, {
        contextPrompt,
        customFallbackText,
        onStateChange: (s) => setState(s),
        onInterimResult: (txt) => setInterimText(txt)
      });

      if (result.transcript) {
        onTranscript(result.transcript);
      }
      setTimeout(() => {
        setState('ready');
        setInterimText('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setState('error');
      setTimeout(() => setState('ready'), 2000);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-5 py-3 text-base gap-2.5 font-medium'
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        id={`voice-btn-${Math.random().toString(36).substr(2, 6)}`}
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 cursor-pointer ${
          sizeClasses[size]
        } ${
          state === 'listening'
            ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200 ring-2 ring-rose-300'
            : state === 'processing' || state === 'transcribing'
            ? 'bg-amber-500 text-white'
            : state === 'complete'
            ? 'bg-emerald-600 text-white'
            : state === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300'
        } ${className}`}
        title="Voice Input (Speech-to-Text)"
      >
        {state === 'listening' ? (
          <>
            <Mic className="w-4 h-4 animate-bounce" />
            <span>Listening...</span>
          </>
        ) : state === 'processing' || state === 'transcribing' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{state === 'transcribing' ? 'Transcribing...' : 'Processing...'}</span>
          </>
        ) : state === 'complete' ? (
          <>
            <Check className="w-4 h-4" />
            <span>Done</span>
          </>
        ) : state === 'error' ? (
          <>
            <MicOff className="w-4 h-4" />
            <span>Retry</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-indigo-600" />
            <span>{label || 'Speak'}</span>
          </>
        )}
      </button>

      {interimText && (state === 'listening' || state === 'transcribing') && (
        <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 max-w-xs truncate italic">
          "{interimText}"
        </span>
      )}
    </div>
  );
};
