# Audio Assets

This directory contains audio files for the Sahayak app.

## File Naming Convention

Audio files should follow this naming pattern:
`<feature>.<screen>.<promptKey>.mp3`

### Examples:
- `workflow.aadhaar.welcome.mp3` - Welcome message for Aadhaar workflow
- `workflow.aadhaar.askName.mp3` - Name prompt for Aadhaar workflow
- `home.welcome.greeting.mp3` - Home screen greeting
- `voice.listening.prompt.mp3` - Voice listening prompt

## Audio Requirements

- **Format**: MP3, 44.1kHz, 128kbps minimum
- **Duration**: Keep prompts under 10 seconds for better UX
- **Language**: Provide files for all supported languages (en, hi, regional)
- **Voice**: Use consistent voice talent across the app
- **Quality**: Clear, professional recording without background noise

## Language Variants

For each audio file, create variants for supported languages:
- `workflow.aadhaar.welcome.en.mp3` (English)
- `workflow.aadhaar.welcome.hi.mp3` (Hindi)  
- `workflow.aadhaar.welcome.regional.mp3` (Marathi)

## Fallback Strategy

If a specific audio file is not found, the app will:
1. Try the default language (English)
2. Use text-to-speech as fallback
3. Display text only if TTS fails

## Production Notes

- Compress audio files for mobile delivery
- Consider using AAC format for better compression
- Test audio quality on various devices and speakers
- Ensure accessibility compliance for hearing-impaired users