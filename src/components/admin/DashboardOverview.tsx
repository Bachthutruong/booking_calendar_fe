import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react'

const DashboardOverview = () => {
  const { data: bookingsData } = useQuery(
    'dashboard-bookings',
    () => api.get('/bookings?limit=10')
  )

  const { data: timeSlotsData } = useQuery(
    'dashboard-time-slots',
    () => api.get('/admin/time-slots')
  )

  // Load custom fields to resolve names by fieldId
  const { data: customFieldsData } = useQuery(
    'dashboard-custom-fields',
    () => api.get('/admin/custom-fields')
  )

  const bookings = bookingsData?.data.bookings || []
  const timeSlots = timeSlotsData?.data.timeSlots || []

  const customFieldNamesById = useMemo(() => {
    const map: Record<string, string> = {}
    const defs = customFieldsData?.data?.customFields || []
    defs.forEach((d: any) => { map[d._id] = d.name })
    return map
  }, [customFieldsData])

  const getCustomFieldValueByName = (booking: any, fieldName: string) => {
    const match = booking?.customFields?.find((f: any) => {
      const cfgName = customFieldNamesById[f.fieldId]
      return f.fieldName === fieldName || cfgName === fieldName
    })
    return match?.value ?? ''
  }

  const getDisplayName = (booking: any) => {
    return getCustomFieldValueByName(booking, 'user_name') || booking.customerName || ''
  }

  const getDisplayEmail = (booking: any) => {
    return getCustomFieldValueByName(booking, 'email') || booking.customerEmail || ''
  }

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
    confirmedBookings: bookings.filter((b: any) => b.status === 'confirmed').length,
    totalTimeSlots: timeSlots.length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Tổng quan hệ thống</h2>
        <p className="text-gray-600">Thống kê và thông tin tổng quan về hệ thống đặt lịch</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đặt lịch</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả đặt lịch trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Đặt lịch chờ xác nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Đặt lịch đã xác nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khung giờ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTimeSlots}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số khung giờ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Đặt lịch gần đây</CardTitle>
          <CardDescription>
            Danh sách các đặt lịch mới nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có đặt lịch nào</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{getDisplayName(booking) || '—'}</p>
                    <p className="text-sm text-gray-600">{getDisplayEmail(booking) || '—'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString('vi-VN')} - {booking.timeSlot}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'pending' ? 'Chờ xác nhận' :
                       booking.status === 'confirmed' ? 'Đã xác nhận' :
                       booking.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardOverview
