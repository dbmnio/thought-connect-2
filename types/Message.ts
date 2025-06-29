/**
 * @file This file defines the types for chat messages.
 */

/**
 * Represents a single message in the chat.
 */
export interface Message {
  /**
   * A unique identifier for the message.
   */
  id: string;
  /**
   * The text content of the message.
   */
  text: string;
  /**
   * Indicates whether the message is from the user.
   */
  isUser: boolean;
  /**
   * The timestamp when the message was created.
   */
  timestamp: Date;
} 