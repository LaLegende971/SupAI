//go:build !windows

package service

func IsWindowsService() bool { return false }
func RunAsService(run func()) error { run(); return nil }
func Install(exePath string) error  { return nil }
func Uninstall() error              { return nil }
func RestartSelf()                  {}
