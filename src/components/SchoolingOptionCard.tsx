import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SchoolingOptionCardProps {
  title: string;
  bio: string;
  images?: string[];
  contactEmail?: string;
  contactPhone?: string;
}

const SchoolingOptionCard: React.FC<SchoolingOptionCardProps> = ({
  title,
  bio,
  images,
  contactEmail,
  contactPhone,
}) => {
  return (
    <Card className="flex flex-col p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-gray-700 dark:text-gray-300 mb-4">
        <p>{bio}</p>
      </CardContent>

      {images && images.length > 0 && (
        <div className="mb-4">
          {images.length === 1 ? (
            <img src={images[0]} alt={title} className="w-full h-48 object-cover rounded-md" />
          ) : (
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <img src={image} alt={`${title} image ${index + 1}`} className="w-full h-48 object-cover rounded-md" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="flex items-center text-blue-600 hover:underline text-sm">
            <Mail className="h-4 w-4 mr-2" /> {contactEmail}
          </a>
        )}
        {contactPhone && (
          <a href={`tel:${contactPhone}`} className="flex items-center text-blue-600 hover:underline text-sm">
            <Phone className="h-4 w-4 mr-2" /> {contactPhone}
          </a>
        )}
      </div>
    </Card>
  );
};

export default SchoolingOptionCard;