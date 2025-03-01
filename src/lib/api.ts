const API_URL = 'http://10.0.0.243:3000';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

interface PrepareResponse {
  questions: string[];
}

interface StartRequest {
  depth: number;
  breadth: number;
  query: string;
  questionsWithAnswers: string;
}

export async function prepareResearch(query: string, numQuestions: number): Promise<string[]> {
  const response = await fetch(`${API_URL}/deep-research/prepare`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ query, numQuestions }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  // Check response Content-Type
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }
    
    console.error('Unexpected JSON response structure from API:', data);
    return [];
  } else {
    // If not JSON, try to process text as a list of questions
    const text = await response.text();
    try {
      // Try to parse as JSON despite missing header
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data;
      }
      if (data.questions && Array.isArray(data.questions)) {
        return data.questions;
      }
    } catch {
      // If not JSON, split text into lines
      return text.split('\n').filter(line => line.trim());
    }
  }
  
  return [];
}

export async function startResearch(params: {
  query: string;
  questionsWithAnswers: string;
  depth: number;
  breadth: number;
}): Promise<string> {
  const response = await fetch(`${API_URL}/deep-research/start`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Błąd API: ${response.status}`);
  }

  // Zawsze pobieramy odpowiedź jako tekst
  return await response.text();
} 