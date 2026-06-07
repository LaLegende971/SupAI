package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Policy struct {
	ID                   string   `json:"id"`
	PushInterval         int      `json:"push_interval"`
	Metrics              []string `json:"metrics"`
	Thresholds           map[string]float64 `json:"thresholds"`
	UpdateCheckEnabled   bool     `json:"update_check_enabled"`
	UpdateCheckFrequency int      `json:"update_check_frequency"`
	AutoUpdate           bool     `json:"auto_update"`
}

type Config struct {
	AgentID   string `json:"agent_id"`
	ServerURL string `json:"server_url"`
	Version   string `json:"version"`
	Policy    Policy `json:"policy"`
}

func configPath() string {
	dir, _ := os.Executable()
	return filepath.Join(filepath.Dir(dir), "supai-agent.json")
}

func Load() (*Config, error) {
	data, err := os.ReadFile(configPath())
	if err != nil {
		return nil, err
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func Save(cfg *Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(configPath(), data, 0600)
}
