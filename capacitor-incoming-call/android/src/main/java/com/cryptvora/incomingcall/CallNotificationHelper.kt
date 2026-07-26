package com.cryptvora.incomingcall

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * Builds and shows Hoox's own "incoming call" notification — a real
 * full-screen-intent, CATEGORY_CALL notification, instead of the generic
 * banner OneSignal would otherwise show. This is what makes the call screen
 * pop up on its own (even over the lock screen) instead of just sitting in
 * the notification shade waiting for a tap.
 */
object CallNotificationHelper {
    const val CHANNEL_ID = "hoox_incoming_calls"
    const val ACTION_ANSWER = "com.cryptvora.incomingcall.ACTION_ANSWER"
    const val ACTION_DECLINE = "com.cryptvora.incomingcall.ACTION_DECLINE"
    const val EXTRA_CALL_ID = "callId"
    const val EXTRA_FROM = "from"
    const val EXTRA_KIND = "kind"

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return

        val ringtoneUri: Uri = android.provider.Settings.System.DEFAULT_RINGTONE_URI
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        val channel = NotificationChannel(CHANNEL_ID, "Incoming calls", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Hoox incoming call alerts"
            setSound(ringtoneUri, audioAttributes)
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 800, 500, 800)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setBypassDnd(true)
        }
        manager.createNotificationChannel(channel)
    }

    /** Shows the incoming-call notification and, via its full-screen intent,
     * launches [IncomingCallActivity] straight away if the device is idle
     * (locked, screen off, or Hoox already in the foreground) — the whole
     * point of doing this natively instead of relying on the OneSignal
     * default banner, which never launches anything on its own. */
    fun showIncomingCall(context: Context, callId: String, from: String, kind: String) {
        ensureChannel(context)

        val fullScreenIntent = Intent(context, IncomingCallActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra(EXTRA_CALL_ID, callId)
            putExtra(EXTRA_FROM, from)
            putExtra(EXTRA_KIND, kind)
        }
        val fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            callId.hashCode(),
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        fun actionIntent(action: String): PendingIntent {
            val intent = Intent(context, CallActionReceiver::class.java).apply {
                this.action = action
                putExtra(EXTRA_CALL_ID, callId)
                putExtra(EXTRA_FROM, from)
                putExtra(EXTRA_KIND, kind)
            }
            return PendingIntent.getBroadcast(
                context,
                (action + callId).hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        val title = if (kind == "video") "Incoming video call" else "Incoming call"
        val appIcon = context.applicationInfo.icon

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(appIcon)
            .setContentTitle(title)
            .setContentText("$from is calling you on Hoox")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(fullScreenPendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(0, "Decline", actionIntent(ACTION_DECLINE))
            .addAction(0, if (kind == "video") "Answer video" else "Answer", actionIntent(ACTION_ANSWER))
            .setTimeoutAfter(45_000)

        NotificationManagerCompat.from(context).notify(callId.hashCode(), builder.build())
    }

    fun cancel(context: Context, callId: String) {
        NotificationManagerCompat.from(context).cancel(callId.hashCode())
    }
}
