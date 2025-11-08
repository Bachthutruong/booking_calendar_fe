import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Footer from '@/components/common/Footer'
import { bookingAPI, adminAPI, api } from '@/lib/api'
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
  const [customFieldLabelsById, setCustomFieldLabelsById] = useState<Record<string, string>>({})
  const [customFieldNamesById, setCustomFieldNamesById] = useState<Record<string, string>>({})
  const [showFooter, setShowFooter] = useState<boolean>(true)

  useEffect(() => {
    adminAPI.getSystemConfig('success_page').then(res => setConfig(res.data.config || {})).catch(() => {})
    if (bookingId) {
      bookingAPI.getBookingById(bookingId).then(res => {
        const bookingData = res.data.booking
        setBooking(bookingData)
        // Debug: log booking data to see custom fields
        console.log('Booking data:', bookingData)
        console.log('Custom fields:', bookingData?.customFields)
      }).catch(() => {})
    }
    window.scrollTo({ top: 0 })
  }, [bookingId])

  // Load footer config
  useEffect(() => {
    const fetchFooterConfig = async () => {
      try {
        const res = await api.get('/system-config/footer')
        setShowFooter(res.data.config?.showFooter !== false) // Default to true if not set
      } catch (e) {
        // Default to showing footer if error
        setShowFooter(true)
      }
    }
    fetchFooterConfig()
  }, [])

  // Load custom field definitions for labels
  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const res = await adminAPI.getCustomFields()
        const defs = res.data?.customFields || []
        const byId: Record<string, string> = {}
        const nameById: Record<string, string> = {}
        
        defs.forEach((d: any) => {
          byId[d._id] = d.label
          nameById[d._id] = d.name
        })
        
        setCustomFieldLabelsById(byId)
        setCustomFieldNamesById(nameById)
        // Debug: log custom fields
        console.log('Custom field definitions loaded:', defs.length, 'fields')
      } catch (e) {
        console.error('Error loading custom fields:', e)
      }
    }
    loadCustomFields()
  }, [])

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
                <h1 className="text-base font-semibold text-gray-900">預約成功</h1>
                <p className="text-xs text-gray-600">感謝您的預約</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{config.heading || '已收到您的聯絡資訊'}</h2>
          <p className="text-gray-600">{config.subheading || '我們將再次聯繫您進行確認與詳細說明。'}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin note */}
          <Card className="md:col-span-1 shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-green-800">{config.adminNoteTitle || '管理員提醒'}</CardTitle>
              <CardDescription>{booking ? '請仔細閱讀以下資訊' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rich-content text-gray-700" dangerouslySetInnerHTML={{ __html: config.adminNoteContent || '感謝您的預約。' }} />
            </CardContent>
          </Card>

          {/* 預約諮詢時間 - Moved from summary badges */}
          <Card className="md:col-span-2 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-gray-800">預約諮詢時間</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {booking ? (
                <>
                  {/* Thông tin cơ bản */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm bg-blue-50 border-blue-200 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.bookingDate)}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm bg-green-50 border-green-200 text-green-700">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(booking.timeSlot)}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm bg-purple-50 border-purple-200 text-purple-700">
                      <User className="h-4 w-4" />
                      <span>{booking.customerName}</span>
                    </div>
                    {booking.customerEmail && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm bg-pink-50 border-pink-200 text-pink-700">
                        <Mail className="h-4 w-4" />
                        <span>{booking.customerEmail}</span>
                      </div>
                    )}
                    {booking.customerPhone && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm bg-amber-50 border-amber-200 text-amber-700">
                        <Phone className="h-4 w-4" />
                        <span>{booking.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Custom fields - Các thông tin khách hàng đã điền */}
                  {booking.customFields && booking.customFields.length > 0 && (() => {
                    // Lọc các custom fields (trừ 3 field mặc định đã hiển thị ở trên)
                    const defaultFieldNames = ['customer_name', 'user_name', 'email', 'customer_phone', 'phone']
                    
                    // Lọc các field có giá trị và không phải default fields
                    const otherFields = booking.customFields.filter((f: any) => {
                      // Lấy field name từ enriched data (có thể có name trực tiếp)
                      const fieldName = f.name || customFieldNamesById[f.fieldId] || (f as any).fieldName
                      
                      // Kiểm tra xem có phải default field không
                      const isDefaultField = fieldName && defaultFieldNames.includes(fieldName)
                      
                      // Kiểm tra xem có giá trị không
                      const hasValue = f.value !== null && f.value !== undefined && f.value !== '' && 
                                      (Array.isArray(f.value) ? f.value.length > 0 : true)
                      
                      // Chỉ hiển thị nếu không phải default field và có giá trị
                      return !isDefaultField && hasValue
                    })

                    if (otherFields.length > 0) {
                      return (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700">其他資訊</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {otherFields.map((field: any, index: number) => {
                              // Lấy label từ enriched data hoặc từ customFieldLabelsById
                              const label = field.label || customFieldLabelsById[field.fieldId] || field.name || '欄位'
                              const value = Array.isArray(field.value) ? field.value.join(', ') : String(field.value ?? '')
                              return (
                                <div key={index} className="p-3 rounded-lg border bg-gradient-to-br from-white to-gray-50">
                                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
                                  <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </>
              ) : (
                <p className="text-gray-500">找不到預約資訊。</p>
              )}

              <div className="pt-4 border-t">
                <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  回到首頁
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  )
}

export default BookingSuccessPage


