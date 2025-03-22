import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About BookShare</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              BookShare is a community-driven platform that connects book lovers who want to share, 
              borrow, and exchange books. Our mission is to promote reading, reduce waste, and build 
              connections through the love of literature.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-xl font-bold mb-2">1. Share</div>
                <p className="text-gray-600">
                  Add books from your collection that you're willing to share with others in your community.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-xl font-bold mb-2">2. Borrow</div>
                <p className="text-gray-600">
                  Browse books shared by others and request to borrow the ones you're interested in reading.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-xl font-bold mb-2">3. Connect</div>
                <p className="text-gray-600">
                  Meet fellow book lovers, exchange recommendations, and build a community around shared interests.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              BookShare was founded in 2025 by a group of avid readers who were frustrated with the 
              accumulation of books they had already read and the expense of constantly buying new ones. 
              They envisioned a platform where book lovers could share their collections, discover new 
              titles, and connect with like-minded individuals in their local communities.
            </p>
            <p className="text-gray-600 mb-6">
              Since our launch, we've helped  readers share their favorite stories, save money, 
              and reduce waste by giving books a second, third, or fourth life. Our community continues to 
              grow as more people discover the joy of sharing books.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Community Guidelines</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li className="mb-2">Treat borrowed books with care and return them in the same condition.</li>
              <li className="mb-2">Respect agreed-upon borrowing periods.</li>
              <li className="mb-2">Communicate promptly with book owners and borrowers.</li>
              <li className="mb-2">Be honest about the condition of books you're sharing.</li>
              <li className="mb-2">Respect the privacy and personal information of other users.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-2">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <p className="text-gray-600">
              Email: <a href="mailto:mr.pizz4800@gmail.com" className="text-blue-600 hover:underline">mr.pizz4800@gmail.com</a><br />
              Email: <a href="mailto:ravindrakandpal10@gmail.com" className="text-blue-600 hover:underline">ravindrakandpal10@gmail.com</a>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Team</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                  <img 
                    src="https://via.placeholder.com/128?text=JD" 
                    alt="Kandpal Ravi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Kandpal Ravi</h3>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                  <img 
                    src="https://via.placeholder.com/128?text=JS" 
                    alt="Paras Joshi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Paras Joshi</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 