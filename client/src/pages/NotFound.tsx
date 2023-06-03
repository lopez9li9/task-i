const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col bg-indigo-300 dark:bg-indigo-800 text-purple-800 dark:text-purple-300">
      <p className="text-xl">Page not found!!</p>
      <button className="border-none rounded-xl p-2 bg-gray-600">Go to home</button>
    </div>
  );
};

export default NotFound;
