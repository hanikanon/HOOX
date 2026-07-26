package com.cryptvora.incomingcall

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject

@CapacitorPlugin(name = "IncomingCall")
class IncomingCallPlugin : Plugin() {
    private var receiver: BroadcastReceiver? = null

    override fun load() {
        super.load()
        receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                val raw = intent.getStringExtra("payload") ?: return
                emit(JSONObject(raw))
            }
        }
        LocalBroadcastManager.getInstance(context)
            .registerReceiver(receiver as BroadcastReceiver, IntentFilter(CallActionBridge.ACTION))
    }

    override fun handleOnDestroy() {
        receiver?.let { LocalBroadcastManager.getInstance(context).unregisterReceiver(it) }
        super.handleOnDestroy()
    }

    private fun emit(json: JSONObject) {
        notifyListeners("callAction", toJs(json))
    }

    private fun toJs(json: JSONObject): JSObject {
        val ret = JSObject()
        ret.put("action", json.optString("action"))
        ret.put("callId", json.optString("callId"))
        ret.put("from", json.optString("from"))
        ret.put("kind", json.optString("kind"))
        return ret
    }

    /** Called from JS on app start and every resume — picks up an
     * answer/decline that happened while nothing was listening yet (app was
     * fully closed). Returns an empty object if there's nothing pending. */
    @PluginMethod
    fun checkPendingAction(call: PluginCall) {
        val pending = CallActionBridge.consumePending(context)
        call.resolve(if (pending != null) toJs(pending) else JSObject())
    }
}
