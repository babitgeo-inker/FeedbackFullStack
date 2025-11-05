import React, { useState, useEffect } from 'react';

// TypeScript interfaces for dashboard data
interface Participant {
  id: number;
  userPhone: string;
  name: string;
  feedback: string;
  profileImageUrl?: string;
  whatsappImageId?: string;
  imageStoragePath?: string;
  sessionDuration?: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardState {
  participants: Participant[];
  totalEnrolled: number;
  isLoading: boolean;
}

interface SummaryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

interface ParticipantTableProps {
  participants: Participant[];
  isLoading?: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Fetch feedback data from backend API
const fetchFeedbackData = async (): Promise<Participant[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    throw error;
  }
};

// SummaryCard Component
const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, icon, isLoading = false }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
      role="region"
      aria-label={`${title} summary`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2" id="enrollment-title">
            {title}
          </h3>
          {isLoading ? (
            <div className="animate-pulse" aria-label="Loading enrollment count">
              <div className="h-12 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <p 
              className="text-4xl font-bold text-blue-600 transition-colors duration-200"
              aria-describedby="enrollment-title"
              aria-label={`${count} people enrolled`}
            >
              {count.toLocaleString()}
            </p>
          )}
        </div>
        <div className="shrink-0 ml-4">
          <div 
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl transition-colors duration-200 hover:bg-blue-200"
            aria-hidden="true"
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// ParticipantTable Component
const ParticipantTable: React.FC<ParticipantTableProps> = ({ participants, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Participant Data</h3>
        </div>
        <div className="animate-pulse p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      role="region"
      aria-label="Participant data table"
    >
      <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
        <h3 className="text-lg font-semibold text-gray-900">Participant Data</h3>
        <p className="text-sm text-gray-600 mt-1">
          {participants.length} participants enrolled
        </p>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                ID
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Mobile No
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Name
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Feedback
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.map((participant, index) => (
              <tr 
                key={participant.id} 
                className={`transition-colors duration-150 hover:bg-blue-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {participant.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  {participant.userPhone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {participant.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  <div className="truncate" title={participant.feedback}>
                    {participant.feedback}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {participants.map((participant, index) => (
          <div 
            key={participant.id} 
            className={`p-4 border-b border-gray-200 transition-colors duration-150 hover:bg-blue-50 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
            role="article"
            aria-label={`Participant ${participant.name}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                ID: {participant.id}
              </span>
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                {participant.userPhone}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">{participant.name}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{participant.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    participants: [],
    totalEnrolled: 0,
    isLoading: true
  });

  // Load real data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const participants = await fetchFeedbackData();
        setDashboardState({
          participants,
          totalEnrolled: participants.length,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load feedback data:', error);
        setDashboardState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and monitor participant enrollment
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" title="Live data"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="grid grid-cols-1 gap-6">
            <SummaryCard
              title="Total People Enrolled"
              count={dashboardState.totalEnrolled}
              icon="👥"
              isLoading={dashboardState.isLoading}
            />
          </div>

          {/* Table Section */}
          <ParticipantTable
            participants={dashboardState.participants}
            isLoading={dashboardState.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;