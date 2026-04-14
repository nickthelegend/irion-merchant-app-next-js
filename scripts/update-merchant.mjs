import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://niveshgajengi_db_user:0gVwvxdK7ms@cluster0.lahyqrp.mongodb.net/?appName=Cluster0';

async function updateMerchant() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('Irion_merchant');
    
    // New MerchantEscrow address for App ID 1047
    const newEscrowAddress = 'LGPHH7LZXSCMDCXGVU76ECSGDLL46PACFNCPHL3UXLISMV57SAEYITIXHA';
    
    // Update the merchant app with new credentials
    const result = await db.collection('merchant_apps').updateOne(
      { client_id: 'prod_740fef7ec73948248fc49cdadb551094' },
      { 
        $set: { 
          escrow_contract: newEscrowAddress,
          usdc_asset_id: 1031,
          updated_at: new Date()
        } 
      }
    );
    
    console.log('Updated merchant:', result);
    
    // Show the updated record
    const merchant = await db.collection('merchant_apps').findOne({
      client_id: 'prod_740fef7ec73948248fc49cdadb551094'
    });
    
    console.log('Updated merchant record:', merchant);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateMerchant();
