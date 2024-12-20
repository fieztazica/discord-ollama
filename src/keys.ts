import { getEnvVar } from './utils/index.js'

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN'),
    ipAddress: getEnvVar('OLLAMA_IP', '127.0.0.1'), // default ollama ip if none
    portAddress: getEnvVar('OLLAMA_PORT', '11434'), // default ollama port if none
    defaultModel: getEnvVar('DEFAULT_MODEL', 'llama3.2'),
    systemPrompt: getEnvVar('SYSTEM_PROMPT'),
} as const // readonly keys

export default Keys
