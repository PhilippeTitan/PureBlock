package com.pureblock.app.blocking

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class BlockingForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "pureblock_blocking"
        const val NOTIFICATION_ID = 1001
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val blockedPackages = intent?.getStringArrayListExtra("blocked_packages") ?: arrayListOf()
        val blockedUrls = intent?.getStringArrayListExtra("blocked_urls") ?: arrayListOf()

        PureBlockAccessibilityService.updateBlockedLists(blockedPackages, blockedUrls)

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("PureBlock Active")
            .setContentText("${blockedPackages.size} apps and ${blockedUrls.size} sites blocked")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setSilent(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        PureBlockAccessibilityService.updateBlockedLists(emptyList(), emptyList())
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Blocking Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows when PureBlock is actively blocking apps"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
