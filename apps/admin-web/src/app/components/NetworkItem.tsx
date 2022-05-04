import {
  Container,
  Button,
  Paper,
  Typography,
  Box,
  Divider,
} from '@mui/material';

import { red, purple, green, blue, orange } from '@mui/material/colors';
import { RecordedItem } from '@caribou-crew/mezzo-interfaces';

interface Props extends RecordedItem {
  selectedUUID: string;
  setSelectedUUID: (id: string) => void;
}

const NetworkItem = ({
  uuid,
  resource,
  request,
  startTime,
  endTime,
  duration,
  url,
  response,
  selectedUUID,
  setSelectedUUID,
}: Props) => {
  const getColors = () => {
    let backgroundColor;
    let textColor;
    if (endTime == null) {
      backgroundColor = orange[50];
      textColor = orange[800];
    } else {
      backgroundColor = green[50];
      textColor = green[800];
    }
    return { backgroundColor, textColor };
  };

  const _renderTitle = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          p: 2,
          gap: 2,
        }}
      >
        <Typography noWrap variant="body1">
          <b>URL: </b>
          {url ?? resource}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      style={{
        backgroundColor: getColors().backgroundColor,
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 15,
      }}
      onClick={() =>
        uuid === selectedUUID ? setSelectedUUID('') : setSelectedUUID(uuid)
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {_renderTitle()}
      </Box>
      {selectedUUID === uuid && (
        <Box>
          <Divider></Divider>
          <Container
            sx={{ pt: 2, pb: 2 }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Typography variant="subtitle2">Details</Typography>
            <Typography variant="body2">
              Start: {new Date(startTime).toISOString()}, End:{' '}
              {new Date(startTime).toISOString()}, Duration:{' '}
              {duration ? `${duration}ms` : 'Pending'}
            </Typography>
            <Typography variant="subtitle2">Request:</Typography>
            <Typography variant="body2">
              Config: {JSON.stringify(request.config)}
            </Typography>
            <Typography variant="subtitle2">Response:</Typography>
            <Typography variant="body2">
              Status: {response?.status} {response?.statusText}
            </Typography>
            <Typography variant="body2">
              Headers:{' '}
              {
                <span style={{ color: 'green' }}>
                  {JSON.stringify(response?.headers)}
                </span>
              }
            </Typography>
            <Typography variant="body2">
              Body:{' '}
              {
                <span style={{ color: 'green' }}>
                  {JSON.stringify(response?.body)}
                </span>
              }
            </Typography>
          </Container>
        </Box>
      )}
    </Paper>
  );
};

export default NetworkItem;
