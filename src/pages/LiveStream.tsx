import React from "react";

const LiveStream = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Live Stream</h1>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}> {/* 16:9 Aspect Ratio */}
        <iframe
          src="https://conceptlivestream.com/embed.php?s=mfUfmtJGCQ&autoplay=1"
          title="Concept Live Stream Player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-lg"
        ></iframe>
      </div>
      <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
        Note: We are exploring alternative live stream solutions for future improvements.
      </p>
    </div>
  );
};

export default LiveStream;