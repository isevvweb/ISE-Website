import React from "react";
import { BellRing } from "lucide-react";

interface AdhanReminderProps {
  prayerName: string;
  timeRemainingText: string;
  onClose: () => void; // Keep onClose, but it will be triggered by parent
}

const AdhanReminder: React.FC<AdhanReminderProps> = ({ prayerName, timeRemainingText, onClose }) => {
  // Removed the useEffect with setTimeout here.
  // The parent component (DigitalSign) will now manage the dismissal.

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground animate-fade-in">
      <div className="text-center p-8 md:p-16">
        <BellRing className="h-48 w-48 mx-auto mb-8 animate-pulse" />
        <h1 className="text-7xl md:text-8xl font-extrabold mb-4">
          Adhan for {prayerName}
        </h1>
        <p className="text-5xl md:text-6xl font-semibold">
          {timeRemainingText}
        </p>
      </div>
    </div>
  );
};

export default AdhanReminder;