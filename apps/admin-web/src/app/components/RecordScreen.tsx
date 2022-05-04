import React, { useEffect, useReducer, useRef, useState } from 'react';

import { Button, Container, Typography } from '@mui/material';
import {
  DEFAULT_PORT,
  MEZZO_API_GET_RECORDINGS,
} from '@caribou-crew/mezzo-constants';

import { interceptedFetch } from '@caribou-crew/mezzo-intercept-fetch';
import { RecordedItem } from '@caribou-crew/mezzo-interfaces';
import NetworkItem from './NetworkItem';
// interceptFetch();

type Props = Record<string, never>;

interface MyState {
  items: RecordedItem[];
}

interface MyAction {
  type: string;
  payload: RecordedItem | RecordedItem[];
}

function reducer(state: MyState, action: MyAction) {
  // console.log('In reducer', action);
  // console.log('My state', state);
  console.log('Received new action: ', action.type);
  switch (action.type) {
    case 'add': {
      const payload: RecordedItem = action.payload as RecordedItem;
      // Attempt to update existing, if not add
      const existingIndex = state.items.findIndex(
        (i) => i.uuid === payload.uuid
      );
      if (existingIndex >= 0) {
        console.log('Updating existing item');
        const clonedItems = [...state.items];
        clonedItems[existingIndex] = payload;
        // update
        return {
          ...state,
          items: clonedItems,
        };
      } else {
        console.log('Adding new item');
        //add
        return {
          ...state,
          items: [...state.items, payload],
        };
      }
    }
    case 'set': {
      const payload: RecordedItem[] = action.payload as RecordedItem[];
      return {
        ...state,
        items: payload,
      };
    }
    // case 'decrement':
    //   return {count: state.count - 1};
    default:
      throw new Error();
  }
}

const initialState: MyState = {
  items: [],
};

export default function RecordScreen(props: Props) {
  const [isPaused, setPause] = useState(false);
  const [selectedUUID, setSelectedUUID] = useState('');
  // const [messages, setItems] = useState<string[]>([]);
  // const [state, dispatch] = useReducer(reducer, { items: [] });
  // const [state, dispatch] = useReducer(reducer, { items: [] });
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchWithIntercept = interceptedFetch(fetch, {});

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    async function fetchAllRecordsings() {
      const response = await fetch(MEZZO_API_GET_RECORDINGS);
      const { data } = await response.json();
      console.log('Setting payload data to: ', data);
      dispatch({
        type: 'set',
        payload: data,
      });
    }
    fetchAllRecordsings();
  }, []);

  // Connect/disconnect on component mount/unmount
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:${DEFAULT_PORT}/`);
    ws.current.onopen = () => console.log('ws opened');
    ws.current.onclose = () => console.log('ws closed');
    const wsCurrent = ws.current;
    return () => {
      wsCurrent.send('Close');
      wsCurrent.close();
    };
  }, []);

  // Process socket message received
  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (e: MessageEvent<string>) => {
      if (isPaused) return;
      const message: RecordedItem = JSON.parse(e.data);
      // const message = JSON.parse(e.data);
      console.log('e', message);
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
      {/* Record:
      <Button
        variant="outlined"
        onClick={() => {
          setPause(!isPaused);
        }}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </Button>
      <br /> */}
      <Button
        variant="outlined"
        onClick={() => {
          fetchWithIntercept('/api/food/meat');
        }}
      >
        Make API Call{' '}
      </Button>
      <br />
      <Typography>Total items: {state.items.length}</Typography>
      Redux:
      {state.items?.map((i: RecordedItem) => {
        return (
          <div key={i.uuid}>
            <NetworkItem
              {...i}
              selectedUUID={selectedUUID}
              setSelectedUUID={setSelectedUUID}
            />
          </div>
        );
      })}
    </Container>
  );
}
