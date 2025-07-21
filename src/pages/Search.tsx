import React from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Search Results</h1>

      <Card className="max-w-2xl mx-auto p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {query ? `Results for "${query}"` : "No search query entered."}
          </CardTitle>
          <CardDescription>
            This is a placeholder for your search results. In a full application,
            content matching your query would appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-700 dark:text-gray-300 text-center">
          {query ? (
            <p>We're currently working on integrating a comprehensive search across all content. Please check back later!</p>
          ) : (
            <p>Please enter a search term in the header's search bar to see results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Search;