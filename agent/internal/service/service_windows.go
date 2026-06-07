//go:build windows

package service

import (
	"fmt"
	"os"
	"os/exec"

	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/mgr"
)

const ServiceName = "SupAIAgent"
const ServiceDisplay = "SupAI Monitoring Agent"

type Handler struct {
	Run func()
}

func (h *Handler) Execute(args []string, r <-chan svc.ChangeRequest, s chan<- svc.Status) (bool, uint32) {
	s <- svc.Status{State: svc.StartPending}
	go h.Run()
	s <- svc.Status{State: svc.Running, Accepts: svc.AcceptStop | svc.AcceptShutdown}
	for c := range r {
		switch c.Cmd {
		case svc.Stop, svc.Shutdown:
			s <- svc.Status{State: svc.StopPending}
			return false, 0
		}
	}
	return false, 0
}

func IsWindowsService() bool {
	ok, _ := svc.IsWindowsService()
	return ok
}

func RunAsService(run func()) error {
	return svc.Run(ServiceName, &Handler{Run: run})
}

func Install(exePath string) error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("connect scm: %w", err)
	}
	defer m.Disconnect()

	// Remove if already exists
	s, err := m.OpenService(ServiceName)
	if err == nil {
		s.Delete()
		s.Close()
	}

	s, err = m.CreateService(ServiceName, exePath, mgr.Config{
		DisplayName: ServiceDisplay,
		Description: "SupAI Infrastructure Monitoring Agent",
		StartType:   mgr.StartAutomatic,
	})
	if err != nil {
		return fmt.Errorf("create service: %w", err)
	}
	defer s.Close()

	if err := s.Start(); err != nil {
		return fmt.Errorf("start service: %w", err)
	}
	fmt.Printf("Service %q installed and started\n", ServiceName)
	return nil
}

func Uninstall() error {
	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := m.OpenService(ServiceName)
	if err != nil {
		return fmt.Errorf("service not found: %w", err)
	}
	defer s.Close()

	exec.Command("sc", "stop", ServiceName).Run()
	return s.Delete()
}

func RestartSelf() {
	exe, _ := os.Executable()
	exec.Command("cmd", "/C", "net stop "+ServiceName+" && net start "+ServiceName).Start()
	_ = exe
	os.Exit(0)
}
