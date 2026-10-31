import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { api } from '../../services/api';

interface DocumentUploadZoneProps {
  applicationId: string;
  onUploadSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'FIRE_NOC', label: 'Fire Safety NOC Certificate (Directorate of Fire Services)' },
  { value: 'LAND_DOCUMENT', label: 'Land Ownership / Perpetual Registered Lease Deed' },
  { value: 'AICTE_APPROVAL', label: 'Prior Regulatory Sanction & Affiliation Order' },
  { value: 'BUILDING_PLAN', label: 'Municipal Approved Campus Layout & Architectural Blueprint' },
  { value: 'SOCIETY_REGISTRATION', label: 'Educational Society / Public Trust Charter' },
  { value: 'FACULTY_LIST', label: 'Cadre Ratio Certified Faculty Roll & Biometrics' },
  { value: 'FINANCIAL_AUDIT', label: 'Statutory Audited Balance Sheet with CA UDIN' }
];

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  applicationId,
  onUploadSuccess
}) => {
  const [selectedType, setSelectedType] = useState('FIRE_NOC');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select or drop a document to upload');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('documentType', selectedType);
      formData.append('file', selectedFile);

      await api.uploadDocument(formData);
      setSuccessMsg(`Document "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-trust-midnight/60 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white">Upload Statutory Clearance Document</h4>
          <p className="text-xs text-slate-400">Accepted formats: PDF, SVG, JPG, PNG (Max 15MB)</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Document Type Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Select Document Category
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-trust-teal"
        >
          {DOCUMENT_TYPES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
          isDragging
            ? 'border-trust-teal bg-trust-teal/10'
            : 'border-slate-800 hover:border-trust-blue/60 bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.svg"
          onChange={handleFileChange}
          className="hidden"
        />

        <UploadCloud className="w-8 h-8 text-trust-teal mx-auto mb-2 animate-bounce" />
        <p className="text-xs font-semibold text-white">
          {selectedFile ? (
            <span className="text-trust-teal">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          ) : (
            'Drag and drop certificate here, or click to browse files'
          )}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Cryptographic SHA-256 hash will be generated upon upload for registry cross-referencing.
        </p>
      </div>

      {/* Action Upload Button */}
      {selectedFile && (
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={handleUpload}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-trust-blue hover:bg-blue-600 text-white transition shadow-md shadow-blue-500/20"
          >
            {isUploading ? 'Hashing & Uploading...' : 'Upload Document'}
          </button>
        </div>
      )}
    </div>
  );
};
