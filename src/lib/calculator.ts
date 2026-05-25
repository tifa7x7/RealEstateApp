import { MARKET_DATA } from './constants';
import type {
  CalcObject,
  CalcResults,
  CashflowForecastParams,
  CashflowForecastYear,
  MortgageResult,
} from './types';

export type CalcConfidenceTier = 'verified' | 'estimated' | 'user-input';

/**
 * Classifies a calculator result section (cost / mortgage / rental / exit /
 * metrics) by the provenance of the inputs that drive it. Pure: no React.
 *
 * Rules:
 *   - `verified` — the section's primary input came from a real project
 *     (`sourceProjectId` set on the CalcObject). Currently only `cost`
 *     can be `verified`; mortgage/rental/exit are model outputs and remain
 *     `estimated` even when the project is verified.
 *   - `user-input` — the user changed at least one driving input away from
 *     the default. Trumps `estimated`.
 *   - `estimated` — defaults across the board.
 */
export function classifyCalcSection(
  section: 'cost' | 'mortgage' | 'rental' | 'exit' | 'metrics',
  obj: CalcObject,
): CalcConfidenceTier {
  const defaults = defaultCalcObject();

  if (section === 'cost') {
    if (obj.sourceProjectId !== null && obj.sourceProjectId !== undefined) {
      return 'verified';
    }
    const costFields: (keyof CalcObject)[] = [
      'price',
      'parking',
      'storage',
      'renovation',
      'realtor',
      'otherCosts',
    ];
    return costFields.some((f) => obj[f] !== defaults[f])
      ? 'user-input'
      : 'estimated';
  }

  if (section === 'mortgage') {
    const fields: (keyof CalcObject)[] = [
      'downPct',
      'term',
      'familyRate',
      'marketRate',
      'subsidyLimit',
    ];
    return fields.some((f) => obj[f] !== defaults[f])
      ? 'user-input'
      : 'estimated';
  }

  if (section === 'rental') {
    const fields: (keyof CalcObject)[] = [
      'monthlyRent',
      'vacancy',
      'taxRate',
      'rentGrowth',
      'utilities',
      'capRepair',
      'propertyTax',
    ];
    return fields.some((f) => obj[f] !== defaults[f])
      ? 'user-input'
      : 'estimated';
  }

  if (section === 'exit') {
    const fields: (keyof CalcObject)[] = [
      'appreciation',
      'holdingYears',
      'sellingCosts',
      'saleTax',
    ];
    return fields.some((f) => obj[f] !== defaults[f])
      ? 'user-input'
      : 'estimated';
  }

  // 'metrics' is a composite — inherits the highest-precedence tier among
  // its inputs. User-input from any contributing section wins.
  if (
    classifyCalcSection('cost', obj) === 'user-input' ||
    classifyCalcSection('mortgage', obj) === 'user-input' ||
    classifyCalcSection('rental', obj) === 'user-input'
  ) {
    return 'user-input';
  }
  if (
    obj.sourceProjectId !== null &&
    obj.sourceProjectId !== undefined
  ) {
    return 'verified';
  }
  return 'estimated';
}

export function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateMortgage(
  price: number,
  downPct: number,
  rate: number,
  termYears: number,
  subsidizedLimit: number,
  marketRate: number,
): MortgageResult {
  const dp = (price * downPct) / 100;
  const loan = price - dp;
  const subPart = Math.min(loan, subsidizedLimit);
  const mktPart = Math.max(0, loan - subsidizedLimit);
  const pmtSub = calcMonthlyPayment(subPart, rate, termYears);
  const pmtMkt = calcMonthlyPayment(mktPart, marketRate, termYears);
  return {
    downPaymentAmount: dp,
    loanAmount: loan,
    subsidizedPart: subPart,
    marketPart: mktPart,
    monthlySubsidized: pmtSub,
    monthlyMarket: pmtMkt,
    totalMonthly: pmtSub + pmtMkt,
    yearlyPayment: (pmtSub + pmtMkt) * 12,
  };
}

export function defaultCalcObject(): CalcObject {
  return {
    name: '',
    district: '',
    aptType: '1К',
    area: 40,
    floorInfo: '',
    completionDate: '',
    stage: 'Строительство',
    price: 5000000,
    parking: 0,
    storage: 0,
    renovation: 0,
    stateDuty: 2000,
    realtor: 0,
    otherCosts: 0,
    useMatkapital: false,
    useMortgage: false,
    useRental: false,
    useExit: false,
    mortgageProgram: 'family',
    matkapital: MARKET_DATA.matkapital.full,
    subsidy450k: MARKET_DATA.subsidy450k.amount,
    downPct: 20,
    term: 20,
    familyRate: MARKET_DATA.mortgage.familyRate,
    subsidyLimit: MARKET_DATA.mortgage.limit,
    marketRate: MARKET_DATA.mortgage.marketRate,
    itRate: 6,
    itLimit: 9000000,
    milNisMonthly: 32947,
    milRate: 10.3,
    milMaxLoan: 1860000,
    milMinDP: 15,
    monthlyRent: 33200,
    vacancy: 5,
    rentGrowth: 5,
    taxRate: 4,
    mgmtPct: 0,
    utilities: 36000,
    capRepair: 12000,
    propertyTax: 5000,
    insurance: 3000,
    repairReserve: 5,
    otherExpenses: 0,
    appreciation: 6,
    holdingYears: 7,
    sellingCosts: 2,
    saleTax: 0,
    expenseGrowth: 2,
    sourceProjectId: null,
    sourceUnitId: null,
  };
}

export function computeCalcResults(obj: CalcObject): CalcResults {
  const totalCost =
    obj.price + obj.parking + obj.storage + obj.renovation + obj.stateDuty + obj.realtor + obj.otherCosts;
  const useMort = obj.useMortgage;
  const useMat = obj.useMatkapital;
  const useRent = obj.useRental;

  const mortgage: MortgageResult = useMort
    ? calculateMortgage(obj.price, obj.downPct, obj.familyRate, obj.term, obj.subsidyLimit, obj.marketRate)
    : {
        downPaymentAmount: 0,
        loanAmount: 0,
        subsidizedPart: 0,
        marketPart: 0,
        monthlySubsidized: 0,
        monthlyMarket: 0,
        totalMonthly: 0,
        yearlyPayment: 0,
      };

  const matkapitalAmt = useMat ? obj.matkapital : 0;
  const subsidyAmt = useMat ? obj.subsidy450k : 0;
  const ownDPFunds = useMort
    ? Math.max(0, mortgage.downPaymentAmount - matkapitalAmt)
    : totalCost - matkapitalAmt - subsidyAmt;
  const totalSupport = matkapitalAmt + subsidyAmt;
  const effectiveLoan = useMort ? mortgage.loanAmount - subsidyAmt : 0;
  const ownInvested =
    Math.max(0, ownDPFunds) +
    obj.parking +
    obj.storage +
    obj.renovation +
    obj.stateDuty +
    obj.realtor +
    obj.otherCosts;

  const grossAnnual = useRent ? obj.monthlyRent * 12 : 0;
  const effAnnual = grossAnnual * (1 - obj.vacancy / 100);
  const taxAmount = (effAnnual * obj.taxRate) / 100;
  const mgmtCost = (effAnnual * obj.mgmtPct) / 100;
  const repairRes = (effAnnual * obj.repairReserve) / 100;
  const totalExpenses = useRent
    ? mgmtCost +
      obj.utilities +
      obj.capRepair +
      obj.propertyTax +
      obj.insurance +
      repairRes +
      obj.otherExpenses +
      taxAmount
    : 0;

  const noi = effAnnual - totalExpenses;
  const annualCashflow = noi - mortgage.yearlyPayment;
  const monthlyCashflow = annualCashflow / 12;
  const grossYield = totalCost > 0 ? ((obj.monthlyRent * 12) / totalCost) * 100 : 0;
  const netYield = totalCost > 0 ? (noi / totalCost) * 100 : 0;
  const capRate = netYield;
  const cashOnCash = ownInvested > 0 ? (annualCashflow / ownInvested) * 100 : 0;
  const breakEvenRent = mortgage.totalMonthly;
  const paybackYears = annualCashflow > 0 ? ownInvested / annualCashflow : Infinity;
  const dscr = mortgage.yearlyPayment > 0 ? noi / mortgage.yearlyPayment : 0;

  const projectedSale = obj.price * Math.pow(1 + obj.appreciation / 100, obj.holdingYears);
  const sellingExp = (projectedSale * obj.sellingCosts) / 100;
  const gain = projectedSale - obj.price;
  const saleTaxAmt = obj.holdingYears >= 5 ? 0 : (Math.max(0, gain - 1e6) * obj.saleTax) / 100;
  const netProceeds = projectedSale - sellingExp - saleTaxAmt;
  const totalRentalIncome = annualCashflow * obj.holdingYears;
  const totalProfit = netProceeds - obj.price + totalRentalIncome;
  const totalROI = ownInvested > 0 ? (totalProfit / ownInvested) * 100 : 0;
  const annualROI = obj.holdingYears > 0 ? totalROI / obj.holdingYears : 0;
  const depositComparison =
    ownInvested * Math.pow(1 + MARKET_DATA.depositRate / 100, obj.holdingYears) - ownInvested;

  return {
    totalCost,
    totalSupport,
    mortgage,
    ownDPFunds,
    effectiveLoan,
    ownInvested,
    grossAnnual,
    effAnnual,
    taxAmount,
    totalExpenses,
    noi,
    annualCashflow,
    monthlyCashflow,
    grossYield,
    netYield,
    capRate,
    cashOnCash,
    breakEvenRent,
    paybackYears,
    dscr,
    projectedSale,
    netProceeds,
    totalRentalIncome,
    totalProfit,
    totalROI,
    annualROI,
    depositComparison,
    rentToPrice: totalCost > 0 ? obj.monthlyRent / totalCost : 0,
    priceSqm: obj.area > 0 ? totalCost / obj.area : 0,
  };
}

export function generateCashflowForecast(
  params: CashflowForecastParams,
  years = 10,
): CashflowForecastYear[] {
  const {
    monthlyRent,
    vacancy,
    rentGrowth,
    totalExpenses,
    mortgagePayment,
    propertyValue,
    appreciation,
    loanAmount,
    expenseGrowth = 2,
  } = params;

  const result: CashflowForecastYear[] = [];
  let rent = monthlyRent;
  let expenses = totalExpenses;
  let propVal = propertyValue;
  let cumCF = 0;

  for (let y = 0; y <= years; y++) {
    const curRent = y === 0 ? monthlyRent : rent * (1 + rentGrowth / 100);
    rent = curRent;
    const gross = curRent * 12;
    const eff = gross * (1 - vacancy / 100);
    const curExp = y === 0 ? expenses : expenses * (1 + expenseGrowth / 100);
    expenses = curExp;
    const noi = eff - curExp;
    const annMort = mortgagePayment * 12;
    const cf = noi - annMort;
    cumCF += cf;
    const curPV = y === 0 ? propertyValue : propVal * (1 + appreciation / 100);
    propVal = curPV;
    result.push({
      year: y,
      monthlyRent: Math.round(curRent),
      noi: Math.round(noi),
      cashflow: Math.round(cf),
      cumulativeCashflow: Math.round(cumCF),
      propertyValue: Math.round(curPV),
      equity: Math.round(curPV - loanAmount),
    });
  }
  return result;
}
