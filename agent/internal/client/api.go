package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/LaLegende971/supai-agent/internal/collector"
	"github.com/LaLegende971/supai-agent/internal/config"
)

type Client struct {
	ServerURL  string
	HTTPClient *http.Client
}

func New(serverURL string) *Client {
	return &Client{
		ServerURL: serverURL,
		HTTPClient: &http.Client{Timeout: 15 * time.Second},
	}
}

// ── Enrollment ──────────────────────────────────────────────────────────────

type EnrollRequest struct {
	Token    string   `json:"token"`
	Host     string   `json:"host"`
	IP       string   `json:"ip"`
	OS       string   `json:"os"`
	Version  string   `json:"version"`
	Services []string `json:"services"`
	Uptime   string   `json:"uptime"`
}

type EnrollResponse struct {
	AgentID string         `json:"agent_id"`
	Policy  config.Policy  `json:"policy"`
}

func (c *Client) Enroll(req EnrollRequest) (*EnrollResponse, error) {
	body, _ := json.Marshal(req)
	resp, err := c.post("/api/v1/enrollment/register", body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("enroll failed (%d): %s", resp.StatusCode, b)
	}
	var out EnrollResponse
	json.NewDecoder(resp.Body).Decode(&out)
	return &out, nil
}

// ── Metrics push ─────────────────────────────────────────────────────────────

type MetricPush struct {
	AgentID   string    `json:"agent_id"`
	CPU       float64   `json:"cpu"`
	RAM       float64   `json:"ram"`
	Disk      float64   `json:"disk"`
	Uptime    string    `json:"uptime"`
	Timestamp time.Time `json:"timestamp"`
}

func (c *Client) PushMetrics(agentID string, snap *collector.Snapshot) error {
	payload := MetricPush{
		AgentID:   agentID,
		CPU:       snap.CPU,
		RAM:       snap.RAM,
		Disk:      snap.Disk,
		Uptime:    snap.Uptime,
		Timestamp: snap.Timestamp,
	}
	body, _ := json.Marshal(payload)
	resp, err := c.post("/api/v1/metrics", body)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("push metrics failed: %d", resp.StatusCode)
	}
	return nil
}

// ── Version check ────────────────────────────────────────────────────────────

type VersionCheckRequest struct {
	CurrentVersion string `json:"current_version"`
	AgentID        string `json:"agent_id"`
}

type VersionCheckResponse struct {
	HasUpdate      bool   `json:"has_update"`
	LatestVersion  string `json:"latest_version"`
	DownloadURL    string `json:"download_url"`
}

func (c *Client) CheckVersion(currentVersion, agentID string) (*VersionCheckResponse, error) {
	body, _ := json.Marshal(VersionCheckRequest{
		CurrentVersion: currentVersion,
		AgentID:        agentID,
	})
	resp, err := c.post("/api/v1/agent/version/check", body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var out VersionCheckResponse
	json.NewDecoder(resp.Body).Decode(&out)
	return &out, nil
}

func (c *Client) DownloadUpdate(path string) (io.ReadCloser, error) {
	resp, err := c.HTTPClient.Get(c.ServerURL + path)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		resp.Body.Close()
		return nil, fmt.Errorf("download failed: %d", resp.StatusCode)
	}
	return resp.Body, nil
}

// ── Helpers ──────────────────────────────────────────────────────────────────

func (c *Client) post(path string, body []byte) (*http.Response, error) {
	return c.HTTPClient.Post(
		c.ServerURL+path,
		"application/json",
		bytes.NewReader(body),
	)
}
