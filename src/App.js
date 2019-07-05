import React, { Component } from 'react';
import {
  Switch, Route, Redirect, withRouter
} from 'react-router-dom';
import Axios from 'axios';
import md5 from 'md5';
import { Helmet } from 'react-helmet';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import DataContext from './components/DataContext';
import asyncComponent from './components/AsyncComponent';
const AsyncHome = asyncComponent(() => import('./containers/Home'));
const AsyncList = asyncComponent(() => import('./containers/List'));
const AsyncCards = asyncComponent(() => import('./containers/Cards'));
const AsyncStats = asyncComponent(() => import('./containers/Stats'));
const AsyncSettings = asyncComponent(() => import('./containers/Settings'));
const AsyncInfo = asyncComponent(() => import('./containers/Info'));

/*
scum: {
  displayName: 'Scum',
  color: '#1b5e20'
}
*/

class App extends Component {

  static contextType = DataContext;

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
    userLists: [],
    userSettings: {},
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
      uniques: []
    }
  }

  componentDidMount() {
    const { location } = this.props;
    const { tabRoutes } = this.context;
    this.setState({
      activeTab: tabRoutes[location.pathname],
      loadingCards: true
    });
  }

  setCardNameFilter = value => this.setState({ cardNameFilter: value });

  setKeywordFilter = value => this.setState({ keywordFilter: value === null ? [] : value });

  setCardTypeFilter = event => this.setState({ cardTypeFilter: event.target.value });

  setFactionFilter = event => this.setState({ factionFilter: event.target.value });

  setRankFilter = event => this.setState({ rankFilter: event.target.value });

  setUpgradeTypeFilter = event => this.setState({ upgradeTypeFilter: event.target.value });

  handleTabClick = (event, value) => {
    const { history } = this.props;
    const { currentList } = this.state;
    const { tabRoutes } = this.context;
    if (value === 1 && currentList.faction) {
      this.setState({
        activeTab: value
      }, history.push(`/list/${currentList.faction}`));
    } else {
      this.setState({
        activeTab: value
      }, history.push(tabRoutes[value]));
    }
  }

  handleFactionClick = (faction) => {
    const { history } = this.props;
    this.setState({
      activeTab: 1,
    }, history.push(`/list/${faction}`));
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

  changeCurrentList = currentList => this.setState({ currentList });

  changeActiveTab = activeTab => this.setState({ activeTab })

  render() {
    const {
      activeTab,
      userId,
      currentList,
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
      classes
    } = this.props;
    const commonProps = {
      classes,
      factions,
      keywords,
      cards,
      ranks,
      upgradeTypes,
      cardTypes
    };
    const homeProps = {
      userId,
      handleFactionClick: this.handleFactionClick,
      handleGoogleLoginSuccess: this.handleGoogleLoginSuccess,
      handleGoogleLoginFailure: this.handleGoogleLoginFailure,
      handleGoogleLogout: this.handleGoogleLogout,
      ...commonProps
    };
    const listProps = {
      currentList,
      changeCurrentList: this.changeCurrentList,
      changeActiveTab: this.changeActiveTab,
      ...commonProps
    };
    const cardsProps = {
      cardNameFilter,
      setCardNameFilter: this.setCardNameFilter,
      keywordFilter,
      setKeywordFilter: this.setKeywordFilter,
      cardTypes,
      cardTypeFilter,
      setCardTypeFilter: this.setCardTypeFilter,
      rankFilter,
      setRankFilter: this.setRankFilter,
      factionFilter,
      setFactionFilter: this.setFactionFilter,
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
      <div>
        <div>
          <Helmet>
            <style>
              {'body { background: url(/images/background.png) no-repeat center fixed; background-size: contain; }'}
            </style>
          </Helmet>
          <AppBar position="fixed" color="default">
            {activeTab !== undefined && (
              <Tabs
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                scrollButtons="on"
                value={activeTab}
                onChange={this.handleTabClick}
              >
                <Tab icon={<HomeIcon />} />
                <Tab disabled={currentList.faction === ''} icon={<ListIcon />} />
                <Tab icon={<SearchIcon />} />
                <Tab icon={<EqualizerIcon />} />
                <Tab icon={<SettingsIcon />} />
                <Tab icon={<InfoIcon />} />
              </Tabs>
            )}
          </AppBar>
        </div>
        <Switch>
          <Route exact path="/" render={(props) => <AsyncHome {...homeProps} {...props} />} />
          <Route path="/list/:id" render={(props) => <AsyncList {...listProps} {...props} />} />
          <Route path="/cards" render={(props) => <AsyncCards {...cardsProps} {...props} />} />
          <Route path="/stats" render={(props) => <AsyncStats {...statsProps} {...props} />} />
          <Route path="/settings" render={(props) => <AsyncSettings {...settingsProps} {...props} />} />
          <Route path="/info" render={(props) => <AsyncInfo {...infoProps} {...props} />} />
          <Redirect to="/" />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
