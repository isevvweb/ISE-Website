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
    <div className="fixed top-0 left-0 right-0 h-[calc(100vh-17rem)] z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground animate-fade-in p-8 md:p-16 overflow-hidden">
      <BellRing className="h-48 w-48 mx-auto mb-8 animate-pulse" />
      <h1 className="text-6xl md:text-7xl font-extrabold mb-4">
        Adhan for {prayerName}
      </h1>
      <p className="text-4xl md:text-5xl font-semibold">
        {timeRemainingText}
      </p>
    </div>
  );
};

export default AdhanReminder;