import { algodClient, deployments, getCreditScoreClient, getLendingPoolClient, getBNPLCreditClient, getMerchantEscrowClient } from './client'

// Read credit profile for a wallet address from chain
export async function fetchCreditProfileFromChain(address: string) {
  console.log('[IRION-DEBUG] fetchCreditProfileFromChain initiated', address)
  const client = getCreditScoreClient()
  try {
    const result = await client.send.getCreditProfile({ args: [address] })
    console.log('[IRION-DEBUG] fetchCreditProfileFromChain result', result.return)
    return result.return
  } catch (e) {
    console.warn('[IRION-DEBUG] fetchCreditProfileFromChain error', e)
    // User has no profile yet on chain — return defaults
    return {
      score: BigInt(300),
      total_borrowed: BigInt(0),
      total_repaid: BigInt(0),
      active_loans: BigInt(0),
      on_time_repayments: BigInt(0),
      late_repayments: BigInt(0),
    }
  }
}

// Read borrow limit for address
export async function fetchBorrowLimit(address: string): Promise<number> {
  console.log('[IRION-DEBUG] fetchBorrowLimit initiated', address)
  const client = getCreditScoreClient()
  try {
    const result = await client.send.getBorrowLimit({ args: [address] })
    console.log('[IRION-DEBUG] fetchBorrowLimit result', result.return)
    return Number(result.return ?? BigInt(0))
  } catch (e) {
    console.warn('[IRION-DEBUG] fetchBorrowLimit error', e)
    return 0
  }
}

// Read pool stats
export async function fetchPoolStats() {
  console.log('[IRION-DEBUG] fetchPoolStats initiated')
  const client = getLendingPoolClient()
  const result = await client.send.getPoolStats({ args: [] })
  console.log('[IRION-DEBUG] fetchPoolStats result', result.return)
  return result.return
}

// Read lender position
export async function fetchLenderPosition(address: string) {
  console.log('[IRION-DEBUG] fetchLenderPosition initiated', address)
  const client = getLendingPoolClient()
  try {
    const result = await client.send.getLenderPosition({ args: [address] })
    console.log('[IRION-DEBUG] fetchLenderPosition result', result.return)
    return result.return
  } catch (e) {
    console.warn('[IRION-DEBUG] fetchLenderPosition error', e)
    return { deposit_amount: BigInt(0), accrued_yield: BigInt(0) }
  }
}

// Read user loans list from chain
export async function fetchUserLoans(address: string): Promise<number[]> {
  console.log('[IRION-DEBUG] fetchUserLoans initiated', address)
  const client = getBNPLCreditClient()
  try {
    const result = await client.send.getUserLoans({ args: [address] })
    const ids = (result.return ?? []).map((id: bigint) => Number(id))
    console.log('[IRION-DEBUG] fetchUserLoans IDs', ids)
    return ids
  } catch (e) {
    console.warn('[IRION-DEBUG] fetchUserLoans error', e)
    return []
  }
}

// Read single loan from chain
export async function fetchLoan(loan_id: number) {
  console.log('[IRION-DEBUG] fetchLoan initiated', loan_id)
  const client = getBNPLCreditClient()
  const result = await client.send.getLoan({ args: [BigInt(loan_id)] })
  console.log('[IRION-DEBUG] fetchLoan result', result.return)
  return result.return
}

// Read escrow state for an order
export async function fetchEscrow(loan_id: number) {
  console.log('[IRION-DEBUG] fetchEscrow initiated', loan_id)
  const client = getMerchantEscrowClient()
  try {
    const result = await client.send.getEscrow({ args: [BigInt(loan_id)] })
    console.log('[IRION-DEBUG] fetchEscrow result', result.return)
    return result.return
  } catch (e) {
    console.warn('[IRION-DEBUG] fetchEscrow error', e)
    return null
  }
}

