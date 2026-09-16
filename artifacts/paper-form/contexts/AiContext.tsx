import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system';
import { type FormFieldKey, type ExtractedField } from './AppContext';

const openai = new OpenAI({
  baseURL: 'https://api.nova.amazon.com/v1',
  apiKey: '<NOVA_API_KEY>',
});

export async function extractFormFields(
  imageUri: string
): Promise<Partial<Record<FormFieldKey, ExtractedField>> | null> {
  try {
    const imageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const prompt = `
    You are an AI document digitization engine. Extract all handwritten or typed fields from this GOLD PICSAVER Official Loan Application Form.
    
    Return ONLY a single valid JSON object strictly matching this shape:
    {
      "fullName": { "value": "", "confidence": 1.0, "sourceText": "" },
      "dateOfBirth": { "value": "", "confidence": 1.0, "sourceText": "" },
      "gender": { "value": "", "confidence": 1.0, "sourceText": "" },
      "maritalStatus": { "value": "", "confidence": 1.0, "sourceText": "" },
      "emailAddress": { "value": "", "confidence": 1.0, "sourceText": "" },
      "phoneNumber": { "value": "", "confidence": 1.0, "sourceText": "" },
      "residentialAddress": { "value": "", "confidence": 1.0, "sourceText": "" },
      "idType": { "value": "", "confidence": 1.0, "sourceText": "" },
      "idNumber": { "value": "", "confidence": 1.0, "sourceText": "" },
      "currentEmployer": { "value": "", "confidence": 1.0, "sourceText": "" },
      "jobTitle": { "value": "", "confidence": 1.0, "sourceText": "" },
      "monthlyNetIncome": { "value": "", "confidence": 1.0, "sourceText": "" },
      "otherIncomeSource": { "value": "", "confidence": 1.0, "sourceText": "" },
      "workAddress": { "value": "", "confidence": 1.0, "sourceText": "" },
      "requestedAmount": { "value": "", "confidence": 1.0, "sourceText": "" },
      "loanTenure": { "value": "", "confidence": 1.0, "sourceText": "" },
      "purposeOfLoan": { "value": "", "confidence": 1.0, "sourceText": "" },
      "bankName": { "value": "", "confidence": 1.0, "sourceText": "" },
      "accountNumber": { "value": "", "confidence": 1.0, "sourceText": "" }
    }

    Rules:
    1. "value" should contain the extracted value. If a field is blank or unreadable, set "value" to "" and "confidence" to 0.0.
    2. "confidence" is a decimal between 0.0 and 1.0 indicating AI detection confidence.
    3. "sourceText" contains the exact raw text string read from the image field.
    `;

    const response = await openai.chat.completions.create({
      model: 'nova-2-lite-v1',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageData}` },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const cleanedJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('Failed to digitize form:', error);
    throw error;
  }
}