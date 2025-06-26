import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const TaskerSignUpStep3 = ({ onSubmit, onBack, initialData = {} }) => {
  const [idDocument, setIdDocument] = useState(null);
  const [qualificationDocuments, setQualificationDocuments] = useState([]);
  const [error, setError] = useState('');
  const idInputRef = useRef();
  const qualInputRef = useRef();

  const handleIdDocChange = (e) => {
    setIdDocument(e.target.files[0]);
    setError('');
  };

  const handleQualDocsChange = (e) => {
    setQualificationDocuments(Array.from(e.target.files));
  };

  const handleIdDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIdDocument(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleIdDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idDocument) {
      setError('ID Document is required.');
      return;
    }
    onSubmit({ idDocument, qualificationDocuments });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Identification document</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Upload file (ID/Passport/Driving license)</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-blue-500 transition cursor-pointer"
            onClick={() => idInputRef.current.click()}
            onDrop={handleIdDrop}
            onDragOver={handleIdDragOver}
          >
            <FaCloudUploadAlt className="w-10 h-10 mb-2" />
            <span>Browse file or drop here</span>
            <span className="text-xs text-gray-400 mt-1">Max file size 5 MB.</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleIdDocChange}
              ref={idInputRef}
              className="hidden"
              required
            />
            {idDocument && <span className="mt-2 text-sm text-gray-600">Selected: {idDocument.name}</span>}
          </div>
        </div>
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Upload qualification documents</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            multiple
            onChange={handleQualDocsChange}
            ref={qualInputRef}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
          />
          {qualificationDocuments.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {qualificationDocuments.map((file, idx) => <div key={idx}>{file.name}</div>)}
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="flex gap-2">
          {onBack && <button type="button" className="btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg" onClick={onBack}>Back</button>}
          <button type="submit" className="w-full py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition">Submit</button>
        </div>
      </form>
      <div className="text-center text-sm mt-4">
        Already have an account? <a href="/login" className="font-semibold text-black">Sign In</a>
      </div>
    </div>
  );
};

export default TaskerSignUpStep3; 