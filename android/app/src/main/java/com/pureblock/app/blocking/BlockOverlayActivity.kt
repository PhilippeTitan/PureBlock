package com.pureblock.app.blocking

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity

class BlockOverlayActivity : Activity() {

    private val motivationalQuotes = listOf(
        "Stay strong. You're building a better you.",
        "Every moment of resistance is a victory.",
        "You are stronger than your urges.",
        "Focus on what matters most right now.",
        "This feeling is temporary. Your progress is permanent.",
        "Discipline is choosing between what you want now and what you want most.",
        "The only way out is through.",
        "Your future self will thank you for this moment.",
        "One moment at a time. You've got this.",
        "Think about why you started."
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        )

        val packageName = intent.getStringExtra("packageName") ?: "unknown"
        val appName = intent.getStringExtra("appName") ?: packageName

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#0F0F0F"))
            gravity = Gravity.CENTER
            setPadding(60, 80, 60, 80)
        }

        val shieldIcon = TextView(this).apply {
            text = "\uD83D\uDEE1\uFE0F"
            textSize = 48f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }
        layout.addView(shieldIcon)

        val title = TextView(this).apply {
            text = "Blocked"
            textSize = 28f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 12)
        }
        layout.addView(title)

        val subtitle = TextView(this).apply {
            text = "$appName is blocked by PureBlock"
            textSize = 16f
            setTextColor(Color.parseColor("#9E9E9E"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 50)
        }
        layout.addView(subtitle)

        val quote = motivationalQuotes.random()
        val quoteText = TextView(this).apply {
            text = "\"$quote\""
            textSize = 14f
            setTextColor(Color.parseColor("#6B6B6B"))
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 60)
        }
        layout.addView(quoteText)

        val backButton = Button(this).apply {
            text = "Go back"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#2D5BFF"))
            setPadding(40, 20, 40, 20)
            isAllCaps = false
            textSize = 16f
            setOnClickListener {
                val homeIntent = Intent(android.content.Intent.ACTION_MAIN).apply {
                    addCategory(android.content.Intent.CATEGORY_HOME)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(homeIntent)
                finish()
            }
        }
        layout.addView(backButton)

        setContentView(layout)
    }

    override fun onBackPressed() {
        val homeIntent = Intent(android.content.Intent.ACTION_MAIN).apply {
            addCategory(android.content.Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        finish()
    }
}
