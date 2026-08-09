package com.pureblock.app.blocking

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Build
import android.view.accessibility.AccessibilityEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class PureBlockAccessibilityService : AccessibilityService() {

    companion object {
        var instance: PureBlockAccessibilityService? = null
            private set

        var blockedPackages: List<String> = emptyList()
        var blockedUrls: List<String> = emptyList()

        fun updateBlockedLists(packages: List<String>, urls: List<String>) {
            blockedPackages = packages
            blockedUrls = urls
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this

        serviceInfo = serviceInfo.apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            notificationTimeout = 100
        }

        sendEvent("pureblock:accessibility_connected", null)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val packageName = event.packageName?.toString() ?: return
                val className = event.className?.toString() ?: ""

                if (isBlockedApp(packageName)) {
                    showBlockScreen(packageName, getAppName(packageName))
                }

                if (isBrowserPackage(packageName)) {
                    checkUrlFromBrowser(event)
                }
            }
        }
    }

    override fun onInterrupt() {
        instance = null
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    private fun isBlockedApp(packageName: String): Boolean {
        if (packageName == this.packageName) return false
        if (packageName == "com.android.systemui") return false
        return blockedPackages.contains(packageName)
    }

    private fun isBrowserPackage(packageName: String): Boolean {
        val browsers = listOf(
            "com.android.chrome",
            "com.UCMobile",
            "org.mozilla.firefox",
            "com.opera.browser",
            "com.brave.browser",
            "com.microsoft.emmx",
            "com.vivaldi.browser",
        )
        return browsers.any { it.equals(packageName, ignoreCase = true) }
    }

    private fun checkUrlFromBrowser(event: AccessibilityEvent) {
        val text = event.text?.toString()?.lowercase() ?: return
        val url = extractUrl(text)

        if (url != null && isBlockedUrl(url)) {
            showBlockScreen("browser", url)
        }
    }

    private fun extractUrl(text: String): String? {
        val urlPattern = Regex("""(https?://[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\s]*)""")
        return urlPattern.find(text)?.value
    }

    private fun isBlockedUrl(url: String): Boolean {
        val lowerUrl = url.lowercase()
        return blockedUrls.any { blocked ->
            lowerUrl.contains(blocked.lowercase())
        }
    }

    private fun getAppName(packageName: String): String {
        return try {
            val pm = packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    private fun showBlockScreen(packageName: String, appName: String) {
        val intent = Intent(this, BlockOverlayActivity::class.java).apply {
            putExtra("packageName", packageName)
            putExtra("appName", appName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        startActivity(intent)
    }

    private fun sendEvent(eventName: String, params: Arguments?) {
        try {
            val reactContext = (application as? android.app.Application)
                ?.let { null } // Would need ReactNative host to emit events
            // Events are sent via the bridge when connected
        } catch (e: Exception) {
            // Silently ignore
        }
    }
}
