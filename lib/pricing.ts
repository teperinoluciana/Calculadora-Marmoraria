export const MATERIAL_PRICES: Record<string, number> = {
  "Granito nacional": 900,
  "Quartzo": 1600,
  "Dekton": 2800,
  "Mármore nacional": 1500,
  "Mármore importado": 3200,
  "Porcelanato esculpido": 1200,
  "Superfície sólida": 2400,
};

export const PATTERN_MULTIPLIERS: Record<string, number> = {
  "Econômico": 0.80,
  "Médio": 1.00,
  "Alto": 1.35,
  "Luxo": 1.75,
};

export const THICKNESS_MULTIPLIERS: Record<string, number> = {
  "2cm": 1.0,
  "3cm": 1.12,
  "4cm (engrossada)": 1.28,
};

export const RODABANCA_PRICE = (h: number) => {
  if (h === 0) return 0;
  if (h <= 10) return 120;
  if (h <= 20) return 220;
  if (h <= 40) return 400;
  return 400 + (h - 40) * 12;
};

export const CUBA_PRICES: Record<string, number> = {
  "Nenhuma": 0,
  "Sobrepor": 0,
  "Embutir": 350,
  "Apoio": 150,
  "Encaixe": 250,
  "Semi-encaixe": 300,
  "Esculpida": 1500,
  "Farm sink": 2200,
};

export const RECORTE_PRICES: Record<string, number> = {
  "Cooktop": 250,
  "Torneira": 50,
  "Dosador": 50,
  "Lixeira": 150,
  "Tomada": 100,
  "Calha úmida": 300,
};

export const EDGE_PRICES: Record<string, number> = {
  "Reto": 0,
  "Reto Duplo": 60,
  "Meia Esquadria": 120,
  "Meia Esq. Invertida": 130,
  "Bisotado": 100,
  "Bisotado Duplo": 140,
  "Meia Cana": 80,
  "Meia Cana Dupla": 140,
  "Boleado": 150,
  "Boleado Duplo": 220,
  "Peito de Pombo": 200,
  "Borda T": 180,
  "Pingadeira": 140,
};

export const STATE_MULTIPLIERS: Record<string, number> = {
  "SP": 1.0,
  "RJ": 1.05,
  "MG": 0.95,
  "SC": 1.02,
  "RS": 1.0,
  "PR": 0.98,
  "Outro": 1.1,
};

export interface ElementPosition {
  x: number;
  y: number;
  rotation: number;
  dimXOffset?: number;
  dimYOffset?: number;
}

export interface Cuba {
  id: string;
  type: string;
  material?: string; // "Inox", "Louça", "Cerâmica", "Pedra"
  fundo?: "Reto" | "Inclinado"; // Para esculpida
  shape: "Retangular" | "Redondo";
  length: number; // meters
  width: number; // meters
  diameter?: number; // meters
}

export interface Recorte {
  id: string;
  type: string;
  shape?: "Retangular" | "Redondo";
  length: number; // meters
  width: number; // meters
  diameter?: number; // meters
}

export interface Bancada {
  id: string;
  name: string;
  tipoBancada: "Seca" | "Úmida";
  length: number; // meters
  width: number; // meters
  material: string;
  pattern: string;
  thickness: string;
  
  saiaAtiva: boolean;
  saiaAltura: number; // cm

  rodabancaAtiva: boolean;
  rodabancaHeight: number; // cm

  bordaTipo: string;
  bordaLados: string[];
  paredeLados: string[];
  rodabancaLados: string[];

  cubas: Cuba[];
  recortes: Recorte[];
  polishing: boolean;
  impermeabilizacao: boolean;
  complexity: number; // 1.0 to 1.5
  posicoes?: Record<string, ElementPosition>;
  
  // For global composition
  globalX?: number;
  globalY?: number;
  globalRotation?: number;
  titleOffsetX?: number;
  titleOffsetY?: number;
}

export const defaultBancada = (): Bancada => ({
  id: Math.random().toString(36).substring(7),
  name: "Bancada 1",
  tipoBancada: "Seca",
  length: 2.0,
  width: 0.6,
  material: "Granito nacional",
  pattern: "Médio",
  thickness: "2cm",
  saiaAtiva: false,
  saiaAltura: 15,
  rodabancaAtiva: false,
  rodabancaHeight: 10,
  bordaTipo: "Reto",
  bordaLados: ["frente", "esquerda", "direita"],
  paredeLados: [],
  rodabancaLados: ["trás"],
  cubas: [{
    id: Math.random().toString(36).substring(7),
    type: "Embutir",
    shape: "Retangular",
    length: 0.5,
    width: 0.4,
    diameter: 0.4
  }],
  recortes: [],
  polishing: false,
  impermeabilizacao: false,
  complexity: 1.0,
  posicoes: {},
  globalX: 0,
  globalY: 0,
  globalRotation: 0,
});

export function calcBancada(b: Bancada, state: string) {
  const area = b.length * b.width;
  const perimeter = (b.length + b.width) * 2; // simplified

  const basePrice = (MATERIAL_PRICES[b.material] || 0) * area;
  const patternMult = PATTERN_MULTIPLIERS[b.pattern] || 1;
  const thicknessMult = THICKNESS_MULTIPLIERS[b.thickness] || 1;
  
  let total = basePrice * patternMult * thicknessMult;

  // Edge (acabamento de borda)
  let bordaLength = 0;
  for (const lado of b.bordaLados) {
    if (lado === "frente" || lado === "trás") bordaLength += b.length;
    if (lado === "esquerda" || lado === "direita") bordaLength += b.width;
  }
  const edgePrice = (EDGE_PRICES[b.bordaTipo] || 0) * bordaLength;
  total += edgePrice;

  // Saia (skirt) - applies to bordaLados
  let saiaPrice = 0;
  if (b.saiaAtiva) {
    const saiaArea = bordaLength * (b.saiaAltura / 100);
    saiaPrice = saiaArea * (MATERIAL_PRICES[b.material] || 0);
  }
  total += saiaPrice;

  // Rodabanca (backsplash) - applies to rodabancaLados
  let rodabancaPrice = 0;
  let rodabancaLength = 0;
  for (const lado of b.rodabancaLados) {
    if (lado === "frente" || lado === "trás") rodabancaLength += b.length;
    if (lado === "esquerda" || lado === "direita") rodabancaLength += b.width;
  }
  if (b.rodabancaAtiva) {
    rodabancaPrice = RODABANCA_PRICE(b.rodabancaHeight) * rodabancaLength;
  }
  total += rodabancaPrice;

  // Cuba (sink)
  let cubaPrice = 0;
  for (const cuba of b.cubas) {
    cubaPrice += CUBA_PRICES[cuba.type] || 0;
  }
  total += cubaPrice;

  // Recortes (cutouts)
  let recortesPrice = 0;
  for (const r of b.recortes) {
    recortesPrice += (RECORTE_PRICES[r.type] || 0);
  }
  total += recortesPrice;

  // Extras (Polishing and Impermeabilização)
  let extrasMult = 1.0;
  if (b.polishing) extrasMult += 0.1;
  if (b.impermeabilizacao) extrasMult += 0.1;
  total *= extrasMult;

  // Complexity
  total *= b.complexity;

  // State multiplier
  const stateMult = STATE_MULTIPLIERS[state] || 1.0;
  total *= stateMult;

  return {
    total,
    area,
    basePrice: basePrice * patternMult * thicknessMult,
    saiaPrice,
    rodabancaPrice,
    cubaPrice,
    recortesPrice,
    edgePrice,
  };
}
