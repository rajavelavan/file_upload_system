# File Upload System - File Analysis Tool Powered By AI

## Project Summary

A modern, full-stack file upload and analysis system built with Next.js that allows users to upload PDF, DOC, DOCX, and JSON files to AWS S3 storage and provides AI-powered analysis and summaries of the uploaded content. The system features a clean, responsive interface with real-time file management capabilities.

## Tech Stack

### Frontend
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling framework
- **Next.js Turbopack** - Fast development server

### Backend
- **Next.js API Routes** - Serverless backend
- **AWS SDK** - AWS service integration
- **MongoDB** - Database with Mongoose ODM
- **OpenAI API** - AI analysis capabilities

### Infrastructure
- **AWS S3** - File storage
- **MongoDB Atlas** - Cloud database
- **Vercel** - Deployment platform

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Formidable** - File upload handling

## Features

### Core Features
- **Multi-format File Upload**: Support for PDF, DOC, DOCX, and JSON files
- **File Size Validation**: 100MB maximum file size limit
- **Real-time Upload Progress**: Visual feedback during file uploads
- **File Management**: View, delete, and manage uploaded files
- **Responsive Design**: Works on desktop and mobile devices

### AI Features
- **Document Analysis**: AI-powered content analysis using OpenAI
- **Smart Summaries**: Automatic generation of document summaries
- **Content Insights**: Extract key information from uploaded documents

### User Experience
- **Drag & Drop**: Intuitive file selection interface
- **Pagination**: Efficient browsing of uploaded files
- **Error Handling**: Comprehensive error messages and validation
- **Loading States**: Smooth user experience with loading indicators

## How to Run Locally

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- AWS account with S3 bucket
- OpenAI API key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file_upload_system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=your-bucket-name

   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open localhost:3000 in your browser

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Example Output

### File Upload Interface
```
┌─────────────────────────────────────────┐
│  File Upload System                     │
├─────────────────────────────────────────┤
│  [Select File]                          │
│  📄 example-document.pdf (2.5MB)       │
│  [Upload]                               │
└─────────────────────────────────────────┘
```

### Uploaded Files List
```
┌─────────────────────────────────────────┐
│  Uploaded Files                         │
├─────────────────────────────────────────┤
│  1. 📄 project-proposal.pdf            │
│     Analyzed: 2024-01-15 10:30 AM      │
│     [View Summary] [Delete]            │
│                                         │
│  2. 📄 technical-specs.docx            │
│     Analyzed: 2024-01-14 3:45 PM       │
│     [View Summary] [Delete]            │
└─────────────────────────────────────────┘
```

### AI Analysis Summary
```
┌─────────────────────────────────────────┐
│  Document Summary                      │
├─────────────────────────────────────────┤
│  File: project-proposal.pdf            │
│                                         │
│  Summary:                              │
│  This document outlines a comprehensive │
│  project proposal for developing a     │
│  new web application. It includes...     │
│                                         │
│  Analyzed: Jan 15, 2024 10:30 AM       │
└─────────────────────────────────────────┘
```

## Use Cases

### Business Applications
- **Document Management**: Centralized storage for business documents
- **Contract Analysis**: AI-powered review of legal documents
- **Report Processing**: Automated analysis of business reports

### Educational Use
- **Assignment Submission**: Student file submission system
- **Research Papers**: Analysis of academic documents
- **Course Materials**: Management of educational content

### Development Workflow
- **API Documentation**: Store and analyze technical documentation
- **Code Reviews**: Upload and analyze code documentation
- **Project Management**: Document storage for project artifacts

### Personal Use
- **Resume Storage**: Keep track of different resume versions
- **Portfolio Management**: Store and analyze portfolio documents
- **Research Organization**: Manage research papers and notes


## Security Features

- **File Type Validation**: Only allowed file types accepted
- **Size Limits**: 100MB maximum file size
- **AWS IAM**: Secure AWS credentials management
- **MongoDB Security**: Connection string with authentication

## Future Enhancements

- **Advanced Search**: Full-text search across uploaded documents
- **Batch Upload**: Multiple file upload capability
- **Export Options**: Download analysis results as PDF/JSON
- **Webhooks**: Real-time notifications for file processing
- **Version Control**: Track document versions and changes

## License

MIT License - Free To Use, and Extend

## Built By: Rajavelavan Appaiyachetty
Grab Ideas, Build, Share, Repeat!
