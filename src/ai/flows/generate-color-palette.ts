'use server';

/**
 * @fileOverview Color palette generation flow.
 *
 * - generateColorPalette - A function that generates a color palette based on keywords.
 * - GenerateColorPaletteInput - The input type for the generateColorPalette function.
 * - GenerateColorPaletteOutput - The return type for the generateColorPalette function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColorPaletteInputSchema = z.object({
  keywords: z
    .string()
    .describe('Keywords describing the theme or mood for the color palette.'),
});
export type GenerateColorPaletteInput = z.infer<typeof GenerateColorPaletteInputSchema>;

const GenerateColorPaletteOutputSchema = z.object({
  palette: z.array(
    z.object({
      colorName: z.string().describe('The name of the color.'),
      hexCode: z.string().describe('The hex code of the color.'),
      rgb: z.string().describe('The RGB value of the color.'),
    })
  ).describe('A color palette generated based on the keywords.'),
});
export type GenerateColorPaletteOutput = z.infer<typeof GenerateColorPaletteOutputSchema>;

export async function generateColorPalette(input: GenerateColorPaletteInput): Promise<GenerateColorPaletteOutput> {
  return generateColorPaletteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColorPalettePrompt',
  input: {schema: GenerateColorPaletteInputSchema},
  output: {schema: GenerateColorPaletteOutputSchema},
  prompt: `You are a color palette generator. Generate a color palette based on the keywords provided. The palette should contain 5 colors with their names, hex codes, and RGB values. Ensure the colors are suitable for art or design, incorporating hue, saturation, and luminosity appropriate to the content.

Keywords: {{{keywords}}}

Output the color palette in JSON format:
`,
});

const generateColorPaletteFlow = ai.defineFlow(
  {
    name: 'generateColorPaletteFlow',
    inputSchema: GenerateColorPaletteInputSchema,
    outputSchema: GenerateColorPaletteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
