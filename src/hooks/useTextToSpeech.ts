const TARGET_LANG = 'es-MX'

function findEsMxVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis.getVoices().find((voice) => voice.lang === TARGET_LANG)
}

export function useTextToSpeech() {
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = TARGET_LANG
    const voice = findEsMxVoice()
    if (voice) {
      utterance.voice = voice
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return { speak }
}
