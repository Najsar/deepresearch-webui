# Deep Research Chat

A web application for conducting advanced research using artificial intelligence. Enables in-depth analysis through an interactive AI chat interface.

## Features

- Interactive chat interface
- Generation of supplementary questions based on the main research query
- Creation of detailed research reports
- PDF report export with preserved formatting
- Real-time research progress logging system
- Responsive design for various devices

## Technical Requirements

- Node.js 18+
- npm 9+
- Access to Deep Research API (port 3000)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd web-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure API address:
Open `src/lib/api.ts` and change the `API_URL` value to your API server address:
```typescript
const API_URL = 'http://your-api-address:3000';
```
Remember to also update the address in `src/lib/socket.ts` for WebSocket.

4. Run the application in development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Socket.IO (websockets)
- html2canvas + jsPDF (PDF generation)
- Radix UI (interface components)

## Project Structure

```
src/
  ├── app/              # Main Next.js components
  ├── components/       # React components
  │   ├── ui/          # Basic UI components
  │   └── ...          # Other components
  └── lib/             # Libraries and tools
      ├── api.ts       # API integration
      └── socket.ts    # WebSocket handling
```

## Usage

1. Enter your main research question in the text field
2. Answer the generated supplementary questions
3. Wait for the report generation
4. Download the report in PDF format using the download icon

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
