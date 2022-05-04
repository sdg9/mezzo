import React, { useEffect, useReducer, useRef, useState } from 'react';

import { Button, Container, Typography } from '@mui/material';
import { DEFAULT_PORT } from '@caribou-crew/mezzo-constants';

import { interceptFetch } from '@caribou-crew/mezzo-intercept-fetch';
interceptFetch();

type Props = Record<string, never>;

interface MyState {
  messages: string[];
}

interface MyAction {
  type: string;
  payload: string;
}

function reducer(state: MyState, action: MyAction) {
  console.log('In reducer', action);
  console.log('My state', state);
  switch (action.type) {
    case 'add':
      // return { count: state.count + 1 };
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    // case 'decrement':
    //   return {count: state.count - 1};
    default:
      throw new Error();
  }
}

export default function RecordScreen(props: Props) {
  const [isPaused, setPause] = useState(false);
  // const [messages, setItems] = useState<string[]>([]);
  const [state, dispatch] = useReducer(reducer, { messages: [] });

  // TODO update to proper domain and port
  const ws = useRef<WebSocket>(
    new WebSocket(`ws://localhost:${DEFAULT_PORT}/`)
  );

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

    ws.current.onmessage = (e: MessageEvent<string>) => {
      if (isPaused) return;
      const message = e.data;
      // const message = JSON.parse(e.data);
      console.log('e', message);
      // setItems([...messages, message]);
      dispatch({ type: 'add', payload: message });

      // TODO each message will be new network request or response, think charles
      // Update component state as responses are coming in
      // Render list of items based on component state
      // provide some option to persist recording locally

      // Consider maintaining state on node backend
      // First load/ws connection will pull all responses, either via socket or could be rest endpointo
    };
  }, [isPaused, dispatch]);

  return (
    <Container component="main" maxWidth="lg">
      Record:
      <Button
        variant="outlined"
        onClick={() => {
          setPause(!isPaused);
        }}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </Button>
      <br />
      <Button
        variant="outlined"
        onClick={() => {
          fetch('/api/food/meat');
        }}
      >
        Test{' '}
      </Button>
      <br />
      <Typography>Total items: {state.messages.length}</Typography>
      Redux:
      {state.messages.map((i, idx) => {
        return <div key={idx}>{i}</div>;
      })}
      {/* Comopnent state:
      {messages.map((i, idx) => {
        return <div key={idx}>{i}</div>;
      })} */}
    </Container>
  );
}
