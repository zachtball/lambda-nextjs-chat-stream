'use strict';
import { OpenAIStream } from 'ai';

import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Function to fetch data from OpenAI API as streaming data
async function fetchData(payload) {
  payload.stream = true; // Enforce streaming (currently non-streaming not supported)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  return response;
}

// A function to stream the response from OpenAI to the client
export async function streamOpenAIResponse(responseStream, payload) {
  try {
    const response = await fetchData(payload);
    const convertedStream = OpenAIStream(response);
    // instead of using StreamingTextResponse from the ai package,
    // we create our own Amplify-friendly way to stream the response.
    for await (const chunk of convertedStream) {
      responseStream.write(chunk);
    }
  } catch (error) {
    console.error('Error in streamOpenAIResponse:', error);
    throw error;
  }
}
