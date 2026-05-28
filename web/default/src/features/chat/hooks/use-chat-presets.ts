import type { ChatPreset } from '../lib/chat-links'

export function useChatPresets(): {
  chatPresets: ChatPreset[]
  serverAddress: string
} {
  return {
    chatPresets: [],
    serverAddress: '',
  }
}
