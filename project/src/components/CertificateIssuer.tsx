import React, { useState, useEffect } from 'react';
import { Plus, Building, User, Award, Calendar, Hash, CheckCircle } from 'lucide-react';
import { BlockchainService, Certificate, Institution } from '../services/BlockchainService';

export function CertificateIssuer() {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    courseName: '',
    institutionId: '',
    completionDate: '',
    grade: '',
    additionalInfo: ''
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    setInstitutions(BlockchainService.getAllInstitutions());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.recipientEmail || !formData.courseName || !formData.institutionId || !formData.completionDate) {
      return;
    }

    setIsSubmitting(true);

    try {
      const institution = BlockchainService.getInstitutionById(formData.institutionId);
      if (!institution) {
        throw new Error('Institution not found');
      }

      const certificateId = crypto.randomUUID();
      const issueDate = new Date().toISOString();

      // Create certificate data for hashing
      const certificateData = {
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        courseName: formData.courseName,
        institutionId: formData.institutionId,
        issueDate,
        completionDate: formData.completionDate
      };

      // Generate certificate hash
      const certificateHash = await BlockchainService.generateHash(JSON.stringify(certificateData));
      const qrCode = await BlockchainService.generateQRCode(certificateId);

      const certificate: Certificate = {
        id: certificateId,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        courseName: formData.courseName,
        institutionId: formData.institutionId,
        institutionName: institution.name,
        issueDate,
        completionDate: formData.completionDate,
        certificateHash,
        blockHash: '', // Will be set when added to blockchain
        blockIndex: 0, // Will be set when added to blockchain
        grade: formData.grade,
        additionalInfo: formData.additionalInfo,
        qrCode
      };

      // Add to blockchain
      await BlockchainService.addCertificateToBlockchain(certificate);

      setIssuedCertificate(certificate);
      
      // Reset form
      setFormData({
        recipientName: '',
        recipientEmail: '',
        courseName: '',
        institutionId: '',
        completionDate: '',
        grade: '',
        additionalInfo: ''
      });

    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCertificate = () => {
    if (!issuedCertificate) return;
    
    const certificateData = {
      ...issuedCertificate,
      verificationUrl: `${window.location.origin}?verify=${issuedCertificate.id}`
    };
    
    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${issuedCertificate.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Issue New Certificate</h2>
            <p className="text-gray-600">Create a new certificate and add it to the blockchain</p>
          </div>

          {!issuedCertificate ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter recipient's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter recipient's email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Institution *
                  </label>
                  <select
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an institution</option>
                    {institutions.map(institution => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Grade (Optional)
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., A+, 95%, Pass"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes or achievements"
                />
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Issuing Certificate...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Issue Certificate
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate Issued Successfully!</h3>
                <p className="text-gray-600">The certificate has been added to the blockchain and is now verifiable.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <h4 className="font-semibold text-gray-900 mb-4">Certificate Details:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Certificate ID:</span>
                    <p className="font-mono text-xs">{issuedCertificate.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Recipient:</span>
                    <p>{issuedCertificate.recipientName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Course:</span>
                    <p>{issuedCertificate.courseName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Block Index:</span>
                    <p>#{issuedCertificate.blockIndex}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Certificate Hash:</span>
                    <p className="font-mono text-xs break-all">{issuedCertificate.certificateHash}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={downloadCertificate}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download Certificate
                </button>
                <button
                  onClick={() => setIssuedCertificate(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Issue Another Certificate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}