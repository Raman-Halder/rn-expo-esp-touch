import ExpoModulesCore
import ESPTouchV2

public class RnExpoEspTouchModule: Module {
  private var espTouchTask: ESPTouchTask?
  private var isTaskRunning = false
  
  public func definition() -> ModuleDefinition {
    Name("RnExpoEspTouch")
    
    Events("onDeviceFound", "onTaskComplete", "onError")
    
    AsyncFunction("startProvisioning") { (config: ESPTouchConfig, promise: Promise) in
      guard !isTaskRunning else {
        promise.reject("TASK_RUNNING", "ESP Touch task is already running")
        return
      }
      
      let ssid = config.ssid
      let password = config.password
      let bssid = config.bssid
      let taskCount = config.taskCount ?? 1
      
      isTaskRunning = true
      
      DispatchQueue.global(qos: .background).async { [weak self] in
        guard let self = self else { return }
        
        do {
          // Create ESP Touch task
          self.espTouchTask = ESPTouchTask(
            apSsid: ssid,
            andApBssid: bssid,
            andApPassword: password
          )
          
          // Execute task
          let results = self.espTouchTask?.executeForResults(taskCount) ?? []
          
          var devices: [[String: Any]] = []
          var successCount = 0
          
          for result in results {
            if result.isSuc() {
              successCount += 1
              let device: [String: Any] = [
                "bssid": result.getBssid() ?? "",
                "ipAddress": result.getInetAddress()?.description ?? ""
              ]
              devices.append(device)
              
              // Emit device found event
              self.sendEvent("onDeviceFound", [
                "device": device
              ])
            }
          }
          
          let response: [String: Any] = [
            "success": successCount > 0,
            "devices": devices,
            "deviceCount": successCount,
            "message": successCount > 0 ? "Successfully configured \(successCount) device(s)" : "No devices configured"
          ]
          
          DispatchQueue.main.async {
            self.isTaskRunning = false
            self.sendEvent("onTaskComplete", response)
            promise.resolve(response)
          }
          
        } catch {
          DispatchQueue.main.async {
            self.isTaskRunning = false
            let errorMessage = error.localizedDescription
            self.sendEvent("onError", ["error": errorMessage])
            promise.reject("ESP_TOUCH_ERROR", errorMessage)
          }
        }
      }
    }
    
    Function("stopProvisioning") { [weak self] in
      guard let self = self else { return }
      
      if let task = self.espTouchTask {
        task.interrupt()
        self.espTouchTask = nil
      }
      self.isTaskRunning = false
    }
    
    Function("isTaskRunning") { [weak self] () -> Bool in
      return self?.isTaskRunning ?? false
    }
    
    Function("isSupported") { () -> Bool in
      return true // ESP Touch is supported on iOS
    }
  }
}

// MARK: - Configuration Struct
struct ESPTouchConfig: Record {
  @Field var ssid: String
  @Field var password: String
  @Field var bssid: String?
  @Field var taskCount: Int?
}