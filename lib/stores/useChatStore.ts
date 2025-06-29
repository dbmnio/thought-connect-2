/**
 * @file This file defines the Zustand store for managing the chat state,
 * including messages, loading status, and errors.
 */
import { create } from 'zustand';
import { Message, MessageRole } from '@/types/Message';

/**
 * Represents the state of the chat.
 */
interface ChatState {
  /**
   * An array of messages in the chat.
   */
  messages: Message[];
  /**
   * A boolean indicating if a response is being loaded.
   */
  isLoading: boolean;
  /**
   * An error object if an error occurred.
   */
  error: Error | null;
  /**
   * Adds a new message to the chat.
   * @param message - The message to add.
   */
  addMessage: (message: Message) => void;
  /**
   * Updates the content of the last assistant message as it streams in.
   * @param contentChunk - The chunk of content to append.
   */
  updateLastMessage: (contentChunk: string) => void;
  /**
   * Sets the loading state.
   * @param isLoading - The new loading state.
   */
  setLoading: (isLoading: boolean) => void;
  /**
   * Sets the error state.
   * @param error - The error to set.
   */
  setError: (error: Error | null) => void;
  /**
   * Resets the chat to its initial state.
   */
  reset: () => void;
}

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
};

/**
 * Zustand store for managing the chat state.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (contentChunk) => {
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === MessageRole.Assistant) {
        const updatedMessage = {
          ...lastMessage,
          content: lastMessage.content + contentChunk,
        };
        return {
          messages: [...state.messages.slice(0, -1), updatedMessage],
        };
      }
      return state;
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
})); 