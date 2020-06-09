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
          <Grid item style={{ maxWidth: '90vw', marginBottom: 16 }}>
            <Typography variant="caption" color="primary" className={classes.textAlignCenter}>
              Link to staging page for new Legion-HQ changes
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://d37xhki8rk4762.cloudfront.net/"
                style={{ textDecoration: 'none' }}
              >
                {` here`}
              </a>
            </Typography>
          </Grid>
          <div style={{ marginTop: 36, maxHeight: '50vh', overflowX: 'scroll' }} className={classes.factionListsContainer}>
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
          </div>
          <Grid item style={{ marginBottom: 60 }} />
        </Grid>
      </div>
    );
  }
}

export default Home;
