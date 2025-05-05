'use client';

import React, { useState } from 'react';
import { CertificationItem } from '@/types/resume';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface CertificationsEditorProps {
  certifications: CertificationItem[];
  onChange: (certifications: CertificationItem[]) => void;
}

export default function CertificationsEditor({ certifications, onChange }: CertificationsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentCert, setCurrentCert] = useState<CertificationItem>({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    url: '',
    description: ''
  });

  const handleAddCertification = () => {
    if (currentCert.name.trim() && currentCert.issuer?.trim()) {
      if (editIndex !== null) {
        const updatedCertifications = [...certifications];
        updatedCertifications[editIndex] = currentCert;
        onChange(updatedCertifications);
      } else {
        onChange([...certifications, currentCert]);
      }
      setCurrentCert({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        url: '',
        description: ''
      });
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  const handleEditCertification = (index: number) => {
    setCurrentCert(certifications[index]);
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleRemoveCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onChange(updatedCertifications);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Add your professional certifications and licenses.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#eb3d24] hover:bg-[#d02e17]"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Add Certification
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-[#fbfbfb] p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Certification Name
              </label>
              <input
                type="text"
                value={currentCert.name}
                onChange={(e) => setCurrentCert({ ...currentCert, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="AWS Certified Solutions Architect"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Issuing Organization
              </label>
              <input
                type="text"
                value={currentCert.issuer || ''}
                onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Amazon Web Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <input
                type="month"
                value={currentCert.date || ''}
                onChange={(e) => setCurrentCert({ ...currentCert, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date (Optional)
              </label>
              <input
                type="month"
                value={currentCert.expiryDate || ''}
                onChange={(e) => setCurrentCert({ ...currentCert, expiryDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Credential URL (Optional)
              </label>
              <input
                type="url"
                value={currentCert.url || ''}
                onChange={(e) => setCurrentCert({ ...currentCert, url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://www.credly.com/badges/..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                value={currentCert.description || ''}
                onChange={(e) => setCurrentCert({ ...currentCert, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Brief description of the certification and skills covered"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditIndex(null);
                setCurrentCert({
                  name: '',
                  issuer: '',
                  date: '',
                  expiryDate: '',
                  url: '',
                  description: ''
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCertification}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editIndex !== null ? 'Update' : 'Add'} Certification
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-[#fbfbfb] rounded-lg shadow"
          >
            <div>
              <h3 className="font-medium text-gray-900">{cert.name}</h3>
              <p className="text-sm text-gray-500">
                {cert.issuer}
                {cert.date && ` • Issued ${cert.date}`}
                {cert.expiryDate && ` • Expires ${cert.expiryDate}`}
              </p>
              {cert.description && (
                <p className="mt-1 text-sm text-gray-600">{cert.description}</p>
              )}
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View Credential
                </a>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleEditCertification(index)}
                className="text-gray-400 hover:text-indigo-600"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveCertification(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 