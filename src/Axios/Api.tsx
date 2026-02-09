// api.js - Complete API Service for React Native
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== AXIOS CONFIGURATION ====================
const apiClient = axios.create({
  baseURL: 'https://backend.newsvelugu.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    console.log('request',config)
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for standardized response format
apiClient.interceptors.response.use(
  (response) => {
    // Standardize success response
    const standardizedResponse = {
      message: response.data?.message || 'Success',
      error: response.data?.error || false,
      data: response.data?.data || response.data
    };
    
    // If backend already returns {message, error, data}, use it
    if (response.data && typeof response.data === 'object') {
      if ('error' in response.data) {
        return response.data;
      }
    }
    console.log('respone',standardizedResponse)
    return standardizedResponse;
  },
  async (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        // You might want to navigate to login screen here
        // navigation.navigate('Login'); // If you have navigation context
      } catch (storageError) {
        console.error('Error removing token:', storageError);
      }
    }
    
    // Format error response consistently
    const errorResponse = {
      message: error.response?.data?.message || 
               error.message || 
               'Network error occurred',
      error: true,
      data: null,
      status: error.response?.status,
      code: error.code
    };
    
    // For network errors
    if (!error.response) {
      errorResponse.message = 'Network error. Please check your connection.';
      errorResponse.code = 'NETWORK_ERROR';
    }
    
    return Promise.reject(errorResponse);
  }
);

// ==================== UNIFIED API FUNCTION ====================
export const apiService = {
  // ===== AUTHENTICATION =====
  register: async (userData) => {
    try {
      const response = await apiClient.post('auth/register', userData);
      console.log('Register response:', response);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      return {
        message: error.message || 'Registration failed',
        error: true,
        data: null
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('auth/login', { email, password });
      console.log('Login response:', response);
      
      // Store token if received
      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        message: error.message || 'Login failed',
        error: true,
        data: null
      };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      return {
        message: 'Logged out successfully',
        error: false,
        data: null
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        message: 'Logout failed',
        error: true,
        data: null
      };
    }
  },

  // ===== ADMIN DASHBOARD =====
  getDashboardStats: async (data) => {
    try {
      const response = await apiClient.get(`/admin/news/stats?userId=${data.userId}&roleId=${data.roleId}`);
      console.log(response)
       return response;
    } catch (error) {
      return error;
    }
  },
  getBannerStats: async () => {
    try {
      const response = await apiClient.get(`/ads/adscount`)
       return response;
    } catch (error) {
      return error;
    }
  },

  // ===== NEWS MANAGEMENT =====

  getAllNews: async (params) => {
    console.log('parameters  =====   ',params  )
    try {
      const response = await apiClient.get('/admin/news', { params });
      return response;
    } catch (error) {
      return error;
    }
  },

  getNewsById: async (newsId) => {
    try {
      const response = await apiClient.get(`/admin/news/${newsId}`);
      console.log(response);
      return response;
    } catch (error) {
      return error;
    }
  },

  updateNewsStatus: async (newsId, status, rejectionReason = null) => {
    try {
      const response = await apiClient.put(`/admin/news/${newsId}/status`, {
        status,
        rejectionReason
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  deleteNews: async (newsId,adminId) => {
    try {
      const response = await apiClient.delete(`/admin/news/delete/${newsId}?adminId=${adminId}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== REPORTER MANAGEMENT =====
  getReporterById: async (userId, roleId) => {
    try {
      // const response = await apiClient.get(`admin/news/reporterById?userId=${userId}&roleId=${roleId}`);
      const response = await apiClient.get(`/users/${userId}`);
      
      return response;
    } catch (error) {
      return error;
    }
  },

  getAllReporters: async (roleId) => {
    try {
      const response = await apiClient.get(`admin/news/allReporter?roleId=${roleId}`);
      return response;
    } catch (error) {
      return error;
    }
  },
 updateReporter : async (updateData) => {
    try {
     
      const response = await apiClient.put( `/admin/reporters/update-profile?userId=${updateData.reporterId}`,updateData);
      return response;
    } catch (error) {
      console.error('Update reporter error:', error);
      throw error;
    }
  },
  updateReporterStatus: async (reporterId) => {
    try {
      const response = await apiClient.put(`admin/reporters/${reporterId}/toggle-status`);
      return response;
    } catch (error) {
      return error;
    }
  },

  getReporterNews: async (reporterId, filters = {}) => {
    try {
      const response = await apiClient.get(`/admin/reporters/${reporterId}/news`, {
        params: filters
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== USER PROFILE =====
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      console.log(response)
      return response;
    } catch (error) {
      return error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      return response;
    } catch (error) {
      return error;
    }
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      return error;
    }
  },

  uploadProfilePicture: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await apiClient.post(
        `/users/${userId}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      return error;
    }
  },

  // ===== TICKET MANAGEMENT =====
createTicket: async (data) => {
  try {
    const response = await apiClient.post(
      `/tickets/create/${data.userId}?title=${encodeURIComponent(data.title)}&description=${encodeURIComponent(data.description)}&email=${encodeURIComponent(data.email)}`
    );
    return response;
  } catch (error) {
    console.error("Create ticket error:", error);
   return error;
  }
},

  getAllTickets: async (userId) => {
    try {
      const response = await apiClient.get(`/tickets/all/${userId}`);
      console.log(response);
      return response;
    } catch (error) {
      return error;
    }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}`);
      return response;
    } catch (error) {
      return error;
    }
  },


updateTicketStatus: async (data) => {
  try {
    const response = await apiClient.put(
      `/tickets/update/${data.userId}/${data.ticketId}?status=${data.status}`
    );
    console.log(response);
    return response;
  } catch (error) {
    return error;
  }
},

// ===== ADMIN NEWS MANAGEMENT =====
  approveAndPublishNews: async (newsId, newsData) => {
    try {
      const response = await apiClient.put(`admin/${newsId}/publish`, newsData);
      console.log('Approve news response:', response);
      return response;
    } catch (error) {
      console.error('Approve news error:', error);
      return {
        message: error.message || 'Failed to approve and publish news',
        error: true,
        data: null
      };
    }
  },

  rejectNews: async (newsId, reason) => {
    try {
      const response = await apiClient.put(`admin/${newsId}/reject`, { reason });
      console.log('Reject news response:', response);
      return response;
    } catch (error) {
      console.error('Reject news error:', error);
      return {
        message: error.message || 'Failed to reject news',
        error: true,
        data: null
      };
    }
  },
 // ===== NEWS INTERACTION APIS =====

// Toggle like for a news
toggleLike: async (newsId, userId) => {
  try {
    const response = await apiClient.post(`news/${newsId}/like/${userId}`);
    return response;
  } catch (error) {
    console.error("Toggle like error:", error);
    return error;
  }
},

// Check if user liked a news
checkLikeStatus: async (newsId, userId) => {
  try {
    const response = await apiClient.get(`news/likecheck?userId=${userId}&newsId=${newsId}`);
    return response;
  } catch (error) {
    console.error("Check like status error:", error);
    return error;
  }
},

// Add a comment to news
addComment: async (newsId, userId, comment) => {
  try {
    const response = await apiClient.post(`news/${newsId}/comment/${userId}`,comment);
    return response;
  } catch (error) {
    console.error("Add comment error:", error);
    return error;
  }
},

// Get comments for a news
getComments: async (newsId) => {
  try {
    const response = await apiClient.get(`news/${newsId}/comments`);
    return response;
  } catch (error) {
    console.error("Get comments error:", error);
    return error;
  }
},

// Share a news
shareNews: async (newsId, userId) => {
  try {
    const response = await apiClient.post(`news/${newsId}/share/${userId}`);
    return response;
  } catch (error) {
    console.error("Share news error:", error);
    return error;
  }
},

// Get counts (likes, comments, shares) for news
getCounts: async (newsId) => {
  try {
    const response = await apiClient.get(`news/${newsId}/counts`);
    return response;
  } catch (error) {
    console.error("Get counts error:", error);
    return error;
  }
},

// Get published news with optional filters
getPublishedNews: async (filters = {}) => {
  try {
    // Build query parameters
    let queryString = '';
    const params = [];
    
    // Add coordinates if they exist (priority: coordinates come before district)
    if (filters.latitude && filters.longitude) {
      params.push(`latitude=${encodeURIComponent(filters.latitude)}`);
      params.push(`longitude=${encodeURIComponent(filters.longitude)}`);
    }
    
    // Add district only if coordinates are not provided
    if (filters.district && !filters.latitude) {
      params.push(`district=${encodeURIComponent(filters.district)}`);
    }
    
    // Add other filters
    if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
    if (filters.newsType) params.push(`newsType=${encodeURIComponent(filters.newsType)}`);
    if (filters.priority) params.push(`priority=${encodeURIComponent(filters.priority)}`);
    
    // Add pagination if needed (optional enhancement)
    if (filters.page) params.push(`page=${filters.page}`);
    if (filters.limit) params.push(`limit=${filters.limit}`);
    
    if (params.length > 0) {
      queryString = `?${params.join('&')}`;
    }
    
    console.log('Query string:', queryString);
    const response = await apiClient.get(`/admin/news/published${queryString}`);
    return response;
  } catch (error) {
    console.error("Get published news error:", error);
    return error;
  }
},
 // Forgot Password APIs
  forgotPassword: async (email) => {
    try {
      // Note: API accepts username or email
      const response = await apiClient.post('auth/forgot-password', { email });
     
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
   return error;
    }
  },

  verifyOTP: async (data) => {
    try {
      const response = await apiClient.post('auth/verify-otp', data);
      return response;
    } catch (error) {
       return error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await apiClient.post('auth/reset-password', data);
      
      return response;
    } catch (error) {
       return error;
    }
  },

  uploadNews: async (userId, formData) => {
    try {
      const response = await apiClient.post(
        `admin/news/upload?userId=${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Upload news response:', response);
      return response;
    } catch (error) {
      console.error('Upload news error:', error);
      return {
        message: error.message || 'Failed to upload news',
        error: true,
        data: null
      };
    }
  },
  // Get all advertisements
  getAllAdvertisements : async () => {
    try {
     
      const response = await apiClient.get(`/ads`);
      return response;
    } catch (error) {
      console.error('Get advertisements error:', error);
      throw error;
    }
  },
  // Get all advertisements
  getAdvertisements : async (coordinates) => {
    try {
      console.log(coordinates.lat)
      const response = await apiClient.get(`/ads/feed?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&local=true`);
      return response;
    } catch (error) {
      console.error('Get advertisements error:', error);
      throw error;
    }
  },
  // Delete advertisement
  deleteAdvertisement : async (advertisementId) => {
    try {
      const response = await apiClient.delete(`/ads/${advertisementId}`);
      return response;
    } catch (error) {
      console.error('Delete advertisement error:', error);
      throw error;
    }
  },
  

  // Get advertisement by ID
  getAdvertisementById : async (advertisementId) => {
    try {
      const response = await apiClient.get(`/admin/advertisements/${advertisementId}`);
      return response.data;
    } catch (error) {
      console.error('Get advertisement error:', error);
      throw error;
    }
  },

  // Create advertisement
  createAdvertisement : async (data) => {
    try {
      const response = await apiClient.post('/admin/advertisements', data);
      return response.data;
    } catch (error) {
      console.error('Create advertisement error:', error);
      throw error;
    }
  },

  // Update advertisement
  updateAdvertisement : async (advertisementId, data) => {
    try {
      const response = await apiClient.put(`/admin/advertisements/${advertisementId}`, data);
      return response.data;
    } catch (error) {
      console.error('Update advertisement error:', error);
      throw error;
    }
  },
  // Update advertisement status
  updateAdvertisementStatus : async (advertisementId, isActive) => {
    try {
      const response = await apiClient.patch(`/admin/advertisements/${advertisementId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },
  

  // Upload image
  uploadImage : async (formData) => {
    try {
      const response = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  },
};

export default apiService;