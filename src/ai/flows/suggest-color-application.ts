'use server';

/**
 * @fileOverview A color application suggestion AI agent.
 *
 * - suggestColorApplication - A function that suggests how to apply a color palette to example designs and layouts.
 * - SuggestColorApplicationInput - The input type for the suggestColorApplication function.
 * - SuggestColorApplicationOutput - The return type for the suggestColorApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestColorApplicationInputSchema = z.object({
  colorPalette: z
    .array(z.string())
    .describe('An array of hex color codes in the palette.'),
  designType: z
    .string()
    .describe(
      'The type of design or layout to apply the color palette to, e.g., website, logo, poster.'
    ),
});
export type SuggestColorApplicationInput = z.infer<typeof SuggestColorApplicationInputSchema>;

const SuggestColorApplicationOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'An array of suggestions on how to apply the colors to the specified design type.'
    ),
});
export type SuggestColorApplicationOutput = z.infer<typeof SuggestColorApplicationOutputSchema>;

export async function suggestColorApplication(input: SuggestColorApplicationInput): Promise<SuggestColorApplicationOutput> {
  return suggestColorApplicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestColorApplicationPrompt',
  input: {schema: SuggestColorApplicationInputSchema},
  output: {schema: SuggestColorApplicationOutputSchema},
  prompt: `You are an expert design assistant. Given a color palette and a design type, you will suggest how to apply the colors in the palette to the design.

Color Palette: {{colorPalette}}
Design Type: {{designType}}

Suggestions:
`,
});

const suggestColorApplicationFlow = ai.defineFlow(
  {
    name: 'suggestColorApplicationFlow',
    inputSchema: SuggestColorApplicationInputSchema,
    outputSchema: SuggestColorApplicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
