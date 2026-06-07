//go:build !windows

package collector

func ListRunningServices() []string { return nil }
