const TARGET_LANG = 'es-MX'

// On systems with no network voices available (e.g. Brave), macOS's classic
// "Paulina" voice reads more natural/professional than the newer persona
// voices (Eddy, Flo, Grandma, Grandpa, Reed, Rocko, Sandy, Shelley), which
// are the same character voices reused across every language.
const PREFERRED_VOICE_NAMES = ['Paulina']

function findEsMxVoice(): SpeechSynthesisVoice | undefined {
  const esMxVoices = window.speechSynthesis.getVoices().filter((voice) => voice.lang === TARGET_LANG)

  for (const name of PREFERRED_VOICE_NAMES) {
    const preferred = esMxVoices.find((voice) => voice.name === name)
    if (preferred) {
      return preferred
    }
  }

  // Network-backed voices (localService: false) are typically the higher-quality
  // ones (e.g. Google's), while local/offline synthesizers tend to sound robotic.
  return esMxVoices.find((voice) => !voice.localService) ?? esMxVoices[0]
}

export function useTextToSpeech() {
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = TARGET_LANG
    const voice = findEsMxVoice()
    if (voice) {
      utterance.voice = voice
    }
    utterance.rate = 0.95
    utterance.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return { speak }
}
