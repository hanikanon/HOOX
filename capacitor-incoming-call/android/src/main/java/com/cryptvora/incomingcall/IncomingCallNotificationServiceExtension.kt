package com.cryptvora.incomingcall

import androidx.annotation.Keep
import com.onesignal.notifications.INotificationReceivedEvent
import com.onesignal.notifications.INotificationServiceExtension
import java.util.UUID

/**
 * Registered via the `com.onesignal.NotificationServiceExtension` meta-data
 * in this module's AndroidManifest.xml. OneSignal's Android SDK calls this
 * for *every* push — even while the app is completely closed, because it's
 * the SDK's own FCM listener that wakes the process up to run this, not our
 * app. That's exactly what lets a real, native call UI show up when the
 * app itself isn't running.
 *
 * For a `{"type": "incoming_call", ...}` payload (see
 * lib/onesignal.ts → sendCallPushNotification), we suppress OneSignal's own
 * generic banner and show our own full-screen call notification instead.
 * Everything else (plain messages, etc.) is left alone and displays
 * normally.
 */
@Keep
class IncomingCallNotificationServiceExtension : INotificationServiceExtension {
    override fun onNotificationReceived(event: INotificationReceivedEvent) {
        val notification = event.notification
        val data = notification.additionalData ?: return
        if (data.optString("type") != "incoming_call") return

        // Stops OneSignal from also posting its own default notification for
        // this push — we're fully replacing it below.
        event.preventDefault()

        val context = event.context
        val from = data.optString("from", "Unknown")
        val kind = data.optString("kind", "audio")
        val callId = notification.notificationId ?: UUID.randomUUID().toString()

        CallNotificationHelper.showIncomingCall(context, callId, from, kind)
    }
}
