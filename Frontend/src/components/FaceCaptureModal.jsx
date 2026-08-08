import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Loader2 } from 'lucide-react';

export default function FaceCaptureModal({ isOpen, onClose, onCapture, title = "Face Recognition" }) {
  const webcamRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const capture = useCallback(async () => {
    setIsProcessing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob/file
        const fetchResponse = await fetch(imageSrc);
        const blob = await fetchResponse.blob();
        const file = new File([blob], "face_capture.jpg", { type: "image/jpeg" });
        await onCapture(file);
      }
    } catch (error) {
      console.error("Capture failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef, onCapture]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-2 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">Please position your face clearly in the frame.</p>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-gray-900 border-4 border-gray-100 shadow-inner">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user"
            }}
            className="w-full h-auto object-cover transform -scale-x-100"
          />
          
          {/* Overlay guide */}
          <div className="absolute inset-0 border-2 border-dashed border-white/30 m-8 rounded-full pointer-events-none"></div>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-white mb-2" size={40} />
              <p className="text-white font-medium">Processing...</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={capture}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-bold text-lg shadow-md transition-all transform hover:scale-105 active:scale-95 ${
              isProcessing ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            <Camera size={24} />
            {isProcessing ? 'Capturing...' : 'Capture Face'}
          </button>
        </div>
      </div>
    </div>
  );
}
