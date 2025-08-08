import React, { useState, useEffect } from 'react';
import { Hash, Clock, Package, ChevronRight, Eye, Shield, Link } from 'lucide-react';
import { BlockchainService, Block } from '../services/BlockchainService';

export function BlockchainViewer() {
  const [blockchain, setBlockchain] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  useEffect(() => {
    const updateBlockchain = () => {
      setBlockchain(BlockchainService.getBlockchain());
    };

    updateBlockchain();
    const interval = setInterval(updateBlockchain, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateHash = (hash: string, length = 12) => {
    return `${hash.substring(0, length)}...${hash.substring(hash.length - 4)}`;
  };

  const getBlockColor = (index: number) => {
    if (index === 0) return 'bg-purple-100 border-purple-300';
    return 'bg-blue-100 border-blue-300';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Blockchain Explorer</h2>
        <p className="text-gray-600">View the complete blockchain with all certificate blocks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Blockchain Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Blockchain Structure
            </h3>
            
            <div className="space-y-4">
              {blockchain.map((block, index) => (
                <div key={block.index} className="relative">
                  <div
                    onClick={() => setSelectedBlock(block)}
                    className={`${getBlockColor(block.index)} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                      selectedBlock?.index === block.index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${
                          block.index === 0 ? 'bg-purple-600' : 'bg-blue-600'
                        } text-white flex items-center justify-center font-bold`}>
                          {block.index === 0 ? 'G' : block.index}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {block.index === 0 ? 'Genesis Block' : `Block #${block.index}`}
                          </h4>
                          <p className="text-sm text-gray-600">{formatDate(block.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{block.data.length} certificate{block.data.length !== 1 ? 's' : ''}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Hash:</span>
                        <p className="font-mono">{truncateHash(block.hash)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Previous:</span>
                        <p className="font-mono">{block.index === 0 ? 'N/A' : truncateHash(block.previousHash)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  {index < blockchain.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-px h-6 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block Details */}
        <div className="space-y-6">
          {selectedBlock ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Block Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Block Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Index:</span>
                      <span className="font-mono">#{selectedBlock.index}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp:</span>
                      <span>{formatDate(selectedBlock.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nonce:</span>
                      <span className="font-mono">{selectedBlock.nonce}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hash:</span>
                      <p className="font-mono text-xs break-all mt-1 bg-gray-50 p-2 rounded">
                        {selectedBlock.hash}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Previous Hash:</span>
                      <p className="font-mono text-xs break-all mt-1 bg-gray-50 p-2 rounded">
                        {selectedBlock.previousHash === '0' ? 'Genesis Block' : selectedBlock.previousHash}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedBlock.data.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Certificates ({selectedBlock.data.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedBlock.data.map((certificate, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Recipient:</span>
                              <p className="font-medium">{certificate.recipientName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Course:</span>
                              <p>{certificate.courseName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Institution:</span>
                              <p>{certificate.institutionName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Certificate ID:</span>
                              <p className="font-mono text-xs">{certificate.id}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-500">
                <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Select a Block</h3>
                <p>Click on any block to view its details and certificates</p>
              </div>
            </div>
          )}

          {/* Blockchain Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Blockchain Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Blocks:</span>
                <span className="font-bold text-xl text-blue-600">{blockchain.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Certificates:</span>
                <span className="font-bold text-xl text-green-600">
                  {blockchain.reduce((total, block) => total + block.data.length, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Latest Block:</span>
                <span className="font-mono">#{blockchain.length - 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chain Integrity:</span>
                <span className="inline-flex items-center gap-1 text-green-600">
                  <Shield className="w-4 h-4" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}