import React, { useState } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';

import {
  TextField,
  Box,
  Container,
  Button,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import RouteItem from './RouteItem';
import useFetchRoutes from '../hooks/useFetchRoutes';
import useRouteFilter from '../hooks/useRouteFilter';
import useRouteSort from '../hooks/useRouteSort';
import useFilterFromURL, { setURLHash } from '../hooks/useFilterFromURL';

type SortProperty = 'method' | 'path' | '';

type Props = {};

export default function Home(props: Props) {
  const [selectedItem, setSelectedItem] = useState('');

  const { routes, version, variantCategories } = useFetchRoutes();

  const {
    routes: filteredRoutes,
    setFilterValue,
    filterValue,
  } = useRouteFilter(routes);

  const {
    routes: displayedRoutes,
    setSort,
    sortDirection,
    sortedByProperty,
  } = useRouteSort(filteredRoutes);

  useFilterFromURL(setFilterValue);

  const renderRouteList = () => {
    return displayedRoutes.map((route) => (
      <Flipped key={route.id} flipId={route.id}>
        <div>
          <RouteItem
            route={route}
            variantCategories={variantCategories}
            key={route.id}
            selectedItem={selectedItem}
            initialActiveVariant={route.activeVariant}
            setSelectedItem={(id) => setSelectedItem(id)}
          ></RouteItem>
        </div>
      </Flipped>
    ));
  };

  const getSortIcon = (property: SortProperty) => {
    if (sortDirection != null && property === sortedByProperty) {
      return sortDirection > 0 ? <ArrowDropDown /> : <ArrowDropUp />;
    } else {
      return null;
    }
  };

  const filter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setURLHash(value);
    setFilterValue(value);
  };

  const _renderShowByContainer = () => {
    return (
      <Container
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          mt: 1.1,
          gap: 1,
          '@media (max-width:475px)': {
            flexDirection: 'column',
            alignItems: 'center',
            mt: 0,
          },
        }}
      >
        <Box>
          <Typography noWrap align="center" variant="h6">
            Sort By:
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setSort('method')}
          startIcon={getSortIcon('method')}
        >
          Method
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setSort('path')}
          startIcon={getSortIcon('path')}
        >
          Path
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={() => setSort('')}
          startIcon={getSortIcon('')}
        >
          Default
        </Button>
      </Container>
    );
  };

  const _renderSearchInput = () => {
    return (
      <TextField
        fullWidth
        id="outlined-search"
        type="search"
        label="Filter"
        variant="outlined"
        onChange={filter}
        value={filterValue}
      />
    );
  };

  const _renderTypography = () => {
    const hasBeenFiltered = filterValue !== '';
    const displayText = hasBeenFiltered
      ? 'No Results Found. Please confirm the value that has been entered is correct.'
      : 'No Routes Available.';
    return (
      <Typography align="center" sx={{ mt: 10 }}>
        {displayText}
      </Typography>
    );
  };

  return (
    <Container component="main" maxWidth="lg">
      <Grid container spacing={1} sx={{ my: 2 }}>
        <Grid item xs={12} sm={12} md={6}>
          {_renderShowByContainer()}
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          {_renderSearchInput()}
        </Grid>
      </Grid>
      <Divider />
      <Typography
        variant="h6"
        sx={{
          mt: 3,
          '@media (max-width:475px)': {
            textAlign: 'center',
          },
        }}
        gutterBottom
      >
        Routes
      </Typography>
      {displayedRoutes.length > 0 ? (
        <Flipper
          flipKey={displayedRoutes.reduce(
            (prev, current) => prev + current.id,
            ''
          )}
        >
          {renderRouteList()}
        </Flipper>
      ) : (
        _renderTypography()
      )}
      <Typography align="center" sx={{ mt: 5 }} gutterBottom>
        {version ? `v${version}` : null}
      </Typography>
    </Container>
  );
}
