#!/usr/bin/env python3
"""
Simple log monitor for SpeedThreads backend
Run this to watch logs in real-time: python monitor_logs.py
"""

import time
import os
import sys
from pathlib import Path

def monitor_logs():
    log_file = Path("speedthreads.log")
    
    if not log_file.exists():
        print("📄 No log file found. Start the server first to create logs.")
        return
    
    print("🔍 Monitoring SpeedThreads logs... (Press Ctrl+C to stop)")
    print("=" * 60)
    
    try:
        with open(log_file, 'r') as f:
            # Go to end of file
            f.seek(0, 2)
            
            while True:
                line = f.readline()
                if line:
                    # Color code different log levels
                    if "ERROR" in line:
                        print(f"\033[91m{line.strip()}\033[0m")  # Red for errors
                    elif "WARNING" in line:
                        print(f"\033[93m{line.strip()}\033[0m")  # Yellow for warnings
                    elif "INFO" in line:
                        print(f"\033[92m{line.strip()}\033[0m")  # Green for info
                    else:
                        print(line.strip())
                else:
                    time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n👋 Log monitoring stopped.")
    except Exception as e:
        print(f"❌ Error monitoring logs: {e}")

if __name__ == "__main__":
    monitor_logs()
