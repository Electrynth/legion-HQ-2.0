import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
// import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
// import DeleteIcon from '@material-ui/icons/Delete';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import DataContext from '../components/DataContext';

class Home extends React.Component {

  static contextType = DataContext;

  state = {
    testLists: []
  }

  render() {
    const {
      classes,
      factions
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
      <Grid
        container
        direction="column"
        alignItems="center"
      >
        <Grid item style={{ marginTop: 60 }}>
          <Typography variant="h4" color="primary">
            Legion HQ
          </Typography>
        </Grid>
        <Grid item style={{ maxWidth: '90vw', marginBottom: 16 }}>
          <Typography
            variant="caption"
            color="primary"
            className={classes.textAlignCenter}
          >
            An unofficial tool and resource for Fantasy Flight Games: Star Wars™: Legion.
          </Typography>
        </Grid>
        <div className={classes.factionListsContainer}>
          {Object.keys(factions).map(factionName => (
            <Grid item key={factionName} style={{ marginTop: 36 }}>
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
