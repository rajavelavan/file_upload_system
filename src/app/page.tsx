'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type FileItem = {
  _id: string;
  fileName: string;
  fileUrl: string;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allowedFileTypes = [
    'application/pdf',                // PDF files
    'application/msword',            // DOC files
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
    'application/json'               // JSON files
  ];
  const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes

  const validateFile = (file: File): boolean => {
    if (!allowedFileTypes.includes(file.type)) {
      setMessage('Invalid file type. Please upload PDF, DOC, DOCX, or JSON files only.');
      return false;
    }

    if (file.size > maxFileSize) {
      setMessage('File size exceeds 100MB limit.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    try {
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('File uploaded successfully!');
        setFiles((prev) => [data, ...prev]);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage(data.error || 'Upload failed!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed! Please try again.');
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('/api/upload');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
          
        if (data.length === 0) {
          setMessage('There is no file uploaded');
          setFiles([]);
        } else {
          setFiles(data);
          setMessage('');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setMessage('Failed to fetch files');
      }
    };
    fetchFiles();
  }, []);

  const totalPages = Math.ceil(files.length / rowsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleSelectedFileDelete = () => {
    console.log('selected file delete clicked');
  }

  const handleUploadedFileClick = (fileId: string) => {
    console.log('Uploaded file clicked', fileId);
    router.push(`summary/${fileId}`);
  };

  const handleUploadedFileDelete = async (fileId: string) => {
    console.log('Uploaded file clicked', fileId);
    // try {
    //   const res = await fetch(`/api/upload/${fileId}`, {
    //     method: 'DELETE',
    //   });

    //   if (res.ok) {
    //     setFiles(files.filter(file => file._id !== fileId));
    //     setMessage('File deleted successfully!');
    //   } else {
    //     setMessage('Failed to delete file');
    //   }
    // } catch (error) {
    //   console.error('Delete error:', error);
    //   setMessage('Failed to delete file');
    // }
  };

  const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    rowsPerPage, 
    onRowsPerPageChange 
  }) => {
    return (
      <div className="flex items-center gap-4 mt-4 justify-between">
        <select 
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
        </select>
        
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className='flex flex-col items-center min-h-screen'>
      <header className='flex h-16 p-3 border-b-2 border-gray-200 w-full items-center justify-center bg-gray-100'>
      <h1 className="text-lg font-bold">File Upload System</h1>
      </header>

      <div className="flex flex-col items-center w-full max-w-2xl p-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.json"
          className="hidden"
        />

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSelectClick}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-lg h-12"
          >
            Select File
          </button>

          {/* {file && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <button
                onClick={handleUpload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Upload File
              </button>
            </div>
          )} */}

          {message && (
            <p className={`mt-2 ${message.includes('successfully') ? 'text-green-700' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 w-full">
          {file && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Selected File</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">File Name</th>
                    <th className="border p-2">Size</th>
                    <th className="border p-2">Type</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">{file.name}</td>
                    <td className="border p-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="border p-2">{file.type.replace('application/', '')}</td>
                    <td className="p-2 flex justify-around gap-2">{file && (
                        <button
                          onClick={handleUpload}
                          className="text-blue-600 rounded hover:text-blue-800"
                        >
                          Upload
                        </button>
                      )}
                      <button
                        className="text-red-600 rounded hover:text-red-800"
                        onClick={handleSelectedFileDelete}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div>
            <h3 className="text-md font-semibold mb-2">Uploaded Files</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">S.No</th>
                  <th className="border p-2 text-left">File Name</th>
                  <th className="border p-2 text-left w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files
                  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                  .map((file, index) => (
                    <tr key={file._id}>
                      <td className="border p-2">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleUploadedFileClick(file._id)}
                          className="text-blue-600 hover:text-blue-800 text-left w-full"
                        >
                          {file.fileName}
                        </button>
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleUploadedFileDelete(file._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {files.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(files.length / rowsPerPage)}
                onPageChange={setCurrentPage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setCurrentPage(1);
                }}
              />
            ) : (
              <p className="text-center text-gray-500 mt-4">No files uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
