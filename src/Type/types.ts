export interface BaseShape {
  id: string;
  label: string;

  preview: string;
  model?: string 
  small_model?: string
  thumbnail?: string;   // webp image

  models: BaseModels;
  color1?: BaseColor;
  color2?: BaseColor;
  disabled?: boolean;
}

export interface BaseColor {
  name: string;
  base: string;
  "base-color": string;
  metalness: string;
  normal: string;
  roughness: string;
}

export interface BaseModels {
  default: string;
}

export interface TopShape {
  id: string;
  name: string;
  modelPath: string;
  mdfModelPath: string;
  preview: string;
  disabled?: boolean;
}

export interface TopColor {
  id: string;
  name: string;
  base: string;
  sample: string;
  description: string;
  "base-color": string;
  metalness: string;
  normal: string;
  roughness: string;
  mdfColor: string;
  type: string;
  disabled?: boolean;
}

/* --- Chair types --- */
export interface ChairColor {
  preview: string;
  name?: string;
  id?: string;
  legcolor: string;
  legmetalness: string;
  legroughness: string;
  legnormal: string;
  seatcolor: string;
  seatmetalness: string;
  seatroughness: string;
  seatnormal: string;
}

export interface Chair {
  id: string;
  name: string;
  base: string;
  modelPath: string;
  color1?: ChairColor;
  color2?: ChairColor;
  color3?: ChairColor;
  disabled?: boolean;
}
