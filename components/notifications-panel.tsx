"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  message: string
  created_at: string
  read: boolean
}

export default function NotificationsPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications for this user
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/notifications?user_id=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data || [])
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
      setLoading(false)
    }

    fetchNotifications()
  }, [userId])

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 rounded-full"
        >
          <Bell className="h-5 w-5 text-neutral-600" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-neutral-900">Notifications</h4>
          <Button
            variant="link"
            size="sm"
            className="text-blue-600"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </div>

        <ScrollArea className="h-64">
          {loading ? (
            <p className="text-sm text-neutral-600 text-center py-4">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-neutral-600 text-center py-4">
              No new notifications
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border text-sm ${
                    n.read ? "bg-white" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <p className="text-neutral-800">{n.message}</p>
                  <span className="text-xs text-neutral-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
