import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getProfile: () =>
    api.get('/auth/profile'),
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
}

// Booking API
export const bookingAPI = {
  getAvailableTimeSlots: (date: string) =>
    api.get(`/bookings/time-slots/${date}`),
  createBooking: (bookingData: any) =>
    api.post('/bookings', bookingData),
  getBookings: (params?: any) =>
    api.get('/bookings', { params }),
  getBookingById: (id: string) =>
    api.get(`/bookings/${id}`),
  updateBookingStatus: (id: string, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
  cancelBooking: (id: string, reason?: string) =>
    api.put(`/bookings/${id}/cancel`, { cancellationReason: reason }),
}

// Admin API
export const adminAPI = {
  // Time slots
  getTimeSlots: () =>
    api.get('/admin/time-slots'),
  createTimeSlot: (timeSlotData: any) =>
    api.post('/admin/time-slots', timeSlotData),
  updateTimeSlot: (id: string, timeSlotData: any) =>
    api.put(`/admin/time-slots/${id}`, timeSlotData),
  deleteTimeSlot: (id: string) =>
    api.delete(`/admin/time-slots/${id}`),

  // Custom fields
  getCustomFields: () =>
    api.get('/admin/custom-fields'),
  createCustomField: (fieldData: any) =>
    api.post('/admin/custom-fields', fieldData),
  updateCustomField: (id: string, fieldData: any) =>
    api.put(`/admin/custom-fields/${id}`, fieldData),
  deleteCustomField: (id: string) =>
    api.delete(`/admin/custom-fields/${id}`),

  // Users
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  createUser: (userData: any) =>
    api.post('/admin/users', userData),
  updateUser: (id: string, userData: any) =>
    api.put(`/admin/users/${id}`, userData),
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),

  // System Config API
  getSystemConfig: (type: string) => api.get(`/system-config/${type}`),
  updateSystemConfig: (type: string, config: any) => api.put(`/system-config/${type}`, { config }),
  getAllSystemConfigs: () => api.get('/system-config'),
}
