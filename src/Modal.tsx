import { useEffect, useRef, type ReactNode } from 'react'

export function Modal({ label, className, onClose, children }: {
  label: string; className: string; onClose: () => void; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previousFocus = document.activeElement
    const parentDialog = dialog.parentElement?.closest('dialog')
    dialog.showModal()
    return () => {
      dialog.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && !previousFocus.matches(':disabled')) previousFocus.focus()
      else parentDialog?.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled)')?.focus()
    }
  }, [])
  return <dialog ref={ref} className={className} aria-label={label}
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose() }}
    onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    {children}
  </dialog>
}
