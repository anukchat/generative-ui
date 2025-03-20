// Type definitions for ai/react module

declare module 'ai/react' {
  import { ChangeEvent, FormEvent } from 'react';

  export interface Message {
    id?: string;
    content: string;
    role: 'user' | 'assistant' | 'system' | 'function' | string;
    createdAt?: Date;
  }

  export interface UseChatOptions {
    api?: string;
    id?: string;
    initialMessages?: Message[];
    body?: Record<string, any>;
    headers?: Record<string, string>;
    onResponse?: (response: Response) => void | Promise<void>;
    onFinish?: (message: Message) => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
  }

  export interface UseChatHelpers {
    messages: Message[];
    error: Error | null;
    append: (message: Message | { content: string; role: string }) => Promise<any>;
    reload: () => Promise<void>;
    stop: () => void;
    isLoading: boolean;
    input: string;
    setInput: (input: string) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  }

  export function useChat(options?: UseChatOptions): UseChatHelpers;
}
