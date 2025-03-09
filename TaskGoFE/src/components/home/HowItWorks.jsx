const HowItWorks = () => {
  const steps = [
    {
      title: "Create account",
      description: "Aliquam facilisis magna sapien, non feugiat sapien, non feugiat mi integer eu rhoncus.",
      icon: "user-plus"
    },
    {
      title: "Post Tasks",
      description: "Curabitur sit amet sapien quis sem a nulla amet. Nam viverra.",
      icon: "clipboard"
    },
    {
      title: "Find suitable Tasker",
      description: "Praesent sed vestibulu mi. Morbi nec fringilla non.",
      icon: "search"
    },
    {
      title: "Schedule the job",
      description: "Curabitur sit amet sapien quis. Nam viverra cursus a nulla amet.",
      icon: "calendar"
    }
  ];

  return (
    <div className="bg-[#f1f2f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How TaskGo work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {/* Icon component here */}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;