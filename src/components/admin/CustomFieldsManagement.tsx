import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminAPI } from '@/lib/api'
import { Plus, Edit, Trash2, FormInput, Type, ChevronLeft, ChevronRight } from 'lucide-react'

interface CustomField {
  _id: string
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  order: number
  isActive: boolean
}

const CustomFieldsManagement = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteField, setDeleteField] = useState<CustomField | null>(null)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    order: 0,
    isActive: true,
    options: [] as Array<{ label: string; value: string }>
  })

  const { data: customFieldsData, isLoading } = useQuery(
    'customFields',
    () => adminAPI.getCustomFields()
  )

  const createMutation = useMutation(
    (data: any) => adminAPI.createCustomField(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customFields')
        toast({ title: "Thành công", description: "Tạo trường tùy chỉnh thành công" })
        setIsDialogOpen(false)
        resetForm()
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

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => adminAPI.updateCustomField(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customFields')
        toast({ title: "Thành công", description: "Cập nhật trường tùy chỉnh thành công" })
        setEditingField(null)
        setIsDialogOpen(false)
        resetForm()
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

  const deleteMutation = useMutation(
    (id: string) => adminAPI.deleteCustomField(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customFields')
        toast({ title: "Thành công", description: "Xóa trường tùy chỉnh thành công" })
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
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      order: 0,
      isActive: true,
      options: []
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      options: formData.type === 'select' || formData.type === 'radio' || formData.type === 'checkbox' 
        ? formData.options 
        : undefined
    }

    if (editingField) {
      updateMutation.mutate({ id: editingField._id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (field: CustomField) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || '',
      order: field.order,
      isActive: field.isActive,
      options: field.options || []
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingField(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleDelete = (field: CustomField) => {
    setDeleteField(field)
    setIsDeleteDialogOpen(true)
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { label: '', value: '' }]
    })
  }

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...formData.options]
    newOptions[index][field] = value
    setFormData({ ...formData, options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData({ ...formData, options: newOptions })
  }

  const getFieldTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'text': 'Văn bản ngắn',
      'textarea': 'Văn bản dài',
      'email': 'Email',
      'phone': 'Số điện thoại',
      'select': 'Chọn từ danh sách',
      'checkbox': 'Nhiều lựa chọn',
      'radio': 'Một lựa chọn',
      'date': 'Ngày tháng',
      'number': 'Số'
    }
    return types[type] || type
  }

  const customFields = customFieldsData?.data.customFields || []

  // Pagination logic
  const totalItems = customFields.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFields = customFields.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Type className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quản lý trường tùy chỉnh</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Thiết lập các trường thông tin bổ sung cho form đặt lịch tư vấn
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo trường mới
        </Button>
      </div>

      {/* Custom Fields Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <div className="text-center">
            <CardTitle className="text-xl text-gray-800">Danh sách trường tùy chỉnh</CardTitle>
            <CardDescription className="text-gray-600">
              {customFields.length} trường được thiết lập
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải trường tùy chỉnh...</p>
            </div>
          ) : customFields.length === 0 ? (
            <div className="text-center py-12">
              <FormInput className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có trường tùy chỉnh</h3>
              <p className="text-gray-500 mb-4">Hãy tạo trường đầu tiên để thu thập thông tin khách hàng</p>
              <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Tạo trường đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Tên trường</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Loại</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Thứ tự</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Bắt buộc</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Tùy chọn</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFields.map((field: CustomField) => (
                    <tr key={field._id} className="hover:bg-gray-50 border-b">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 rounded-full p-2">
                            <FormInput className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{field.label}</div>
                            <div className="text-sm text-gray-500">{field.name}</div>
                            {field.placeholder && (
                              <div className="text-xs text-gray-400 mt-1">
                                Placeholder: {field.placeholder}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {getFieldTypeText(field.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {field.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          field.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {field.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {field.required ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Có
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            Không
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {field.options && field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options.slice(0, 2).map((option, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {option.label}
                              </span>
                            ))}
                            {field.options.length > 2 && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                +{field.options.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(field)}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(field)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingField ? 'Chỉnh sửa trường tùy chỉnh' : 'Tạo trường tùy chỉnh mới'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Tên trường (không dấu)
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="customer_company"
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">Sử dụng chữ thường và dấu gạch dưới</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label" className="text-sm font-medium text-gray-700">
                  Nhãn hiển thị
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Tên công ty"
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Loại trường
                </Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="text">Văn bản ngắn</option>
                  <option value="textarea">Văn bản dài</option>
                  <option value="email">Email</option>
                  <option value="phone">Số điện thoại</option>
                  <option value="select">Chọn từ danh sách</option>
                  <option value="checkbox">Nhiều lựa chọn</option>
                  <option value="radio">Một lựa chọn</option>
                  <option value="date">Ngày tháng</option>
                  <option value="number">Số</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order" className="text-sm font-medium text-gray-700">
                  Thứ tự hiển thị
                </Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder" className="text-sm font-medium text-gray-700">
                Placeholder
              </Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="Nhập placeholder..."
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Options for select, radio, checkbox */}
            {(formData.type === 'select' || formData.type === 'radio' || formData.type === 'checkbox') && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Tùy chọn</Label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="Nhãn hiển thị"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input
                        placeholder="Giá trị"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addOption} className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    Thêm tùy chọn
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Bắt buộc</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Kích hoạt</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  editingField ? 'Cập nhật' : 'Tạo mới'
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
              Xác nhận xóa trường tùy chỉnh
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Bạn có chắc chắn muốn xóa?</h3>
                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            {deleteField && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Tên trường:</span>
                    <span className="text-gray-900">{deleteField.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Loại:</span>
                    <span className="text-gray-900">{getFieldTypeText(deleteField.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Thứ tự:</span>
                    <span className="text-gray-900">{deleteField.order}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteField) {
                  deleteMutation.mutate(deleteField._id)
                  setIsDeleteDialogOpen(false)
                  setDeleteField(null)
                }
              }}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa trường
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomFieldsManagement
