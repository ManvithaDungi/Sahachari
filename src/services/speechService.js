// src/services/speechService.js

const LANGUAGE_CONFIG = {
   en: {
      speechLang: 'en-IN',
      ttsLang: 'en-IN',
      fallbackLang: 'en-US',
      voiceKeywords: ['India', 'English']
   },
   ta: {
      speechLang: 'ta-IN',
      ttsLang: 'ta-IN',
      fallbackLang: 'ta-IN',
      voiceKeywords: ['Tamil', 'ta-IN']
   },
   hi: {
      speechLang: 'hi-IN',
      ttsLang: 'hi-IN',
      fallbackLang: 'hi-IN',
      voiceKeywords: ['Hindi', 'hi-IN']
   },
   ml: {
      speechLang: 'ml-IN',
      ttsLang: 'ml-IN',
      fallbackLang: 'ml-IN',
      voiceKeywords: ['Malayalam', 'ml-IN']
   },
   te: {
      speechLang: 'te-IN',
      ttsLang: 'te-IN',
      fallbackLang: 'te-IN',
      voiceKeywords: ['Telugu', 'te-IN']
   }
}

// ─── SPEECH TO TEXT (voice input) ────────────────────────

export const startSpeechRecognition = (language, onResult, onError) => {
   const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

   if (!SpeechRecognition) {
      onError('Speech recognition not supported in this browser. Try Chrome.')
      return null
   }

   const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en']
   const recognition = new SpeechRecognition()

   recognition.lang = config.speechLang
   recognition.continuous = false
   recognition.interimResults = true  // shows text while speaking
   recognition.maxAlternatives = 1

   recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
         const transcript = event.results[i][0].transcript
         if (event.results[i].isFinal) {
            finalTranscript += transcript
         } else {
            interimTranscript += transcript
         }
      }

      onResult({
         final: finalTranscript,
         interim: interimTranscript,
         isFinal: finalTranscript.length > 0
      })
   }

   recognition.onerror = (event) => {
      const errorMessages = {
         'not-allowed': 'Microphone access denied. Please allow microphone.',
         'no-speech': 'No speech detected. Please try again.',
         'network': 'Network error. Check your connection.',
         'language-not-supported': `${language.toUpperCase()} voice input not 
        supported on this device. Try typing instead.`
      }
      onError(errorMessages[event.error] || 'Voice input failed. Try typing.')
   }

   recognition.onend = () => {
      // recognition stopped
   }

   try {
      recognition.start()
      return recognition  // return so caller can call recognition.stop()
   } catch (e) {
      onError('Could not start voice input. Try again.')
      return null
   }
}

// ─── TEXT TO SPEECH (read content aloud) ─────────────────

const getVoiceForLanguage = (language) => {
   const voices = window.speechSynthesis.getVoices()
   const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en']

   // try to find exact language match first
   let voice = voices.find(v => v.lang === config.ttsLang)

   // try keyword match if exact not found
   if (!voice) {
      voice = voices.find(v =>
         config.voiceKeywords.some(keyword =>
            v.name.includes(keyword) || v.lang.includes(keyword)
         )
      )
   }

   // fallback to any voice with same language prefix (e.g. te-*)
   if (!voice) {
      const langPrefix = config.ttsLang.split('-')[0]
      voice = voices.find(v => v.lang.startsWith(langPrefix))
   }

   // last resort: default English voice
   if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en')) || voices[0]
   }

   return voice
}

export const speakText = (text, language, onStart, onEnd, onError) => {
   if (!window.speechSynthesis) {
      onError?.('Text to speech not supported in this browser.')
      return
   }

   // cancel any ongoing speech
   window.speechSynthesis.cancel()

   // voices may not be loaded yet — wait for them
   const attemptSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getVoiceForLanguage(language)

      utterance.voice = voice
      utterance.lang = LANGUAGE_CONFIG[language]?.ttsLang || 'en-IN'
      utterance.rate = 0.9    // slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => onStart?.()
      utterance.onend = () => onEnd?.()
      utterance.onerror = (e) => {
         // if language not supported, fall back to English
         if (e.error === 'language-unavailable' || e.error === 'voice-unavailable') {
            const fallbackUtterance = new SpeechSynthesisUtterance(text)
            fallbackUtterance.lang = 'en-IN'
            fallbackUtterance.onend = () => onEnd?.()
            window.speechSynthesis.speak(fallbackUtterance)
         } else {
            onError?.('Could not read text aloud.')
         }
      }

      window.speechSynthesis.speak(utterance)
   }

   // voices sometimes load async — handle both cases
   if (window.speechSynthesis.getVoices().length > 0) {
      attemptSpeak()
   } else {
      window.speechSynthesis.onvoiceschanged = () => {
         attemptSpeak()
         window.speechSynthesis.onvoiceschanged = null
      }
   }
}

export const stopSpeaking = () => {
   window.speechSynthesis?.cancel()
}

export const isSpeaking = () => {
   return window.speechSynthesis?.speaking || false
}

// ─── CHECK LANGUAGE SUPPORT ──────────────────────────────
// call this to warn user before they try

export const checkLanguageSupport = (language) => {
   const voices = window.speechSynthesis?.getVoices() || []
   const config = LANGUAGE_CONFIG[language]

   const hasVoice = voices.some(v =>
      v.lang === config?.ttsLang ||
      v.lang.startsWith(language)
   )

   const hasSpeechRecognition = !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
   )

   return {
      tts: hasVoice,           // text to speech works
      stt: hasSpeechRecognition, // speech to text works
      // Telugu and Malayalam often return false for tts
      // on devices without those language packs installed
   }
}
