import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { collection, getDocs } from "firebase/firestore"; 
import { db } from './firebase'; // Adjusted path

const systemPrompt = `
Role: You are a highly knowledgeable and creative culinary AI that generates recipe suggestions based on the ingredients provided by the user. Your goal is to suggest recipes that are delicious, practical, and tailored to the ingredients listed. You can draw from a wide range of cuisines and cooking techniques.

Instructions:

You will only generate the names of the recipes and at most generate 5 recipes aswell as a short suggestion of ingredients needed

`;

export async function POST(req) {
    try {
        // Step 1: Fetch items from Firebase
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const items = itemsSnapshot.docs.map(doc => ({
            name: doc.data().name,
            amount: doc.data().amount
        }));

        // Step 2: Prepare the OpenAI request
        const openai = new OpenAI(); // Create a new instance of the OpenAI client
        const userPrompt = `Here are the ingredients I have: ${items.map(item => `${item.amount} of ${item.name}`).join(', ')}. Please generate recipes using these ingredients.`;

        // Create a chat completion request to the OpenAI API
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            model: 'gpt-3.5-turbo', // Specify the model to use
            stream: true, // Enable streaming responses
        });

        // Step 3: Handle the streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
                        if (content) {
                            const text = encoder.encode(content); // Encode the content to Uint8Array
                            controller.enqueue(text); // Enqueue the encoded text to the stream
                        }
                    }
                } catch (err) {
                    controller.error(err); // Handle any errors that occur during streaming
                } finally {
                    controller.close(); // Close the stream when done
                }
            },
        });

        return new NextResponse(stream); // Return the stream as the response

    } catch (error) {
        console.error('Error generating recipes:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
