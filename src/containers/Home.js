import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import AddIcon from '@material-ui/icons/Add';
import FiberNewIcon from '@material-ui/icons/FiberNew';
// import DeleteIcon from '@material-ui/icons/Delete';
// import { GoogleLogin, GoogleLogout } from 'react-google-login';
import DataContext from '../components/DataContext';

class Home extends React.Component {

  static contextType = DataContext;

  state = {
    testLists: []
  }

  render() {
    const {
      classes,
      factions,
      userSettings
    } = this.context;
    const {
      userId,
      handleFactionClick,
      handleGoogleLoginSuccess,
      handleGoogleLoginFailure,
      handleGoogleLogout
    } = this.props;
    const { testLists } = this.state;
    return (
      <div>
        <Grid
          container
          direction="column"
          alignItems="center"
        >
          <Grid item align="center" style={{ marginTop: 75 }}>
            <img
              alt="Fifth Trooper"
              src={userSettings.themeColor === 'light' ? '/images/fifthTrooperLogoLight.png' : '/images/fifthTrooperLogo.png'}
              style={{
                width: '20%'
              }}
            />
          </Grid>
          <Grid item align="center">
            <img
              alt="Legion HQ"
              src={userSettings.themeColor === 'light' ? '/images/legionHQLogoLight.png' : '/images/legionHQLogo.png'}
              style={{
                width: '40%'
              }}
            />
          </Grid>
          <Grid item style={{ maxWidth: '90vw' }}>
            <Typography
              variant="caption"
              color="primary"
              className={classes.textAlignCenter}
            >
              An unofficial tool and resource for Fantasy Flight Games: Star Wars™: Legion.
            </Typography>
          </Grid>
          <Grid item style={{ maxWidth: '90vw', marginBottom: 16 }}>
            <Typography
              variant="caption"
              color="primary"
              className={classes.textAlignCenter}
            >
              Email contact@legion-hq.com to report bugs, give feedback, and request features!
            </Typography>
          </Grid>
          <div style={{ marginTop: 36 }} className={classes.factionListsContainer}>
            {Object.keys(factions).map(factionName => (
              <Grid item key={factionName} style={{ marginTop: 12 }}>
                <Chip
                  clickable
                  variant="outlined"
                  icon={<AddIcon />}
                  onClick={() => handleFactionClick(factionName)}
                  style={{
                    border: `${factions[factionName].color} solid 2px`,
                    marginRight: 4,
                    marginBottom: 4
                  }}
                  label={(
                    <Typography variant="subtitle1">
                      {factions[factionName].longName}
                    </Typography>
                  )}
                />
              </Grid>
            ))}
            <Grid item style={{ marginTop: 36 }}>
              <div>
                <a
                  href="https://imperialterrain.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    alt="Imperial Terrain"
                    src="/images/imperialTerrain.png"
                    style={{
                      width: '50%',
                      height: '50%',
                      marginBottom: 48
                    }}
                  />
                </a>
              </div>
            </Grid>
          </div>
          <Grid item style={{ marginBottom: 120 }} />
        </Grid>
      </div>
    );
  }
}

/*
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
*/

/*
{testLists.map((testList, i) => {
  if (testList.faction === factionName) {
    if (testList.notes === '') {
      return (
        <Chip
          key={i}
          clickable
          variant="outlined"
          label={<Typography>{`${testList.title} - ${testList.pointTotal}`}</Typography>}
          onDelete={() => console.log('deleted')}
          style={{
            border: `${factions[factionName].color} solid 2px`,
            marginRight: 4,
            marginBottom: 4
          }}
          onClick={() => handleFactionClick(factionName)}
        />
      );
    } else {
      return (
        <Tooltip
          key={i}
          title={(<Typography variant="body1">{testList.notes}</Typography>)}
        >
          <Chip
            clickable
            variant="outlined"
            label={<Typography>{`${testList.title} - ${testList.pointTotal}`}</Typography>}
            onDelete={() => console.log('deleted')}
            style={{ border: `${factions[factionName].color} solid 2px`, marginRight: 4 }}
            onClick={() => handleFactionClick(factionName)}
          />
        </Tooltip>
      );
    }
  } else return null;
})}
*/

export default Home;
