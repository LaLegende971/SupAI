package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"runtime"
	"time"

	"github.com/LaLegende971/supai-agent/internal/client"
	"github.com/LaLegende971/supai-agent/internal/collector"
	"github.com/LaLegende971/supai-agent/internal/config"
	"github.com/LaLegende971/supai-agent/internal/service"
	"github.com/LaLegende971/supai-agent/internal/updater"
)

const AgentVersion = "1.0.0"

func main() {
	token := flag.String("token", "", "Enrollment token")
	server := flag.String("server", "", "Server URL (e.g. http://192.168.1.220:5001)")
	uninstall := flag.Bool("uninstall", false, "Uninstall the service")
	flag.Parse()

	log.SetFlags(log.LstdFlags | log.Lshortfile)

	if *uninstall {
		if err := service.Uninstall(); err != nil {
			log.Fatalf("Uninstall failed: %v", err)
		}
		fmt.Println("SupAI Agent uninstalled successfully")
		return
	}

	// Enrollment mode
	if *token != "" && *server != "" {
		if err := enroll(*token, *server); err != nil {
			log.Fatalf("Enrollment failed: %v", err)
		}
		return
	}

	// Run as Windows service if invoked by SCM
	if service.IsWindowsService() {
		if err := service.RunAsService(run); err != nil {
			log.Fatalf("Service run failed: %v", err)
		}
		return
	}

	// Foreground mode (dev / test)
	run()
}

func enroll(token, serverURL string) error {
	ip := getLocalIP()
	hostname, _ := os.Hostname()
	osStr := fmt.Sprintf("%s %s", runtime.GOOS, runtime.GOARCH)

	snap, _ := collector.Collect()
	uptime := ""
	if snap != nil {
		uptime = snap.Uptime
	}

	c := client.New(serverURL)
	resp, err := c.Enroll(client.EnrollRequest{
		Token:    token,
		Host:     hostname,
		IP:       ip,
		OS:       osStr,
		Version:  AgentVersion,
		Services: []string{},
		Uptime:   uptime,
	})
	if err != nil {
		return err
	}

	cfg := &config.Config{
		AgentID:   resp.AgentID,
		ServerURL: serverURL,
		Version:   AgentVersion,
		Policy:    resp.Policy,
	}
	if err := config.Save(cfg); err != nil {
		return fmt.Errorf("save config: %w", err)
	}

	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("get exe path: %w", err)
	}

	if err := service.Install(exePath); err != nil {
		return fmt.Errorf("install service: %w", err)
	}

	fmt.Printf("Enrolled successfully. Agent ID: %s\n", resp.AgentID)
	return nil
}

func run() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Cannot load config — run enrollment first: %v", err)
	}

	c := client.New(cfg.ServerURL)
	log.Printf("SupAI Agent v%s started — server: %s", cfg.Version, cfg.ServerURL)

	pushInterval := time.Duration(cfg.Policy.PushInterval) * time.Second
	if pushInterval < 5*time.Second {
		pushInterval = 5 * time.Second
	}

	updateCheckInterval := time.Duration(cfg.Policy.UpdateCheckFrequency) * time.Second
	if updateCheckInterval < time.Minute {
		updateCheckInterval = time.Minute
	}

	pushTicker := time.NewTicker(pushInterval)
	updateTicker := time.NewTicker(updateCheckInterval)
	defer pushTicker.Stop()
	defer updateTicker.Stop()

	// Initial push
	pushOnce(c, cfg)

	for {
		select {
		case <-pushTicker.C:
			pushOnce(c, cfg)

		case <-updateTicker.C:
			if cfg.Policy.UpdateCheckEnabled && cfg.Policy.AutoUpdate {
				updated, err := updater.CheckAndUpdate(c, cfg.Version, cfg.AgentID)
				if err != nil {
					log.Printf("[updater] error: %v", err)
				} else if updated {
					service.RestartSelf()
				}
			}
		}
	}
}

func pushOnce(c *client.Client, cfg *config.Config) {
	snap, err := collector.Collect()
	if err != nil {
		log.Printf("[metrics] collect error: %v", err)
		return
	}
	if err := c.PushMetrics(cfg.AgentID, snap); err != nil {
		log.Printf("[metrics] push error: %v", err)
	}
}

func getLocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "unknown"
	}
	for _, addr := range addrs {
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return "unknown"
}
