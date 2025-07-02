export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export enum MessageType {
  Text = 'text',
}

export type Message = {
  role: MessageRole;
  content: string;
  message_type: MessageType;
}
