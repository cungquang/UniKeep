import '../../assets/budget.css'
import React, { useState } from 'react';
import axios from 'axios';

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('');

  //Function handle use select file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      setFile(selectedFile);
      setFilePath(selectedFile.name);           // Set file path
    }
  };

  //Function handle upload
  const handleUpload = async () => {
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('file', file);

        //Access local storage -> get "access token" -> 
        const decodedToken = await axios.post('/decode-token');
        const userId = decodedToken;

        //Upload the file to blob
        const response = await axios.post('http://localhost:2024/api/file/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        //Retrieve information from response
        const { objectName, signedUrl, createdDate, lastModified } = response.data;        

        //Read data in the receipt
        const receiptData = await axios.post('https://aiservicereadreceipt.azurewebsites.net/api/aiserviceextractreceipt', { RequestUrl: signedUrl });
        
        //Temporary store into local storage
        localStorage.setItem('recent_receipt', JSON.stringify({
          userId: userId,
          objectName: objectName,
          receiptData: receiptData.data
        }));

        //Write into the database:
        const recordFile = {
          userId: userId,
          objectName: objectName,
          createdDate: createdDate,
          lastModified: lastModified,
          isRead: true,
          isReceipt: false
        }
        
        //Post record of the uploaded file into database
        await axios.post('http://localhost:2024/api/fileMetadata/insertRecord', recordFile);

        // Reset file state after successful upload
        setFile(null);
        setFilePath('');
    } catch (error) {
        console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='file-external-container'>
        <div className="file-upload-container">
            <input type="file" onChange={handleFileChange} />
            <div>{filePath ? filePath : 'Click to Select File to Upload'}</div>
            {file && ''}
        </div>
        <div className='upload-button'>
            <button onClick={handleUpload}>Upload</button>
        </div>
    </div>

  );
};

export default FileUploadComponent;