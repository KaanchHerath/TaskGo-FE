import { useState } from 'react';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Robert Fox",
      role: "UI/UX Designer",
      content: "Ut pellentesque hendrerit tempor. Aliquam in rutrum dui. Maecenas ac placerat metus, in faucibus elit.",
      rating: 5,
      image: "/images/testimonials/robert.jpg"
    },
    {
      id: 2,
      name: "Bessie Cooper",
      role: "Graphic Designer",
      content: "Mauris eget lorem nulla. Mauris congollis lacus molestie metus aliquam lacinia. Suspendisse id vel vulputate augue confrmentum ornare. Mordi vitae finibus amet.",
      rating: 5,
      image: "/images/testimonials/bessie.jpg"
    },
    {
      id: 3,
      name: "Jane Cooper",
      role: "Web Developer",
      content: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse et magna quis nisi accumsan venenatis.",
      rating: 5,
      image: "/images/testimonials/jane.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="bg-[#f1f2f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Clients Testimonial</h2>
      
      <div className="relative">
        <button 
          onClick={prevSlide}
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg"
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out space-x-6"
            style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-1/3 flex-shrink-0">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-blue-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={nextSlide}
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg"
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center mt-8 space-x-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 mx-1 rounded-full transition-colors duration-200 ${
              idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>
    </div>
    </div>
  );
};

export default TestimonialsSection;