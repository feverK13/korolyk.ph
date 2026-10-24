import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetTitle = DialogPrimitive.Title
const SheetDescription = DialogPrimitive.Description

function SheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/60 data-[state=open]:animate-[fade-in_.4s_var(--ease-out-soft)]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-0 z-[85] flex flex-col overflow-y-auto overscroll-contain bg-ink text-paper outline-none on-ink',
          'data-[state=open]:animate-[sheet-in_.6s_var(--ease-out-soft)] data-[state=closed]:animate-[sheet-out_.35s_var(--ease-out-soft)]',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription }
