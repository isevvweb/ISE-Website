import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WhatsAppQRSectionProps {
  communityQrUrl: string;
  youthQrUrl: string;
}

const WhatsAppQRSection: React.FC<WhatsAppQRSectionProps> = ({ communityQrUrl, youthQrUrl }) => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Top Half: Community Linktree QR */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h3 className="text-5xl font-bold text-primary-foreground mb-6 text-center">
          Community Linktree
        </h3>
        <div className="w-[90%] h-[90%] max-w-[600px] max-h-[600px] aspect-square bg-white rounded-lg flex items-center justify-center">
          <img src={communityQrUrl} alt="Community Linktree QR Code" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Bottom Half: Youth Linktree QR */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h3 className="text-5xl font-bold text-primary-foreground mb-6 text-center">
          Youth Linktree
        </h3>
        <div className="w-[90%] h-[90%] max-w-[600px] max-h-[600px] aspect-square bg-white rounded-lg flex items-center justify-center">
          <img src={youthQrUrl} alt="Youth Linktree QR Code" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppQRSection;