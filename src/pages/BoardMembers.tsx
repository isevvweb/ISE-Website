import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import BoardMemberCard from "@/components/BoardMemberCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card"; // Added Card import

interface BoardMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url?: string;
  email?: string;
  phone?: string;
  display_order: number;
}

const BoardMembers = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      showError("Error fetching board members: " + error.message);
    } else {
      setBoardMembers(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Meet Our Board Members</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col items-center text-center p-6 h-full">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </Card>
          ))}
        </div>
      ) : boardMembers.length === 0 ? (
        <p className="text-center text-muted-foreground">No board members found at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardMembers.map((member) => (
            <BoardMemberCard key={member.id} {...member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardMembers;