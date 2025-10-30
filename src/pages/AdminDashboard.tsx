import { Routes, Route } from 'react-router-dom'
import AdminSidebar from '@/components/admin/AdminSidebar'
import BookingsList from '@/components/admin/BookingsList'
import TimeSlotsManagement from '@/components/admin/TimeSlotsManagement'
import CustomFieldsManagement from '@/components/admin/CustomFieldsManagement'
import UsersManagement from '@/components/admin/UsersManagement'
import DashboardOverview from '@/components/admin/DashboardOverview'
import SystemConfigManagement from '@/components/admin/SystemConfigManagement'
import SuccessPageConfig from '@/components/admin/SuccessPageConfig'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AdminSidebar />
      
      {/* Main content */}
      <div className="ml-64">
        <div className="p-6">
          <Routes>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/bookings" element={<BookingsList />} />
            <Route path="/time-slots" element={<TimeSlotsManagement />} />
            <Route path="/custom-fields" element={<CustomFieldsManagement />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/system-config" element={<SystemConfigManagement />} />
            <Route path="/success-page" element={<SuccessPageConfig />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
