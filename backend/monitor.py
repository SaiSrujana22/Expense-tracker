"""
monitor.py
----------
This is the only file that talks to psutil directly. Everything else in the
app just consumes the dictionary that get_metrics() returns. That separation
means the rest of the app doesn't care *how* we measured the system - it just
gets clean numbers back.
"""

import time
import psutil

# psutil.cpu_percent() needs a "warm up" call before it gives real numbers,
# otherwise the very first reading is always 0.0. We do that once at import
# time so the first real request already has good data.
psutil.cpu_percent(interval=None)

# Remember when the server started, so we can show "dashboard uptime" too.
_START_TIME = time.time()


def _bytes_to_gb(value: int) -> float:
    return round(value / (1024 ** 3), 2)


def get_cpu_info() -> dict:
    return {
        "percent": psutil.cpu_percent(interval=None),          # overall CPU load
        "per_core": psutil.cpu_percent(interval=None, percpu=True),
        "core_count": psutil.cpu_count(logical=True),
    }


def get_memory_info() -> dict:
    mem = psutil.virtual_memory()
    return {
        "percent": mem.percent,
        "used_gb": _bytes_to_gb(mem.used),
        "total_gb": _bytes_to_gb(mem.total),
    }


def get_disk_info() -> dict:
    disk = psutil.disk_usage("/")
    return {
        "percent": disk.percent,
        "used_gb": _bytes_to_gb(disk.used),
        "total_gb": _bytes_to_gb(disk.total),
    }


def get_network_info() -> dict:
    net = psutil.net_io_counters()
    return {
        "sent_mb": round(net.bytes_sent / (1024 ** 2), 2),
        "received_mb": round(net.bytes_recv / (1024 ** 2), 2),
    }


def get_top_processes(limit: int = 5) -> list:
    """Return the top N processes by CPU usage."""
    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            info = proc.info
            processes.append({
                "pid": info["pid"],
                "name": info["name"] or "unknown",
                "cpu_percent": round(info["cpu_percent"] or 0.0, 1),
                "memory_percent": round(info["memory_percent"] or 0.0, 1),
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            # Processes can disappear between listing and reading them - just skip those.
            continue

    processes.sort(key=lambda p: p["cpu_percent"], reverse=True)
    return processes[:limit]


def get_uptime_seconds() -> int:
    """How long the *machine* has been running (not just this app)."""
    return int(time.time() - psutil.boot_time())


def get_app_uptime_seconds() -> int:
    """How long this dashboard server itself has been running."""
    return int(time.time() - _START_TIME)


def get_metrics() -> dict:
    """The single entry point the API route calls."""
    return {
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "network": get_network_info(),
        "top_processes": get_top_processes(),
        "uptime_seconds": get_uptime_seconds(),
        "app_uptime_seconds": get_app_uptime_seconds(),
        "timestamp": time.time(),
    }
