import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

class StatsContainer extends React.Component {
  state = {}

  render() {
    return (
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h3" color="primary" style={{ marginTop: 120 }}>
            Under Construction!
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

export default StatsContainer;
