import React, { useEffect, useReducer, useRef, useState } from 'react';

import { Button, Container, Typography } from '@mui/material';
import {
  DEFAULT_PORT,
  MEZZO_API_GET_RECORDINGS,
} from '@caribou-crew/mezzo-constants';

// import { interceptedFetch } from '@caribou-crew/mezzo-interceptor-fetch';
import { RecordedItem } from '@caribou-crew/mezzo-interfaces';
import NetworkItem from './NetworkItem';
import { createClient, MezzoClient } from '@caribou-crew/mezzo-core-client';
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
  // const [isPaused, setPause] = useState(false);
  const [selectedUUID, setSelectedUUID] = useState('');
  // const [messages, setItems] = useState<string[]>([]);
  // const [state, dispatch] = useReducer(reducer, { items: [] });
  // const [state, dispatch] = useReducer(reducer, { items: [] });
  const [state, dispatch] = useReducer(reducer, initialState);

  // const fetchWithIntercept = interceptedFetch(fetch, {});

  const ws = useRef<WebSocket | null>(null);
  const mezzoClient = useRef<MezzoClient | null>(null);

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
  // useEffect(() => {
  //   ws.current = new WebSocket(`ws://localhost:${DEFAULT_PORT}/`);
  //   ws.current.onopen = () => console.log('ws opened');
  //   ws.current.onclose = () => console.log('ws closed');
  //   const wsCurrent = ws.current;
  //   return () => {
  //     if (wsCurrent.readyState === WebSocket.OPEN) {
  //       wsCurrent.send('Close');
  //     }
  //     wsCurrent.close();
  //   };
  // }, []);

  // Process socket message received
  // useEffect(() => {
  //   if (!ws.current) return;

  //   ws.current.onmessage = (e: MessageEvent<string>) => {
  //     if (isPaused) return;
  //     const message: RecordedItem = JSON.parse(e.data);
  //     // const message = JSON.parse(e.data);
  //     console.log('e', message);
  //     dispatch({ type: 'add', payload: message });

  //     // TODO each message will be new network request or response, think charles
  //     // Update component state as responses are coming in
  //     // Render list of items based on component state
  //     // provide some option to persist recording locally

  //     // Consider maintaining state on node backend
  //     // First load/ws connection will pull all responses, either via socket or could be rest endpointo
  //   };
  // }, [isPaused, dispatch]);

  // Use core client
  useEffect(() => {
    const onCommand = (data: any) => {
      console.log('On command: ', data);
      if (data.type === 'api.response') {
        const message: RecordedItem = data;
        console.log('e', message);
        dispatch({ type: 'add', payload: message });

        // do logic here
      }
      // logger.info('In custom on response', data);
      // messages.push(data);
      // if (messages.length >= 2) {
      //   client.close();
      // }
    };
    mezzoClient.current = createClient({
      createSocket: (path) => new WebSocket(path ?? ''),
      port: DEFAULT_PORT,
      host: 'localhost',
      name: 'Admin Web',
      client: {},
      getClientId: () => {
        return new Promise((resolve) => resolve('Some Temp id from client'));
      },
      onCommand,
      // proxyHack: true,
    });
    // ws.current = ;
    // ws.current.onopen = () => console.log('ws opened');
    // ws.current.onclose = () => console.log('ws closed');
    // const wsCurrent = ws.current;
    // return () => {
    //   if (wsCurrent.readyState === WebSocket.OPEN) {
    //     wsCurrent.send('Close');
    //   }
    //   wsCurrent.close();
    // };

    return () => {
      if (mezzoClient.current?.readyState === WebSocket.OPEN) {
        mezzoClient.current.send('Close');
        mezzoClient.current.close();
      }
      // if (wsCurrent.readyState === WebSocket.OPEN) {
      //   wsCurrent.send('Close');
      // }
      // wsCurrent.close();
    };
  }, [dispatch]);

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
          // fetchWithIntercept('/api/food/meat');

          // this essentially is what core-client's captureApiResponse does provided it's passed valid data
          // ws.current?.send('api.response', dummyData, false);
          mezzoClient.current?.send('api.response', dummyData, false);
        }}
      >
        {/* Make API Call{' '} */}
        Load dummy data
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

const dummyData = {
  request: {
    url: 'https://reactnative.dev/movies.json',
    method: 'GET',
    data: null,
    headers: {},
    params: null,
  },
  response: {
    body: {
      title: 'The Basics - Networking',
      description: 'Your app fetched this from a remote endpoint!',
      movies: [
        {
          id: '1',
          title: 'Star Wars',
          releaseYear: '1977',
        },
        {
          id: '2',
          title: 'Back to the Future',
          releaseYear: '1985',
        },
        {
          id: '3',
          title: 'The Matrix',
          releaseYear: '1999',
        },
        {
          id: '4',
          title: 'Inception',
          releaseYear: '2010',
        },
        {
          id: '5',
          title: 'Interstellar',
          releaseYear: '2014',
        },
      ],
    },
    status: 200,
    headers: {
      'content-type': 'application/json',
      'expect-ct':
        'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
      etag: '"1c280937dfb73305184f0c1a4d75848c-ssl"',
      nel: '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
      'report-to':
        '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v3?s=09DVBAQZR9o54ciqTC%2BBHNf%2B5EGm2oc%2FXYy4QV22hStDYlsbWvKsHxWxU5gsGiOV03fpYyaXHcSuGqQO7MCVvRGGF5REn%2Fg7rpo%2FvPtoPh5CO0XzuKxtkkuzNl5c8Ou35vQ%3D"}],"group":"cf-nel","max_age":604800}',
      date: 'Mon, 09 May 2022 13:51:21 GMT',
      server: 'cloudflare',
      'cache-control': 'public, max-age=0, must-revalidate',
      'cf-ray': '708ae8cd0d2a2d85-ORD',
      'access-control-allow-origin': '*',
      'cf-cache-status': 'DYNAMIC',
      'alt-svc': 'h3=":443"; ma=86400, h3-29=":443"; ma=86400',
      age: '4276',
      'x-nf-request-id': '01G2MHDF20EBJT76C2KR3KCVK2',
    },
  },
  duration: 198.60000002384186,
};
