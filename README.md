# MindHaven API

A Text-to-Speech API service built with Node.js, Express, and Google Cloud Text-to-Speech.

## Features

- Text-to-Speech conversion using Google Cloud's advanced TTS service
- Support for both English and Filipino languages with automatic language detection
- High-quality voice output using Chirp HD voices
- Rate limiting for API protection
- CORS enabled for cross-origin requests
- Error handling and logging

## Prerequisites

- Node.js >= 14.0.0
- Google Cloud Text-to-Speech API credentials
- TypeScript

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mindhaven-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up Google Cloud credentials:

   - Create a service account and download the JSON key file
   - Place the key file in `credentials/mindhaven-tts-e1026fbd1dc1.json`

4. Create a `.env` file in the root directory (optional):

```env
PORT=5000
```

## Development

Run the development server:

```bash
npm run dev
```

The server will start on port 5000 (or the port specified in your environment variables).

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Start the production server:

```bash
npm start
```

## API Endpoints

### GET /api

Health check endpoint that returns the API status.

**Response:**

```json
{
  "status": 200,
  "message": "Welcome to the Text-to-Speech API.",
  "timestamp": "2024-03-21T12:00:00.000Z"
}
```

### POST /api/tts/synthesize

Convert text to speech.

**Request Body:**

```json
{
  "text": "Your text to convert to speech"
}
```

**Response:**

- Content-Type: audio/mpeg
- Content-Disposition: attachment; filename=speech.mp3
- Returns the audio file as a stream

## Configuration

The API uses the following configuration:

- Default port: 5000
- Rate limiting: 100 requests per 15 minutes
- Voice: en-US-Chirp-HD-F (Google Cloud's high-quality voice)
- Audio format: MP3
- Speaking rate: 1.0 (normal speed)
- Volume gain: 2.0 dB

## Error Handling

The API includes error handling for:

- Missing text in request
- Invalid audio content
- TTS service errors
- General server errors

## Project Structure (SOA + MVC + Monorepo Style)

```
mindhaven-api/
├── config/
│   ├── common.ts
│   └── database.ts
├── credentials/
│   └── mindhaven-tts-e1026fbd1dc1.json
├── prisma/
│   └── schema.prisma
├── modules/
│   ├── conversation/
│   │   ├── conversation.controller.ts
│   │   ├── conversation.model.ts
│   │   ├── conversation.repository.ts
│   │   ├── conversation.routes.ts
│   │   └── conversation.service.ts
│   ├── gemini/
│   │   ├── gemini.controller.ts
│   │   ├── gemini.routes.ts
│   │   └── gemini.service.ts
│   ├── server/
│   │   ├── server.controller.ts
│   │   └── server.routes.ts
│   ├── text-to-speech/
│   │   ├── tts.controller.ts
│   │   ├── tts.routes.ts
│   │   └── tts.service.ts
│   └── user/
│       ├── user.controller.ts
│       ├── user.model.ts
│       ├── user.repository.ts
│       ├── user.routes.ts
│       └── user.service.ts
├── shared/
│   ├── helper/
│   │   ├── aws.ts
│   │   ├── common.ts
│   │   └── tts.helper.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── types/
│   │   └── search.types.ts
│   └── utils/
│       ├── gemini.utils.ts
│       └── tts.utils.ts
├── test/
│   └── test.upload.ts
├── .env
├── .gitignore
├── index.ts
├── package.json
├── README.md
└── tsconfig.json
```
