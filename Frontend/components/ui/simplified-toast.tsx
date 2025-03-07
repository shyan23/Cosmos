"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type ToastType = {
  id: string
  title: string
  description: string
  variant: "default" | "success" | "error"
}

type ToastContextType = {
  toasts: ToastType[]
  addToast: (toast: Omit<ToastType, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = (toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md ${
              toast.variant === "success"
                ? "bg-green-500 text-white"
                : toast.variant === "error"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-800 border"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{toast.title}</h3>
                <p className="text-sm">{toast.description}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-sm font-bold">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

