import { Link } from "react-router-dom";

const HeroSection = ({
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  image,
  imageAlt = "Hero Image",
  colorScheme = "blue", 
  density = "comfortable",
  transparent = false,
  headingSize,
  children
}) => {
  const getColorClasses = (scheme) => {
    const colors = {
      blue: {
        gradient: "from-blue-600 to-indigo-600",
        hoverGradient: "hover:from-blue-700 hover:to-indigo-700",
        ring: "focus:ring-blue-500/50",
        text: "text-blue-600 hover:text-blue-700",
        border: "border-blue-600/30 hover:border-blue-600/50",
        bgGlow: "from-blue-400/20 to-indigo-400/20",
        bgColor: "bg-blue-50/30",
        decorative: "bg-blue-300/20",
        bgGradient: "from-blue-50/30 via-indigo-50/20 to-purple-50/10"
      },
      lightBlue: {
        gradient: "from-sky-400 to-blue-500",
        hoverGradient: "hover:from-sky-500 hover:to-blue-600",
        ring: "focus:ring-sky-500/50",
        text: "text-sky-600 hover:text-sky-700",
        border: "border-sky-600/30 hover:border-sky-600/50",
        bgGlow: "from-sky-300/20 to-blue-300/20",
        decorative: "bg-sky-200/30",
        bgGradient: "from-sky-50 via-blue-50 to-indigo-50"
      },
      green: {
        gradient: "from-green-600 to-emerald-600",
        hoverGradient: "hover:from-green-700 hover:to-emerald-700",
        ring: "focus:ring-green-500/50",
        text: "text-green-600 hover:text-green-700",
        border: "border-green-600/30 hover:border-green-600/50",
        bgGlow: "from-green-400/20 to-emerald-400/20",
        decorative: "bg-green-200/20",
        bgGradient: "from-green-50/30 via-emerald-50/20 to-blue-50/10"
      },
      purple: {
        gradient: "from-purple-600 to-indigo-600",
        hoverGradient: "hover:from-purple-700 hover:to-indigo-700",
        ring: "focus:ring-purple-500/50",
        text: "text-purple-600 hover:text-purple-700",
        border: "border-purple-600/30 hover:border-purple-600/50",
        bgGlow: "from-purple-400/20 to-indigo-400/20",
        decorative: "bg-purple-200/20",
        bgGradient: "from-purple-50/30 via-indigo-50/20 to-blue-50/10"
      }
    };
    return colors[scheme] || colors.blue;
  };

  const colors = getColorClasses(colorScheme);
  const isCompact = density === 'compact';
  const headingSizeClasses = headingSize || (isCompact ? 'text-3xl md:text-5xl mb-4' : 'text-4xl md:text-6xl mb-6');

  return (
    <section className={`${transparent ? 'bg-transparent' : `bg-gradient-to-br ${colors.bgGradient}`} ${isCompact ? 'py-10 md:py-12 px-4 md:px-10' : 'py-16 px-4 md:px-24'} relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      {!transparent && (
        <>
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
          <div className={`absolute top-10 left-10 w-32 h-32 ${colors.decorative} rounded-full blur-3xl`}></div>
          <div className={`absolute top-20 right-20 w-48 h-48 ${colors.decorative} rounded-full blur-3xl`}></div>
          <div className={`absolute bottom-10 left-1/4 w-24 h-24 ${colors.decorative} rounded-full blur-2xl`}></div>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </>
      )}
      
      <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto relative z-10">
        {/* Left side content */}
        <div className="w-full md:w-1/2 text-left mb-10 md:mb-0 pr-0 md:pr-16">
          <h1 className={`${headingSizeClasses} font-bold leading-tight`}>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </span>
            {subtitle && (
              <>
                <br />
                <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                  {subtitle}
                </span>
              </>
            )}
          </h1>
          <p className={`text-slate-600 ${isCompact ? 'mb-6 text-base' : 'mb-8 text-lg'} max-w-lg leading-relaxed`}>
            {description}
          </p>
          
         
          
          <div className="flex flex-col sm:flex-row gap-3">
            {primaryButton && (
              <Link 
                to={primaryButton.to} 
                className={`bg-gradient-to-r ${colors.gradient} text-white ${isCompact ? 'px-6 py-3' : 'px-8 py-4'} rounded-xl ${colors.hoverGradient} transition-all duration-300 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105`}
              >
                {primaryButton.icon && <span className="mr-2">{primaryButton.icon}</span>}
                {primaryButton.text}
              </Link>
            )}
            {secondaryButton && (
              <Link 
                to={secondaryButton.to} 
                className={`bg-white/70 backdrop-blur-sm border-2 ${colors.border} ${colors.text} ${isCompact ? 'px-6 py-3' : 'px-8 py-4'} rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg`}
              >
                {secondaryButton.icon && <span className="mr-2">{secondaryButton.icon}</span>}
                {secondaryButton.text}
              </Link>
            )}
          </div>

          {children}
        </div>

        {/* Right side image */}
        {image && (
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative">
              {!transparent && (
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.bgGlow} rounded-3xl blur-3xl`}></div>
              )}
              <img 
                src={image} 
                alt={imageAlt} 
                className="max-w-md w-full relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection; 