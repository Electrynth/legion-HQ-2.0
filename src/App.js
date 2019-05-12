import React, { Component } from 'react';
import {
  Switch, Route, Redirect, withRouter
} from 'react-router-dom';
import Axios from 'axios';
import md5 from 'md5';
import { Helmet } from 'react-helmet';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import asyncComponent from './components/AsyncComponent';
const AsyncHome = asyncComponent(() => import('./containers/Home'));
const AsyncList = asyncComponent(() => import('./containers/List'));
const AsyncCards = asyncComponent(() => import('./containers/Cards'));
const AsyncStats = asyncComponent(() => import('./containers/Stats'));
const AsyncSettings = asyncComponent(() => import('./containers/Settings'));
const AsyncInfo = asyncComponent(() => import('./containers/Info'));

const styles = theme => ({
  rankButton: {
    width: 35,
    height: 35,
    cursor: 'pointer',
    '&:hover': {
      opacity: '0.8'
    }
  },
  rankButtonContainer: {
    display: 'inline-block',
    marginRight: 15
  },
  textAlignCenter: { textAlign: 'center' },
  divider: {
    marginTop: 8,
    marginBottom: 8,
    height: 1,
    width: 250,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  factionListsContainer: {
    position: 'absolute',
    top: '25vh',
    textAlign: 'center'
  },
  googleButtonContainer: {
    position: 'absolute',
    bottom: 24,
    marginTop: 48
  }
});

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#fafafa'
    },
    secondary: {
      main: '#757575'
    },
    error: {
      main: '#f44336'
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: 'Aero Matics Regular'
  }
});

/*
scum: {
  displayName: 'Scum',
  color: '#1b5e20'
}
*/

const tabRoutes = {
  0: '/',
  1: '/list',
  2: '/cards',
  3: '/stats',
  4: '/settings',
  5: '/info',
  '/': 0,
  '/list': 1,
  '/cards': 2,
  '/stats': 3,
  '/settings': 4,
  '/info': 5
};

class App extends Component {
  state = {
    activeTab: 0,
    userId: '',
    cardNameFilter: '',
    keywords: [],
    keywordFilter: [],
    cardTypeFilter: ['Units', 'Upgrades', 'Commands', 'Battle'],
    factionFilter: [],
    rankFilter: [],
    upgradeTypeFilter: [],
    cards: {
      allCards: {},
      unitCardsById: [],
      upgradeCardsById: [],
      commandCardsById: [],
      battleCardsById: []
    },
    cardTypes: ['Units', 'Upgrades', 'Commands', 'Battle'],
    factions: {
      rebels: {
        longName: 'Rebel Alliance',
        shortName: 'Rebels',
        color: '#b71c1c',
        iconLocation: '/images/rebelsIconWhite.svg'
      },
      empire: {
        longName: 'Galactic Empire',
        shortName: 'Empire',
        color: '#555555',
        iconLocation: '/images/empireIconWhite.svg'
      },
      republic: {
        longName: 'Galactic Republic',
        shortName: 'Republic',
        color: '#97084f',
        iconLocation: '/images/republicIconWhite.svg'
      },
      separatists: {
        longName: 'Separatist Alliance',
        shortName: 'Separatists',
        color: '#3f51b6',
        iconLocation: '/images/separatistsIconWhite.svg'
      }
    },
    ranks: {
      commander: {
        displayName: 'Commander',
        iconLocation: '/images/rankIcons/commander.png'
      },
      operative: {
        displayName: 'Operative',
        iconLocation: '/images/rankIcons/operative.png'
      },
      corps: {
        displayName: 'Corps',
        iconLocation: '/images/rankIcons/corps.png'
      },
      special: {
        displayName: 'Special Forces',
        iconLocation: '/images/rankIcons/special.png'
      },
      support: {
        displayName: 'Support',
        iconLocation: '/images/rankIcons/support.png'
      },
      heavy: {
        displayName: 'Heavy Weapon',
        iconLocation: '/images/rankIcons/heavy.png'
      }
    },
    upgradeTypes: {
      'heavy weapon': {
        displayName: 'Heavy Weapon',
        iconLocation: '/images/upgradeTypeIcons/Heavy%20Weapon.png'
      },
      personnel: {
        displayName: 'Personnel',
        iconLocation: '/images/upgradeTypeIcons/personnel.png'
      },
      force: {
        displayName: 'Force',
        iconLocation: '/images/upgradeTypeIcons/force.png'
      },
      command: {
        displayName: 'Command',
        iconLocation: '/images/upgradeTypeIcons/command.png'
      },
      hardpoint: {
        displayName: 'Hardpoint',
        iconLocation: '/images/upgradeTypeIcons/hardpoint.png'
      },
      gear: {
        displayName: 'Gear',
        iconLocation: '/images/upgradeTypeIcons/gear.png'
      },
      grenades: {
        displayName: 'Grenades',
        iconLocation: '/images/upgradeTypeIcons/grenades.png'
      },
      comms: {
        displayName: 'Comms',
        iconLocation: '/images/upgradeTypeIcons/comms.png'
      },
      pilot: {
        displayName: 'Pilot',
        iconLocation: '/images/upgradeTypeIcons/pilot.png'
      },
      training: {
        displayName: 'Training',
        iconLocation: '/images/upgradeTypeIcons/training.png'
      },
      generator: {
        displayName: 'Generator',
        iconLocation: '/images/upgradeTypeIcons/generator.png'
      },
      armament: {
        displayName: 'Armament',
        iconLocation: '/images/upgradeTypeIcons/armament.png'
      },
      crew: {
        displayName: 'Crew',
        iconLocation: '/images/upgradeTypeIcons/crew.png'
      }
    },
    currentList: {
      mode: 'standard',
      userId: '',
      title: '',
      faction: '',
      notes: '',
      pointTotal: 0,
      competitive: false,
      units: [],
      commandCards: [],
      objectiveCards: [],
      conditionCards: [],
      deploymentCards: [],
      uniques: {}
    },
    userLists: [],
    userSettings: {}
  }

  componentDidMount() {
    const { location } = this.props;
    this.setState({
      activeTab: tabRoutes[location.pathname],
      loadingCards: true
    });
    Axios.get('/cards').then((cardsResponse) => {
      Axios.get('/keywords.json').then((keywordsResponse) => {
        this.setState({
          keywords: { ...keywordsResponse.data },
          cards: { ...cardsResponse.data },
          loadingCards: false
        });
      });
    });
  }

  setCardNameFilter = value => this.setState({ cardNameFilter: value });

  setKeywordFilter = value => this.setState({ keywordFilter: value });

  setCardTypeFilter = event => this.setState({ cardTypeFilter: event.target.value });

  setFactionFilter = event => this.setState({ factionFilter: event.target.value });

  setRankFilter = event => this.setState({ rankFilter: event.target.value });

  setUpgradeTypeFilter = event => this.setState({ upgradeTypeFilter: event.target.value });

  handleTabClick = (event, value) => {
    const { history } = this.props;
    this.setState({
      activeTab: value
    }, history.push(tabRoutes[value]));
  }

  handleGoogleLoginSuccess = (googleResponse) => {
    if ('googleId' in googleResponse) {
      const userId = md5(googleResponse.googleId);
      Axios.get(`/user?userId=${userId}`).then((userResponse) => {
        const userData = userResponse.data;
        if (userData.error) {
          alert('Login error:', userData.message);
        } else if (userData.results.length === 0) {
            Axios.post(`/user?userId=${userId}`).then((creationResponse) => {
            const creationData = creationResponse.data;
            if (creationData.error) this.setState({ googleResponse: true });
            else {
              this.setState({
                userId,
                userLists: [],
                googleResponse: true
              });
            }
          });
        } else {
          Axios.get(`lists?userId=${userId}`).then((response) => {
            const { data } = response;
            if (data.error) this.setState({ googleResponse: true });
            else {
              this.setState({
                userId,
                userLists: data.results,
                googleResponse: true
              });
            }
          });
        }
      });
    }
  }

  handleGoogleLoginFailure = (googleResponse) => {
    alert(`Login Error: ${googleResponse.error}`);
  }

  handleGoogleLogout = () => {
    alert('Successfully signed out.');
    this.setState({
      userId: '',
      userLists: []
    });
  }

  refreshUserLists = () => {
    const { userId } = this.state;
    if (userId) {
      Axios.get(`lists?userId=${userId}`).then((response) => {
        const { data } = response;
        this.setState({ userLists: data.results });
      });
    }
  }

  render() {
    const {
      activeTab,
      userId,
      cardNameFilter,
      keywords,
      keywordFilter,
      cards,
      cardTypes,
      cardTypeFilter,
      ranks,
      rankFilter,
      factions,
      factionFilter,
      upgradeTypes,
      upgradeTypeFilter
    } = this.state;
    const {
      classes,
      width
    } = this.props;
    const mobile = width === 'sm' || width === 'xs';
    const commonProps = {
      mobile,
      classes
    };
    const homeProps = {
      userId,
      factions,
      cards,
      handleGoogleLoginSuccess: this.handleGoogleLoginSuccess,
      handleGoogleLoginFailure: this.handleGoogleLoginFailure,
      handleGoogleLogout: this.handleGoogleLogout,
      ...commonProps
    };
    const listProps = {
      factions,
      ranks,
      upgradeTypes,
      ...commonProps
    };
    const cardsProps = {
      cardNameFilter,
      setCardNameFilter: this.setCardNameFilter,
      keywords,
      keywordFilter,
      setKeywordFilter: this.setKeywordFilter,
      cards,
      cardTypes,
      cardTypeFilter,
      setCardTypeFilter: this.setCardTypeFilter,
      ranks,
      rankFilter,
      setRankFilter: this.setRankFilter,
      factions,
      factionFilter,
      setFactionFilter: this.setFactionFilter,
      upgradeTypes,
      upgradeTypeFilter,
      setUpgradeTypeFilter: this.setUpgradeTypeFilter,
      ...commonProps
    };
    const statsProps = {
      ...commonProps
    };
    const settingsProps = {
      ...commonProps
    };
    const infoProps = {
      ...commonProps
    };
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Helmet>
            <style>
              {'body { background: url(/images/background.png) no-repeat center fixed; background-size: contain; }'}
            </style>
          </Helmet>
          <AppBar position="fixed" color="default">
            <Tabs
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              scrollButtons="on"
              value={activeTab}
              onChange={this.handleTabClick}
            >
              <Tab icon={<HomeIcon />} />
              <Tab icon={<ListIcon />} />
              <Tab icon={<SearchIcon />} />
              <Tab icon={<EqualizerIcon />} />
              <Tab icon={<SettingsIcon />} />
              <Tab icon={<InfoIcon />} />
            </Tabs>
          </AppBar>
        </div>
        <Switch>
          <Route exact path="/" render={(props) => <AsyncHome {...homeProps} {...props} />} />
          <Route path="/list" render={(props) => <AsyncList {...listProps} {...props} />} />
          <Route path="/cards" render={(props) => <AsyncCards {...cardsProps} {...props} />} />
          <Route path="/stats" render={(props) => <AsyncStats {...statsProps} {...props} />} />
          <Route path="/settings" render={(props) => <AsyncSettings {...settingsProps} {...props} />} />
          <Route path="/info" render={(props) => <AsyncInfo {...infoProps} {...props} />} />
          <Redirect to="/" />
        </Switch>
      </MuiThemeProvider>
    );
  }
}

export default withWidth()(withStyles(styles)(withRouter(App)));
