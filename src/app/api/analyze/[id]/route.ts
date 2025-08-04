import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
// import { openai } from '@/lib/openai';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function GET(request: Request, context: { params?: Promise<{ id?: string }> }) {

  const fileId = await context.params?.then(params => params?.id);

  if (!fileId) {
    return NextResponse.json({ error: 'File ID missing' }, { status: 400 });
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db();

  try {
    const fileObjectId = new ObjectId(fileId);

    const existing = await db.collection('fileanalysis').findOne({
      fileId: new ObjectId(fileId)
    });

    if (existing) {
      const existingRecord = await db.collection('fileanalysis').aggregate([
        { $match: { fileId: fileObjectId } },
        {
          $lookup: {
            from: 'fileurls',
            localField: 'fileId',
            foreignField: '_id',
            as: 'fileDetails'
          }
        },
        { $unwind: '$fileDetails' },
        {
          $project: {
            _id: 0,
            fileId: 1,
            summary: 1,
            analyzedAt: 1,
            fileName: '$fileDetails.fileName'
          }
        }
      ]).toArray();

      return NextResponse.json(existingRecord[0], { status: 208, statusText: 'File already analyzed' });
    }

    const file = await db.collection('fileurls').findOne({ _id: fileObjectId });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.fileUrl.split('.com/')[1]
    }));

    const chunks: Buffer[] = [];
    const stream = s3Response.Body as NodeJS.ReadableStream;
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    // const buffer = Buffer.concat(chunks);
    // const fileContent = buffer.toString('utf-8');

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant that analyzes documents and provides summaries." },
    //     { role: "user", content: `Please analyze this document and provide a summary: ${fileContent}` }
    //   ],
    //   max_tokens: 500
    // });

    // const summary = completion.choices[0].message.content;
    const summary = 'Api response placeholder for file analysis'; // Placeholder for actual openAI analysis logic
    const analyzedAt = new Date();
    
    await db.collection('fileanalysis').insertOne({
      fileId: fileObjectId,
      summary,
      analyzedAt
    });

    return NextResponse.json({
      fileId,
      fileName: file.fileName,
      summary,
      analyzedAt
    }, { status: 200, statusText: 'File analyzed successfully' });

  } catch (err) {
    console.error('Analysis error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Analysis failed', message: (err as Error).message }, { status: 500 });

  } finally {
    await client.close();
  }
}
