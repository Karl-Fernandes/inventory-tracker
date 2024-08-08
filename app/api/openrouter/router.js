// app/api/openrouter/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  const { ingredients } = await request.json();

  if (!ingredients) {
    return NextResponse.json({ error: 'Ingredients are required' }, { status: 400 });
  }

  const prompt = `Generate a recipe using the following ingredients: ${ingredients.join(', ')}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/models/meta-llama/llama-3.1-8b-instruct:free/api',
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_API_KEY`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
