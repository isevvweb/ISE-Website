import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

const Members = () => {
  const [membershipForm, setMembershipForm] = React.useState({
    email: "",
    agreement: false,
    fullName: "",
    familyMembers: "",
    mailingAddress: "",
    whatsappPhone: "",
    paymentPreference: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setMembershipForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setMembershipForm((prev) => ({ ...prev, agreement: checked }));
  };

  const handleRadioChange = (value: string) => {
    setMembershipForm((prev) => ({ ...prev, paymentPreference: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!membershipForm.email || !membershipForm.fullName || !membershipForm.familyMembers ||
        !membershipForm.mailingAddress || !membershipForm.whatsappPhone || !membershipForm.paymentPreference ||
        !membershipForm.agreement) {
      showError("Please fill in all required fields and agree to the terms.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://wzeyadxcbopevhuzimgf.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ formType: "membershipApplication", data: membershipForm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send membership application.");
      }

      showSuccess("Membership Application Sent! Thank you for your interest.");
      setMembershipForm({
        email: "",
        agreement: false,
        fullName: "",
        familyMembers: "",
        mailingAddress: "",
        whatsappPhone: "",
        paymentPreference: "",
      });
    } catch (error: any) {
      showError("Error sending application: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Become a Member</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Become a Member?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-xl">Support Your Community</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>Your membership directly supports the mosque's operations, educational programs, and community services. It's an investment in the future of our Islamic community in Evansville.</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-xl">Exclusive Benefits</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>Members receive special access to certain events, voting rights in general body meetings, and priority registration for youth programs and classes.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Membership Application</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <CardHeader>
            <CardTitle>Apply for Membership</CardTitle>
            <CardDescription>
              Please fill out the form below to apply for membership with the Islamic Society of Evansville.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2 text-left">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={membershipForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="agreement">
                  I bear witness that there is no deity worthy of worship except Allah سبحانَهُ و تعالى , the One True God, and Mohammad صلى الله عليه وسلم is His final messenger. By applying for membership to the Islamic Society of Evansville, I agree to abide by its constitution & bylaws and I agree to fulfill my financial obligations in the form of membership dues. <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="agreement"
                    checked={membershipForm.agreement}
                    onCheckedChange={handleCheckboxChange}
                    required
                  />
                  <label
                    htmlFor="agreement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree
                  </label>
                </div>
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your answer"
                  value={membershipForm.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="familyMembers">Names of all family members and children's ages <span className="text-red-500">*</span></Label>
                <Textarea
                  id="familyMembers"
                  placeholder="Your answer"
                  value={membershipForm.familyMembers}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="mailingAddress">Mailing Address <span className="text-red-500">*</span></Label>
                <Textarea
                  id="mailingAddress"
                  placeholder="Your answer"
                  value={membershipForm.mailingAddress}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="whatsappPhone">Phone number for WhatsApp announcements <span className="text-red-500">*</span></Label>
                <Input
                  id="whatsappPhone"
                  type="tel"
                  placeholder="Your answer"
                  value={membershipForm.whatsappPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label>Payment preference <span className="text-red-500">*</span></Label>
                <Card className="p-4 mt-2">
                  <CardDescription className="mb-4">
                    Although it is not required to submit information for automatic monthly bank draft of the membership fees, this is the easiest, most secure option, and standard practice among the majority of our members. Dues are payable via cash, check, or automatic bank draft. We welcome your suggestions so please feel free to contact us with questions and/or concerns.
                  </CardDescription>
                  <RadioGroup
                    value={membershipForm.paymentPreference}
                    onValueChange={handleRadioChange}
                    className="space-y-2"
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly_cash_check" id="monthly_cash_check" />
                      <Label htmlFor="monthly_cash_check">I would like to pay monthly via cash/check.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="automatic_payments" id="automatic_payments" />
                      <Label htmlFor="automatic_payments">I would like to enroll in automatic payments.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="annual_lump_sum" id="annual_lump_sum" />
                      <Label htmlFor="annual_lump_sum">I would like to pay my monthly dues in one annual lump sum.</Label>
                    </div>
                  </RadioGroup>
                </Card>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Community Events Calendar</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Members will have access to a dedicated community calendar showcasing exclusive events, meetings, and volunteer opportunities.
            </p>
            <div className="relative w-full mx-auto" style={{ paddingBottom: "75%", maxWidth: "600px" }}>
              <iframe
                src="https://calendar.google.com/calendar/embed?src=464ad63344b9b7c026adb7ee76c370b95864259cac908d685142e8571291449c%40group.calendar.google.com&ctz=America%2FChicago"
                style={{ border: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                title="Community Events Calendar"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Annual Reports</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              As a member, you can review our annual reports to stay informed about the mosque's financial health and activities.
            </p>
            <Button asChild className="w-full md:w-auto">
              <Link to="/annual-reports">View Annual Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Members;