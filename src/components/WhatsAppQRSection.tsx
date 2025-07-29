import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WhatsAppQRSectionProps {
  communityQrUrl: string;
  youthQrUrl: string;
}

const WhatsAppQRSection: React.FC<WhatsAppQRSectionProps> = ({ communityQrUrl, youthQrUrl }) => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Top Half: Community Group QR */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-700 rounded-t-lg shadow-lg mb-4">
        <h3 className="text-5xl font-bold text-primary-foreground mb-6 text-center">
          Join Our Community WhatsApp Group
        </h3>
        <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] bg-white p-4 rounded-lg flex items-center justify-center">
          <img src={communityQrUrl} alt="Community WhatsApp QR Code" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Bottom Half: Youth Group QR */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-700 rounded-b-lg shadow-lg mt-4">
        <h3 className="text-5xl font-bold text-primary-foreground mb-6 text-center">
          Join Our Youth WhatsApp Group
        </h3>
        <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] bg-white p-4 rounded-lg flex items-center justify-center">
          <img src={youthQrUrl} alt="Youth WhatsApp QR Code" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppQRSection;