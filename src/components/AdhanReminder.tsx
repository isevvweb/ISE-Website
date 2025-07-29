import React, { useEffect } from "react";
import { BellRing } from "lucide-react";

interface AdhanReminderProps {
  prayerName: string;
  onClose: () => void;
}

const AdhanReminder: React.FC<AdhanReminderProps> = ({ prayerName, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // Automatically close after 8 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground animate-fade-in">
      <div className="text-center p-8 md:p-16">
        <BellRing className="h-48 w-48 mx-auto mb-8 animate-pulse" />
        <h1 className="text-7xl md:text-8xl font-extrabold mb-4">
          Adhan for {prayerName}
        </h1>
        <p className="text-5xl md:text-6xl font-semibold">
          in 10 Minutes!
        </p>
      </div>
    </div>
  );
};

export default AdhanReminder;