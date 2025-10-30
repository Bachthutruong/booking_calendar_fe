import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Footer from '@/components/common/Footer'
import { bookingAPI, adminAPI } from '@/lib/api'
import { formatDate, formatTime } from '@/lib/utils'
import { CheckCircle2, Calendar, Clock, User, ArrowRight, Mail, Phone } from 'lucide-react'

interface SuccessConfig {
  heading?: string
  subheading?: string
  adminNoteTitle?: string
  adminNoteContent?: string
  ctaText?: string
}

const useQuery = () => new URLSearchParams(useLocation().search)

const BookingSuccessPage = () => {
  const navigate = useNavigate()
  const query = useQuery()
  const bookingId = query.get('bookingId') || ''

  const [config, setConfig] = useState<SuccessConfig>({})
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    adminAPI.getSystemConfig('success_page').then(res => setConfig(res.data.config || {})).catch(() => {})
    if (bookingId) {
      bookingAPI.getBookingById(bookingId).then(res => setBooking(res.data.booking)).catch(() => {})
    }
    window.scrollTo({ top: 0 })
  }, [bookingId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <style>{`
        .rich-content ul { list-style: disc; padding-left: 1.25rem; }
        .rich-content ol { list-style: decimal; padding-left: 1.25rem; }
        .rich-content blockquote { border-left: 4px solid #e5e7eb; padding-left: .75rem; color: #6b7280; }
        .rich-content h1 { font-size: 1.5rem; font-weight: 700; }
        .rich-content h2 { font-size: 1.25rem; font-weight: 700; }
        .rich-content h3 { font-size: 1.125rem; font-weight: 600; }
        .rich-content a { color: #2563eb; text-decoration: underline; }
      `}</style>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-lg p-1.5">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Đặt lịch thành công</h1>
                <p className="text-xs text-gray-600">Cảm ơn bạn đã đặt lịch</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero */}
        <div className="text-center py-8 rounded-2xl bg-white/70 border">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{config.heading || 'Thông tin liên hệ đã được ghi nhận'}</h2>
          <p className="text-gray-600">{config.subheading || 'Chúng tôi sẽ liên hệ lại để xác nhận và tư vấn chi tiết.'}</p>
        </div>

        {/* Summary badges */}
        {booking && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-blue-50 border-blue-200 text-blue-700">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(booking.bookingDate)}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-green-50 border-green-200 text-green-700">
              <Clock className="h-4 w-4" />
              <span>{formatTime(booking.timeSlot)}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-purple-50 border-purple-200 text-purple-700">
              <User className="h-4 w-4" />
              <span>{booking.customerName}</span>
            </div>
            {booking.customerEmail && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-pink-50 border-pink-200 text-pink-700">
                <Mail className="h-4 w-4" />
                <span>{booking.customerEmail}</span>
              </div>
            )}
            {booking.customerPhone && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-amber-50 border-amber-200 text-amber-700">
                <Phone className="h-4 w-4" />
                <span>{booking.customerPhone}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin note */}
          <Card className="md:col-span-1 shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-green-800">{config.adminNoteTitle || 'Lưu ý từ quản trị viên'}</CardTitle>
              <CardDescription>{booking ? 'Vui lòng đọc kỹ thông tin dưới đây' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rich-content text-gray-700" dangerouslySetInnerHTML={{ __html: config.adminNoteContent || 'Cảm ơn bạn đã đặt lịch.' }} />
            </CardContent>
          </Card>

          {/* Booking details */}
          <Card className="md:col-span-2 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-gray-800">Chi tiết đặt lịch</CardTitle>
              <CardDescription>Thông tin bạn đã cung cấp</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {booking ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                    </div>
                    {booking.customerEmail && (
                      <div className="space-y-1">
                        <p className="text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">{booking.customerEmail}</p>
                      </div>
                    )}
                    {booking.customerPhone && (
                      <div className="space-y-1">
                        <p className="text-gray-500">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-gray-500">Ngày</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.bookingDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Khung giờ</p>
                      <p className="font-semibold text-gray-900">{formatTime(booking.timeSlot)}</p>
                    </div>
                  </div>

                  {/* Dynamic custom fields */}
                  {Array.isArray(booking.customFields) && booking.customFields.filter((f:any)=>f.isActive && f.label).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">Các thông tin khác</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {booking.customFields
                          .filter((f: any) => f.isActive && f.label && (Array.isArray(f.value) ? f.value.length > 0 : String(f.value ?? '') !== ''))
                          .map((field: any) => (
                            <div key={field.fieldId} className="p-3 rounded-lg border bg-gradient-to-br from-white to-gray-50">
                              <p className="text-xs uppercase tracking-wide text-gray-500">{field.label}</p>
                              <p className="mt-1 font-medium text-gray-900 break-words">
                                {Array.isArray(field.value) ? field.value.join(', ') : String(field.value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Không tìm thấy thông tin đặt lịch.</p>
              )}

              <div className="pt-2">
                <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Về trang chủ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BookingSuccessPage


