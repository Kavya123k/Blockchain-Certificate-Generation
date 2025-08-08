import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Hash, Calendar, User, Building, Award, QrCode } from 'lucide-react';
import { BlockchainService, Certificate } from '../services/BlockchainService';

export function CertificateVerifier() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'hash' | 'name'>('id');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'verified' | 'invalid' | 'not-found'>('idle');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setVerificationStatus('loading');
    
    try {
      let foundCertificate: Certificate | null = null;
      
      if (searchType === 'id') {
        foundCertificate = BlockchainService.getCertificateById(searchTerm.trim());
      } else if (searchType === 'hash') {
        foundCertificate = BlockchainService.getCertificateByHash(searchTerm.trim());
      } else if (searchType === 'name') {
        const allCertificates = BlockchainService.getAllCertificates();
        foundCertificate = allCertificates.find(cert => 
          cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase())
        ) || null;
      }
      
      if (foundCertificate) {
        setCertificate(foundCertificate);
        
        // Verify the certificate
        const isValid = await BlockchainService.verifyCertificate(foundCertificate);
        setVerificationStatus(isValid ? 'verified' : 'invalid');
      } else {
        setCertificate(null);
        setVerificationStatus('not-found');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'invalid': return 'text-red-600 bg-red-50 border-red-200';
      case 'not-found': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'invalid': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'not-found': return <XCircle className="w-6 h-6 text-yellow-600" />;
      case 'loading': return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <Search className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'verified': return 'Certificate is valid and verified on the blockchain';
      case 'invalid': return 'Certificate is invalid or has been tampered with';
      case 'not-found': return 'Certificate not found in the blockchain';
      case 'loading': return 'Verifying certificate...';
      default: return 'Enter a certificate ID, hash, or recipient name to verify';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Certificate</h2>
            <p className="text-gray-600">Enter certificate details to verify authenticity on the blockchain</p>
          </div>

          {/* Search Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'id' | 'hash' | 'name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="id">Certificate ID</option>
                <option value="hash">Certificate Hash</option>
                <option value="name">Recipient Name/Email</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'id' && 'Certificate ID'}
                {searchType === 'hash' && 'Certificate Hash'}
                {searchType === 'name' && 'Recipient Name or Email'}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Enter ${searchType === 'id' ? 'certificate ID' : searchType === 'hash' ? 'certificate hash' : 'recipient name or email'}`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {verificationStatus !== 'idle' && (
            <div className={`mt-8 p-4 rounded-lg border-2 ${getStatusColor()}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <h3 className="font-semibold text-lg">Verification Status</h3>
                  <p>{getStatusMessage()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Details */}
          {certificate && verificationStatus === 'verified' && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Certificate Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Recipient</p>
                            <p className="text-gray-700">{certificate.recipientName}</p>
                            <p className="text-sm text-gray-600">{certificate.recipientEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Course</p>
                            <p className="text-gray-700">{certificate.courseName}</p>
                            {certificate.grade && (
                              <p className="text-sm text-gray-600">Grade: {certificate.grade}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Building className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Institution</p>
                            <p className="text-gray-700">{certificate.institutionName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-orange-600 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Issue Date</p>
                            <p className="text-gray-700">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-orange-600 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Completion Date</p>
                            <p className="text-gray-700">{new Date(certificate.completionDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Hash className="w-5 h-5 text-gray-600 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Certificate Hash</p>
                            <p className="text-xs text-gray-600 font-mono break-all">{certificate.certificateHash}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {certificate.additionalInfo && (
                      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">Additional Information</p>
                        <p className="text-gray-700">{certificate.additionalInfo}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Blockchain Verification</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Block Index:</span>
                        <span className="font-mono">#{certificate.blockIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Block Hash:</span>
                        <span className="font-mono text-xs">{certificate.blockHash.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certificate ID:</span>
                        <span className="font-mono text-xs">{certificate.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-start space-y-4">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                    <QrCode className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-2">QR Code</p>
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-xs text-gray-600">QR Code</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}