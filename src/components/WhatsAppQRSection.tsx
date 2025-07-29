import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WhatsAppQRSectionProps {
  communityQrUrl: string; // This will now be the single Linktree QR
}

const WhatsAppQRSection: React.FC<WhatsAppQRSectionProps> = ({ communityQrUrl }) => {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center p-6">
      {/* Removed the h3 title from here */}
      <div className="w-[95%] h-[95%] max-w-[700px] max-h-[700px] aspect-square bg-white rounded-lg flex items-center justify-center">
        <img src={communityQrUrl} alt="Community Connection Linktree QR Code" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

export default WhatsAppQRSection;