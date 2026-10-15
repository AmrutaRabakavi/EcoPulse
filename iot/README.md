# EcoPulse IoT Module (Smart Campus Dustbin)

This directory contains the firmware and simulator for the ESP32 IoT Smart Dustbin sensors.

## Architecture
- **Hardware**: ESP32 microcontroller with HC-SR04 ultrasonic distance sensor mounted on campus waste bins.
- **Protocol**: HTTP POST (or MQTT) sending telemetry payload `{ deviceId, fillLevelPercentage, batteryLevel, status }` to `/api/iot/telemetry`.
- **MVP Status**: Simulated in Phase 8 via a Node.js simulator script prior to physical flashing.
