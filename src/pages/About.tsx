import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">About Us</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Our History</h2>
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              The Islamic Society of Evansville (ISE) was established with the vision of creating a vibrant Muslim community rooted in Islamic principles and dedicated to serving the wider society. Since its inception, ISE has grown to become a central hub for Muslims in Evansville and the surrounding areas, offering a place of worship, education, and community engagement.
            </p>
            <p className="mb-4">
              Over the years, ISE has been committed to fostering understanding and cooperation among different faiths, promoting peace, and contributing positively to the social fabric of Evansville. We strive to embody the true spirit of Islam through our actions and outreach.
            </p>
            <p>
              Our journey has been marked by the dedication of countless volunteers, generous donors, and committed leaders who have worked tirelessly to build and sustain this blessed institution. We look forward to many more years of growth, service, and community building.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Annual Reports</h2>
        <Card className="p-6 text-center">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Transparency and accountability are core values at the Islamic Society of Evansville. We provide annual reports detailing our financial activities, community programs, and achievements.
            </p>
            <p className="mb-6">
              You can view our past annual reports to understand our progress and impact.
            </p>
            <Link to="/admin/reports" className="text-blue-600 hover:underline font-medium">
              View Annual Reports
            </Link>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Meet Our Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 text-center">
            <CardContent className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-semibold mb-4">Board Members</h3>
              <p className="mb-6">
                Our mosque is guided by a dedicated team of board members who volunteer their time and expertise to serve the community.
              </p>
              <Link to="/members/board" className="text-blue-600 hover:underline font-medium">
                View Board Members
              </Link>
            </CardContent>
          </Card>
          <Card className="p-6 text-center">
            <CardContent className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-semibold mb-4">Board of Trustees</h3>
              <p className="mb-6">
                The Board of Trustees provides oversight and ensures the long-term stability and integrity of the organization.
              </p>
              <Link to="/members/trustees" className="text-blue-600 hover:underline font-medium">
                View Board of Trustees
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;