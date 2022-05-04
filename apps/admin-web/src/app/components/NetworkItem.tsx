import { useState } from 'react';
import {
  Container,
  Button,
  Paper,
  Typography,
  Box,
  Divider,
} from '@mui/material';

import { red, purple, green, blue, orange } from '@mui/material/colors';
import { OpenInNew } from '@mui/icons-material';
import { openInNewTab, openJsonInNewTab } from '../utils/urlHelper';
import {
  RecordedItem,
  RouteItemType,
  RouteOrVariantIcon,
  VariantCategory,
} from '@caribou-crew/mezzo-interfaces';
import DynamicIcon from './DynamicIcon';
import RouteCategory from './RouteCategory';

type Props = RecordedItem;

const NetworkItem = ({
  uuid,
  resource,
  request,
  startTime,
  endTime,
  duration,
  url,
  response,
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
      // onClick={() =>
      // route.id === selectedItem
      //   ? setSelectedItem('')
      //   : setSelectedItem(route.id)
      // }
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
      {/* {selectedItem === route.id && (
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
              Route Id: {<span style={{ color: 'green' }}>{route.id}</span>}
            </Typography>
            <Typography noWrap variant="body2">
              Active Variant Id:{' '}
              {<span style={{ color: 'green' }}>{activeVariant}</span>}
            </Typography>
            {variantCategories.map((category, index) => (
              <RouteCategory
                key={`${category}:${index}`}
                category={category}
                route={route}
                activeVariant={activeVariant}
                setActiveVariant={setActiveVariant}
              />
            ))}
          </Container>
        </Box> */}
      {/* )} */}
    </Paper>
  );
};

export default NetworkItem;
