import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Calendar, Clock, User, Mail, Phone, Search, X, Eye, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Booking {
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
  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

const BookingsList = () => {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    fetchBookings()
  }, [searchTerm, statusFilter, dateFilter, currentPage, pageSize])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFilter) params.append('date', dateFilter)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())
      
      const response = await api.get(`/bookings?${params.toString()}`)
      setBookings(response.data.bookings || [])
      
      // Update pagination info
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages)
        setTotalItems(response.data.pagination.total)
      }
    } catch (error) {
      console.error('Fetch bookings error:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đặt lịch",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái đặt lịch đã được cập nhật"
      })
      fetchBookings()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
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
        title: "Hủy thành công",
        description: "Đặt lịch đã được hủy và email thông báo đã được gửi"
      })
      setShowCancelDialog(false)
      setSelectedBooking(null)
      setCancellationReason('')
      fetchBookings()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy đặt lịch",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', variant: 'secondary' as const },
      confirmed: { label: 'Đã xác nhận', variant: 'default' as const },
      cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
      completed: { label: 'Hoàn thành', variant: 'outline' as const }
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

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDateFilter('')
    setCurrentPage(1)
  }

  const handleConfirmAction = (booking: Booking, action: 'confirm' | 'cancel') => {
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đặt lịch</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Xem và quản lý tất cả đặt lịch tư vấn của khách hàng
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tên, email khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ngày</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Số lượng hiển thị</label>
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
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <div className="text-center">
            <CardTitle className="text-xl text-gray-800">Danh sách đặt lịch</CardTitle>
            <CardDescription className="text-gray-600">
              {totalItems} đặt lịch được tìm thấy - Trang {currentPage} / {totalPages}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách đặt lịch...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có đặt lịch</h3>
              <p className="text-gray-500">Không tìm thấy đặt lịch nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Khách hàng</TableHead>
                    <TableHead className="w-[150px]">Liên hệ</TableHead>
                    <TableHead className="w-[120px]">Ngày đặt</TableHead>
                    <TableHead className="w-[100px]">Giờ</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="w-[200px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{booking.customerName}</div>
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
                            <span className="truncate max-w-[120px]" title={booking.customerEmail}>
                              {booking.customerEmail}
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
                            {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
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
                                Xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfirmAction(booking, 'cancel')}
                                className="h-8 px-2 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Hủy
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
                                Hoàn thành
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfirmAction(booking, 'cancel')}
                                className="h-8 px-2 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Hủy
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
                  Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, totalItems)} trong tổng số {totalItems} kết quả
                </div>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Chi tiết đặt lịch</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin khách hàng</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedBooking.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedBooking.customerEmail}</span>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin đặt lịch</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{selectedBooking.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Trạng thái:</span>
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.customFields && selectedBooking.customFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin bổ sung</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedBooking.customFields.map((field, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{field.fieldName || 'Field'}:</span>
                        <p className="text-gray-900 mt-1">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ghi chú</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.status === 'cancelled' && selectedBooking.cancellationReason && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Lý do hủy</h3>
                  <p className="text-red-600">{selectedBooking.cancellationReason}</p>
                  {selectedBooking.cancelledAt && (
                    <p className="text-sm text-red-500 mt-2">
                      Hủy lúc: {new Date(selectedBooking.cancelledAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailsDialog(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Đóng
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
            <DialogTitle className="text-xl font-bold">Xác nhận đặt lịch</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Xác nhận đặt lịch</span>
                </div>
                <p className="text-green-700">
                  Bạn có chắc chắn muốn xác nhận đặt lịch của <strong>{selectedBooking.customerName}</strong>?
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Email xác nhận sẽ được tự động gửi đến khách hàng.
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin đặt lịch:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Khách hàng:</strong> {selectedBooking.customerName}</div>
                  <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>
                  <div><strong>Ngày:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</div>
                  <div><strong>Giờ:</strong> {selectedBooking.timeSlot}</div>
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
                  Hủy
                </Button>
                <Button
                  onClick={confirmBooking}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Xác nhận
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
            <DialogTitle className="text-xl font-bold">Hủy đặt lịch</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Xác nhận hủy đặt lịch</span>
                </div>
                <p className="text-red-700">
                  Bạn có chắc chắn muốn hủy đặt lịch của <strong>{selectedBooking.customerName}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Email thông báo hủy lịch sẽ được gửi đến khách hàng.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Lý do hủy (tùy chọn)</label>
                <Textarea
                  placeholder="Nhập lý do hủy..."
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
                  Hủy
                </Button>
                <Button
                  onClick={cancelBooking}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Xác nhận hủy
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