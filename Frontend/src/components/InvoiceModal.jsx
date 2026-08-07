import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';

export default function InvoiceModal({ order, onClose }) {
  const printRef = useRef();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      {/* Hide the modal UI when printing, but keep the invoice content visible */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice, #printable-invoice * {
              visibility: visible;
            }
            #printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            /* Hide print and close buttons during print */
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center no-print">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Printer size={20} className="text-orange-600" /> Print Invoice
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-gray-100">
          <div 
            id="printable-invoice" 
            ref={printRef}
            className="bg-white p-6 shadow-sm border border-gray-200 w-full max-w-[320px] text-sm text-gray-800 font-mono"
            style={{ minHeight: '400px' }}
          >
            <div className="text-center mb-6 border-b border-dashed border-gray-400 pb-4">
              <h1 className="text-xl font-bold uppercase mb-1">Coffee Shop</h1>
              <p className="text-xs text-gray-500">123 Street, Phnom Penh</p>
              <p className="text-xs text-gray-500">Tel: 012 345 678</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Order No:</span>
                <span className="font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Date:</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Status:</span>
                <span>{order.status}</span>
              </div>
            </div>
            
            <table className="w-full mb-4 border-b border-dashed border-gray-400 pb-4">
              <thead>
                <tr className="border-y border-dashed border-gray-400">
                  <th className="py-1 text-left font-normal">Item</th>
                  <th className="py-1 text-center font-normal">Qty</th>
                  <th className="py-1 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1 truncate max-w-[120px]">{item.menu?.name || 'Unknown Item'}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">${item.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mb-6">
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount:</span>
                <span>${order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-400 pt-4">
              <p>Thank you for your visit!</p>
              <p>Please come again.</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-3 no-print bg-white rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
