package client

import (
	"encoding/json"
	"fmt"
)

type AgentEvent struct {
	AgentID  string `json:"agent_id"`
	Level    string `json:"level"` // "error" | "warning" | "info"
	Message  string `json:"message"`
	Source   string `json:"source"` // "metrics" | "updater" | "service" | ...
}

func (c *Client) SendEvent(ev AgentEvent) error {
	body, _ := json.Marshal(ev)
	resp, err := c.post("/api/v1/agent/events", body)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return fmt.Errorf("send event: %d", resp.StatusCode)
	}
	return nil
}
