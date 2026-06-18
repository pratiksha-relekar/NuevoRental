export function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function computeCartSummary(cartItems, cartTotal) {
  const totalMrp = cartItems.reduce((sum, item) => {
    const listPrice = item.originalPrice ?? item.rentalPrice ?? item.unitPrice
    return sum + listPrice * item.quantity
  }, 0)

  const rentalDiscount = Math.max(0, totalMrp - cartTotal)
  const nuevoOfferDiscount = Math.round(cartTotal * 0.1)
  const bulkBonusDiscount = cartTotal >= 2500 ? Math.round(cartTotal * 0.05) : 0
  const payAmount = Math.max(0, cartTotal - nuevoOfferDiscount - bulkBonusDiscount)

  const waivedDelivery = 199
  const waivedSetup = 149
  const waivedPlatform = 99
  const totalSavings =
    rentalDiscount +
    nuevoOfferDiscount +
    bulkBonusDiscount +
    waivedDelivery +
    waivedSetup +
    waivedPlatform

  const savingsPercent = totalMrp > 0
    ? Math.round((totalSavings / totalMrp) * 100)
    : 0

  return {
    totalMrp,
    rentalDiscount,
    nuevoOfferDiscount,
    bulkBonusDiscount,
    payAmount,
    securityDeposit: 0,
    totalSavings,
    savingsPercent,
    waivedDelivery,
    waivedSetup,
    waivedPlatform,
  }
}
