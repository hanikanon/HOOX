package com.cryptvora.incomingcall

import android.content.Context
import android.content.Intent
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import org.json.JSONObject

/**
 * The single place that records "the person answered/declined" so the JS
 * side (src/hooks/use-call.tsx) can react, no matter what state the app was
 * in when it happened:
 *
 * - If the webview is already alive, [IncomingCallPlugin] is listening for
 *   the broadcast below and delivers it to JS immediately.
 * - If the app was fully closed, nothing was listening yet — so this is
 *   also written to SharedPreferences, and [IncomingCallPlugin] reads it
 *   back the moment the webview finishes booting (see
 *   `checkPendingAction()`, called from JS on every app start/resume).
 */
object CallActionBridge {
    const val ACTION = "com.cryptvora.incomingcall.CALL_ACTION"
    private const val PREFS = "hoox_incoming_call"
    private const val KEY_PENDING = "pending_action"

    fun dispatch(context: Context, action: String, callId: String, from: String, kind: String) {
        val payload = JSONObject().apply {
            put("action", action)
            put("callId", callId)
            put("from", from)
            put("kind", kind)
        }

        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_PENDING, payload.toString())
            .apply()

        val intent = Intent(ACTION).putExtra("payload", payload.toString())
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent)
    }

    fun consumePending(context: Context): JSONObject? {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val raw = prefs.getString(KEY_PENDING, null) ?: return null
        prefs.edit().remove(KEY_PENDING).apply()
        return try {
            JSONObject(raw)
        } catch (e: Exception) {
            null
        }
    }
}
