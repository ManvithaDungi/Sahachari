import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { startSpeechRecognition, checkLanguageSupport } from '../services/speechService'

const VoiceInputButton = ({ onTranscript }) => {
   const { i18n } = useTranslation()
   const [isListening, setIsListening] = useState(false)
   const [interimText, setInterimText] = useState('')
   const [error, setError] = useState(null)
   const recognitionRef = useRef(null)

   const languageLabels = {
      en: 'English', ta: 'Tamil',
      hi: 'Hindi', ml: 'Malayalam', te: 'Telugu', kn: 'Kannada'
   }

   const handleVoiceClick = () => {
      setError(null)

      if (isListening) {
         recognitionRef.current?.stop()
         setIsListening(false)
         setInterimText('')
         return
      }

      // check support before starting
      const support = checkLanguageSupport(i18n.language)

      if (!support.stt) {
         setError('Voice input not supported. Use Chrome browser.')
         return
      }

      setIsListening(true)

      recognitionRef.current = startSpeechRecognition(
         i18n.language,
         // onResult
         ({ final, interim, isFinal }) => {
            if (isFinal) {
               onTranscript(final)
               setIsListening(false)
               setInterimText('')
            } else {
               setInterimText(interim)
            }
         },
         // onError
         (errorMsg) => {
            setError(errorMsg)
            setIsListening(false)
            setInterimText('')
         }
      )
   }

   return (
      <div className="flex flex-col items-center gap-2">
         {/* mic button */}
         <button
            onClick={handleVoiceClick}
            className={`relative w-14 h-14 rounded-full flex items-center 
          justify-center transition-all duration-200 
          ${isListening
                  ? 'bg-[#B5756B] scale-110'
                  : 'bg-[#6D5BD0] hover:scale-105'
               }`}
         >
            {/* pulse ring when listening */}
            {isListening && (
               <>
                  <span className="absolute inset-0 rounded-full 
              bg-[#B5756B] animate-ping opacity-30" />
                  <span className="absolute inset-[-8px] rounded-full 
              border-2 border-[#B5756B] opacity-20 animate-pulse" />
               </>
            )}
            <span className="text-white text-xl z-10">
               {isListening ? '⏹' : '🎤'}
            </span>
         </button>

         {/* status label */}
         <span className="text-xs text-[#6B6580]">
            {isListening
               ? `Listening in ${languageLabels[i18n.language] || i18n.language}...`
               : `Tap to speak in ${languageLabels[i18n.language] || i18n.language}`
            }
         </span>

         {/* interim transcript shown while speaking */}
         {interimText && (
            <div className="w-full bg-[rgba(109,91,208,0.06)] 
          border border-[rgba(109,91,208,0.15)]
          rounded-xl px-3 py-2 text-sm text-[#6B6580] italic">
               {interimText}...
            </div>
         )}

         {/* language not supported warning */}
         {['te', 'ml'].includes(i18n.language) && !isListening && (
            <p className="text-xs text-[#C4956A] text-center max-w-xs">
               ⚠️ {languageLabels[i18n.language]} voice input requires
               language pack installed on your device.
               Typing works in all languages.
            </p>
         )}

         {/* error message */}
         {error && (
            <div className="w-full bg-[rgba(181,117,107,0.06)]
          border border-[rgba(181,117,107,0.2)]
          rounded-xl px-3 py-2 text-sm text-[#B5756B]">
               {error}
            </div>
         )}
      </div>
   )
}

export default VoiceInputButton
