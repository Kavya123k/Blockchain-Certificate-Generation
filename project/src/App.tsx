import React, { useState, useEffect } from 'react';
import { Shield, Award, Search, Plus, FileCheck, Hash, Users, BookOpen } from 'lucide-react';
import { CertificateIssuer } from './components/CertificateIssuer';
import { CertificateVerifier } from './components/CertificateVerifier';
import { BlockchainViewer } from './components/BlockchainViewer';
import { InstitutionManager } from './components/InstitutionManager';
import { CertificateManager } from './components/CertificateManager';
import { BlockchainService } from './services/BlockchainService';

type TabType = 'issue' | 'verify' | 'blockchain' | 'institutions' | 'certificates';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('verify');
  const [blockchainStats, setBlockchainStats] = useState({
    totalCertificates: 0,
    totalBlocks: 0,
    totalInstitutions: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const certificates = BlockchainService.getAllCertificates();
      const blockchain = BlockchainService.getBlockchain();
      const institutions = BlockchainService.getAllInstitutions();
      
      setBlockchainStats({
        totalCertificates: certificates.length,
        totalBlocks: blockchain.length,
        totalInstitutions: institutions.length
      });
    };

    updateStats();
    
    // Update stats periodically
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'verify' as TabType, label: 'Verify Certificate', icon: Search },
    { id: 'issue' as TabType, label: 'Issue Certificate', icon: Plus },
    { id: 'certificates' as TabType, label: 'Manage Certificates', icon: Award },
    { id: 'institutions' as TabType, label: 'Institutions', icon: Users },
    { id: 'blockchain' as TabType, label: 'Blockchain View', icon: Hash }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CertifyChain</h1>
                <p className="text-sm text-gray-600">Blockchain Certificate Verification</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FileCheck className="w-4 h-4 text-green-600" />
                  <span>{blockchainStats.totalCertificates} Certificates</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span>{blockchainStats.totalBlocks} Blocks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>{blockchainStats.totalInstitutions} Institutions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'verify' && <CertificateVerifier />}
        {activeTab === 'issue' && <CertificateIssuer />}
        {activeTab === 'certificates' && <CertificateManager />}
        {activeTab === 'institutions' && <InstitutionManager />}
        {activeTab === 'blockchain' && <BlockchainViewer />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Powered by blockchain technology for immutable certificate verification
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;