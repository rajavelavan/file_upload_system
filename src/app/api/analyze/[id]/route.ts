import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { OpenAI } from 'openai';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET(request: Request, context: { params?: Promise<{ id?: string }> }
) {
  const fileId = await context.params?.then(params => params?.id);
  if (!fileId) {
    return NextResponse.json({ error: 'File ID missing' }, { status: 400 });
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db();

  try {
    const existing = await db.collection('fileanalysis').findOne({
      fileId: new ObjectId(fileId)
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const file = await db.collection('fileurls').findOne({
      _id: new ObjectId(fileId)
    });

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
    const buffer = Buffer.concat(chunks);
    const fileContent = buffer.toString('utf-8');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes documents and provides summaries." },
        { role: "user", content: `Please analyze this document and provide a summary: ${fileContent}` }
      ],
      max_tokens: 500
    });

    const summary = completion.choices[0].message.content;

    await db.collection('fileanalysis').insertOne({
      fileId: new ObjectId(fileId),
      summary,
      analyzedAt: new Date()
    });

    return NextResponse.json({
      fileId,
      summary,
      analyzedAt: new Date()
    });

  } catch (err) {
    console.error('Analysis error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Analysis failed', message: (err as Error).message }, { status: 500 });

  } finally {
    await client.close();
  }
}
