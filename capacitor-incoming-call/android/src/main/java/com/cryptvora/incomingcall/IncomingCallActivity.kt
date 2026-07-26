package com.cryptvora.incomingcall

import android.app.KeyguardManager
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * The actual ringing screen — a plain native Activity (not the app's
 * webview) so it can be drawn instantly and shown over the lock screen,
 * independent of whether the JS/PeerJS layer has finished booting yet.
 *
 * On create, it also silently launches the real app in the background (see
 * [wakeAppInBackground]) so that by the time the person taps Answer, the
 * PeerJS signaling connection is already live instead of only starting
 * then — the caller's 45s ring timeout doesn't leave much room otherwise.
 */
class IncomingCallActivity : AppCompatActivity() {
    private var callId: String = ""
    private var from: String = ""
    private var kind: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        callId = intent.getStringExtra(CallNotificationHelper.EXTRA_CALL_ID) ?: ""
        from = intent.getStringExtra(CallNotificationHelper.EXTRA_FROM) ?: "Unknown"
        kind = intent.getStringExtra(CallNotificationHelper.EXTRA_KIND) ?: "audio"

        showOverLockScreen()
        buildUi()
        wakeAppInBackground()
    }

    private fun showOverLockScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            )
        }
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#0B0B0F"))
            gravity = Gravity.CENTER
            setPadding(64, 64, 64, 64)
        }

        val title = TextView(this).apply {
            text = if (kind == "video") "Incoming video call" else "Incoming call"
            setTextColor(Color.parseColor("#AAAAAA"))
            textSize = 18f
            gravity = Gravity.CENTER
        }
        val caller = TextView(this).apply {
            text = from
            setTextColor(Color.WHITE)
            textSize = 34f
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 120)
        }

        val buttonsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        val decline = Button(this).apply {
            text = "Decline"
            setOnClickListener { onDecline() }
        }
        val spacer = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(80, 1)
        }
        val accept = Button(this).apply {
            text = if (kind == "video") "Answer video" else "Answer"
            setOnClickListener { onAnswer() }
        }
        buttonsRow.addView(decline)
        buttonsRow.addView(spacer)
        buttonsRow.addView(accept)

        root.addView(title)
        root.addView(caller)
        root.addView(buttonsRow)
        setContentView(root)
    }

    private fun wakeAppInBackground() {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName) ?: return
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        launchIntent.putExtra(CallNotificationHelper.EXTRA_CALL_ID, callId)
        launchIntent.putExtra(CallNotificationHelper.EXTRA_FROM, from)
        launchIntent.putExtra(CallNotificationHelper.EXTRA_KIND, kind)
        launchIntent.putExtra("pendingCallAction", "wake")
        startActivity(launchIntent)
    }

    private fun onAnswer() {
        CallActionBridge.dispatch(this, "answer", callId, from, kind)
        CallNotificationHelper.cancel(this, callId)
        bringAppToFront("answer")
        finish()
    }

    private fun onDecline() {
        CallActionBridge.dispatch(this, "decline", callId, from, kind)
        CallNotificationHelper.cancel(this, callId)
        finish()
    }

    private fun bringAppToFront(action: String) {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName) ?: return
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        launchIntent.putExtra(CallNotificationHelper.EXTRA_CALL_ID, callId)
        launchIntent.putExtra(CallNotificationHelper.EXTRA_FROM, from)
        launchIntent.putExtra(CallNotificationHelper.EXTRA_KIND, kind)
        launchIntent.putExtra("pendingCallAction", action)
        startActivity(launchIntent)
    }
}
