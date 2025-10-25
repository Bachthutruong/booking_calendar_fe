import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  LogOut, 
  BarChart3, 
  Clock,
  FormInput,
  User,
  Globe
} from 'lucide-react'

const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3, path: '/admin/dashboard' },
    { id: 'bookings', label: 'Quản lý đặt lịch', icon: Calendar, path: '/admin/bookings' },
    { id: 'time-slots', label: 'Khung giờ', icon: Clock, path: '/admin/time-slots' },
    { id: 'custom-fields', label: 'Trường tùy chỉnh', icon: FormInput, path: '/admin/custom-fields' },
    { id: 'users', label: 'Quản lý người dùng', icon: Users, path: '/admin/users' },
    { id: 'system-config', label: 'Cấu hình hệ thống', icon: Globe, path: '/admin/system-config' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const getCurrentPage = () => {
    const path = location.pathname
    if (path.includes('/bookings')) return 'bookings'
    if (path.includes('/time-slots')) return 'time-slots'
    if (path.includes('/custom-fields')) return 'custom-fields'
    if (path.includes('/users')) return 'users'
    if (path.includes('/system-config')) return 'system-config'
    return 'overview'
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary to-blue-600">
          <div className="flex items-center">
            <div className="bg-white/20 rounded-lg p-2 mr-3">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-white/80">Quản lý hệ thống</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = getCurrentPage() === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-primary/10 hover:text-primary'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center mb-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="bg-primary rounded-full p-2 mr-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mt-1">
                {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
