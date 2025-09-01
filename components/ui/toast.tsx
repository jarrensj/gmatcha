import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
  onDismiss: (id: string) => void
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-full max-w-sm rounded-md border p-4 shadow-lg transition-all",
        variant === "destructive" 
          ? "border-destructive bg-destructive text-destructive-foreground" 
          : "border bg-background text-foreground"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="ml-2 opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface ToasterProps {
  toasts: Array<{
    id: string
    title: string
    description?: string
    variant?: "default" | "destructive"
  }>
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </>
  )
}
