import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone } from "lucide-react";

interface YouthTeamMemberCardProps {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
}

const YouthTeamMemberCard: React.FC<YouthTeamMemberCardProps> = ({
  name,
  title,
  bio,
  imageUrl,
  email,
  phone,
}) => {
  return (
    <Card className="flex flex-col items-center text-center p-6">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={imageUrl} alt={`${name}'s picture`} />
        <AvatarFallback className="text-4xl font-bold">{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <CardDescription className="text-muted-foreground">{title}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <p>{bio}</p>
      </CardContent>
      <div className="flex flex-col gap-2">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center text-blue-600 hover:underline text-sm">
            <Mail className="h-4 w-4 mr-2" /> {email}
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center text-blue-600 hover:underline text-sm">
            <Phone className="h-4 w-4 mr-2" /> {phone}
          </a>
        )}
      </div>
    </Card>
  );
};

export default YouthTeamMemberCard;