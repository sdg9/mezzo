import React, { useEffect, useState } from 'react';
import { GetMezzoRoutesRouteData } from '@caribou-crew/mezzo-interfaces';

import {
  TextField,
  Stack,
  Autocomplete,
  Grid,
  Box,
  Container,
} from '@mui/material';
import RouteItem from './components/RouteItem';
import Header from './components/Header';

export const App = () => {
  const [routes, setRoutes] = useState<GetMezzoRoutesRouteData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/_admin/routes');
      const data = await response.json();
      setRoutes(data.routes);
    };

    fetchData().catch(console.error);
  }, []);

  const list = () => {
    const listOfRoutes: JSX.Element[] = [];
    if (Array.isArray(routes) && routes.length > 0) {
      routes.forEach((route) => {
        listOfRoutes.push(<RouteItem route={route} key={route.id}></RouteItem>);
      });
    }
    return listOfRoutes;
  };
  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} justifyContent="center">
            <Header name="Mezzo"></Header>
            <Autocomplete
              disablePortal
              freeSolo
              id="combo-box-search"
              options={routes.map((route) => ({
                label: route.path,
                id: route.id,
              }))}
              sx={{ pr: '20%', pl: '20%' }}
              renderInput={(params) => (
                <TextField {...params} label="Search..." />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={2}>{list()}</Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default App;
