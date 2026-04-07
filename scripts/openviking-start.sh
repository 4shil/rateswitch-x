#!/bin/bash
# Start OpenViking servers (main + MCP)
# Usage: ./scripts/openviking-start.sh

# Clean stale locks
rm -f ~/.openviking/workspace/vectordb/context/store/LOCK 2>/dev/null

# Kill any existing instances
fuser -k 1950/tcp 2>/dev/null
fuser -k 2033/tcp 2>/dev/null
sleep 1

# Start main REST API server
nohup openviking-server --config ~/.openviking/ov.conf --host 127.0.0.1 --port 1950 > /tmp/openviking-main.log 2>&1 &
echo "Main server started (PID: $!) on port 1950"

# Start MCP server
cd /home/ashil/OpenViking/examples/mcp-query
nohup python3 server.py --config ~/.openviking/ov.conf --port 2033 > /tmp/openviking-mcp.log 2>&1 &
echo "MCP server started (PID: $!) on port 2033"

sleep 3

# Verify
if curl -s http://127.0.0.1:1950/health | grep -q "ok"; then
    echo "✅ Main server healthy"
else
    echo "❌ Main server failed"
fi

if mcporter list openviking --schema 2>/dev/null | grep -q "tools"; then
    echo "✅ MCP server healthy (3 tools available)"
else
    echo "❌ MCP server failed"
fi
