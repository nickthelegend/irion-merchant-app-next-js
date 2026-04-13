import { algodClient, deployments, getCreditScoreClient, getLendingPoolClient, getBNPLCreditClient, getMerchantEscrowClient } from './client'

// Read credit profile for a wallet address from chain
export async function fetchCreditProfileFromChain(address: string) {
  const client = getCreditScoreClient()
  try {
    const result = await client.send.getCreditProfile({ args: [address] })
    return result.return
  } catch (e) {
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
  const client = getCreditScoreClient()
  try {
    const result = await client.send.getBorrowLimit({ args: [address] })
    return Number(result.return ?? BigInt(0))
  } catch {
    return 0
  }
}

// Read pool stats
export async function fetchPoolStats() {
  const client = getLendingPoolClient()
  const result = await client.send.getPoolStats({ args: [] })
  return result.return
}

// Read lender position
export async function fetchLenderPosition(address: string) {
  const client = getLendingPoolClient()
  try {
    const result = await client.send.getLenderPosition({ args: [address] })
    return result.return
  } catch {
    return { deposit_amount: BigInt(0), accrued_yield: BigInt(0) }
  }
}

// Read user loans list from chain
export async function fetchUserLoans(address: string): Promise<number[]> {
  const client = getBNPLCreditClient()
  try {
    const result = await client.send.getUserLoans({ args: [address] })
    return (result.return ?? []).map((id: bigint) => Number(id))
  } catch {
    return []
  }
}

// Read single loan from chain
export async function fetchLoan(loan_id: number) {
  const client = getBNPLCreditClient()
  const result = await client.send.getLoan({ args: [BigInt(loan_id)] })
  return result.return
}

// Read escrow state for an order
export async function fetchEscrow(loan_id: number) {
  const client = getMerchantEscrowClient()
  try {
    const result = await client.send.getEscrow({ args: [BigInt(loan_id)] })
    return result.return
  } catch {
    return null
  }
}
