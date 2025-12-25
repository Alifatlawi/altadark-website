# Altadark Website

Website for Altadark Center featuring a voice assistant powered by Google Gemini AI.

## Features

- Modern React + Vite setup
- Tailwind CSS for styling
- Arabic RTL support
- Voice Assistant with Google Gemini AI integration
- Real-time audio streaming

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add your Gemini API key:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

You can get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Voice Assistant

The voice assistant component is integrated into the website and appears as a floating button in the bottom right corner. It uses Google Gemini's native audio streaming capabilities to provide real-time voice responses in Arabic.

The assistant is configured with:
- Arabic language support
- Custom system instructions for Altadark Center
- Real-time audio playback
- Connection status indicators
