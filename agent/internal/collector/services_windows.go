//go:build windows

package collector

import (
	"golang.org/x/sys/windows/svc/mgr"
)

// ListRunningServices retourne les noms des services Windows en cours d'exécution.
func ListRunningServices() []string {
	m, err := mgr.Connect()
	if err != nil {
		return nil
	}
	defer m.Disconnect()

	names, err := m.ListServices()
	if err != nil {
		return nil
	}

	var running []string
	for _, name := range names {
		s, err := m.OpenService(name)
		if err != nil {
			continue
		}
		status, err := s.Query()
		s.Close()
		if err != nil {
			continue
		}
		// svc.Running == 4
		if status.State == 4 {
			running = append(running, name)
		}
	}
	return running
}
