import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
// import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

class ListContainer extends React.Component {
  state = {}

  render() {
    const {
      classes,
      mobile,
      factions,
      ranks,
      upgradeTypes,
      currentList
    } = this.props;
    return (
      <div>
        <Grid
          container
          direction="column"
          alignItems="center"
          justify="center"
          style={{ marginBottom: 8 }}
        >
          <Grid item style={{ marginTop: 60, marginBottom: 8 }}>
            <Grid container spacing={8} alignItems="flex-end">
              <Grid item>
                <Avatar
                  alt="Rebels"
                  src={factions.rebels.iconLocation}
                  style={{
                    width: 25,
                    height: 25
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  label="Title"
                />
              </Grid>
              <Grid item>
                <Typography variant="body1" color="primary">
                  0/800
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          alignItems="flex-start"
          justify="center"
        >
          <Grid
            item
            container
            xs={12}
            md={6}
            direction="column"
            alignItems="center"
            justify="center"
            className={classes.textAlignCenter}
          >
            <Grid item>
              {Object.keys(ranks).map((r) => {
                return (
                  <div key={r} className={classes.rankButtonContainer}>
                    <Badge badgeContent={0} showZero color="secondary">
                      <img
                        alt={ranks[r].displayName}
                        src={ranks[r].iconLocation}
                        className={classes.rankButton}
                      />
                    </Badge>
                  </div>
                );
              })}
            </Grid>
            <div className={classes.divider} />
          </Grid>
          <Grid
            item
            container
            xs={12}
            md={6}
            direction="column"
            alignItems="center"
            justify="center"
            className={classes.textAlignCenter}
            style={{ display: mobile ? 'none' : 'block' }}
          >
            <Grid item>
              <Typography variant="h6">
                WIP
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default ListContainer;
