import React, { useState, useEffect } from 'react';
import { Search, Award, Calendar, Building, User, Download, Eye, Trash2, Filter } from 'lucide-react';
import { BlockchainService, Certificate, Institution } from '../services/BlockchainService';

export function CertificateManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, filterInstitution]);

  const loadData = () => {
    setCertificates(BlockchainService.getAllCertificates());
    setInstitutions(BlockchainService.getAllInstitutions());
  };

  const filterCertificates = () => {
    let filtered = certificates;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.recipientName.toLowerCase().includes(search) ||
        cert.recipientEmail.toLowerCase().includes(search) ||
        cert.courseName.toLowerCase().includes(search) ||
        cert.id.toLowerCase().includes(search)
      );
    }

    if (filterInstitution) {
      filtered = filtered.filter(cert => cert.institutionId === filterInstitution);
    }

    setFilteredCertificates(filtered);
  };

  const downloadCertificate = (certificate: Certificate) => {
    const certificateData = {
      ...certificate,
      verificationUrl: `${window.location.origin}?verify=${certificate.id}`
    };
    
    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificate.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteCertificate = (certificateId: string) => {
    if (confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      const updatedCertificates = certificates.filter(c => c.id !== certificateId);
      localStorage.setItem('certify_certificates', JSON.stringify(updatedCertificates));
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Certificate Management</h2>
        <p className="text-gray-600">View and manage all issued certificates</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search Certificates
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, course, or ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Institution
            </label>
            <select
              value={filterInstitution}
              onChange={(e) => setFilterInstitution(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Institutions</option>
              {institutions.map(institution => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Total Certificates: {certificates.length}</p>
              <p>Showing: {filteredCertificates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map(certificate => (
          <div key={certificate.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {certificate.courseName}
                    </h3>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCertificate(certificate)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadCertificate(certificate)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Download certificate"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCertificate(certificate.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete certificate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{certificate.recipientName}</p>
                    <p className="text-gray-600 text-xs">{certificate.recipientEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{certificate.institutionName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {new Date(certificate.issueDate).toLocaleDateString()}
                  </span>
                </div>

                {certificate.grade && (
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Award className="w-3 h-3" />
                    {certificate.grade}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <span>ID: </span>
                    <span className="font-mono">{certificate.id.substring(0, 8)}...</span>
                  </div>
                  <div>
                    <span>Block: </span>
                    <span className="font-mono">#{certificate.blockIndex}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {certificates.length === 0 ? 'No Certificates Yet' : 'No Matching Certificates'}
          </h3>
          <p className="text-gray-600">
            {certificates.length === 0
              ? 'Issue your first certificate to get started.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Certificate Details</h3>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recipient Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> {selectedCertificate.recipientName}</p>
                      <p><span className="text-gray-600">Email:</span> {selectedCertificate.recipientEmail}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Course:</span> {selectedCertificate.courseName}</p>
                      <p><span className="text-gray-600">Institution:</span> {selectedCertificate.institutionName}</p>
                      {selectedCertificate.grade && (
                        <p><span className="text-gray-600">Grade:</span> {selectedCertificate.grade}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dates</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><span className="text-gray-600">Issue Date:</span> {new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Completion Date:</span> {new Date(selectedCertificate.completionDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedCertificate.additionalInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedCertificate.additionalInfo}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Blockchain Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Certificate ID:</span> 
                      <span className="font-mono ml-2">{selectedCertificate.id}</span>
                    </p>
                    <p><span className="text-gray-600">Block Index:</span> #{selectedCertificate.blockIndex}</p>
                    <p><span className="text-gray-600">Certificate Hash:</span></p>
                    <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                      {selectedCertificate.certificateHash}
                    </p>
                    <p><span className="text-gray-600">Block Hash:</span></p>
                    <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                      {selectedCertificate.blockHash}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => downloadCertificate(selectedCertificate)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}