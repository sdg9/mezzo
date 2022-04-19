import { Paper, Typography } from '@mui/material';

import { red, purple, green, blue, orange } from '@mui/material/colors';
import { Chip, Grid, Button } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { openInNewTab, openJsonInNewTab } from '../utils/urlHelper';
import { GetMezzoRoutesRouteData } from '@caribou-crew/mezzo-interfaces';

type Props = {
  route: GetMezzoRoutesRouteData;
};

const RouteItem = ({ route }: Props) => {
  let backgroundColor;
  let textColor;
  switch (route.method) {
    case 'GET':
      backgroundColor = blue[50];
      textColor = blue[800];
      break;
    case 'POST':
      backgroundColor = green[50];
      textColor = green[800];
      break;
    case 'PUT':
      backgroundColor = purple[50];
      textColor = purple[800];
      break;
    case 'DELETE':
      backgroundColor = red[50];
      textColor = red[800];
      break;
    case 'PATCH':
      backgroundColor = orange[50];
      textColor = orange[800];
      break;
    default:
      break;
  }
  return (
    <Paper style={{ backgroundColor }}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={4}>
          <Typography
            variant="body1"
            sx={{ p: 2 }}
            style={{ color: textColor }}
          >
            {route.path}
          </Typography>
        </Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={4} sx={{ pr: 2 }}>
          <Grid container xs={12} justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{ mr: 2, backgroundColor: textColor }}
              onClick={() => {
                if (route.method?.toUpperCase() === 'GET') {
                  openInNewTab(route.path.toString());
                } else {
                  // If not a POST, currently assumes response is always JSON, fetch via API then open
                  console.log('Route path: ', route.path.toString());
                  fetch(route.path.toString(), {
                    method: route.method,
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: route.method === 'GET' ? undefined : '{}',
                  })
                    .then((r) => r.json())
                    .then(openJsonInNewTab);
                }
              }}
            >
              <Visibility></Visibility>
            </Button>
            <Chip
              label={route.method}
              variant="outlined"
              style={{ color: textColor }}
            />
          </Grid>
        </Grid>
      </Grid>
      {route.variants.map((variant) => {
        return (
          <Grid
            key={variant.id}
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              onClick={() => {
                // if run:dev don't deal with prefix
                // if built into core, and core index.html is at /mezzo, we need to get to root
                console.log(
                  `../_admin/api/route/${encodeURIComponent(route.id)}`
                );
                fetch(`../_admin/api/route/${encodeURIComponent(route.id)}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ variant: variant.id }),
                });
              }}
            >
              {variant.label ?? variant.id}
            </Button>
          </Grid>
        );
      })}
    </Paper>
  );
};

export default RouteItem;
