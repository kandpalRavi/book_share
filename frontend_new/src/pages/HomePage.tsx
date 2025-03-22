import Hero from '../components/Hero';
import FeaturedBooks from '../components/FeaturedBooks';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedBooks />
      <div className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Share books in 3 simple steps
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform makes it easy to connect with other book lovers in your community
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-16 md:space-y-0 md:grid md:grid-cols-3 md:gap-10">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ),
                  title: 'List your books',
                  description: 'Create your virtual bookshelf by listing the books you own and are willing to share with others.'
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  title: 'Discover books',
                  description: 'Browse books available in your area, filter by genre, and find your next great read.'
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  ),
                  title: 'Connect & share',
                  description: 'Message book owners, arrange meetups, and build relationships with fellow readers.'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center md:flex md:flex-col md:items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg mb-6">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default HomePage; 