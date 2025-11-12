import { GoogleGenAI, Type } from '@google/genai';

// Fix: Initialize the GoogleGenAI client to interact with the Gemini API.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert base64 to a Gemini-compatible part
const fileToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
      inlineData: {
        data: base64Data,
        mimeType
      },
    };
};


export const geminiService = {
  // Fix: Updated to use the actual Gemini API instead of a simulated response.
  generatePerformanceFeedback: async (employeeName: string, rating: number, previousComments?: string): Promise<string> => {
    
    let prompt = `Generate a constructive performance review comment for ${employeeName}.`;
    prompt += `\nTheir performance rating is ${rating} out of 5.`;
    if (previousComments) {
      prompt += `\nFor context, their previous review comment was: "${previousComments}"`;
    }
    prompt += "\n\nThe feedback should be professional, encouraging, and provide at least one area for improvement.";

    // Fix: Call the Gemini API to generate content using the specified model and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix: Return the generated text from the API response.
    return response.text;
  },

  generateTurnoverRiskReport: async (employees: any[]): Promise<string> => {
    const prompt = `
      Act as an expert HR analyst. Based on the following employee data, provide a brief turnover risk assessment. 
      For each employee, identify their risk level (Low, Medium, High) and provide a 1-sentence justification.
      Finally, provide a 2-3 sentence summary of the overall team risk and suggest one proactive retention strategy.
      Format the output as clean markdown with headings.

      Employee Data:
      ${employees.map(e => `- ${e.name} (Job Title: ${e.jobTitle}, Tenure: ${e.tenure.toFixed(1)} years, Last Rating: ${e.rating || 'N/A'}/5)`).join('\n')}
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  },

  getWellnessTip: async (): Promise<string> => {
    const prompt = "Provide a concise and actionable wellness tip for employees in a corporate setting. The tip should be about mental health, work-life balance, or physical well-being at the desk. Keep it to 1-2 sentences.";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  },
  
  verifyProfilePicture: async (imageBase64: string, mimeType: string): Promise<{ isValid: boolean; reason: string; }> => {
    const imagePart = fileToGenerativePart(imageBase64, mimeType);
    const prompt = `
      Analyze this image for use as a professional profile picture. 
      Check for two conditions:
      1. Does the image contain one, and only one, clear human face?
      2. Is the image a professional headshot? (e.g., not a group photo, cartoon, object, or containing inappropriate content).
      
      Return your answer as a JSON object with two keys: "isValid" (boolean) and "reason" (a brief string explanation, max 10 words).
      If it is valid, the reason should be "Photo is valid.".
      If invalid, explain why (e.g., "No face detected.", "Multiple faces detected.", "Image is not a person.", "Image is not professional.").
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [imagePart, { text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isValid: { type: Type.BOOLEAN },
                    reason: { type: Type.STRING },
                },
            },
        },
    });

    // The response text will be a JSON string, so we parse it.
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse;
  },
  
  verifyFaceMatch: async (
    liveImage: { base64: string; mimeType: string },
    profileImage: { base64: string; mimeType: string }
  ): Promise<boolean> => {
    const liveImagePart = fileToGenerativePart(liveImage.base64, liveImage.mimeType);
    const profileImagePart = fileToGenerativePart(profileImage.base64, profileImage.mimeType);

    const prompt = `
      Act as a security system. Compare the person in the live camera frame to the person in the user's profile photo. 
      Are they the same person?
      The live frame might have different lighting or angles. Be reasonably certain before confirming.
      Respond with only the word 'Yes' or 'No'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [
          { text: 'This is the live camera frame:' },
          liveImagePart,
          { text: "This is the user's profile photo:" },
          profileImagePart,
          { text: prompt },
        ],
      }],
    });

    return response.text.trim().toLowerCase().includes('yes');
  },

  detectFaceInFrame: async (imageBase64: string, mimeType: string): Promise<boolean> => {
    const imagePart = fileToGenerativePart(imageBase64, mimeType);
    const prompt = "Is there one single, clear human face visible in this image? Answer with only the word 'Yes' or 'No'.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [imagePart, { text: prompt }] }],
    });

    return response.text.trim().toLowerCase() === 'yes';
  }
};