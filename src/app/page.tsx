"use client";

import { useState, useEffect, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Color, Palette } from "@/lib/types";
import { handleGeneratePalette, handleSuggestApplication } from "@/app/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Save, Trash2, ClipboardCopy, Loader2, Lightbulb, Palette as PaletteIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const initialGenerateState = {
  palette: undefined,
  error: undefined,
};

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full font-bold">
      {pending ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-5 w-5" />
      )}
      Generate Palette
    </Button>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [generateState, formAction] = useFormState(handleGeneratePalette, initialGenerateState);
  
  const [currentPalette, setCurrentPalette] = useState<Palette | null>(null);
  const [savedPalettes, setSavedPalettes] = useLocalStorage<Palette[]>("saved-palettes", []);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [designType, setDesignType] = useState("website");
  const [isSuggesting, startSuggestionTransition] = useTransition();

  useEffect(() => {
    if (generateState.palette) {
      setCurrentPalette({
        id: `palette-${Date.now()}`,
        name: "My New Palette",
        colors: generateState.palette,
      });
      toast({
        title: "Palette Generated!",
        description: "Your new color palette is ready.",
      });
    }
    if (generateState.error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: generateState.error,
      });
    }
  }, [generateState, toast]);

  const handleColorNameChange = (colorIndex: number, newName: string) => {
    if (!currentPalette) return;
    const updatedColors = [...currentPalette.colors];
    updatedColors[colorIndex].colorName = newName;
    setCurrentPalette({ ...currentPalette, colors: updatedColors });
  };

  const handlePaletteNameChange = (newName: string) => {
    if (!currentPalette) return;
    setCurrentPalette({ ...currentPalette, name: newName });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!", description: text });
  };

  const saveCurrentPalette = () => {
    if (!currentPalette) return;
    const existingPaletteIndex = savedPalettes.findIndex(p => p.id === currentPalette.id);
    if (existingPaletteIndex > -1) {
      const updatedPalettes = [...savedPalettes];
      updatedPalettes[existingPaletteIndex] = currentPalette;
      setSavedPalettes(updatedPalettes);
      toast({ title: "Palette Updated!", description: `"${currentPalette.name}" has been updated.` });
    } else {
      setSavedPalettes([...savedPalettes, currentPalette]);
      toast({ title: "Palette Saved!", description: `"${currentPalette.name}" has been added to your collection.` });
    }
  };

  const deletePalette = (id: string) => {
    setSavedPalettes(savedPalettes.filter(p => p.id !== id));
    toast({ title: "Palette Deleted", description: "The palette has been removed from your collection." });
  };

  const loadPalette = (palette: Palette) => {
    setCurrentPalette(palette);
    setSuggestions([]);
  };

  const getSuggestions = () => {
    if (!currentPalette) return;
    startSuggestionTransition(async () => {
      const result = await handleSuggestApplication(
        currentPalette.colors.map(c => c.hexCode),
        designType
      );
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Suggestion Failed",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <main className="container mx-auto p-4 py-8 md:p-12">
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl font-bold tracking-tight">
            Artful Assistant
          </h1>
          <p className="text-muted-foreground text-xl mt-4 max-w-2xl mx-auto">
            Your AI-powered companion for creating and applying beautiful color palettes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center"><Wand2 className="mr-3 h-6 w-6 text-primary" />Color Palette Generator</CardTitle>
                <CardDescription>
                  Enter a few keywords to generate a unique color palette with AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={formAction} className="space-y-4">
                  <div>
                    <Label htmlFor="keywords" className="font-bold">Keywords</Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      placeholder="e.g., 'serene forest dawn', 'cyberpunk city night'"
                      className="mt-2 text-lg p-4"
                      required
                    />
                  </div>
                  <GenerateButton />
                </form>
              </CardContent>
            </Card>

            {currentPalette && (
              <>
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Input 
                                value={currentPalette.name}
                                onChange={(e) => handlePaletteNameChange(e.target.value)}
                                className="text-2xl font-headline font-bold border-0 shadow-none -ml-3 p-2 focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <CardDescription>Customize your generated palette below.</CardDescription>
                        </div>
                        <Button onClick={saveCurrentPalette}><Save className="mr-2 h-4 w-4" /> Save Palette</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {currentPalette.colors.map((color, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className="h-32 w-full rounded-lg border-2 border-border"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <Input
                            value={color.colorName}
                            onChange={(e) => handleColorNameChange(index, e.target.value)}
                            className="font-semibold"
                          />
                           <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
                                <span>{color.hexCode.toUpperCase()}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(color.hexCode)}>
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center"><Lightbulb className="mr-3 h-6 w-6 text-primary" />Color Application Tool</CardTitle>
                    <CardDescription>
                      Get AI-powered suggestions on how to apply this palette.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select value={designType} onValueChange={setDesignType}>
                      <SelectTrigger className="w-full sm:w-[240px] text-base">
                        <SelectValue placeholder="Select design type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="logo">Logo</SelectItem>
                        <SelectItem value="poster">Poster</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="brand-identity">Brand Identity</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={getSuggestions} disabled={isSuggesting} className="w-full sm:w-auto">
                      {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Get Suggestions
                    </Button>
                  </CardContent>
                  {isSuggesting && (
                      <CardFooter className="pt-4">
                          <div className="w-full space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[80%]" />
                          </div>
                      </CardFooter>
                  )}
                  {suggestions.length > 0 && !isSuggesting &&(
                    <CardFooter className="pt-4">
                      <ul className="list-disc space-y-2 pl-5 text-card-foreground/90">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </CardFooter>
                  )}
                </Card>
              </>
            )}
          </div>
          
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center"><PaletteIcon className="mr-3 h-6 w-6 text-primary" />Saved Palettes</CardTitle>
                <CardDescription>
                  Your collection of custom color palettes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedPalettes.length > 0 ? (
                  <div className="space-y-6">
                    {savedPalettes.map(palette => (
                      <div key={palette.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold font-headline">{palette.name}</h3>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => loadPalette(palette)}>Load</Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deletePalette(palette.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {palette.colors.map((color, index) => (
                            <div key={index} title={`${color.colorName} - ${color.hexCode}`} className="h-8 flex-1 rounded" style={{ backgroundColor: color.hexCode }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    You have no saved palettes. Generate one to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
