package com.cryptvora.incomingcall

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Fires when the person taps "Answer"/"Decline" directly on the
 * notification (in the shade or on the lock screen), without going through
 * [IncomingCallActivity] first — this must work even if the app process
 * isn't running at all yet.
 */
class CallActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val callId = intent.getStringExtra(CallNotificationHelper.EXTRA_CALL_ID) ?: return
        val from = intent.getStringExtra(CallNotificationHelper.EXTRA_FROM) ?: ""
        val kind = intent.getStringExtra(CallNotificationHelper.EXTRA_KIND) ?: "audio"
        CallNotificationHelper.cancel(context, callId)

        when (intent.action) {
            CallNotificationHelper.ACTION_ANSWER -> {
                CallActionBridge.dispatch(context, "answer", callId, from, kind)
                // Answering needs the webview/PeerJS layer running to actually
                // pick up the call — bring the app to the front so that
                // happens right away.
                context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launch ->
                    launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                    launch.putExtra("pendingCallAction", "answer")
                    launch.putExtra(CallNotificationHelper.EXTRA_CALL_ID, callId)
                    launch.putExtra(CallNotificationHelper.EXTRA_FROM, from)
                    launch.putExtra(CallNotificationHelper.EXTRA_KIND, kind)
                    context.startActivity(launch)
                }
            }
            CallNotificationHelper.ACTION_DECLINE -> {
                // Just record the decline and stop ringing — no need to open
                // the app just to say no.
                CallActionBridge.dispatch(context, "decline", callId, from, kind)
            }
        }
    }
}
