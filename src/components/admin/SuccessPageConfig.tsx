import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { adminAPI } from '@/lib/api'
import { CheckCircle2 } from 'lucide-react'

const SuccessPageConfig = () => {
  const { toast } = useToast()
  const { register, handleSubmit, setValue, watch } = useForm()
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    adminAPI.getSystemConfig('success_page').then(res => {
      const cfg = res.data.config || {}
      Object.keys(cfg).forEach(k => setValue(`success_page.${k}`, cfg[k]))
    }).catch(() => {})
  }, [setValue])

  const onSubmit = async (data: any) => {
    try {
      await adminAPI.updateSystemConfig('success_page', data.success_page || {})
      toast({ title: 'Đã lưu', description: 'Cập nhật trang thành công' })
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không thể lưu cấu hình', variant: 'destructive' })
    }
  }

  const currentHtml = watch('success_page.adminNoteContent')
  useEffect(() => {
    if (editorRef.current && typeof currentHtml === 'string' && editorRef.current.innerHTML !== currentHtml) {
      editorRef.current.innerHTML = currentHtml
    }
  }, [currentHtml])

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const exec = (command: string, value?: string) => {
    focusEditor()
    // Normalize certain commands/values
    if (command === 'formatBlock' && value) {
      const map: Record<string, string> = { h1: 'H1', h2: 'H2', h3: 'H3', p: 'P', blockquote: 'BLOCKQUOTE' }
      value = map[value.toLowerCase()] || value
    }
    if (command === 'hiliteColor') {
      // Some browsers prefer backColor
      const ok = document.execCommand('hiliteColor', false, value)
      if (!ok) document.execCommand('backColor', false, value)
    } else {
      document.execCommand(command, false, value)
    }
    if (editorRef.current) {
      setValue('success_page.adminNoteContent', editorRef.current.innerHTML, { shouldDirty: true })
    }
  }

  return (
    <div className="space-y-6">
      <style>{`
        .rich-editor ul { list-style: disc; padding-left: 1.25rem; }
        .rich-editor ol { list-style: decimal; padding-left: 1.25rem; }
        .rich-editor blockquote { border-left: 4px solid #e5e7eb; padding-left: .75rem; color: #6b7280; }
        .rich-editor h1 { font-size: 1.5rem; font-weight: 700; }
        .rich-editor h2 { font-size: 1.25rem; font-weight: 700; }
        .rich-editor h3 { font-size: 1.125rem; font-weight: 600; }
        .rich-editor a { color: #2563eb; text-decoration: underline; }
      `}</style>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 rounded-lg p-2">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trang đặt thành công</h2>
            <p className="text-gray-600">Thiết lập nội dung khi khách đặt lịch thành công</p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">Lưu</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung hiển thị</CardTitle>
          <CardDescription>Các trường văn bản cho trang thành công</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="success_page.heading">Tiêu đề</Label>
              <Input id="success_page.heading" placeholder="Đặt lịch thành công" {...register('success_page.heading')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="success_page.subheading">Mô tả</Label>
              <Input id="success_page.subheading" placeholder="Chúng tôi sẽ liên hệ lại..." {...register('success_page.subheading')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="success_page.adminNoteTitle">Tiêu đề lưu ý</Label>
            <Input id="success_page.adminNoteTitle" placeholder="Lưu ý từ quản trị viên" {...register('success_page.adminNoteTitle')} />
          </div>
          <div className="space-y-2">
            <Label>Nội dung lưu ý</Label>
            <div className="border rounded-md bg-white">
              <div className="flex flex-wrap items-center gap-2 p-2 border-b">
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100 font-bold" onMouseDown={(e)=>{e.preventDefault(); exec('bold')}}>B</button>
                <button type="button" className="px-2 py-1 text-sm italic rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('italic')}}>I</button>
                <button type="button" className="px-2 py-1 text-sm underline rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('underline')}}>U</button>
                <button type="button" className="px-2 py-1 text-sm line-through rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('strikeThrough')}}>S</button>

                <span className="mx-1 h-5 w-px bg-gray-300" />

                <select className="px-2 py-1 text-sm border rounded" onChange={(e) => { const v = e.target.value; if (v) exec('formatBlock', v); e.currentTarget.value = '' }} defaultValue=""><option value="">Kiểu</option><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="p">Đoạn</option><option value="blockquote">Trích dẫn</option></select>
                <select className="px-2 py-1 text-sm border rounded" onChange={(e) => { const v = e.target.value; if (v) exec('fontSize', v); e.currentTarget.value = '' }} defaultValue=""><option value="">Cỡ</option><option value="2">Nhỏ</option><option value="3">Bình thường</option><option value="4">Lớn</option><option value="5">Rất lớn</option></select>

                <label className="px-2 py-1 text-sm border rounded cursor-pointer">Màu
                  <input type="color" className="hidden" onInput={(e) => exec('foreColor', (e.target as HTMLInputElement).value)} />
                </label>
                <label className="px-2 py-1 text-sm border rounded cursor-pointer">Nền
                  <input type="color" className="hidden" onInput={(e) => exec('hiliteColor', (e.target as HTMLInputElement).value)} />
                </label>

                <span className="mx-1 h-5 w-px bg-gray-300" />

                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('insertUnorderedList')}}>• Danh sách</button>
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('insertOrderedList')}}>1. Danh sách</button>

                <span className="mx-1 h-5 w-px bg-gray-300" />

                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e) => {
                  e.preventDefault();
                  const url = window.prompt('Nhập URL:') || ''
                  if (url) exec('createLink', url)
                }}>Link</button>
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('unlink')}}>Bỏ link</button>

                <span className="mx-1 h-5 w-px bg-gray-300" />

                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('justifyLeft')}}>Trái</button>
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('justifyCenter')}}>Giữa</button>
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('justifyRight')}}>Phải</button>

                <span className="mx-1 h-5 w-px bg-gray-300" />

                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('undo')}}>Hoàn tác</button>
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('redo')}}>Làm lại</button>
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('removeFormat')}}>Xóa định dạng</button>
              </div>
              <div
                ref={editorRef}
                className="min-h-[160px] p-3 outline-none rich-editor"
                contentEditable
                onInput={(e) => setValue('success_page.adminNoteContent', (e.target as HTMLDivElement).innerHTML)}
              />
            </div>
            <input type="hidden" {...register('success_page.adminNoteContent')} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuccessPageConfig


