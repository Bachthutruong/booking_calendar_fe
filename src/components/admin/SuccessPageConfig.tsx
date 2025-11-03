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
      toast({ title: '已儲存', description: '更新成功頁面內容' })
    } catch (e) {
      toast({ title: '錯誤', description: '無法儲存設定', variant: 'destructive' })
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
            <h2 className="text-2xl font-bold text-gray-900">成功預約頁面</h2>
            <p className="text-gray-600">設定客戶預約成功時顯示的內容</p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">儲存</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung hiển thị</CardTitle>
          <CardDescription>成功頁面的文字欄位</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="success_page.heading">標題</Label>
              <Input id="success_page.heading" placeholder="預約成功" {...register('success_page.heading')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="success_page.subheading">說明</Label>
              <Input id="success_page.subheading" placeholder="我們將再與您聯繫..." {...register('success_page.subheading')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="success_page.adminNoteTitle">提醒標題</Label>
            <Input id="success_page.adminNoteTitle" placeholder="管理員提醒" {...register('success_page.adminNoteTitle')} />
          </div>
          <div className="space-y-2">
            <Label>提醒內容</Label>
            <div className="border rounded-md bg-white">
              <div className="flex flex-wrap items-center gap-2 p-2 border-b">
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100 font-bold" onMouseDown={(e)=>{e.preventDefault(); exec('bold')}}>B</button>
                <button type="button" className="px-2 py-1 text-sm italic rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('italic')}}>I</button>
                <button type="button" className="px-2 py-1 text-sm underline rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('underline')}}>U</button>
                <button type="button" className="px-2 py-1 text-sm line-through rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('strikeThrough')}}>S</button>

                <span className="mx-1 h-5 w-px bg-gray-300" />

                <select className="px-2 py-1 text-sm border rounded" onChange={(e) => { const v = e.target.value; if (v) exec('formatBlock', v); e.currentTarget.value = '' }} defaultValue=""><option value="">樣式</option><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="p">段落</option><option value="blockquote">引言</option></select>
                <select className="px-2 py-1 text-sm border rounded" onChange={(e) => { const v = e.target.value; if (v) exec('fontSize', v); e.currentTarget.value = '' }} defaultValue=""><option value="">字級</option><option value="2">小</option><option value="3">一般</option><option value="4">大</option><option value="5">特大</option></select>

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
                <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onMouseDown={(e)=>{e.preventDefault(); exec('removeFormat')}}>清除格式</button>
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


