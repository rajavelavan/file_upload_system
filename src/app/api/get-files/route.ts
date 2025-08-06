import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This function handles the get request to fetch all uploaded files from MongoDB
export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    
    const files = await db.collection('fileurls')
      .find()
      .sort({ uploadedAt: -1 })
      .toArray();

    await client.close();

    if (!files || files.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(files);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}