import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

// ---- Ollama Integration Function ----
async function analyzeWithOllama(content: string) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3",
      prompt: `Analyze and briefly summarize the following document:\n\n${content}`,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = (await response.json()) as OllamaResponse;
  return data.response;
}

// ---- AWS S3 Client ----
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// ---- GET Handler ----
export async function GET(request: Request, context: { params?: Promise<{ id?: string }> }) {
  const fileId = await context.params?.then(params => params?.id);

  if (!fileId) {
    return NextResponse.json({ error: 'File ID missing' }, { status: 400 });
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db();

  try {
    const fileObjectId = new ObjectId(fileId);

    // 1. Check if already analyzed
    const existing = await db.collection('fileanalysis').findOne({ fileId: fileObjectId });
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

    // 2. Fetch file info from DB
    const file = await db.collection('fileurls').findOne({ _id: fileObjectId });
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 3. Download file from S3
    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.fileUrl.split('.com/')[1]
    }));

    // 4. Convert stream to Buffer
    const chunks: Buffer[] = [];
    const stream = s3Response.Body as NodeJS.ReadableStream;
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    const fileContent = buffer.toString('utf-8'); // For text/JSON files. For PDF/DOCX, use parser.

    // 5. Analyze with Ollama Phi3
    const summary = await analyzeWithOllama(fileContent);
    const analyzedAt = new Date();

    // 6. Save analysis result
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
    }, { status: 201, statusText: 'File analyzed successfully' });

  } catch (err) {
    console.error('Analysis error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Analysis failed', message: (err as Error).message }, { status: 500 });
  } finally {
    await client.close();
  }
}
