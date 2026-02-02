// Shared car-related types used across the application

export interface Car {
  make: string
  model: string
  year: number
  trim?: string
}

export interface CarSpecs {
  // Basic Info
  make: string
  model: string
  year: number
  trim?: string
  bodyType?: string
  
  // Engine & Performance
  engine?: string
  horsepower?: number
  torque?: number
  transmission?: string
  drivetrain?: string
  
  // Fuel
  fuelType?: string
  mpgCity?: number
  mpgHighway?: number
  mpgCombined?: number
  fuelCapacity?: number
  
  // Dimensions
  length?: number
  width?: number
  height?: number
  wheelbase?: number
  curbWeight?: number
  
  // Cargo & Storage
  cargoVolume?: number  // Liters or cubic feet
  trunkCapacity?: number  // Liters
  
  // Tires & Wheels
  tireSize?: string  // e.g., "245/40R18"
  wheelSize?: number  // Inches (diameter)
  wheelMaterial?: string  // e.g., "Alloy", "Steel"
  
  // Electric Vehicle Specs
  batteryCapacity?: number  // kWh
  electricRange?: number  // Miles (EPA combined range)
  
  // Performance
  zeroToSixty?: number
  topSpeed?: number
  
  // Metadata
  dataSource: 'verified' | 'ai-generated'
  sourceApi?: 'nhtsa' | 'carquery' | 'groq'
}

export interface YearOption {
  year: number
}

export interface MakeOption {
  makeId?: number
  makeName: string
}

export interface ModelOption {
  modelId?: number
  modelName: string
}

export interface TrimOption {
  trimId?: string
  trimName: string
  displayName?: string // Formatted display name with engine & transmission
  dataSource?: 'verified' | 'ai-generated' // Source of trim data
  specs?: Partial<CarSpecs>
}

// API Response types
export interface NHTSAMake {
  Make_ID: number
  Make_Name: string
}

export interface NHTSAModel {
  Model_ID: number
  Model_Name: string
}

export interface CarQueryTrim {
  model_id: string
  model_make_id: string
  model_name: string
  model_trim: string
  model_year: string
  model_body: string
  model_engine_position: string
  model_engine_cc: string
  model_engine_cyl: string
  model_engine_type: string
  model_engine_valves_per_cyl: string
  model_engine_power_ps: string
  model_engine_power_rpm: string
  model_engine_torque_nm: string
  model_engine_torque_rpm: string
  model_engine_bore_mm: string
  model_engine_stroke_mm: string
  model_engine_compression: string
  model_engine_fuel: string
  model_top_speed_kph: string
  model_0_to_100_kph: string
  model_drive: string
  model_transmission_type: string
  model_seats: string
  model_doors: string
  model_weight_kg: string
  model_length_mm: string
  model_width_mm: string
  model_height_mm: string
  model_wheelbase_mm: string
  model_lkm_hwy: string
  model_lkm_mixed: string
  model_lkm_city: string
  model_fuel_cap_l: string
}
