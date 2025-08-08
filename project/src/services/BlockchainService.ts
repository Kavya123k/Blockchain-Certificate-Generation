export interface Certificate {
  id: string;
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  institutionId: string;
  institutionName: string;
  issueDate: string;
  completionDate: string;
  certificateHash: string;
  blockHash: string;
  blockIndex: number;
  grade?: string;
  additionalInfo?: string;
  qrCode: string;
}

export interface Institution {
  id: string;
  name: string;
  email: string;
  address: string;
  publicKey: string;
  createdAt: string;
  isVerified: boolean;
}

export interface Block {
  index: number;
  timestamp: string;
  data: Certificate[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export class BlockchainService {
  private static readonly STORAGE_KEY_BLOCKCHAIN = 'certify_blockchain';
  private static readonly STORAGE_KEY_CERTIFICATES = 'certify_certificates';
  private static readonly STORAGE_KEY_INSTITUTIONS = 'certify_institutions';

  static async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey)
    };
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static getBlockchain(): Block[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_BLOCKCHAIN);
    if (!stored) {
      const genesisBlock = this.createGenesisBlock();
      this.saveBlockchain([genesisBlock]);
      return [genesisBlock];
    }
    return JSON.parse(stored);
  }

  private static createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: new Date().toISOString(),
      data: [],
      previousHash: '0',
      hash: '000000',
      nonce: 0
    };
  }

  static async createBlock(certificates: Certificate[]): Promise<Block> {
    const blockchain = this.getBlockchain();
    const previousBlock = blockchain[blockchain.length - 1];
    
    const block: Block = {
      index: blockchain.length,
      timestamp: new Date().toISOString(),
      data: certificates,
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0
    };

    // Simple proof-of-work (for demonstration)
    const target = '0000';
    do {
      block.nonce++;
      const blockString = JSON.stringify({
        index: block.index,
        timestamp: block.timestamp,
        data: block.data,
        previousHash: block.previousHash,
        nonce: block.nonce
      });
      block.hash = await this.generateHash(blockString);
    } while (!block.hash.startsWith(target));

    return block;
  }

  static async addCertificateToBlockchain(certificate: Certificate): Promise<void> {
    const blockchain = this.getBlockchain();
    const block = await this.createBlock([certificate]);
    
    blockchain.push(block);
    this.saveBlockchain(blockchain);

    // Update certificate with block information
    certificate.blockHash = block.hash;
    certificate.blockIndex = block.index;
    
    this.saveCertificate(certificate);
  }

  private static saveBlockchain(blockchain: Block[]): void {
    localStorage.setItem(this.STORAGE_KEY_BLOCKCHAIN, JSON.stringify(blockchain));
  }

  static getAllCertificates(): Certificate[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_CERTIFICATES);
    return stored ? JSON.parse(stored) : [];
  }

  static saveCertificate(certificate: Certificate): void {
    const certificates = this.getAllCertificates();
    const existingIndex = certificates.findIndex(c => c.id === certificate.id);
    
    if (existingIndex >= 0) {
      certificates[existingIndex] = certificate;
    } else {
      certificates.push(certificate);
    }
    
    localStorage.setItem(this.STORAGE_KEY_CERTIFICATES, JSON.stringify(certificates));
  }

  static getCertificateById(id: string): Certificate | null {
    const certificates = this.getAllCertificates();
    return certificates.find(c => c.id === id) || null;
  }

  static getCertificateByHash(hash: string): Certificate | null {
    const certificates = this.getAllCertificates();
    return certificates.find(c => c.certificateHash === hash) || null;
  }

  static async verifyCertificate(certificate: Certificate): Promise<boolean> {
    // Verify certificate hash
    const certificateData = {
      recipientName: certificate.recipientName,
      recipientEmail: certificate.recipientEmail,
      courseName: certificate.courseName,
      institutionId: certificate.institutionId,
      issueDate: certificate.issueDate,
      completionDate: certificate.completionDate
    };
    
    const expectedHash = await this.generateHash(JSON.stringify(certificateData));
    if (expectedHash !== certificate.certificateHash) {
      return false;
    }

    // Verify block integrity
    const blockchain = this.getBlockchain();
    const block = blockchain.find(b => b.hash === certificate.blockHash);
    if (!block) {
      return false;
    }

    // Verify block hash
    const blockString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce
    });
    
    const blockHash = await this.generateHash(blockString);
    return blockHash === block.hash;
  }

  static getAllInstitutions(): Institution[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_INSTITUTIONS);
    return stored ? JSON.parse(stored) : [];
  }

  static saveInstitution(institution: Institution): void {
    const institutions = this.getAllInstitutions();
    const existingIndex = institutions.findIndex(i => i.id === institution.id);
    
    if (existingIndex >= 0) {
      institutions[existingIndex] = institution;
    } else {
      institutions.push(institution);
    }
    
    localStorage.setItem(this.STORAGE_KEY_INSTITUTIONS, JSON.stringify(institutions));
  }

  static getInstitutionById(id: string): Institution | null {
    const institutions = this.getAllInstitutions();
    return institutions.find(i => i.id === id) || null;
  }

  static async generateQRCode(certificateId: string): Promise<string> {
    // Generate a simple QR code URL (in a real app, you'd use a QR library)
    const verificationUrl = `${window.location.origin}?verify=${certificateId}`;
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="white"/>
        <text x="50" y="50" text-anchor="middle" fill="black" font-size="8">QR: ${certificateId}</text>
      </svg>
    `)}`;
  }
}