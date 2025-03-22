import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  avatar: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "BookShare has completely transformed how I read. I've discovered so many new authors and genres I wouldn't have tried otherwise. The community aspect makes reading feel more connected.",
    author: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    role: "Teacher"
  },
  {
    id: 2,
    content: "As someone who reads 2-3 books a week, BookShare has saved me a fortune! The borrowing process is seamless, and I love being able to share my collection with others who appreciate good literature.",
    author: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    role: "Software Developer"
  },
  {
    id: 3,
    content: "What I appreciate most about BookShare is the personal recommendations. Real suggestions from real readers beats algorithm-based recommendations every time.",
    author: "Emily Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    role: "Graphic Designer"
  },
  {
    id: 4,
    content: "I've met some of my closest friends through BookShare. Our shared love of mystery novels brought us together, and now we have monthly meetups to discuss our latest reads.",
    author: "David Thompson",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    role: "Marketing Manager"
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const goToPrev = () => {
    setDirection('left');
    setActive(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setDirection('right');
    setActive(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setTimeout(() => {
      goToNext();
    }, 8000);

    return () => clearTimeout(timer);
  }, [active]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="block text-sm font-semibold uppercase tracking-wider text-blue-600">Testimonials</span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Community Says
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Join thousands of satisfied readers who are sharing and discovering books every day
          </p>
        </div>

        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-5 transform -translate-y-1/2 text-9xl text-blue-100 opacity-50 leading-none select-none">
            "
          </div>
          <div className="absolute top-1/2 right-5 transform -translate-y-1/2 text-9xl text-blue-100 opacity-50 leading-none select-none">
            "
          </div>

          {/* Testimonial Cards */}
          <div className="relative h-[440px] md:h-[320px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`
                  absolute w-full transition-all duration-700 ease-in-out
                  ${active === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                  ${active === index && direction === 'right' ? 'translate-x-0' : ''}
                  ${active === index && direction === 'left' ? 'translate-x-0' : ''}
                  ${active !== index && direction === 'right' ? '-translate-x-full' : ''}
                  ${active !== index && direction === 'left' ? 'translate-x-full' : ''}
                `}
                aria-hidden={active !== index}
              >
                <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 md:p-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.author} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-lg md:text-xl italic leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="mt-6">
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-blue-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8">
            <button
              onClick={goToPrev}
              className="mx-2 p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Previous testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > active ? 'right' : 'left');
                  setActive(index);
                }}
                className={`mx-1 w-3 h-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  active === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={active === index ? 'true' : 'false'}
              />
            ))}
            <button
              onClick={goToNext}
              className="mx-2 p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Next testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 