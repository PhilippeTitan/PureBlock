package com.pureblock.app.blocking

import android.app.ActivityManager
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class PureBlockModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "PureBlockModule"
        private const val BLOCK_OVERLAY_ACTION = "com.pureblock.BLOCK_OVERLAY"
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun isUsagePermissionGranted(promise: Promise) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactApplicationContext.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactApplicationContext.packageName
            )
        }
        promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
    }

    @ReactMethod
    fun openUsagePermissionSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val service = "${reactApplicationContext.packageName}/com.pureblock.app.blocking.PureBlockAccessibilityService"
        val enabledServices = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: ""
        promise.resolve(enabledServices.contains(service))
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun startBlockingService(blockedPackages: ReadableArray, blockedUrls: ReadableArray) {
        val packages = mutableListOf<String>()
        for (i in 0 until blockedPackages.size()) {
            packages.add(blockedPackages.getString(i))
        }

        val urls = mutableListOf<String>()
        for (i in 0 until blockedUrls.size()) {
            urls.add(blockedUrls.getString(i))
        }

        val intent = Intent(reactApplicationContext, BlockingForegroundService::class.java).apply {
            putExtra("blocked_packages", ArrayList(packages))
            putExtra("blocked_urls", ArrayList(urls))
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopBlockingService() {
        val intent = Intent(reactApplicationContext, BlockingForegroundService::class.java)
        reactApplicationContext.stopService(intent)
    }

    @ReactMethod
    fun showBlockOverlay(packageName: String, appName: String) {
        val intent = Intent(BLOCK_OVERLAY_ACTION).apply {
            putExtra("packageName", packageName)
            putExtra("appName", appName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.sendBroadcast(intent)
    }

    @ReactMethod
    fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                putExtra(Settings.EXTRA_APP_PACKAGE, reactApplicationContext.packageName)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun isDeviceAdminActive(promise: Promise) {
        val devicePolicyManager = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
        val componentName = android.content.ComponentName(reactApplicationContext, PureBlockDeviceAdmin::class.java)
        promise.resolve(devicePolicyManager.isAdminActive(componentName))
    }

    @ReactMethod
    fun requestDeviceAdmin() {
        val intent = Intent(android.app.admin.DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
            putExtra(android.app.admin.DevicePolicyManager.EXTRA_DEVICE_ADMIN,
                android.content.ComponentName(reactApplicationContext, PureBlockDeviceAdmin::class.java))
            putExtra(android.app.admin.DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                "PureBlock needs Device Admin to prevent uninstallation while blocking is active.")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun removeDeviceAdmin() {
        val devicePolicyManager = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
        val componentName = android.content.ComponentName(reactApplicationContext, PureBlockDeviceAdmin::class.java)
        devicePolicyManager.removeActiveAdmin(componentName)
    }

    @ReactMethod
    fun getForegroundApp(promise: Promise) {
        try {
            val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val runningTasks = activityManager.getRunningTasks(1)
            if (runningTasks != null && runningTasks.isNotEmpty()) {
                val topActivity = runningTasks[0].topActivity
                val result = Arguments.createMap().apply {
                    putString("packageName", topActivity.packageName)
                    putString("className", topActivity.className)
                }
                promise.resolve(result)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
