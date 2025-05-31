package expo.modules.rnexpoesptouch

import android.content.Context
import android.net.wifi.WifiManager
import android.os.AsyncTask
import androidx.core.os.bundleOf
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

import com.espressif.iot.esptouch.EsptouchTask
import com.espressif.iot.esptouch.IEsptouchResult
import com.espressif.iot.esptouch.IEsptouchTask

class RnExpoEspTouchModule : Module() {
  private var esptouchTask: IEsptouchTask? = null
  private var isTaskRunning = false

  override fun definition() = ModuleDefinition {
    Name("RnExpoEspTouch")

    Events("onDeviceFound", "onTaskComplete", "onError")

    AsyncFunction("startProvisioning") { config: ESPTouchConfig, promise: Promise ->
      if (isTaskRunning) {
        promise.reject("TASK_RUNNING", "ESP Touch task is already running", null)
        return@AsyncFunction
      }

      val ssid = config.ssid
      val password = config.password
      val bssid = config.bssid
      val taskCount = config.taskCount ?: 1

      isTaskRunning = true

      // Stop any existing task
      esptouchTask?.interrupt()

      // Create new ESP Touch task
      esptouchTask = EsptouchTask(ssid, bssid, password, appContext.reactContext)

      // Execute task asynchronously
      object : AsyncTask<Void, Void, List<IEsptouchResult>>() {
        override fun doInBackground(vararg params: Void?): List<IEsptouchResult> {
          return try {
            esptouchTask?.executeForResults(taskCount) ?: emptyList()
          } catch (e: Exception) {
            sendEvent("onError", bundleOf("error" to e.message))
            emptyList()
          }
        }

        override fun onPostExecute(results: List<IEsptouchResult>) {
          val devices = mutableListOf<Map<String, String>>()
          var successCount = 0

          for (result in results) {
            if (result.isSuc) {
              successCount++
              val device = mapOf(
                "bssid" to result.bssid,
                "ipAddress" to result.inetAddress.hostAddress
              )
              devices.add(device)

              // Emit device found event
              sendEvent("onDeviceFound", bundleOf("device" to device))
            }
          }

          val response = mapOf(
            "success" to (successCount > 0),
            "devices" to devices,
            "deviceCount" to successCount,
            "message" to if (successCount > 0) {
              "Successfully configured $successCount device(s)"
            } else {
              "No devices configured"
            }
          )

          isTaskRunning = false
          sendEvent("onTaskComplete", bundleOf(
            "success" to response["success"],
            "devices" to response["devices"],
            "deviceCount" to response["deviceCount"],
            "message" to response["message"]
          ))
          promise.resolve(response)
        }

        override fun onCancelled() {
          isTaskRunning = false
          val response = mapOf(
            "success" to false,
            "devices" to emptyList<Map<String, String>>(),
            "deviceCount" to 0,
            "message" to "Task was cancelled"
          )
          promise.resolve(response)
        }
      }.execute()
    }

    Function("stopProvisioning") {
      esptouchTask?.interrupt()
      esptouchTask = null
      isTaskRunning = false
    }

    Function("isTaskRunning") {
      return@Function isTaskRunning
    }

    Function("isSupported") {
      val wifiManager = appContext.reactContext?.getSystemService(Context.WIFI_SERVICE) as? WifiManager
      return@Function wifiManager?.isWifiEnabled == true
    }
  }
}

class ESPTouchConfig : Record {
  @Field val ssid: String = ""
  @Field val password: String = ""
  @Field val bssid: String? = null
  @Field val taskCount: Int? = null
}