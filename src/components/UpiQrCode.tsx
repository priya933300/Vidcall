import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { UPI_ID } from '../utils/storage';

interface UpiQrCodeProps {
  amount?: number;
  size?: number;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({ amount, size = 220 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Format standard Indian UPI payment URI:
    // upi://pay?pa=gpay-12200991834@okbizaxis&pn=TalkConnect&am=100&cu=INR&tn=CreditRecharge
    const amountStr = amount ? `&am=${amount}` : '';
    const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('TalkConnect')}${amountStr}&cu=INR&tn=${encodeURIComponent('TalkConnect Credit Recharge')}`;

    QRCode.toCanvas(
      canvasRef.current,
      upiUri,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) console.error('Failed to generate UPI QR code', error);
      }
    );
  }, [amount, size]);

  return (
    <div className="relative inline-flex flex-col items-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
      <canvas ref={canvasRef} className="rounded-lg max-w-full" />
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold text-slate-800 tracking-tight">Scan with any UPI App</p>
        <p className="text-[11px] text-slate-500">GPay, PhonePe, Paytm, BHIM</p>
      </div>
    </div>
  );
};
