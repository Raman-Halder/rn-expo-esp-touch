Pod::Spec.new do |s|
  s.name           = 'RnExpoEspTouch'
  s.version        = '1.0.0'
  s.summary        = 'ESP Touch WiFi provisioning for Expo apps'
  s.description    = 'A comprehensive ESP Touch implementation for Expo applications supporting both iOS and Android platforms'
  s.author         = ''
  s.homepage       = 'https://github.com/Raman-Halder/rn-expo-esp-touch'
  s.platforms      = { :ios => '13.0', :tvos => '13.0' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'ESPTouchV2', '~> 2.0'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end