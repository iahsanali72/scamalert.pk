'use client';

import { useState } from 'react';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (data: {
    brandName: string;
    platform: string;
    orderDate: string;
    amountPaid: string;
    paymentMethod: string;
    description: string;
    evidenceFile: File | null;
  }) => void;
}

export default function ReportForm({ isOpen, onClose, onSubmitReport }: ReportFormProps) {
  const [brandName, setBrandName] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [orderDate, setOrderDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [description, setDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      brandName,
      platform,
      orderDate,
      amountPaid,
      paymentMethod,
      description,
      evidenceFile,
    });
    setBrandName('');
    setDescription('');
    setAmountPaid('');
    setEvidenceFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-red-500">File Store Fraud Complaint</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold block">Store / Brand Name or Handle</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. @Luxe_Fashions_PK or StoreName"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold block">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-red-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold block">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-red-500"
              >
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold block">Order Date</label>
             <input
  type="date"
  value={orderDate}
  onChange={(e) => setOrderDate(e.target.value)}
  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-red-500 [color-scheme:dark]"
/>
    
            </div>
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold block">Amount (PKR)</label>
              <input
                type="number"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="14500"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold block">Fraud Details</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scam or non-delivery issue..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold block">Upload Receipt / Screenshot Evidence</label>
            <input
              type="file"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              className="w-full text-zinc-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm transition cursor-pointer mt-2">
            Submit & Trigger 72h Notice
          </button>
        </form>
      </div>
    </div>
  );
}