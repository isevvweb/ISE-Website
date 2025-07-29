import React from "react";
import { format, parseISO } from "date-fns";

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
  return (
    <div className="flex-grow flex flex-col justify-evenly text-center h-full">
      <h3 className="text-5xl font-semibold text-gray-100 mb-4">{announcement.title}</h3>
      {settings.show_descriptions && (
        <p className="text-3xl text-gray-300 mb-6">{announcement.description}</p>
      )}
      {settings.show_images && announcement.image_url && (
        <div className="w-full max-h-[60vh] overflow-hidden rounded-md mx-auto mb-4 flex items-center justify-center">
          <img src={announcement.image_url} alt={announcement.title} className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <p className="text-2xl text-gray-400">
        {format(parseISO(announcement.announcement_date), "PPP")}
      </p>
    </div>
  );
};

export default DigitalSignAnnouncementCard;