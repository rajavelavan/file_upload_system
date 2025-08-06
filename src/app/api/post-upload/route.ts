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
      fileSize: file.size,
    });

    await client.close();

    return NextResponse.json({
      _id: result.insertedId,
      fileName: file.name,
      fileUrl: fileUrl,
      uploadedAt: file.lastModified,
    }, { status: 201, statusText: 'File uploaded successfully' });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}