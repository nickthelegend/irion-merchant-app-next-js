import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

// Handle CORS preflight
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-client-id, x-client-secret',
    },
  });
}

export async function POST(req: Request) {
  const clientId = req.headers.get("x-client-id");
  const clientSecret = req.headers.get("x-client-secret");

  console.log('[MERCHANT-DEBUG] Received request headers:', { clientId, clientSecret: clientSecret?.substring(0, 10) + '...' });

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Client Auth Headers (x-client-id, x-client-secret)" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
    console.log('[MERCHANT-DEBUG] Received request body:', body);
  } catch (e) {
    console.log('[MERCHANT-DEBUG] Failed to parse body:', e);
    body = {};
  }
  
  const { amount, description, metadata, asset = "USDC" } = body;

  console.log('[MERCHANT-DEBUG] Extracted values:', { amount, description, asset });

  if (amount === undefined || amount === null) {
    console.log('[MERCHANT-DEBUG] Amount is missing! Returning error.');
    return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  }

  if (parseFloat(amount) <= 0) {
    console.log('[MERCHANT-DEBUG] Amount is 0 or negative! Returning error.');
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  const db = await getDb();
  // Note: in merchant app collections are 'merchant_apps'
  const app = await db.collection("merchant_apps").findOne({ client_id: clientId, client_secret: clientSecret });

  if (!app) {
    return NextResponse.json({ error: "Invalid API Credentials" }, { status: 403 });
  }

  const billHash = crypto.randomBytes(20).toString("hex");

  const result = await db.collection("merchant_bills").insertOne({
    app_id: app._id,
    amount: parseFloat(amount),
    asset,
    description,
    metadata: metadata || {},
    hash: billHash,
    status: "pending",
    created_at: new Date(),
  });

  const coreUrl = process.env.Irion_CORE_URL || "https://app.irion.network";
  return NextResponse.json({
    billId: result.insertedId,
    billHash,
    checkoutUrl: `${coreUrl}/pay/${billHash}`,
    merchantName: app.name,
    escrowAddress: app.escrow_contract,
    chainId: 11155111, // Sepolia
    status: "pending",
  });
}
