import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface EventImage {
  url: string;
  caption: string;
}

interface PastYouthEvent {
  id: string;
  title: string;
  description: string;
  event_date: string; // ISO date string
  images: EventImage[];
  display_order: number;
  created_at?: string;
}

const fetchPastYouthEvents = async (): Promise<PastYouthEvent[]> => {
  const { data, error } = await supabase
    .from("past_youth_events")
    .select("*")
    .order("event_date", { ascending: false }) // Newest events first
    .order("created_at", { ascending: false }); // Then by creation date

  if (error) {
    throw new Error("Error fetching past youth events: " + error.message);
  }
  return data || [];
};

const PastYouthEvents = () => {
  const { data: events, isLoading, error } = useQuery<PastYouthEvent[], Error>({
    queryKey: ["pastYouthEvents"],
    queryFn: fetchPastYouthEvents,
    staleTime: 1000 * 60 * 10, // Data considered fresh for 10 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    showError("Error loading past youth events: " + error.message);
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>Error loading past youth events. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Past Youth Events</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col p-6">
              <Skeleton className="w-full h-48 mb-4 rounded-md" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground">No past youth events found at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {format(parseISO(event.event_date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 text-gray-700 dark:text-gray-300 mb-4 flex-grow">
                <p>{event.description}</p>
              </CardContent>

              {event.images && event.images.length > 0 && (
                <div className="mb-4 mt-auto">
                  {event.images.length === 1 ? (
                    <div className="w-full h-48 object-cover rounded-md overflow-hidden">
                      <img src={event.images[0].url} alt={event.images[0].caption || event.title} className="w-full h-full object-cover" />
                      {event.images[0].caption && (
                        <p className="text-sm text-muted-foreground mt-1 text-center">{event.images[0].caption}</p>
                      )}
                    </div>
                  ) : (
                    <Carousel className="w-full max-w-xs mx-auto">
                      <CarouselContent>
                        {event.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <img src={image.url} alt={image.caption || `${event.title} image ${index + 1}`} className="w-full h-48 object-cover rounded-md" />
                              {image.caption && (
                                <p className="text-sm text-muted-foreground mt-1 text-center">{image.caption}</p>
                              )}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastYouthEvents;