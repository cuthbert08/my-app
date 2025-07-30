'use server';

import { generateColorPalette } from '@/ai/flows/generate-color-palette';
import type { GenerateColorPaletteOutput } from '@/ai/flows/generate-color-palette';
import { suggestColorApplication } from '@/ai/flows/suggest-color-application';
import type { SuggestColorApplicationOutput } from '@/ai/flows/suggest-color-application';
import { z } from 'zod';

const generatePaletteSchema = z.object({
  keywords: z.string().min(3, 'Keywords must be at least 3 characters.'),
});

interface GeneratePaletteState {
  palette?: GenerateColorPaletteOutput['palette'];
  error?: string;
}

export async function handleGeneratePalette(
  prevState: GeneratePaletteState,
  formData: FormData
): Promise<GeneratePaletteState> {
  const validatedFields = generatePaletteSchema.safeParse({
    keywords: formData.get('keywords'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.keywords?.[0],
    };
  }

  try {
    const result = await generateColorPalette({ keywords: validatedFields.data.keywords });
    return { palette: result.palette };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate palette. Please try again.' };
  }
}

interface SuggestApplicationState {
    suggestions?: SuggestColorApplicationOutput['suggestions'];
    error?: string;
}

export async function handleSuggestApplication(
    palette: string[],
    designType: string
): Promise<SuggestApplicationState> {
    if (!palette || palette.length === 0) {
        return { error: "A color palette is required." };
    }
    if (!designType) {
        return { error: "A design type is required." };
    }

    try {
        const result = await suggestColorApplication({
            colorPalette: palette,
            designType: designType,
        });
        return { suggestions: result.suggestions };
    } catch (error) {
        console.error(error);
        return { error: "Failed to get suggestions. Please try again." };
    }
}
