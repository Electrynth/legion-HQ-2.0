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
    testLists: [
      {
        mode: 'standard',
        title: 'Rebel list 1',
        faction: 'rebels',
        notes: '',
        pointTotal: 795,
        competitive: true,
        units: [
          {
            _id: '5c88a2e88f63424d32d13b8b'
          }
        ],
        comandCards: [],
        objectiveCards: [],
        conditionCards: [],
        deploymentCards: [],
        uniques: []
      },
      {
        mode: 'grand army',
        title: 'Rebel list 2',
        faction: 'rebels',
        notes: '',
        pointTotal: 1599,
        competitive: true,
        units: [
          {
            _id: '5c88a2e88f63424d32d13b89'
          }
        ],
        comandCards: [],
        objectiveCards: [],
        conditionCards: [],
        deploymentCards: [],
        uniques: []
      },
      {
        mode: 'standard',
        title: 'Empire list 1',
        faction: 'empire',
        notes: 'blah blah blah',
        pointTotal: 799,
        competitive: true,
        units: [
          {
            _id: '5c88a2e88f63424d32d13b9b'
          }
        ],
        comandCards: [],
        objectiveCards: [],
        conditionCards: [],
        deploymentCards: [],
        uniques: []
      }
    ]
  }

  render() {
    const {
      classes,
      factions,
      allCards
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
                style={{ border: `${factions[factionName].color} solid 2px`, marginRight: 4 }}
                onClick={() => handleFactionClick(factionName)}
              />
              {testLists.map((testList, i) => {
                if (testList.faction === factionName) {
                  let commanderIcon = undefined;
                  if (allCards[testList.units[0]._id]) {
                    commanderIcon = <img
                      alt={allCards[testList.units[0]._id].cardName}
                      src={allCards[testList.units[0]._id].iconLocation}
                      style={{
                        borderRadius: 15,
                        height: 28,
                        width: 42,
                        marginLeft: 0
                      }}
                    />
                  }
                  if (testList.notes === '') {
                    return (
                      <Chip
                        key={i}
                        clickable
                        variant="outlined"
                        label={<Typography>{`${testList.title} - ${testList.pointTotal}`}</Typography>}
                        icon={commanderIcon}
                        onDelete={() => console.log('deleted')}
                        style={{ border: `${factions[factionName].color} solid 2px`, marginRight: 4 }}
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
                          icon={commanderIcon}
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
