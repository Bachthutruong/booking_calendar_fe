import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminAPI } from '@/lib/api'
import { Edit, Trash2, Users, UserPlus, Shield, UserCheck, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle } from 'lucide-react'

interface User {
  _id: string
  email: string
  name: string
  role: 'admin' | 'staff' | 'customer'
  phone?: string
  isActive: boolean
  createdAt: string
}

const UsersManagement = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff' as 'admin' | 'staff' | 'customer',
    phone: '',
    isActive: true
  })
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { data: usersData, isLoading } = useQuery(
    ['users', currentPage, pageSize, searchTerm, roleFilter],
    () => adminAPI.getUsers({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      role: roleFilter === 'all' ? '' : roleFilter
    })
  )

  // Update pagination info when data changes
  useEffect(() => {
    if (usersData?.data?.pagination) {
      setTotalPages(usersData.data.pagination.pages)
      setTotalItems(usersData.data.pagination.total)
    }
  }, [usersData])

  const createMutation = useMutation(
    (data: any) => adminAPI.createUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
        toast({ title: "成功", description: "建立用戶成功" })
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
    ({ id, data }: { id: string; data: any }) => adminAPI.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
        toast({ title: "成功", description: "更新用戶成功" })
        setEditingUser(null)
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
    (id: string) => adminAPI.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', currentPage, pageSize, searchTerm, roleFilter])
        toast({ title: "成功", description: "刪除用戶成功" })
        setShowDeleteDialog(false)
        setUserToDelete(null)
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

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'staff',
      phone: '',
      isActive: true
    })
    setConfirmPassword('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      // If password provided, validate confirm and min length
      if (formData.password) {
        if (formData.password.length < 6) {
          toast({ title: '錯誤', description: '密碼至少需 6 個字元', variant: 'destructive' })
          return
        }
        if (formData.password !== confirmPassword) {
          toast({ title: '錯誤', description: '確認密碼不一致', variant: 'destructive' })
          return
        }
      }

      const payload = { ...formData }
      // If password empty, do not send it
      if (!formData.password) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _omitPassword, ...dataWithoutPassword } = payload
        updateMutation.mutate({ id: editingUser._id, data: dataWithoutPassword })
      } else {
        updateMutation.mutate({ id: editingUser._id, data: payload })
      }
    } else {
      // On create: send full payload including phone
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive
    })
    setConfirmPassword('')
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id)
    }
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
    setRoleFilter('all')
    setCurrentPage(1)
  }

  // const getRoleText = (role: string) => {
  //   const roles: { [key: string]: string } = {
  //     'admin': 'Quản trị viên',
  //     'staff': 'Nhân viên',
  //     'customer': 'Khách hàng'
  //   }
  //   return roles[role] || role
  // }

  // const getRoleColor = (role: string) => {
  //   const colors: { [key: string]: string } = {
  //     'admin': 'bg-red-100 text-red-800',
  //     'staff': 'bg-blue-100 text-blue-800',
  //     'customer': 'bg-gray-100 text-gray-800'
  //   }
  //   return colors[role] || 'bg-gray-100 text-gray-800'
  // }

  const users = usersData?.data?.users || []

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Users className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">用戶管理</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          管理系統中的管理員、員工與客戶
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">搜尋篩選</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">搜尋</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="姓名、用戶 Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">角色</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="所有角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                  <SelectItem value="staff">員工</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">每頁顯示數量</label>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          建立新用戶
        </Button>
      </div>

      {/* Users List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <div className="text-center">
            <CardTitle className="text-xl text-gray-800">用戶列表</CardTitle>
            <CardDescription className="text-gray-600">
              {totalItems} 位用戶 - 第 {currentPage} / {totalPages} 頁
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在載入用戶列表...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">沒有用戶</h3>
              <p className="text-gray-500 mb-4">找不到符合篩選條件的用戶</p>
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-2" />
                建立第一位用戶
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">用戶</TableHead>
                    <TableHead className="w-[150px]">聯絡方式</TableHead>
                    <TableHead className="w-[120px]">角色</TableHead>
                    <TableHead className="w-[100px]">狀態</TableHead>
                    <TableHead className="w-[120px]">建立日期</TableHead>
                    <TableHead className="w-[150px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${
                            user.role === 'admin' ? 'bg-red-100' :
                            user.role === 'staff' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {user.role === 'admin' ? (
                              <Shield className="h-4 w-4 text-red-600" />
                            ) : user.role === 'staff' ? (
                              <UserCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Users className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? '管理員' :
                           user.role === 'staff' ? '員工' : '客戶'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.isActive ? '啟用' : '停用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0 border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user)}
                            className="h-8 w-8 p-0 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  顯示第 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} 筆／共 {totalItems} 筆
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingUser ? '編輯用戶' : '建立新用戶'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  姓名
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {!editingUser ? (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  密碼
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500">至少 6 個字元</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                    新密碼（可選）
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    placeholder="若不更改請留空"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                    確認密碼
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次輸入新密碼"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  角色
                </Label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="staff">員工</option>
                  <option value="admin">管理員</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  電話
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">啟用帳戶</span>
              </label>
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
                className="bg-green-600 hover:bg-green-700"
              >
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    處理中...
                  </>
                ) : (
                  editingUser ? '更新' : '建立'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">確認刪除用戶</DialogTitle>
          </DialogHeader>
          
          {userToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">警告</span>
                </div>
                <p className="text-red-700">
                  您確定要刪除用戶 <strong>{userToDelete.name}</strong>？
                </p>
                <p className="text-sm text-red-600 mt-2">
                  此操作無法復原，將永久刪除所有相關資料。
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">用戶資訊：</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>姓名：</strong> {userToDelete.name}</div>
                  <div><strong>Email:</strong> {userToDelete.email}</div>
                  <div><strong>角色：</strong> {
                    userToDelete.role === 'admin' ? '管理員' :
                    userToDelete.role === 'staff' ? '員工' : '客戶'
                  }</div>
                  <div><strong>狀態：</strong> {userToDelete.isActive ? '啟用' : '停用'}</div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setUserToDelete(null)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  取消
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      刪除中...
                    </>
                  ) : (
                    '確認刪除'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersManagement
