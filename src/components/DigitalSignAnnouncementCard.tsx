import React from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils"; // Import cn utility for conditional class merging

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string; // ISO date string
  image_url?: string;
  is_active: boolean;
  posted_at?: string;
}

interface DigitalSignSettings {
  max_announcements: number;
  show_descriptions: boolean;
  show_images: boolean;
  rotation_interval_seconds: number;
}

interface DigitalSignAnnouncementCardProps {
  announcement: Announcement;
  settings: DigitalSignSettings;
}

const DigitalSignAnnouncementCard: React.FC<DigitalSignAnnouncementCardProps> = ({ announcement, settings }) => {
  const showImage = settings.show_images && announcement.image_url;

  return (
    <div className="flex-grow flex flex-col justify-center text-center h-full p-4"> {/* Added p-4 for internal padding */}
      <h3 className={cn(
        "font-semibold text-gray-100 mb-4",
        showImage ? "text-5xl" : "text-7xl md:text-8xl lg:text-9xl leading-tight" // Larger text if no image
      )}>
        {announcement.title}
      </h3>
      {settings.show_descriptions && (
        <p className={cn(
          "text-gray-300 mb-6",
          showImage ? "text-3xl" : "text-4xl md:text-5xl lg:text-6xl" // Larger text if no image
        )}>
          {announcement.description}
        </p>
      )}
      {showImage && (
        <div className="w-full max-h-[60vh] overflow-hidden rounded-md mx-auto mb-4 flex items-center justify-center">
          <img src={announcement.image_url} alt={announcement.title} className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <p className={cn(
        "text-gray-400",
        showImage ? "text-2xl" : "text-3xl" // Slightly larger date if no image
      )}>
        {format(parseISO(announcement.announcement_date), "PPP")}
      </p>
    </div>
  );
};

export default DigitalSignAnnouncementCard;