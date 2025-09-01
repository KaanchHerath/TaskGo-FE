import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaStar,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaCheck,
  FaTimes as FaReject,
  FaClock,
  FaBriefcase,
  FaGraduationCap,
  FaMoneyBillWave
} from 'react-icons/fa';
import DocumentViewer from './DocumentViewer';

const TaskerDetails = ({ tasker, onClose, onApprove, onReject }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  const handleViewDocument = (documentUrl, documentType) => {
    setSelectedDocument({ url: documentUrl, type: documentType });
    setShowDocumentViewer(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExperienceColor = (experience) => {
    const colors = {
      '0-1 years': 'bg-yellow-100 text-yellow-800',
      '1-3 years': 'bg-blue-100 text-blue-800',
      '3-5 years': 'bg-green-100 text-green-800',
      '5+ years': 'bg-purple-100 text-purple-800'
    };
    return colors[experience] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tasker Application Review</h2>
            <p className="text-gray-600 mt-1">Review application details and documents</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{tasker.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                  {tasker.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                  {tasker.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                  {tasker.taskerProfile?.province}, {tasker.taskerProfile?.district}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExperienceColor(tasker.taskerProfile?.experience)}`}>
                  {tasker.taskerProfile?.experience || 'Not specified'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <FaMoneyBillWave className="w-4 h-4 mr-2 text-gray-400" />
                  ${tasker.taskerProfile?.hourlyRate || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Skills and Bio */}
          <div className="bg-gray-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBriefcase className="w-5 h-5 mr-2" />
              Skills & Bio
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {tasker.taskerProfile?.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
            </div>
          </div>

          {/* Documents */}
          <div className="bg-gray-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaFileAlt className="w-5 h-5 mr-2" />
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Document */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">ID Document</h4>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Required
                  </span>
                </div>
                {tasker.taskerProfile?.idDocument ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {tasker.taskerProfile.idDocument.split('/').pop()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(tasker.taskerProfile.idDocument, 'ID Document')}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <FaEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <a
                        href={tasker.taskerProfile.idDocument}
                        download
                        className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <FaDownload className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">No ID document uploaded</p>
                )}
              </div>

              {/* Qualification Documents */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Qualification Documents</h4>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    Optional
                  </span>
                </div>
                {tasker.taskerProfile?.qualificationDocuments?.length > 0 ? (
                  <div className="space-y-2">
                    {tasker.taskerProfile.qualificationDocuments.map((doc, index) => (
                      <div key={index} className="border-t pt-2">
                        <p className="text-sm text-gray-600">
                          {doc.split('/').pop()}
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={() => handleViewDocument(doc, `Qualification Document ${index + 1}`)}
                            className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <FaEye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <a
                            href={doc}
                            download
                            className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <FaDownload className="w-3 h-3 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No qualification documents uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaClock className="w-5 h-5 mr-2" />
              Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(tasker.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending Approval
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available for Work</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  tasker.taskerProfile?.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tasker.taskerProfile?.isAvailable ? 'Yes' : 'No'}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 p-6 border-t border-slate-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FaReject className="w-4 h-4 mr-2" />
            Reject Application
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaCheck className="w-4 h-4 mr-2" />
            Approve Application
          </button>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskerDetails; 