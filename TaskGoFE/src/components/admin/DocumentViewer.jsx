import React, { useState } from 'react';
import { 
  FaTimes, 
  FaDownload, 
  FaExpand, 
  FaCompress, 
  FaChevronLeft, 
  FaChevronRight,
  FaFilePdf,
  FaFileImage,
  FaFileAlt
} from 'react-icons/fa';

const DocumentViewer = ({ document, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);

  const isPDF = document.url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.url);
  const fileName = document.url.split('/').pop();

  const getFileIcon = () => {
    if (isPDF) return <FaFilePdf className="w-8 h-8 text-red-500" />;
    if (isImage) return <FaFileImage className="w-8 h-8 text-green-500" />;
    return <FaFileAlt className="w-8 h-8 text-blue-500" />;
  };

  const handleDownload = () => {
    const anchor = window.document.createElement('a');
    anchor.href = document.url;
    anchor.download = fileName;
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{document.type}</h3>
              <p className="text-sm text-gray-600">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Zoom Out"
              >
                <FaCompress className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Zoom In"
              >
                <FaExpand className="w-4 h-4" />
              </button>
            </div>
            
            {/* Page Navigation (for PDFs) */}
            {isPDF && totalPages > 1 && (
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  title="Previous Page"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  title="Next Page"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <FaDownload className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-center">
            <div 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-lg"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
              {isPDF ? (
                <iframe
                  src={`${document.url}#page=${currentPage}`}
                  className="w-full"
                  style={{ 
                    height: isFullscreen ? 'calc(100vh - 120px)' : '600px',
                    minWidth: '800px'
                  }}
                  onLoad={(e) => {
                    // Try to get total pages from PDF (this is a simplified approach)
                    // In a real implementation, you might use a PDF library
                    setTotalPages(1); // Default to 1, could be enhanced with PDF.js
                  }}
                />
              ) : isImage ? (
                <img
                  src={document.url}
                  alt={document.type}
                  className="max-w-full h-auto"
                  style={{ 
                    maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '600px'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <div className="text-center">
                    <FaFileAlt className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Document Preview Not Available</p>
                    <p className="text-sm">This file type cannot be previewed in the browser.</p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download to View
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">File:</span> {fileName}
              {isPDF && totalPages > 1 && (
                <span className="ml-4">
                  <span className="font-medium">Pages:</span> {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetZoom}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Reset Zoom
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 