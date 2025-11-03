import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Calendar, Clock, User, Mail, Phone, Search, X, Eye, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface AdminBooking {
  _id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  bookingDate: string
  timeSlot: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  customFields: Array<{
    fieldId: string
    value: any
    fieldName?: string
  }>
  notes?: string
  createdAt: string
  cancelledAt?: string
  cancellationReason?: string
  cancelledBy?: string | { _id?: string; name?: string; email?: string }
}

const BookingsList = () => {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('confirmed')
  const [rangeFilter, setRangeFilter] = useState<'last7' | 'all'>('last7')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Custom fields definitions for labeling
  const [customFieldLabelsById, setCustomFieldLabelsById] = useState<Record<string, string>>({})
  const [customFieldNamesById, setCustomFieldNamesById] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchBookings()
  }, [searchTerm, statusFilter, dateFilter, currentPage, pageSize, rangeFilter])

  // Debounce search input -> query param
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    // Load custom field definitions for labels (admin endpoint)
    const loadCustomFields = async () => {
      try {
        const res = await api.get('/admin/custom-fields')
        const defs = res.data?.customFields || []
        const byId: Record<string, string> = {}
        const nameById: Record<string, string> = {}
        defs.forEach((d: any) => {
          byId[d._id] = d.label
          nameById[d._id] = d.name
        })
        setCustomFieldLabelsById(byId)
        setCustomFieldNamesById(nameById)
      } catch (e) {
        // Non-blocking
      }
    }
    loadCustomFields()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      params.append('range', rangeFilter)
      if (dateFilter) params.append('date', dateFilter)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())
      
      const response = await api.get(`/bookings?${params.toString()}`)
      let items: AdminBooking[] = response.data.bookings || []
      setBookings(items)
      
      // Update pagination info
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages)
        setTotalItems(response.data.pagination.total)
      }
    } catch (error) {
      console.error('Fetch bookings error:', error)
      toast({
        title: "錯誤",
        description: "無法載入預約列表",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getCustomFieldValueByName = (booking: AdminBooking, fieldName: string) => {
    const match = booking.customFields?.find((f) => {
      const cfgName = customFieldNamesById[f.fieldId]
      return (f as any).fieldName === fieldName || cfgName === fieldName
    })
    return match?.value ?? ''
  }

  const getDisplayName = (booking: AdminBooking) => {
    return getCustomFieldValueByName(booking, 'user_name') || booking.customerName || ''
  }

  const getDisplayEmail = (booking: AdminBooking) => {
    return getCustomFieldValueByName(booking, 'email') || booking.customerEmail || ''
  }

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      toast({
        title: "更新成功",
        description: "預約狀態已更新"
      })
      fetchBookings()
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
      fetchBookings()
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法取消預約",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '待確認', variant: 'secondary' as const },
      confirmed: { label: '已確認', variant: 'default' as const },
      cancelled: { label: '已取消', variant: 'destructive' as const },
      completed: { label: '已完成', variant: 'outline' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Pagination helpers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const switchRange = (range: 'last7' | 'all') => {
    setRangeFilter(range)
    // Reset pagination and filters appropriately
    setCurrentPage(1)
    if (range === 'last7') {
      // Force confirmed in last7 view
      setStatusFilter('confirmed')
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDateFilter('')
    setCurrentPage(1)
  }

  const handleConfirmAction = (booking: AdminBooking, action: 'confirm' | 'cancel') => {
    setSelectedBooking(booking)
    if (action === 'confirm') {
      setShowConfirmDialog(true)
    } else {
      setShowCancelDialog(true)
    }
  }

  const confirmBooking = async () => {
    if (!selectedBooking) return
    
    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, { status: 'confirmed' })
      toast({
        title: "Xác nhận thành công",
        description: "Đặt lịch đã được xác nhận và email thông báo đã được gửi đến khách hàng"
      })
      setShowConfirmDialog(false)
      setSelectedBooking(null)
      fetchBookings()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận đặt lịch",
        variant: "destructive"
      })
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">預約管理</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          檢視並管理所有客戶的諮詢預約
        </p>
        
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">搜尋篩選</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">搜尋</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="姓名、客戶 Email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">日期</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">每頁顯示數量</label>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">&nbsp;</label>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                清除篩選
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <div className="text-center">
            <CardTitle className="text-xl text-gray-800">預約列表</CardTitle>
            <div className="mt-1 flex flex-col items-start justify-start gap-2 text-gray-600">
              {/* Row 1: Range badges */}
              <div className="inline-flex items-start justify-start gap-2">
                <button
                  type="button"
                  onClick={() => switchRange('last7')}
                  className={`px-3 py-1 rounded-full text-xs border ${rangeFilter === 'last7' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  最近 7 天
                </button>
                <button
                  type="button"
                  onClick={() => switchRange('all')}
                  className={`px-3 py-1 rounded-full text-xs border ${rangeFilter === 'all' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  全部
                </button>
              </div>
              {/* Row 2: Status badges */}
              <div className="inline-flex items-center gap-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'pending', label: '待確認' },
                  { key: 'confirmed', label: '已確認' },
                  { key: 'cancelled', label: '已取消' },
                  { key: 'completed', label: '已完成' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => { setStatusFilter(s.key as any); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-full text-xs border ${statusFilter === s.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在載入預約列表...</p>
            </div>
          ) : bookings.length === 0 ? (
              <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">沒有預約</h3>
                <p className="text-gray-500">找不到符合篩選條件的預約</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">客戶</TableHead>
                    <TableHead className="w-[150px]">聯絡方式</TableHead>
                    <TableHead className="w-[120px]">預約日期</TableHead>
                    <TableHead className="w-[100px]">時間</TableHead>
                    <TableHead className="w-[120px]">狀態</TableHead>
                    <TableHead className="w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{getDisplayName(booking) || '—'}</div>
                            {booking.notes && (
                              <div className="text-xs text-gray-500 truncate max-w-[150px]" title={booking.notes}>
                                {booking.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[120px]" title={getDisplayEmail(booking)}>
                              {getDisplayEmail(booking) || '—'}
                            </span>
                          </div>
                          {booking.customerPhone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{booking.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(booking.bookingDate).toLocaleDateString('zh-TW')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{booking.timeSlot}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {rangeFilter === 'last7'
                    ? `最近 7 天共 ${totalItems} 筆結果（已確認）`
                    : `顯示第 ${((currentPage - 1) * pageSize) + 1} - ${Math.min(currentPage * pageSize, totalItems)} 筆／共 ${totalItems} 筆`}
                </div>
                {rangeFilter === 'last7' ? null : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
                )}
              </div>
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
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.customFields && selectedBooking.customFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">補充資訊</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedBooking.customFields.map((field, index) => {
                      const label = customFieldLabelsById[field.fieldId] || field.fieldName || '欄位'
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

              {selectedBooking.status === 'cancelled' && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">取消原因</h3>
                  {selectedBooking.cancellationReason ? (
                    <p className="text-red-600">{selectedBooking.cancellationReason}</p>
                  ) : (
                    <p className="text-red-600">無原因</p>
                  )}
                  <div className="text-sm text-red-500 mt-2 space-y-1">
                    {selectedBooking.cancelledAt && (
                      <p>取消時間：{new Date(selectedBooking.cancelledAt).toLocaleString('zh-TW')}</p>
                    )}
                    {selectedBooking.cancelledBy && (
                      <p>
                        取消者：{
                          typeof selectedBooking.cancelledBy === 'string'
                            ? selectedBooking.cancelledBy
                            : `${selectedBooking.cancelledBy.name || 'N/A'}${selectedBooking.cancelledBy.email ? ` (${selectedBooking.cancelledBy.email})` : ''}`
                        }
                      </p>
                    )}
                  </div>
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
                  您確定要確認 <strong>{selectedBooking.customerName}</strong> 的預約嗎？
                </p>
                <p className="text-sm text-green-600 mt-2">
                  系統將自動寄送確認郵件給客戶。
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">預約資訊：</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>客戶：</strong> {selectedBooking.customerName}</div>
                  <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>
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
                  您確定要取消 <strong>{selectedBooking.customerName}</strong> 的預約嗎？
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

export default BookingsList