import React from "react";
import YouthTeamMemberCard from "@/components/YouthTeamMemberCard";
import SchoolingOptionCard from "@/components/SchoolingOptionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const YouthActivities = () => {
  const youthPrograms = [
    {
      title: "Weekly Youth Halaqa",
      description: "Engage in insightful discussions about Islamic teachings every Saturday after Dhuhr prayer.",
    },
    {
      title: "Sports & Recreation",
      description: "Join us for basketball, soccer, and other fun activities to stay active and build brotherhood/sisterhood.",
    },
    {
      title: "Community Service Projects",
      description: "Participate in local initiatives to give back to the community and embody Islamic values.",
    },
  ];

  const youthTeamMembers = [
    {
      name: "Imam Omar",
      title: "Youth Director",
      bio: "Imam Omar leads our youth programs with passion and dedication, focusing on spiritual growth and community engagement.",
      imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=IO", // Placeholder image
      email: "imam.omar@example.com",
      phone: "555-123-4567",
    },
    {
      name: "Sister Aisha",
      title: "Girls' Coordinator",
      bio: "Sister Aisha organizes empowering events and educational sessions for young Muslimahs.",
      imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=SA", // Placeholder image
      email: "aisha.coord@example.com",
      phone: "555-987-6543",
    },
  ];

  const schoolingOptions = [
    {
      title: "Saturday School",
      bio: "Our Saturday School provides comprehensive Islamic education, including Quranic studies, Arabic language, and Islamic manners.",
      images: ["https://via.placeholder.com/400x225/008000/FFFFFF?text=Saturday+School"], // Changed to single image
      contactEmail: "saturdayschool@example.com",
    },
    {
      title: "Sunday School",
      bio: "Sunday School focuses on foundational Islamic knowledge, stories of the prophets, and character building for younger children.",
      images: ["https://via.placeholder.com/400x225/800080/FFFFFF?text=Sunday+School"], // Changed to single image
      contactEmail: "sundayschool@example.com",
    },
    {
      title: "Little Pioneers Academy",
      bio: "A full-time Islamic preschool and kindergarten, offering a nurturing environment for early childhood development with an Islamic curriculum.",
      images: ["https://via.placeholder.com/400x225/FFA500/FFFFFF?text=LPA"], // Changed to single image
      contactPhone: "555-111-2222",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Youth Activities & Education</h1>

      {/* Youth Program Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Youth Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Upcoming Events Calendar</h3>
            <div className="relative w-full" style={{ paddingBottom: "75%" }}> {/* 4:3 Aspect Ratio */}
              <iframe
                src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York"
                style={{ border: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                title="Youth Events Calendar"
              ></iframe>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Note: This is a placeholder calendar. The actual youth events calendar will be linked here.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Ongoing Programs</h3>
            <div className="grid gap-4">
              {youthPrograms.map((program, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{program.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Follow us on social media for more updates:
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="https://www.facebook.com/IslamicSocietyOfEvansville" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Facebook
                </a>
                <a href="https://www.instagram.com/islamicsocietyofevansville/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Youth Team Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Meet the Youth Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youthTeamMembers.map((member, index) => (
            <YouthTeamMemberCard key={index} {...member} />
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Schooling Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Schools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schoolingOptions.map((school, index) => (
            <SchoolingOptionCard key={index} {...school} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default YouthActivities;