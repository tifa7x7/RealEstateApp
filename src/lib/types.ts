export type ProjectStatus = 'Проектируется' | 'Строится' | 'Ввод в эксплуатацию' | 'Сдан';
export type ProjectClass = 'Эконом' | 'Комфорт' | 'Бизнес' | 'Премиум';
export type UnitStatus = 'в продаже' | 'бронь' | 'продано';
export type Locale = 'ru' | 'en';
export type Currency = 'RUB' | 'USD';
export type Theme = 'dark' | 'light';
export type UserTier = 'free' | 'pro';
export type MortgageProgram = 'family' | 'it' | 'military';
export type DataConfidence = 'verified' | 'estimated' | 'unverified';

export interface Unit {
  id: string;
  building: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: UnitStatus;
}

export interface Project {
  id: number;
  name: string;
  developer: string;
  city: string;
  district: string;
  status: ProjectStatus;
  classType: ProjectClass;
  buildingType: string;
  buildings: number;
  totalUnits: number;
  sizeMin: number;
  sizeMax: number;
  floors: number;
  pricePerSqm: number;
  minPrice: number;
  completion: string;
  amenities: string[];
  distSea: number;
  lat: number;
  lng: number;
  dateAdded?: string;
  dataConfidence?: DataConfidence;
  description?: string;
  units: Unit[];
}

export interface Region {
  id: string;
  name: string;
  nameEn: string;
  cities?: string[];
}

export interface FilterState {
  search: string;
  region: string;
  cities: string[];
  statuses: ProjectStatus[];
  classes: ProjectClass[];
  types: string[];
  priceRange: [number, number];
  sizeRange: [number, number];
  seaRange: [number, number];
}

export interface CalcObject {
  name: string;
  district: string;
  aptType: string;
  area: number;
  floorInfo: string;
  completionDate: string;
  stage: string;
  price: number;
  parking: number;
  storage: number;
  renovation: number;
  stateDuty: number;
  realtor: number;
  otherCosts: number;
  useMatkapital: boolean;
  useMortgage: boolean;
  useRental: boolean;
  useExit: boolean;
  mortgageProgram: MortgageProgram;
  matkapital: number;
  subsidy450k: number;
  downPct: number;
  term: number;
  familyRate: number;
  subsidyLimit: number;
  marketRate: number;
  itRate: number;
  itLimit: number;
  milNisMonthly: number;
  milRate: number;
  milMaxLoan: number;
  milMinDP: number;
  monthlyRent: number;
  vacancy: number;
  rentGrowth: number;
  taxRate: number;
  mgmtPct: number;
  utilities: number;
  capRepair: number;
  propertyTax: number;
  insurance: number;
  repairReserve: number;
  otherExpenses: number;
  appreciation: number;
  holdingYears: number;
  sellingCosts: number;
  saleTax: number;
  expenseGrowth: number;
  sourceProjectId: number | null;
  sourceUnitId: string | null;
}

export interface MortgageResult {
  downPaymentAmount: number;
  loanAmount: number;
  subsidizedPart: number;
  marketPart: number;
  monthlySubsidized: number;
  monthlyMarket: number;
  totalMonthly: number;
  yearlyPayment: number;
}

export interface CalcResults {
  totalCost: number;
  totalSupport: number;
  mortgage: MortgageResult;
  ownDPFunds: number;
  effectiveLoan: number;
  ownInvested: number;
  grossAnnual: number;
  effAnnual: number;
  taxAmount: number;
  totalExpenses: number;
  noi: number;
  annualCashflow: number;
  monthlyCashflow: number;
  grossYield: number;
  netYield: number;
  capRate: number;
  cashOnCash: number;
  breakEvenRent: number;
  paybackYears: number;
  dscr: number;
  projectedSale: number;
  netProceeds: number;
  totalRentalIncome: number;
  totalProfit: number;
  totalROI: number;
  annualROI: number;
  depositComparison: number;
  rentToPrice: number;
  priceSqm: number;
}

export interface CashflowForecastParams {
  monthlyRent: number;
  vacancy: number;
  rentGrowth: number;
  totalExpenses: number;
  mortgagePayment: number;
  propertyValue: number;
  appreciation: number;
  loanAmount: number;
  expenseGrowth?: number;
}

export interface CashflowForecastYear {
  year: number;
  monthlyRent: number;
  noi: number;
  cashflow: number;
  cumulativeCashflow: number;
  propertyValue: number;
  equity: number;
}

export interface SavedCalc {
  id: number | string;
  date: string;
  objects: CalcObject[];
}

export interface RentalProperty {
  id: number | string;
  name?: string;
  type?: string;
  purchasePrice?: number;
  currentValue?: number;
  monthlyRent?: number;
  monthlyExpenses?: number;
  purchaseDate?: string;
}

export interface UserPrefs {
  favorites: number[];
  favUnits: string[];
  notes: Record<string, string>;
  loggedIn: boolean;
  userName: string;
  userEmail: string;
  savedCalcs: SavedCalc[];
  rentalProperties: RentalProperty[];
}
