import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
// import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

class Home extends React.Component {
  state = {}

  render() {
    const {
      classes,
      userId,
      factions,
      handleGoogleLoginSuccess,
      handleGoogleLoginFailure,
      handleGoogleLogout
    } = this.props;
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
      >
        <Grid item style={{ marginTop: 60 }}>
          <Typography variant="h4">
            Legion HQ
          </Typography>
        </Grid>
        <Grid item style={{ maxWidth: '90vw', marginBottom: 16 }}>
          <Typography variant="caption" className={classes.textAlignCenter}>
            An unofficial tool and resource for Fantasy Flight Games: Star Wars™: Legion.
          </Typography>
        </Grid>
        <div className={classes.factionListsContainer}>
          {Object.keys(factions).map(factionName => (
            <Grid item key={factionName} style={{ marginTop: 36 }}>
              <Chip
                clickable
                variant="outlined"
                label={<Typography>{factions[factionName].longName}</Typography>}
                icon={<AddIcon />}
                style={{ border: `${factions[factionName].color} solid 2px` }}
                onClick={() => console.log(`clicked ${factionName}`)}
              />
            </Grid>
          ))}
        </div>
        <Grid item className={classes.googleButtonContainer}>
          {userId ? (
            <GoogleLogout
              buttonText="Sign out"
              onLogoutSuccess={handleGoogleLogout}
              className="loginButton"
            />
          ) : (
            <GoogleLogin
              isSignedIn
              buttonText="Sign in with Google"
              clientId="112890447494-ls135bmon2jbaj0mh3k0fnukugp9upkk.apps.googleusercontent.com"
              onSuccess={handleGoogleLoginSuccess}
              onFailure={handleGoogleLoginFailure}
              className="loginButton"
            />
          )}
        </Grid>
        <Grid item style={{ marginTop: 48 }} />
      </Grid>
    );
  }
}

export default Home;
