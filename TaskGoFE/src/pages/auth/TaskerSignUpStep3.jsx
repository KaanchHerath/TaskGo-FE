import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaFileAlt, FaTimes } from 'react-icons/fa';
import { validateStep3, validateFile } from '../../utils/validation';

const TaskerSignUpStep3 = ({ onSubmit, onBack, initialData = {} }) => {
  const [idDocument, setIdDocument] = useState(initialData.idDocument || null);
  const [qualificationDocuments, setQualificationDocuments] = useState(initialData.qualificationDocuments || []);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idInputRef = useRef();
  const qualInputRef = useRef();

  const handleIdDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.isValid) {
        setIdDocument(file);
        setErrors(prev => ({ ...prev, idDocument: null }));
      } else {
        setErrors(prev => ({ ...prev, idDocument: validation.error }));
        // Clear the input
        e.target.value = '';
      }
    }
  };

  const handleQualDocsChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const fileErrors = [];
    
    files.forEach((file, index) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        fileErrors.push(`File ${index + 1}: ${validation.error}`);
      }
    });
    
    if (fileErrors.length > 0) {
      setErrors(prev => ({ ...prev, qualificationDocuments: fileErrors.join(', ') }));
    } else {
      setErrors(prev => ({ ...prev, qualificationDocuments: null }));
    }
    
    setQualificationDocuments(prev => [...prev, ...validFiles]);
  };

  const handleIdDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validation = validateFile(file);
      if (validation.isValid) {
        setIdDocument(file);
        setErrors(prev => ({ ...prev, idDocument: null }));
      } else {
        setErrors(prev => ({ ...prev, idDocument: validation.error }));
      }
    }
  };

  const handleIdDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveIdDoc = () => {
    setIdDocument(null);
    setErrors(prev => ({ ...prev, idDocument: null }));
    if (idInputRef.current) {
      idInputRef.current.value = '';
    }
  };

  const handleRemoveQualDoc = (index) => {
    const newDocs = qualificationDocuments.filter((_, i) => i !== index);
    setQualificationDocuments(newDocs);
    
    // Clear error if all files are now valid
    if (newDocs.length === 0) {
      setErrors(prev => ({ ...prev, qualificationDocuments: null }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📎';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {
      idDocument: true,
      qualificationDocuments: true
    };
    setTouched(allTouched);
    
    // Validate entire form
    const validation = validateStep3({ idDocument, qualificationDocuments });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    // If validation passes, proceed to submission
    onSubmit(validation.cleanData);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Identification document</h2>
        <p className="text-center text-sm text-gray-600 mt-2">Upload your documents to verify your identity</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Upload ID Document <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">ID/Passport/Driving license (Max 5MB, PDF or Image)</p>
          
          {!idDocument ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-blue-500 transition cursor-pointer ${
                touched.idDocument && errors.idDocument ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              onClick={() => idInputRef.current.click()}
              onDrop={handleIdDrop}
              onDragOver={handleIdDragOver}
            >
              <FaCloudUploadAlt className="w-10 h-10 mb-2" />
              <span>Browse file or drop here</span>
              <span className="text-xs text-gray-400 mt-1">Max file size 5 MB</span>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleIdDocChange}
                ref={idInputRef}
                className="hidden"
                required
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(idDocument.type)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{idDocument.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(idDocument.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveIdDoc}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
          
          {touched.idDocument && errors.idDocument && (
            <p className="text-red-500 text-sm mt-1">{errors.idDocument}</p>
          )}
          
          {touched.idDocument && !errors.idDocument && idDocument && (
            <p className="text-green-500 text-sm mt-1">✓ ID document uploaded successfully</p>
          )}
        </div>
        
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Upload Qualification Documents <span className="text-gray-500">(Optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Certificates, diplomas, or other relevant documents (Max 5MB each, PDF or Image)</p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-blue-500 transition cursor-pointer ${
              touched.qualificationDocuments && errors.qualificationDocuments ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            onClick={() => qualInputRef.current.click()}
          >
            <FaCloudUploadAlt className="w-8 h-8 mb-2" />
            <span>Add qualification documents</span>
            <span className="text-xs text-gray-400 mt-1">Max 5 files, 5MB each</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleQualDocsChange}
              ref={qualInputRef}
              className="hidden"
            />
          </div>
          
          {qualificationDocuments.length > 0 && (
            <div className="mt-3 space-y-2">
              {qualificationDocuments.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQualDoc(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {touched.qualificationDocuments && errors.qualificationDocuments && (
            <p className="text-red-500 text-sm mt-1">{errors.qualificationDocuments}</p>
          )}
          
          {touched.qualificationDocuments && !errors.qualificationDocuments && qualificationDocuments.length > 0 && (
            <p className="text-green-500 text-sm mt-1">✓ {qualificationDocuments.length} qualification document{qualificationDocuments.length > 1 ? 's' : ''} uploaded</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {onBack && (
            <button 
              type="button" 
              className="btn bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition" 
              onClick={onBack}
            >
              Back
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
      
      <div className="text-center text-sm mt-4">
        Already have an account? <a href="/login" className="font-semibold text-black">Sign In</a>
      </div>
    </div>
  );
};

export default TaskerSignUpStep3; 