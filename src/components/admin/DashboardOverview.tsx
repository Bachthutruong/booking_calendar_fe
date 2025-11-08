import { useMemo, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Calendar, Users, Clock, CheckCircle, Eye, XCircle, AlertCircle, User, Mail, Phone } from 'lucide-react'

const DashboardOverview = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [monthFilter, setMonthFilter] = useState<'thisMonth' | 'custom'>('thisMonth')
  const [customMonth, setCustomMonth] = useState<string>('')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [customFieldLabelsById, setCustomFieldLabelsById] = useState<Record<string, string>>({})

  // Tự động set tháng hiện tại khi chuyển sang custom mode
  useEffect(() => {
    if (monthFilter === 'custom' && !customMonth) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      setCustomMonth(`${year}-${month}`)
    }
  }, [monthFilter, customMonth])

  // Tính toán date range dựa trên filter
  const getDateRange = () => {
    if (monthFilter === 'thisMonth') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
      }
    } else if (monthFilter === 'custom' && customMonth) {
      // customMonth format: YYYY-MM
      const [year, month] = customMonth.split('-')
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      return {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
      }
    }
    return null
  }

  const dateRange = getDateRange()
  
  // Build API query string
  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.append('limit', '1000') // Lấy tất cả để tính stats
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }
    return params.toString()
  }

  // Chỉ query khi có dateRange hợp lệ
  const shouldQuery = Boolean(monthFilter === 'thisMonth' || (monthFilter === 'custom' && customMonth && customMonth.trim() !== ''))

  const { data: bookingsData } = useQuery(
    ['dashboard-bookings', monthFilter, customMonth],
    () => api.get(`/bookings?${buildQueryString()}`),
    {
      enabled: shouldQuery
    }
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

  // Load custom field labels
  useEffect(() => {
    const loadCustomFieldLabels = async () => {
      try {
        const res = await api.get('/admin/custom-fields')
        const defs = res.data?.customFields || []
        const byId: Record<string, string> = {}
        defs.forEach((d: any) => {
          byId[d._id] = d.label
        })
        setCustomFieldLabelsById(byId)
      } catch (e) {
        // Non-blocking
      }
    }
    loadCustomFieldLabels()
  }, [])

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

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      toast({
        title: "更新成功",
        description: "預約狀態已更新"
      })
      queryClient.invalidateQueries(['dashboard-bookings', monthFilter, customMonth])
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法更新狀態",
        variant: "destructive"
      })
    }
  }

  const cancelBooking = async () => {
    if (!selectedBooking) return
    
    try {
      await api.put(`/bookings/${selectedBooking._id}/cancel`, {
        cancellationReason
      })
      toast({
        title: "取消成功",
        description: "預約已取消並已寄出通知郵件"
      })
      setShowCancelDialog(false)
      setSelectedBooking(null)
      setCancellationReason('')
      queryClient.invalidateQueries(['dashboard-bookings', monthFilter, customMonth])
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法取消預約",
        variant: "destructive"
      })
    }
  }

  const confirmBooking = async () => {
    if (!selectedBooking) return
    
    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, { status: 'confirmed' })
      toast({
        title: "確認成功",
        description: "預約已確認並已寄出通知郵件"
      })
      setShowConfirmDialog(false)
      setSelectedBooking(null)
      queryClient.invalidateQueries(['dashboard-bookings', monthFilter, customMonth])
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法確認預約",
        variant: "destructive"
      })
    }
  }

  const handleConfirmAction = (booking: any, action: 'confirm' | 'cancel') => {
    setSelectedBooking(booking)
    if (action === 'confirm') {
      setShowConfirmDialog(true)
    } else {
      setShowCancelDialog(true)
    }
  }

  return (
    <div className="space-y-6" lang="zh-TW">
      <div>
        <h2 className="text-3xl font-bold">系統總覽</h2>
        <p className="text-gray-600">預約系統的統計與總覽資訊</p>
        
        {/* Month Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Badge
            variant={monthFilter === 'thisMonth' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => {
              setMonthFilter('thisMonth')
              setCustomMonth('')
            }}
          >
            本月
          </Badge>
          <Badge
            variant={monthFilter === 'custom' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setMonthFilter('custom')}
          >
            選擇月份
          </Badge>
          {monthFilter === 'custom' && (
            <div lang="zh-TW" className="flex items-center gap-2">
              <Input
                type="month"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
                className="w-auto inline-block"
                placeholder="選擇年月"
                lang="zh-TW"
              />
              {customMonth && (() => {
                const [year, month] = customMonth.split('-')
                const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
                return (
                  <span className="text-sm text-gray-600">
                    {year}年{monthNames[parseInt(month) - 1]}
                  </span>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總預約數</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              系統中的所有預約
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待確認</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              待確認的預約
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已確認</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              已確認的預約
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">時段</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTimeSlots}</div>
            <p className="text-xs text-muted-foreground">
              總時段數
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>最近預約</CardTitle>
          <CardDescription>
            最新的預約清單
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">尚無預約</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{getDisplayName(booking) || '—'}</p>
                    <p className="text-sm text-gray-600">{getDisplayEmail(booking) || '—'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString('zh-TW')} - {booking.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'pending' ? '待確認' :
                       booking.status === 'confirmed' ? '已確認' :
                       booking.status === 'cancelled' ? '已取消' : '已完成'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowDetailsDialog(true)
                        }}
                        className="h-8 w-8 p-0 border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmAction(booking, 'confirm')}
                            className="h-8 px-2 bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            確認
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmAction(booking, 'cancel')}
                            className="h-8 px-2 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            取消
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="h-8 px-2 bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            完成
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmAction(booking, 'cancel')}
                            className="h-8 px-2 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            取消
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">預約詳情</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">客戶資訊</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{getDisplayName(selectedBooking) || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{getDisplayEmail(selectedBooking) || '—'}</span>
                      </div>
                      {selectedBooking.customerPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedBooking.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">預約資訊</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(selectedBooking.bookingDate).toLocaleDateString('zh-TW')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{selectedBooking.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">狀態：</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBooking.status === 'pending' ? '待確認' :
                           selectedBooking.status === 'confirmed' ? '已確認' :
                           selectedBooking.status === 'cancelled' ? '已取消' : '已完成'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.customFields && selectedBooking.customFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">補充資訊</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedBooking.customFields.map((field: any, index: number) => {
                      const label = customFieldLabelsById[field.fieldId] || (field as any).fieldName || '欄位'
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{label}:</span>
                          <p className="text-gray-900 mt-1">{Array.isArray(field.value) ? field.value.join(', ') : String(field.value)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">備註</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailsDialog(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">確認預約</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">確認預約</span>
                </div>
                <p className="text-green-700">
                  您確定要確認 <strong>{getDisplayName(selectedBooking)}</strong> 的預約嗎？
                </p>
                <p className="text-sm text-green-600 mt-2">
                  系統將自動寄送確認郵件給客戶。
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">預約資訊：</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>客戶：</strong> {getDisplayName(selectedBooking)}</div>
                  <div><strong>Email:</strong> {getDisplayEmail(selectedBooking)}</div>
                  <div><strong>日期：</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString('zh-TW')}</div>
                  <div><strong>時間：</strong> {selectedBooking.timeSlot}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setSelectedBooking(null)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  取消
                </Button>
                <Button
                  onClick={confirmBooking}
                  className="bg-green-600 hover:bg-green-700"
                >
                  確認
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">取消預約</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">確認取消預約</span>
                </div>
                <p className="text-red-700">
                  您確定要取消 <strong>{getDisplayName(selectedBooking)}</strong> 的預約嗎？
                </p>
                <p className="text-sm text-red-600 mt-2">
                  系統將寄送取消通知郵件給客戶。
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">取消原因（選填）</label>
                <Textarea
                  placeholder="請輸入取消原因..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCancelDialog(false)
                    setSelectedBooking(null)
                    setCancellationReason('')
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  取消
                </Button>
                <Button
                  onClick={cancelBooking}
                  className="bg-red-600 hover:bg-red-700"
                >
                  確認取消
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardOverview
