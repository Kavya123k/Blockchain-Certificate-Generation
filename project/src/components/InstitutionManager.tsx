import React, { useState, useEffect } from 'react';
import { Plus, Building, Mail, MapPin, Key, Check, Edit, Trash2 } from 'lucide-react';
import { BlockchainService, Institution } from '../services/BlockchainService';

export function InstitutionManager() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = () => {
    setInstitutions(BlockchainService.getAllInstitutions());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address) return;

    try {
      const keyPair = await BlockchainService.generateKeyPair();
      
      const institution: Institution = {
        id: editingId || crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        address: formData.address,
        publicKey: keyPair.publicKey,
        createdAt: editingId ? institutions.find(i => i.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        isVerified: editingId ? institutions.find(i => i.id === editingId)?.isVerified || false : false
      };

      BlockchainService.saveInstitution(institution);
      loadInstitutions();
      resetForm();
    } catch (error) {
      console.error('Error saving institution:', error);
      alert('Failed to save institution. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', address: '' });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleEdit = (institution: Institution) => {
    setFormData({
      name: institution.name,
      email: institution.email,
      address: institution.address
    });
    setEditingId(institution.id);
    setIsAddingNew(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this institution?')) {
      // In a real app, you'd need to check for dependencies
      const updatedInstitutions = institutions.filter(i => i.id !== id);
      localStorage.setItem('certify_institutions', JSON.stringify(updatedInstitutions));
      loadInstitutions();
    }
  };

  const toggleVerification = (institution: Institution) => {
    const updatedInstitution = { ...institution, isVerified: !institution.isVerified };
    BlockchainService.saveInstitution(updatedInstitution);
    loadInstitutions();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Institution Management</h2>
          <p className="text-gray-600">Manage certificate-issuing institutions</p>
        </div>
        
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Institution
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingId ? 'Edit Institution' : 'Add New Institution'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter institution name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map(institution => (
          <div key={institution.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {institution.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{institution.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{institution.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVerification(institution)}
                    className={`p-2 rounded-lg transition-colors ${
                      institution.isVerified
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={institution.isVerified ? 'Verified Institution' : 'Click to verify'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Key className="w-3 h-3" />
                    <span>Created {new Date(institution.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(institution)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit institution"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(institution.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete institution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {institution.isVerified && (
                  <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Verified Institution
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {institutions.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Institutions Yet</h3>
          <p className="text-gray-600 mb-6">Add your first institution to start issuing certificates.</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Institution
          </button>
        </div>
      )}
    </div>
  );
}