import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DonatePage = () => {
  const [donationItems, setDonationItems] = useState({
    books: false,
    stationery: false,
    uniforms: false,
    schoolBags: false,
    shoes: false,
    other: false
  });
  const [otherItemDescription, setOtherItemDescription] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [preferredMethod, setPreferredMethod] = useState('drop-off');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setDonationItems({
      ...donationItems,
      [name]: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare the data to be sent
      const donationData = {
        donationItems,
        otherItemDescription,
        itemDescription,
        donorName,
        donorEmail,
        donorPhone,
        donorAddress,
        preferredMethod,
        preferredTime,
        message
      };
      
      // Send data to the API
      const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reset form after successful submission
        setDonationItems({
          books: false,
          stationery: false,
          uniforms: false,
          schoolBags: false,
          shoes: false,
          other: false
        });
        setOtherItemDescription('');
        setItemDescription('');
        setDonorName('');
        setDonorEmail('');
        setDonorPhone('');
        setDonorAddress('');
        setPreferredMethod('drop-off');
        setPreferredTime('');
        setMessage('');
        
        // Show success message
        alert('Thank you for your donation! We\'ve received your information and will be in touch soon.');
      } else {
        throw new Error(result.message || 'Failed to submit donation');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Sorry, there was a problem submitting your donation. Please try again later.');
    }
  };

  return (
    <div className="pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Donate Books & School Supplies</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Help support education for children in need by donating your gently used books and school supplies to KITES Education Program.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Campaign Info */}
          <div className="col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2">About KITES</h2>
              <p className="text-white/80 text-sm md:text-base">Knowledge Integration Through Education and Service</p>
            </div>
            <div className="p-5">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  KITES is a pre and remedial school located in Dehradun which provides free education to children belonging to slums.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">What We Need</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Books (textbooks, storybooks, activity books)</li>
                  <li>Stationery (pencils, pens, erasers, notebooks)</li>
                  <li>School uniforms in good condition</li>
                  <li>School bags</li>
                  <li>Shoes</li>
                  <li>Art supplies</li>
                  <li>Educational toys and games</li>
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Our Impact</h3>
                <p className="text-gray-600">
                  We currently serve over 150 children from slum areas, with a mission to reach 1000+ students and provide them with free quality education and essential school supplies.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                <p className="text-gray-600 mb-1">
                  <a href="http://www.societysilverlining.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Website: societysilverlining.org.in
                  </a>
                </p>
                <p className="text-gray-600 mb-1">
                  <a href="https://www.facebook.com/kitesafreeschool/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Facebook: /kitesafreeschool/
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="https://www.twitter.com/NgoSilverlining/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Twitter: @NgoSilverlining
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Donate Items</h2>
              <p className="text-white/80 text-sm md:text-base">Your donations help children access quality education</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              {/* Items to Donate */}
              <div className="mb-6">
                <h3 className="font-medium text-lg text-gray-900 mb-3">What would you like to donate?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start">
                    <input
                      id="books"
                      name="books"
                      type="checkbox"
                      checked={donationItems.books}
                      onChange={handleItemChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="books" className="ml-2 block text-sm text-gray-700">
                      Books
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="stationery"
                      name="stationery"
                      type="checkbox"
                      checked={donationItems.stationery}
                      onChange={handleItemChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="stationery" className="ml-2 block text-sm text-gray-700">
                      Stationery
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="uniforms"
                      name="uniforms"
                      type="checkbox"
                      checked={donationItems.uniforms}
                      onChange={handleItemChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="uniforms" className="ml-2 block text-sm text-gray-700">
                      School Uniforms
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="schoolBags"
                      name="schoolBags"
                      type="checkbox"
                      checked={donationItems.schoolBags}
                      onChange={handleItemChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="schoolBags" className="ml-2 block text-sm text-gray-700">
                      School Bags
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="shoes"
                      name="shoes"
                      type="checkbox"
                      checked={donationItems.shoes}
                      onChange={handleItemChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="shoes" className="ml-2 block text-sm text-gray-700">
                      Shoes
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="other"
                      name="other"
                      type="checkbox"
                      checked={donationItems.other}
                      onChange={handleItemChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="other" className="ml-2 block text-sm text-gray-700">
                      Other
                    </label>
                  </div>
                </div>
                
                {donationItems.other && (
                  <div className="mb-4">
                    <label htmlFor="otherItemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Please specify other items
                    </label>
                    <input
                      type="text"
                      id="otherItemDescription"
                      value={otherItemDescription}
                      onChange={(e) => setOtherItemDescription(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., Educational toys, art supplies, etc."
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Item Description
                  </label>
                  <textarea
                    id="itemDescription"
                    rows={3}
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Please provide details about the items you're donating (quantity, condition, age group, etc.)"
                  />
                </div>
              </div>
              
              {/* Donor Information */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={donorAddress}
                      onChange={(e) => setDonorAddress(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery/Pickup Options */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Method</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-10 space-y-3 sm:space-y-0 mb-4">
                  <div className="flex items-center">
                    <input
                      id="drop-off"
                      name="delivery-method"
                      type="radio"
                      checked={preferredMethod === 'drop-off'}
                      onChange={() => setPreferredMethod('drop-off')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="drop-off" className="ml-3 block text-sm font-medium text-gray-700">
                      I'll drop off the items
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="pick-up"
                      name="delivery-method"
                      type="radio"
                      checked={preferredMethod === 'pick-up'}
                      onChange={() => setPreferredMethod('pick-up')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="pick-up" className="ml-3 block text-sm font-medium text-gray-700">
                      Request item pickup
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date/Time
                  </label>
                  <input
                    type="text"
                    id="preferredTime"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., Weekdays after 5pm, Saturday mornings"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any additional information or questions"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-lg font-medium"
                >
                  Submit Donation Request
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">How Your Donations Help</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Books</h3>
              <p className="text-gray-600">
                Your donated books foster literacy and a love for reading among children who otherwise wouldn't have access to books.
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">School Supplies</h3>
              <p className="text-gray-600">
                Stationery and supplies give children the tools they need to participate fully in their education.
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-md text-center sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Uniforms & Bags</h3>
              <p className="text-gray-600">
                Proper uniforms and school bags help children feel included and proud to attend school.
              </p>
            </div>
          </div>
        </div>

        {/* Drop-off Locations */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Drop-off Locations</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">KITES School Campus</h3>
                  <p className="text-gray-700 mb-2">123 Education Lane, Dehradun</p>
                  <p className="text-gray-700 mb-2">Monday to Friday: 9 AM - 5 PM</p>
                  <p className="text-gray-700 mb-4">Saturday: 10 AM - 2 PM</p>
                  <p className="text-gray-700">
                    <span className="font-medium">Contact:</span> Mrs. Sharma at 9876543210
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Community Center</h3>
                  <p className="text-gray-700 mb-2">456 Community Plaza, Dehradun</p>
                  <p className="text-gray-700 mb-2">Monday, Wednesday, Friday: 10 AM - 6 PM</p>
                  <p className="text-gray-700 mb-4">Sunday: 11 AM - 3 PM</p>
                  <p className="text-gray-700">
                    <span className="font-medium">Contact:</span> Mr. Patel at 9876543211
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center text-gray-700">
                <p>For large donations or to arrange special drop-offs, please contact us directly at</p>
                <p className="font-medium text-blue-600">donations@kitesschool.org</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Make a Difference Today</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your donated books and school supplies can change a child's educational journey and open doors to new opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a 
              href="#donate-form" 
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Donate Now
            </a>
            <Link 
              to="/contact" 
              className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage; 