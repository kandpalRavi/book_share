import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an actual API call
      // await api.post('/contact', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const topics = [
    'General Inquiry',
    'Technical Support',
    'Book Sharing Issue',
    'Account Problem',
    'Feature Suggestion',
    'Report a Bug',
    'Other'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="mb-4 text-green-500">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Message Sent!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                  
                  {/* Subject/Topic */}
                  <div className="md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject*
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a topic</option>
                      {topics.map(topic => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                  </div>
                  
                  {/* Message */}
                  <div className="md:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Alternative contact methods */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Other Ways to Reach Us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center">
                <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Email Us</h3>
                <p className="text-gray-600 text-center">
                  <a href="mailto:mr.pizz4800@gmail.com" className="text-blue-600 hover:underline">mr.pizz4800@gmail.com</a>
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center">
                <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Live Chat</h3>
                <p className="text-gray-600 text-center">
                  Available Monday-Friday<br />
                  9:00 AM - 5:00 PM IST
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center">
                <svg className="w-10 h-10 text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Phone</h3>
                <p className="text-gray-600 text-center">
                  +917465023620<br />
                  Mon-Fri, 9AM-5PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 