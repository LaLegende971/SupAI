package updater

import (
	"fmt"
	"log"

	"github.com/LaLegende971/supai-agent/internal/client"
	"github.com/minio/selfupdate"
)

func CheckAndUpdate(c *client.Client, currentVersion, agentID string) (bool, error) {
	resp, err := c.CheckVersion(currentVersion, agentID)
	if err != nil {
		return false, fmt.Errorf("version check: %w", err)
	}
	if !resp.HasUpdate {
		return false, nil
	}

	log.Printf("[updater] new version available: %s — downloading...", resp.LatestVersion)

	body, err := c.DownloadUpdate(resp.DownloadURL)
	if err != nil {
		return false, fmt.Errorf("download: %w", err)
	}
	defer body.Close()

	if err := selfupdate.Apply(body, selfupdate.Options{}); err != nil {
		return false, fmt.Errorf("apply update: %w", err)
	}

	log.Printf("[updater] updated to %s — restarting...", resp.LatestVersion)
	return true, nil
}
