import React from 'react';
import Axios from 'axios';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import AddIcon from '@material-ui/icons/Add';
import GitHubIcon from '@material-ui/icons/GitHub';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import DataContext from '../components/DataContext';
import auth0Client from '../components/Auth';

class Home extends React.Component {

  static contextType = DataContext;

  componentDidMount() {
    const { userId, changeUserLists } = this.props;
    if (userId > 999) {
      Axios.get(`https://api.legion-hq.com:3000/lists?userId=${userId}`).then((response) => {
        changeUserLists(response.data);
      }).catch((error) => {
        alert(error.description);
        console.log(error);
      });
    }
  }

  render() {
    const {
      classes,
      factions,
      userSettings
    } = this.context;
    const {
      userLists,
      deleteList,
      handleFactionClick
    } = this.props;
    const listChips = {
      rebels: [],
      empire: [],
      republic: [],
      separatists: []
    };
    userLists.forEach(userList => listChips[userList.faction].push(userList));
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
          <Grid item style={{ maxWidth: '90vw', marginBottom: 16 }}>
            <Typography
              variant="caption"
              color="primary"
              className={classes.textAlignCenter}
            >
              An unofficial tool and resource for Fantasy Flight Games: Star Wars™: Legion.
            </Typography>
          </Grid>
          <Grid item style={{ maxWidth: '75vw' }}>
            <Typography
              variant="caption"
              color="primary"
              className={classes.textAlignCenter}
            >
              <FiberNewIcon style={{ display: 'inline-block', marginRight: 4, top: 8, position: 'relative' }} />
              <div style={{ display: 'inline-block' }}>
                User accounts have been enabled. Lists from legion-hq.com will be transferred over at a later date.
              </div>
            </Typography>
          </Grid>
          <Grid item style={{ maxWidth: '75w', marginBottom: 16 }}>
            <Typography variant="caption" color="primary" className={classes.textAlignCenter}>
              Please email contact@legion-hq.com if you have any issues or questions.
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
                {listChips[factionName].map((userList, i) => {
                  if (!userList.listId) return undefined;
                  return (
                    <Chip
                      key={i}
                      clickable
                      variant="outlined"
                      label={(
                        <Typography>
                          {`${userList.title.length > 20 ? `${userList.title.substring(0, 20)}...` : userList.title} - ${userList.pointTotal}`}
                        </Typography>
                      )}
                      onDelete={() => deleteList(userList.listId)}
                      style={{
                        border: `${factions[factionName].color} solid 2px`,
                        marginRight: 4,
                        marginBottom: 4
                      }}
                      onClick={() => {
                        handleFactionClick(factionName);
                        this.props.history.push(`/list/${userList.listId}`);
                      }}
                    />
                  );
                })}
              </Grid>
            ))}
            <Grid item style={{ marginTop: 24 }}>
              {auth0Client.isAuthenticated() ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    auth0Client.signOut();
                    this.changeUserLists([]);
                    this.props.history.replace('/');
                  }}
                >
                  {`Logout (${auth0Client.getEmail().split('@')[0]})`}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={auth0Client.signIn}
                >
                  Login
                </Button>
              )}
            </Grid>
            <Grid item style={{ marginTop: 12 }}>
              <IconButton
                color="primary"
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/NicholasCBrown/legion-HQ-2.0"
              >
                <GitHubIcon />
              </IconButton>
            </Grid>
            <Grid item style={{ marginTop: 12 }}>
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
                      marginBottom: 120
                    }}
                  />
                </a>
              </div>
            </Grid>
          </div>
          <Grid item style={{ marginBottom: 60 }} />
        </Grid>
      </div>
    );
  }
}

export default Home;
