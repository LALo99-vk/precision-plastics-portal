export interface Industry {
  id: string;
  name: string;
  description: string;
  challenges?: string[];
  applications?: string[];
  recommendedMaterials?: string[];
}

export const industries: Industry[] = [
  {
    id: 'aerospace',
    name: 'Aerospace',
    description: 'High-performance materials for aircraft, spacecraft, and defense applications requiring extreme temperature resistance, weight reduction, and regulatory compliance.',
    challenges: [
      'Extreme temperature variations',
      'Flame and smoke requirements (FAR 25.853)',
      'Weight reduction targets',
      'Long service life requirements',
    ],
    applications: ['Interior components', 'Structural parts', 'Electrical insulators', 'Seals and gaskets'],
    recommendedMaterials: ['PEEK', 'PEI', 'PEKK', 'PAI', 'PTFE'],
  },
  {
    id: 'biopharma',
    name: 'Biopharma',
    description: 'USP Class VI compliant materials for pharmaceutical manufacturing, single-use systems, and biotechnology applications.',
    challenges: [
      'USP Class VI compliance',
      'Sterilization compatibility',
      'Chemical purity requirements',
      'Particle generation control',
    ],
    applications: ['Single-use components', 'Tubing', 'Valves', 'Filtration housings'],
    recommendedMaterials: ['PVDF', 'PPSU', 'PTFE', 'PP'],
  },
  {
    id: 'building',
    name: 'Building',
    description: 'Durable materials for construction and building applications with focus on weatherability and fire safety.',
    challenges: [
      'Fire safety regulations',
      'UV stability requirements',
      'Thermal insulation',
      'Long-term durability',
    ],
    applications: ['Facade components', 'Insulation', 'Piping systems', 'Structural elements'],
    recommendedMaterials: ['PVC', 'PC', 'PMMA', 'HDPE'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Materials with excellent electrical properties for electronic components, housings, and assemblies.',
    challenges: [
      'ESD protection requirements',
      'Flame retardancy (UL94)',
      'Dimensional precision',
      'Heat dissipation',
    ],
    applications: ['Connectors', 'Housings', 'Insulators', 'PCB components'],
    recommendedMaterials: ['PBT', 'LCP', 'PPS', 'PEI', 'PC'],
  },
  {
    id: 'food',
    name: 'Food',
    description: 'FDA and EU 10/2011 compliant materials for food contact applications in processing and packaging.',
    challenges: [
      'FDA/EU 10/2011 compliance',
      'Cleaning and sanitization',
      'Temperature cycling',
      'Contamination prevention',
    ],
    applications: ['Conveyor components', 'Processing equipment', 'Cutting surfaces', 'Packaging'],
    recommendedMaterials: ['UHMW-PE', 'POM', 'PP', 'PEEK', 'PTFE'],
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Heat-resistant materials for glass manufacturing and processing equipment.',
    challenges: [
      'Extreme heat exposure',
      'Thermal shock resistance',
      'Wear resistance',
      'Chemical resistance to glass',
    ],
    applications: ['Handling equipment', 'Molds', 'Conveyor components', 'Insulators'],
    recommendedMaterials: ['PEEK', 'PI', 'PTFE', 'PBI'],
  },
  {
    id: 'hydrogen',
    name: 'Hydrogen',
    description: 'Materials compatible with hydrogen environments for fuel cells and hydrogen infrastructure.',
    challenges: [
      'Hydrogen permeation resistance',
      'Pressure containment',
      'Temperature extremes',
      'Long-term hydrogen exposure',
    ],
    applications: ['Seals', 'Gaskets', 'Fuel cell components', 'Tank liners'],
    recommendedMaterials: ['PEEK', 'PTFE', 'PVDF', 'HDPE'],
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    description: 'Engineering plastics for general mechanical applications including bearings, gears, and structural components.',
    challenges: [
      'Wear and friction control',
      'Load-bearing capability',
      'Dimensional stability',
      'Noise reduction',
    ],
    applications: ['Gears', 'Bearings', 'Bushings', 'Rollers', 'Wear strips'],
    recommendedMaterials: ['POM', 'PA', 'PEEK', 'UHMW-PE', 'PK'],
  },
  {
    id: 'medical',
    name: 'Medical',
    description: 'Biocompatible and sterilizable materials for medical devices, surgical instruments, and implants.',
    challenges: [
      'Biocompatibility (ISO 10993)',
      'Multiple sterilization cycles',
      'Regulatory compliance',
      'Traceability requirements',
    ],
    applications: ['Surgical instruments', 'Implants', 'Device housings', 'Diagnostic equipment'],
    recommendedMaterials: ['PEEK', 'PPSU', 'PSU', 'PC', 'UHMW-PE'],
  },
  {
    id: 'mobility',
    name: 'Mobility',
    description: 'Lightweight, durable materials for automotive, rail, and electric vehicle applications.',
    challenges: [
      'Weight reduction',
      'Thermal management',
      'NVH performance',
      'Electrification requirements',
    ],
    applications: ['Structural components', 'Bearings', 'Electrical insulators', 'Interior parts'],
    recommendedMaterials: ['PA', 'PBT', 'PPS', 'PEEK', 'PC'],
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas',
    description: 'High-performance materials for extreme environments in upstream, midstream, and downstream applications.',
    challenges: [
      'Extreme pressures and temperatures',
      'Chemical resistance (H2S, CO2)',
      'Explosive decompression resistance',
      'Long-term reliability',
    ],
    applications: ['Seals', 'Bearings', 'Backup rings', 'Valve seats', 'Pipe liners'],
    recommendedMaterials: ['PEEK', 'PTFE', 'PVDF', 'PAI'],
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    description: 'Durable materials for solar, wind, and other renewable energy applications.',
    challenges: [
      'UV and weather resistance',
      'Electrical insulation',
      'Long service life (20+ years)',
      'Temperature cycling',
    ],
    applications: ['Solar panel components', 'Wind turbine parts', 'Electrical insulators', 'Cable management'],
    recommendedMaterials: ['PVDF', 'PA', 'PC', 'PEEK'],
  },
  {
    id: 'semiconductor',
    name: 'Semiconductor & Electronics Manufacturing',
    description: 'Ultra-clean materials for semiconductor fabrication, flat panel display, and precision electronics manufacturing.',
    challenges: [
      'Ultra-low particle generation',
      'Chemical purity',
      'Plasma resistance',
      'Cleanroom compatibility',
    ],
    applications: ['Wafer handling', 'Process chambers', 'Chemical delivery', 'Test equipment'],
    recommendedMaterials: ['PEEK', 'PTFE', 'PVDF', 'PFA', 'PI'],
  },
];
