export type Color = {
  colorName: string;
  hexCode: string;
  rgb: string;
};

export type Palette = {
  id: string;
  name: string;
  colors: Color[];
};
