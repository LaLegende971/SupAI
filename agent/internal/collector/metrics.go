package collector

import (
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

type Snapshot struct {
	CPU      float64
	RAM      float64
	Disk     float64
	Uptime   string
	Services []string
	Timestamp time.Time
}

func Collect() (*Snapshot, error) {
	cpuPct, err := cpu.Percent(500*time.Millisecond, false)
	if err != nil || len(cpuPct) == 0 {
		return nil, fmt.Errorf("cpu: %w", err)
	}

	memStat, err := mem.VirtualMemory()
	if err != nil {
		return nil, fmt.Errorf("ram: %w", err)
	}

	diskStat, err := disk.Usage("C:\\")
	if err != nil {
		// fallback to root partition on non-Windows
		diskStat, err = disk.Usage("/")
		if err != nil {
			return nil, fmt.Errorf("disk: %w", err)
		}
	}

	info, _ := host.Info()
	uptime := formatUptime(info.Uptime)

	return &Snapshot{
		CPU:       cpuPct[0],
		RAM:       memStat.UsedPercent,
		Disk:      diskStat.UsedPercent,
		Uptime:    uptime,
		Services:  ListRunningServices(),
		Timestamp: time.Now().UTC(),
	}, nil
}

func formatUptime(seconds uint64) string {
	d := seconds / 86400
	h := (seconds % 86400) / 3600
	m := (seconds % 3600) / 60
	if d > 0 {
		return fmt.Sprintf("%dd %dh %02dm", d, h, m)
	}
	return fmt.Sprintf("%dh %02dm", h, m)
}
