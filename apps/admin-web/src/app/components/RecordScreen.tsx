import React, { useEffect, useRef, useState } from 'react';

import { Container } from '@mui/material';

type Props = {};

export default function RecordScreen(props: Props) {
  const [isPaused, setPause] = useState(false);

  // TODO update to proper domain
  const ws = useRef<WebSocket>(new WebSocket('ws://localhost:8000/'));

  // Connect/disconnect on component mount/unmount
  useEffect(() => {
    ws.current.onopen = () => console.log('ws opened');
    ws.current.onclose = () => console.log('ws closed');
    const wsCurrent = ws.current;
    return () => {
      wsCurrent.close();
    };
  }, []);

  // Process socket message received
  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (e: any) => {
      if (isPaused) return;
      const message = e.data;
      // const message = JSON.parse(e.data);
      console.log('e', message);

      // TODO each message will be new network request or response, think charles
      // Update component state as responses are coming in
      // Render list of items based on component state
      // provide some option to persist recording locally

      // Consider maintaining state on node backend
      // First load/ws connection will pull all responses, either via socket or could be rest endpointo
    };
  }, [isPaused]);

  return (
    <Container component="main" maxWidth="lg">
      TODO record
      <button onClick={() => setPause(!isPaused)}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </Container>
  );
}
