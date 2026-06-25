export const PROJECT_PLAN_OPTIONS = [
  { id: '1d', value: 'day', label: 'Daily plan' },
  { id: '1w', value: 'week', label: 'Weekly plan' },
  { id: '1m', value: 'month', label: 'Monthly plan' },
  { id: '3m', value: '3m', label: '3 Months plan' },
  { id: '6m', value: '6m', label: '6 Months plan' },
  { id: '12m', value: '12m', label: '12 Months plan' },
]

export const DEFAULT_PLAN_ID_BY_PERIOD = {
  day: '1d',
  week: '1w',
  month: '1m',
  '3m': '3m',
  '6m': '6m',
  '12m': '12m',
}

const DURATION_PLAN_DEFS = [
  { id: '1d', label: 'Daily plan', months: 1 / 30 },
  { id: '1w', label: 'Weekly plan', months: 0.25 },
  { id: '1m', label: 'Monthly plan', months: 1 },
  { id: '3m', label: '3 Months plan', months: 3 },
  { id: '6m', label: '6 Months plan', months: 6 },
  { id: '12m', label: '12 Months plan', months: 12 },
]

const MONTHLY_DISCOUNTS = {
  0.25: 0.34,
  1: 1,
  3: 0.96,
  6: 0.92,
  12: 0.88,
}

function monthlyBaseFromProduct(product) {
  const base = Number(product.rentalPrice) || 0
  const period = product.period || 'month'

  if (period === 'day') return base * 30
  if (period === 'week') return base * 4
  if (period === '3m') return base / 3
  if (period === '6m') return base / 6
  if (period === '12m') return base / 12
  return base
}

function priceForPlan(plan, product) {
  const base = Number(product.rentalPrice) || 0
  const period = product.period || 'month'
  const monthlyBase = monthlyBaseFromProduct(product)

  if (plan.id === '1d') {
    return Math.round(period === 'day' ? base : monthlyBase / 30)
  }

  if (plan.id === '1w') {
    return Math.round(period === 'week' ? base : monthlyBase * MONTHLY_DISCOUNTS[0.25])
  }

  if (plan.id === '1m') {
    return Math.round(period === 'month' ? base : monthlyBase)
  }

  const periodKey = `${plan.months}m`
  if (period === periodKey) {
    return Math.round(base)
  }

  const discount = MONTHLY_DISCOUNTS[plan.months] ?? 1
  return Math.round(monthlyBase * plan.months * discount)
}

function periodUnitForPlan(plan) {
  if (plan.id === '1d') return 'Day'
  if (plan.id === '1w') return 'Week'
  if (plan.months === 1) return 'Month'
  return `${plan.months} Months`
}

export function getDefaultProjectPlanId(product) {
  return DEFAULT_PLAN_ID_BY_PERIOD[product?.period] ?? '1m'
}

export function getRentalDurationPlans(product) {
  return DURATION_PLAN_DEFS.map((plan) => {
    const price = priceForPlan(plan, product)
    const periodUnit = periodUnitForPlan(plan)
    const priceSuffix = plan.id === '1d' ? '/Day' : plan.id === '1w' ? '/Week' : '/Month'

    return {
      id: plan.id,
      durationLabel: plan.label,
      shortLabel: plan.label.replace(' plan', ''),
      months: plan.months,
      price,
      periodUnit,
      priceLabel: `Price: ₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}${priceSuffix}`,
    }
  })
}

export function getProjectPlanLabel(period) {
  return PROJECT_PLAN_OPTIONS.find((option) => option.value === period)?.label ?? period
}

export const RENTAL_DURATION_FILTERS = [
  { label: 'All Durations', value: 'all', planId: null },
  ...PROJECT_PLAN_OPTIONS.map((option) => ({
    label: option.label.replace(' plan', ''),
    value: option.value,
    planId: option.id,
  })),
]

export function getProductPlanPricing(product, durationValue = 'all') {
  const fallback = {
    price: Number(product?.rentalPrice) || 0,
    period: product?.period || 'month',
    durationPlanId: getDefaultProjectPlanId(product),
  }

  if (!product || !durationValue || durationValue === 'all') {
    return fallback
  }

  const planId = DEFAULT_PLAN_ID_BY_PERIOD[durationValue]
  if (!planId) {
    return fallback
  }

  const plan = getRentalDurationPlans(product).find((item) => item.id === planId)
  if (!plan) {
    return fallback
  }

  return {
    price: plan.price,
    period: durationValue,
    durationPlanId: plan.id,
  }
}
