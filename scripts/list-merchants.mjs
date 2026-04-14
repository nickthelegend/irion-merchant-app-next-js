import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://niveshgajengi_db_user:0gVwvxdK7ms@cluster0.lahyqrp.mongodb.net/?appName=Cluster0';

async function listMerchants() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    
    // Check Irion_merchant database
    const db = client.db('Irion_merchant');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    if (collections.find(c => c.name === 'merchant_apps')) {
      const merchants = await db.collection('merchant_apps').find({}).toArray();
      console.log(`Found ${merchants.length} merchants:`);
      merchants.forEach(m => {
        console.log('  - Client ID:', m.client_id);
        console.log('    Name:', m.name);
        console.log('    Escrow:', m.escrow_contract);
        console.log('    USDC Asset:', m.usdc_asset_id);
      });
    } else {
      console.log('No merchant_apps collection found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

listMerchants();
