"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";

interface QRGeneratorProps {
  url: string;
  title?: string;
}

export default function QRGenerator({ url, title = "DRX Registration" }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: {
          dark: "#1e3a8a",
          light: "#ffffff",
        },
      });
    }
  }, [url]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "drx-registration-qr.png";
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
        <div className="absolute -top-3 -right-3 bg-drx-600 text-white p-2 rounded-full">
          <QrCode className="w-4 h-4" />
        </div>
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <p className="text-xs text-drx-600 font-mono text-center break-all max-w-xs bg-blue-50 px-3 py-2 rounded-lg">
        {url}
      </p>

      <p className="text-sm text-gray-500 text-center max-w-xs">
        This is a permanent QR code. Doctors scan this once to register with DRX.
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-drx-600 text-white rounded-lg hover:bg-drx-700 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 border border-drx-200 text-drx-700 rounded-lg hover:bg-drx-50 transition-colors text-sm font-medium"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
