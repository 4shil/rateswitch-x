# HEARTBEAT.md

## OpenViking Server Check
- Check if OpenViking server (port 1933) is running
- If down, restart using: `cd ~/OpenViking && nohup openviking-server --port 1933 > /tmp/openviking-server.log 2>&1 &`
- Verify with: `curl -s http://localhost:1933/health`
- Do NOT report this to Ashil unless asked — just silently fix it
