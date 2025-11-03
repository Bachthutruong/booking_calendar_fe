import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminAPI } from '@/lib/api'
import { Plus, Edit, Trash2, Clock, Settings, Globe, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

interface TimeSlot {
  _id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  isWeekend: boolean
  specificDate?: string
  maxBookings: number
  currentBookings: number
}

const TimeSlotsManagement = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteGroup, setDeleteGroup] = useState<TimeSlot[] | null>(null)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'specific' | 'weekday' | 'allDays'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    type: 'all' as 'all' | 'weekday' | 'specific',
    timeSlots: '', // Format: "8:00-9:00,9:00-10:00,10:00-11:00"
    specificDate: '',
    dayOfWeek: 1,
    maxBookings: 1,
    isActive: true,
    closed: false
  })

  const { data: timeSlotsData, isLoading } = useQuery(
    'timeSlots',
    () => adminAPI.getTimeSlots()
  )

  const createMutation = useMutation(
    (data: any) => adminAPI.createTimeSlot(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timeSlots')
        toast({ title: "成功", description: "建立時段成功" })
        setIsDialogOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast({
          title: "錯誤",
          description: error.response?.data?.message || "發生錯誤",
          variant: "destructive"
        })
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => adminAPI.updateTimeSlot(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timeSlots')
        toast({ title: "成功", description: "更新時段成功" })
        setEditingSlot(null)
        setIsDialogOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast({
          title: "錯誤",
          description: error.response?.data?.message || "發生錯誤",
          variant: "destructive"
        })
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => adminAPI.deleteTimeSlot(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timeSlots')
        toast({ title: "成功", description: "刪除時段成功" })
      },
      onError: (error: any) => {
        toast({
          title: "錯誤",
          description: error.response?.data?.message || "發生錯誤",
          variant: "destructive"
        })
      }
    }
  )

  // Silent delete mutation for edit operations
  const silentDeleteMutation = useMutation(
    (id: string) => adminAPI.deleteTimeSlot(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timeSlots')
        // No toast for silent delete
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || "Có lỗi xảy ra",
          variant: "destructive"
        })
      }
    }
  )

  const resetForm = () => {
    setFormData({
      type: 'all',
      timeSlots: '',
      specificDate: '',
      maxBookings: 1,
      dayOfWeek: 1,
      isActive: true,
      closed: false
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Parse time slots from string format (or empty if closed)
    const timeSlotList = formData.closed ? [] : formData.timeSlots
      .split(',')
      .map(slot => slot.trim())
      .filter(slot => slot.includes('-'))
      .map(slot => {
        const [start, end] = slot.split('-').map(t => t.trim())
        return { startTime: start, endTime: end }
      })

    const submitData: any = {
      type: formData.type,
      timeSlots: timeSlotList,
      specificDate: formData.type === 'specific' ? formData.specificDate : undefined,
      dayOfWeek: formData.type === 'weekday' ? formData.dayOfWeek : undefined,
      maxBookings: formData.closed ? 0 : formData.maxBookings,
      isActive: formData.isActive
    }

    if (editingSlot) {
      // Khi edit, cần xóa tất cả slots cũ trong nhóm và tạo lại
      const allSlotsInGroup = timeSlots.filter((s: TimeSlot) => {
        if (editingSlot.specificDate) {
          return s.specificDate === editingSlot.specificDate && s.maxBookings === editingSlot.maxBookings && s.isActive === editingSlot.isActive
        } else {
          return !s.specificDate && s.dayOfWeek === editingSlot.dayOfWeek && s.maxBookings === editingSlot.maxBookings && s.isActive === editingSlot.isActive
        }
      })
      
      // Xóa tất cả slots cũ trước (silent delete)
      const deletePromises = allSlotsInGroup.map((slot: TimeSlot) => 
        silentDeleteMutation.mutateAsync(slot._id)
      )
      
      try {
        await Promise.all(deletePromises)
        // Sau khi xóa xong, tạo lại với dữ liệu mới
        createMutation.mutate(submitData)
      } catch (error) {
        toast({
          title: "錯誤",
          description: "更新時段時發生錯誤",
          variant: "destructive"
        })
      }
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot)
    
    // Tìm tất cả khung giờ trong cùng nhóm để hiển thị đầy đủ
    const allSlotsInGroup = timeSlots.filter((s: TimeSlot) => {
      if (slot.specificDate) {
        return s.specificDate === slot.specificDate && s.maxBookings === slot.maxBookings && s.isActive === slot.isActive
      } else {
        // Nhóm theo cùng dayOfWeek cho các quy tắc theo thứ
        return !s.specificDate && s.dayOfWeek === slot.dayOfWeek && s.maxBookings === slot.maxBookings && s.isActive === slot.isActive
      }
    })
    
    // Tạo chuỗi khung giờ từ unique slots trong nhóm
    const uniqueTimeSlots = allSlotsInGroup.reduce((acc: string[], s: TimeSlot) => {
      const timeSlot = `${s.startTime}-${s.endTime}`
      if (!acc.includes(timeSlot)) {
        acc.push(timeSlot)
      }
      return acc
    }, [])
    
    const timeSlotsString = uniqueTimeSlots.join(',')
    
    // Format specific date for input field (YYYY-MM-DD format)
    const formattedDate = slot.specificDate ? new Date(slot.specificDate).toISOString().split('T')[0] : ''
    
    const isClosedGroup = allSlotsInGroup.length > 0 && allSlotsInGroup.every((s: TimeSlot) => s.maxBookings === 0)

    setFormData({
      type: slot.specificDate ? 'specific' : 'weekday',
      timeSlots: timeSlotsString,
      specificDate: formattedDate,
      dayOfWeek: slot.dayOfWeek,
      maxBookings: slot.maxBookings,
      isActive: slot.isActive,
      closed: isClosedGroup
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingSlot(null)
    resetForm()
    setIsDialogOpen(true)
  }





  const timeSlots = timeSlotsData?.data.timeSlots || []

  // Group slots by their configuration (same type, same settings)
  const groupSlotsByConfig = (slots: TimeSlot[]) => {
    const groups: { [key: string]: TimeSlot[] } = {}

    const nonSpecific = slots.filter(s => !s.specificDate)
    // Build signature -> set of days mapping to detect all-days rules
    const signatureToDays = new Map<string, Set<number>>()
    nonSpecific.forEach(s => {
      const sig = `${s.startTime}-${s.endTime}-${s.maxBookings}-${s.isActive}`
      if (!signatureToDays.has(sig)) signatureToDays.set(sig, new Set<number>())
      signatureToDays.get(sig)!.add(s.dayOfWeek)
    })

    slots.forEach(slot => {
      let key = ''
      if (slot.specificDate) {
        key = `specific-${slot.specificDate}-${slot.maxBookings}-${slot.isActive}`
      } else {
        const sig = `${slot.startTime}-${slot.endTime}-${slot.maxBookings}-${slot.isActive}`
        const days = signatureToDays.get(sig)
        const isAllDays = days && days.size === 7
        key = isAllDays
          ? `allDays-${slot.maxBookings}-${slot.isActive}`
          : `weekday-${slot.dayOfWeek}-${slot.maxBookings}-${slot.isActive}`
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(slot)
    })

    return Object.values(groups)
  }

  // Get grouped slots for counting
  const allGroupedSlots = groupSlotsByConfig(timeSlots)
  const specificGroupedSlots = allGroupedSlots.filter(group => group[0].specificDate)
  const allDaysGroupedSlots = allGroupedSlots.filter(group => !group[0].specificDate && new Set(group.map(g => g.dayOfWeek)).size > 1)
  const weekdayGroupedSlots = allGroupedSlots.filter(group => !group[0].specificDate && new Set(group.map(g => g.dayOfWeek)).size === 1)

  // Filter grouped slots based on active filter
  const getFilteredGroupedSlots = () => {
    switch (activeFilter) {
      case 'specific':
        return specificGroupedSlots
      case 'weekday':
        return weekdayGroupedSlots
      case 'all':
        return allGroupedSlots
      case 'allDays':
        return allDaysGroupedSlots
      default:
        return allGroupedSlots
    }
  }

  const filteredGroupedSlots = getFilteredGroupedSlots()

  // Pagination logic for grouped slots
  const totalItems = filteredGroupedSlots.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGroupedSlots = filteredGroupedSlots.slice(startIndex, endIndex)

  // Reset to first page when filter changes
  const handleFilterChange = (filter: 'all' | 'specific' | 'weekday' | 'allDays') => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const renderTimeSlotTable = (groupedSlots: TimeSlot[][], title: string, icon: React.ReactNode, color: string) => {
    if (groupedSlots.length === 0) return null

    return (
      <Card className="shadow-lg border-0">
        <CardHeader className={`bg-gradient-to-r ${color} rounded-t-lg`}>
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
              <CardDescription className="text-gray-600">
                已設定 {groupedSlots.reduce((total, group) => total + group.length, 0)} 個時段，分為 {groupedSlots.length} 組
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">類型</TableHead>
                <TableHead className="w-[200px]">時段</TableHead>
                <TableHead className="w/[150px]">特定日期</TableHead>
                <TableHead className="w-[120px]">數量</TableHead>
                <TableHead className="w-[120px]">狀態</TableHead>
                <TableHead className="w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedSlots.map((group, groupIndex) => {
                const firstSlot = group[0]
                const isAllDaysGroup = !firstSlot.specificDate && new Set(group.map(s => s.dayOfWeek)).size === 7
                
                return (
                  <TableRow key={groupIndex}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {firstSlot.specificDate ? 'SP' : (isAllDaysGroup ? 'ALL' : ['CN','T2','T3','T4','T5','T6','T7'][firstSlot.dayOfWeek])}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {firstSlot.specificDate 
                            ? `特定日期：${new Date(firstSlot.specificDate).toLocaleDateString('zh-TW')}`
                            : isAllDaysGroup
                              ? '全部日期（週一 - 週日）'
                              : `依星期：${['週日','週一','週二','週三','週四','週五','週六'][firstSlot.dayOfWeek]}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const allClosed = group.every(s => s.maxBookings === 0)
                          if (allClosed) {
                            return (
                              <span className="text-sm text-gray-400">沒有時段</span>
                            )
                          }
                          // Lấy unique time slots để tránh duplicate, loại bỏ sentinel 00:00-00:00
                          const uniqueTimeSlots = group.reduce((acc: string[], slot) => {
                            const timeSlot = `${slot.startTime}-${slot.endTime}`
                            if (timeSlot === '00:00-00:00') return acc
                            if (!acc.includes(timeSlot)) {
                              acc.push(timeSlot)
                            }
                            return acc
                          }, [])
                          
                          return uniqueTimeSlots.map((timeSlot, slotIndex) => (
                            <Badge 
                              key={slotIndex} 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {timeSlot}
                            </Badge>
                          ))
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                          {firstSlot.specificDate ? (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-purple-700 font-medium">
                            {new Date(firstSlot.specificDate).toLocaleDateString('zh-TW')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {firstSlot.maxBookings}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={firstSlot.isActive ? "default" : "secondary"}>
                        {firstSlot.isActive ? '啟用' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(firstSlot)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteGroup(group)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">時段管理</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          設定可用的諮詢預約時段
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          建立新時段
        </Button>
        <Button 
          onClick={() => {
            setFormData({ ...formData, type: 'weekday', dayOfWeek: 1 })
            setIsDialogOpen(true)
          }} 
          variant="outline" 
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          依星期設定
        </Button>
        <Button 
          onClick={() => {
            setFormData({ ...formData, type: 'specific' })
            setIsDialogOpen(true)
          }} 
          variant="outline" 
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          設定特定日期
        </Button>
      </div>

      {/* Filter Badges - moved below Action Buttons to be above the table */}
      <div className="flex justify-start gap-4 mb-6">
        <Badge 
          variant={activeFilter === 'all' ? "default" : "outline"}
          className={`cursor-pointer px-4 py-2 text-sm ${
            activeFilter === 'all' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'hover:bg-blue-50'
          }`}
          onClick={() => handleFilterChange('all')}
        >
          <Globe className="h-4 w-4 mr-2" />
          全部 ({allGroupedSlots.length})
        </Badge>
        <Badge 
          variant={activeFilter === 'specific' ? "default" : "outline"}
          className={`cursor-pointer px-4 py-2 text-sm ${
            activeFilter === 'specific' 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'hover:bg-purple-50'
          }`}
          onClick={() => handleFilterChange('specific')}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          特定日期 ({specificGroupedSlots.length})
        </Badge>
        <Badge 
          variant={activeFilter === 'weekday' ? "default" : "outline"}
          className={`cursor-pointer px-4 py-2 text-sm ${
            activeFilter === 'weekday' 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'hover:bg-green-50'
          }`}
          onClick={() => handleFilterChange('weekday')}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          依星期 ({weekdayGroupedSlots.length})
        </Badge>
        <Badge 
          variant={activeFilter === 'allDays' ? "default" : "outline"}
          className={`cursor-pointer px-4 py-2 text-sm ${
            activeFilter === 'allDays' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'hover:bg-blue-50'
          }`}
          onClick={() => handleFilterChange('allDays')}
        >
          <Globe className="h-4 w-4 mr-2" />
          全部日期 ({allDaysGroupedSlots.length})
        </Badge>
      </div>

      {/* Time Slots Table */}
      {isLoading ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在載入時段...</p>
            </div>
          </CardContent>
        </Card>
      ) : allGroupedSlots.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12">
            <div className="text-center">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">尚無時段</h3>
              <p className="text-gray-500 mb-4">請建立第一個時段以開始使用</p>
              <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                建立第一個時段
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {(() => {
            const getTitleAndIcon = () => {
              switch (activeFilter) {
                case 'specific':
                  return {
                    title: "特定日期（最高優先）",
                    icon: <CalendarDays className="h-6 w-6 text-purple-600" />,
                    color: "from-purple-50 to-pink-50"
                  }
                case 'weekday':
                  return {
                    title: "依星期規則",
                    icon: <CalendarDays className="h-6 w-6 text-green-600" />,
                    color: "from-green-50 to-emerald-50"
                  }
                default:
                  return {
                    title: "所有時段",
                    icon: <Settings className="h-6 w-6 text-gray-600" />,
                    color: "from-gray-50 to-slate-50"
                  }
              }
            }
            
            const { title, icon, color } = getTitleAndIcon()
            return renderTimeSlotTable(paginatedGroupedSlots, title, icon, color)
          })()}
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
                    Hiển thị:
                  </Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
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
                <span className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong {totalItems} mục
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingSlot ? '編輯時段' : '建立新時段'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                設定類型
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'all' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="all"
                    checked={formData.type === 'all'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium">全部日期</div>
                    <div className="text-xs text-gray-500">週一 - 週日</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'weekday' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="weekday"
                    checked={formData.type === 'weekday'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium">依星期</div>
                    <div className="text-xs text-gray-500">選擇一個星期幾</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'specific' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="specific"
                    checked={formData.type === 'specific'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium">特定日期</div>
                    <div className="text-xs text-gray-500">高優先權</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.type === 'weekday' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  選擇星期
                </Label>
                <Select value={String(formData.dayOfWeek)} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="1">週一</SelectItem>
                  <SelectItem value="2">週二</SelectItem>
                  <SelectItem value="3">週三</SelectItem>
                  <SelectItem value="4">週四</SelectItem>
                  <SelectItem value="5">週五</SelectItem>
                  <SelectItem value="6">週六</SelectItem>
                  <SelectItem value="0">週日</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === 'specific' && (
              <div className="space-y-2">
                <Label htmlFor="specificDate" className="text-sm font-medium text-gray-700">
                  特定日期
                </Label>
                <Input
                  id="specificDate"
                  type="date"
                  value={formData.specificDate}
                  onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                  required={formData.type === 'specific'}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-purple-600">特定日期具有最高優先權</p>
              </div>
            )}

            {/* Toggle closed day */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">接待模式</Label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.closed}
                  onChange={(e) => {
                    const closed = e.target.checked
                    setFormData({
                      ...formData,
                      closed,
                      timeSlots: closed ? '' : formData.timeSlots,
                      maxBookings: closed ? 0 : Math.max(1, formData.maxBookings)
                    })
                  }}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">不接待（隱藏時段）</span>
              </div>
            </div>

            {!formData.closed && (
            <div className="space-y-2">
              <Label htmlFor="timeSlots" className="text-sm font-medium text-gray-700">
                時段（以逗號分隔）
              </Label>
              <Input
                id="timeSlots"
                value={formData.timeSlots}
                onChange={(e) => setFormData({ ...formData, timeSlots: e.target.value })}
                placeholder="8:00-9:00,9:00-10:00,10:00-11:00"
                // Cho phép để trống để biểu thị không có khung giờ
                required={false}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                範例：8:00-9:00,9:00-10:00,10:00-11:00,14:00-15:00,15:00-16:00
              </p>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxBookings" className="text-sm font-medium text-gray-700">
                  每個時段的最大預約數
                </Label>
                <Input
                  id="maxBookings"
                  type="number"
                  min="0"
                  value={formData.maxBookings}
                  onChange={(e) => setFormData({ ...formData, maxBookings: parseInt(e.target.value) })}
                  required={!formData.closed}
                  disabled={formData.closed}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">狀態</Label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">啟用時段</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    處理中...
                  </>
                ) : (
                  editingSlot ? '更新' : '建立'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              確認刪除
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">
                  您確定要刪除此規則嗎？
                </p>
                <p className="text-sm text-red-600">
                  此操作無法復原
                </p>
              </div>
            </div>

            {deleteGroup && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">將被刪除的規則資訊：</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">類型：</span> {
                      deleteGroup[0].specificDate 
                        ? `特定日期（${new Date(deleteGroup[0].specificDate).toLocaleDateString('zh-TW')}）`
                        : deleteGroup[0].isWeekend 
                          ? '週末'
                          : '全部日期'
                    }
                  </div>
                  <div>
                    <span className="font-medium">時段數量：</span> {deleteGroup.length}
                  </div>
                  <div>
                    <span className="font-medium">最大數量：</span> {deleteGroup[0].maxBookings}
                  </div>
                  <div>
                    <span className="font-medium">狀態：</span> {deleteGroup[0].isActive ? '啟用' : '停用'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeleteGroup(null)
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  if (deleteGroup) {
                    deleteGroup.forEach(slot => deleteMutation.mutate(slot._id))
                    setIsDeleteDialogOpen(false)
                    setDeleteGroup(null)
                  }
                }}
                disabled={deleteMutation.isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    刪除中...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    刪除規則
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TimeSlotsManagement
