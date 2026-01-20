export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  properties: {
    thermal?: boolean;
    electrical?: boolean;
    chemical?: boolean;
  };
  specifications?: Record<string, string>;
  materials?: string[];
  industries?: string[];
}

export const productCategories = [
  {
    id: 'compounds',
    name: 'Compounds',
    description: 'Custom compound formulations for injection molding and extrusion',
    image: '/placeholder.svg',
    productCount: 45,
  },
  {
    id: 'stock-shapes',
    name: 'Stock Shapes',
    description: 'Rods, sheets, tubes and profiles in various materials',
    image: '/placeholder.svg',
    productCount: 120,
  },
  {
    id: 'sintered-plastics',
    name: 'Sintered Plastics',
    description: 'High-performance sintered materials for demanding applications',
    image: '/placeholder.svg',
    productCount: 32,
  },
  {
    id: 'composites',
    name: 'Composites',
    description: 'Fiber-reinforced composite solutions',
    image: '/placeholder.svg',
    productCount: 28,
  },
  {
    id: 'filaments',
    name: 'Filaments',
    description: '3D printing filaments for additive manufacturing',
    image: '/placeholder.svg',
    productCount: 18,
  },
  {
    id: 'pi-powder',
    name: 'PI Powder',
    description: 'Polyimide powder materials',
    image: '/placeholder.svg',
    productCount: 8,
  },
  {
    id: 'substrates',
    name: 'Substrates',
    description: 'Electronic and thermal management substrates',
    image: '/placeholder.svg',
    productCount: 12,
  },
];

export const sampleProducts: Product[] = [
  {
    id: 'peek-rod-natural',
    name: 'PEEK Rod Natural',
    category: 'Stock Shapes',
    description: 'High-performance PEEK rod with excellent thermal and chemical resistance.',
    properties: { thermal: true, chemical: true },
    materials: ['PEEK'],
    industries: ['Aerospace', 'Medical', 'Semiconductor'],
  },
  {
    id: 'ptfe-sheet',
    name: 'PTFE Sheet',
    category: 'Stock Shapes',
    description: 'Virgin PTFE sheets with superior chemical resistance and low friction.',
    properties: { thermal: true, chemical: true, electrical: true },
    materials: ['PTFE'],
    industries: ['Chemical', 'Food', 'Semiconductor'],
  },
  {
    id: 'pom-c-rod',
    name: 'POM-C Rod',
    category: 'Stock Shapes',
    description: 'Acetal copolymer rods with good dimensional stability and machinability.',
    properties: { chemical: true },
    materials: ['POM'],
    industries: ['Mechanical', 'Food', 'Automotive'],
  },
  {
    id: 'pa66-gf30',
    name: 'PA66 GF30 Compound',
    category: 'Compounds',
    description: '30% glass fiber reinforced PA66 for structural applications.',
    properties: { thermal: true },
    materials: ['PA'],
    industries: ['Mobility', 'Electronics', 'Mechanical'],
  },
  {
    id: 'peek-cf30',
    name: 'PEEK CF30',
    category: 'Composites',
    description: 'Carbon fiber reinforced PEEK for high-strength applications.',
    properties: { thermal: true, chemical: true },
    materials: ['PEEK'],
    industries: ['Aerospace', 'Oil & Gas'],
  },
  {
    id: 'pei-ultem',
    name: 'PEI (Ultem) Sheet',
    category: 'Stock Shapes',
    description: 'Polyetherimide sheets with excellent flame resistance.',
    properties: { thermal: true, electrical: true },
    materials: ['PEI'],
    industries: ['Aerospace', 'Electronics'],
  },
];

export const compoundFilters = [
  {
    id: 'basic-polymer',
    name: 'Basic Polymer',
    options: [
      { id: 'pa', label: 'PA (Nylon)', count: 12 },
      { id: 'peek', label: 'PEEK', count: 8 },
      { id: 'pps', label: 'PPS', count: 6 },
      { id: 'pom', label: 'POM', count: 5 },
      { id: 'pbt', label: 'PBT', count: 4 },
    ],
  },
  {
    id: 'material-modification',
    name: 'Material Modification',
    options: [
      { id: 'gf-reinforced', label: 'Glass Fiber Reinforced', count: 18 },
      { id: 'cf-reinforced', label: 'Carbon Fiber Reinforced', count: 8 },
      { id: 'mineral-filled', label: 'Mineral Filled', count: 6 },
      { id: 'lubricated', label: 'Internally Lubricated', count: 5 },
    ],
  },
  {
    id: 'tribology',
    name: 'Tribology',
    options: [
      { id: 'low-friction', label: 'Low Friction', count: 12 },
      { id: 'wear-resistant', label: 'Wear Resistant', count: 15 },
      { id: 'self-lubricating', label: 'Self-Lubricating', count: 8 },
    ],
  },
  {
    id: 'thermal-properties',
    name: 'Thermal Properties',
    options: [
      { id: 'high-temp', label: 'High Temperature (>150°C)', count: 14 },
      { id: 'ultra-high-temp', label: 'Ultra High Temp (>250°C)', count: 6 },
      { id: 'flame-retardant', label: 'Flame Retardant', count: 10 },
    ],
  },
  {
    id: 'industries',
    name: 'Industries',
    options: [
      { id: 'aerospace', label: 'Aerospace', count: 8 },
      { id: 'medical', label: 'Medical', count: 12 },
      { id: 'semiconductor', label: 'Semiconductor', count: 6 },
      { id: 'automotive', label: 'Automotive', count: 15 },
    ],
  },
];

export const stockShapeFilters = [
  {
    id: 'shapes',
    name: 'Shapes',
    options: [
      { id: 'rod', label: 'Rods', count: 45 },
      { id: 'sheet', label: 'Sheets', count: 38 },
      { id: 'tube', label: 'Tubes', count: 22 },
      { id: 'profile', label: 'Profiles', count: 15 },
    ],
  },
  {
    id: 'basic-polymer',
    name: 'Basic Polymer',
    options: [
      { id: 'peek', label: 'PEEK', count: 18 },
      { id: 'ptfe', label: 'PTFE', count: 15 },
      { id: 'pom', label: 'POM', count: 22 },
      { id: 'pa', label: 'PA (Nylon)', count: 28 },
      { id: 'pc', label: 'PC', count: 12 },
      { id: 'pei', label: 'PEI', count: 8 },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance',
    options: [
      { id: 'fda', label: 'FDA Approved', count: 35 },
      { id: 'eu10-2011', label: 'EU 10/2011', count: 28 },
      { id: 'rohs', label: 'RoHS Compliant', count: 95 },
      { id: 'reach', label: 'REACH Compliant', count: 88 },
    ],
  },
  {
    id: 'thermal-properties',
    name: 'Thermal Properties',
    options: [
      { id: 'high-temp', label: 'High Temperature', count: 32 },
      { id: 'cryogenic', label: 'Cryogenic', count: 8 },
      { id: 'flame-retardant', label: 'Flame Retardant', count: 18 },
    ],
  },
  {
    id: 'colour',
    name: 'Colour',
    options: [
      { id: 'natural', label: 'Natural', count: 85 },
      { id: 'black', label: 'Black', count: 42 },
      { id: 'white', label: 'White', count: 18 },
      { id: 'custom', label: 'Custom Colors', count: 25 },
    ],
  },
];
