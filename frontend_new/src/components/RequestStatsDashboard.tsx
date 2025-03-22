import React from 'react';
import { Link } from 'react-router-dom';

interface RequestStatsProps {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  asOwner?: boolean;
}

const RequestStatsDashboard: React.FC<RequestStatsProps> = ({
  totalRequests,
  pendingRequests,
  approvedRequests,
  rejectedRequests,
  asOwner = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className={`p-6 ${asOwner ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-indigo-600'} text-white`}>
        <h2 className="text-xl font-bold mb-2">
          {asOwner ? 'Book Lending Activity' : 'Book Borrowing Activity'}
        </h2>
        <p className="text-blue-100 mb-4">
          {asOwner 
            ? 'Overview of requests from people who want to borrow your books' 
            : 'Overview of your requests to borrow books from others'}
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-1">Total</h3>
            <p className="text-3xl font-bold text-blue-600">{totalRequests}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-1">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{approvedRequests}</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <h3 className="text-lg font-semibold text-red-800 mb-1">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{rejectedRequests}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Link
            to={asOwner ? "/my-books/requests" : "/my-requests"}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {asOwner ? 'View All Requests' : 'View My Requests'}
          </Link>
        </div>
      </div>
      
      {pendingRequests > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-700">
              You have <span className="font-bold">{pendingRequests}</span> pending {asOwner ? 'requests to review' : 'book requests'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestStatsDashboard; 