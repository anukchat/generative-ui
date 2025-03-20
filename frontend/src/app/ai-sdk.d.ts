declare module 'ai/react' {
  export function useChat(options: any): {
    messages: any[];
    append: (message: any) => Promise<any>;
    isLoading: boolean;
  };
}
