const Index = () => {
  return (
    <div className="flex flex-col justify-between items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 flex-grow">
      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
          Welcome to the <br className="sm:hidden" /> Islamic Society of Evansville
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Building a vibrant community through faith, education, and service.
        </p>
      </main>
    </div>
  );
};

export default Index;