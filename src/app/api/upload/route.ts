import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MongoClient } from 'mongodb';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

//  This function handles the post request for uploading the selected file to S3 and save the file URL to MongoDB 
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to S3
    const fileBuffer = await file.arrayBuffer();
    const key = `${Date.now()}-${file.name}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    }));

    // Save to MongoDB
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    
    const result = await db.collection('fileurls').insertOne({
      fileName: file.name,
      fileUrl: fileUrl,
      uploadedAt: new Date(),
    });

    await client.close();

    return NextResponse.json({
      _id: result.insertedId,
      fileName: file.name,
      fileUrl: fileUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

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