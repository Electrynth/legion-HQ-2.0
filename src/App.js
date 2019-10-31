import React, { Component } from 'react';
import {
  Switch, Route, Redirect, withRouter
} from 'react-router-dom';
import Axios from 'axios';
import { Helmet } from 'react-helmet';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import HomeIcon from '@material-ui/icons/Home';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import DataContext from './components/DataContext';
import Callback from './components/Callback';
import auth0Client from './components/Auth';
import PrivacyPolicy from './containers/PrivacyPolicy';
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

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

class App extends Component {

  static contextType = DataContext;

  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  state = {
    snackbarMessage: '',
    isSnackbarOpen: false,
    initialLoading: true,
    activeTab: 0,
    userId: -1,
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
      mode: 'standard mode',
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
      uniques: [],
      commanders: [],
      unitObjectStrings: [],
      unitCounts: {
        commander: 0,
        operative: 0,
        corps: 0,
        special: 0,
        support: 0,
        heavy: 0
      }
    }
  }

  async componentDidMount() {
    const { location } = this.props;
    const { tabRoutes } = this.context;
    this.setState({
      activeTab: tabRoutes[location.pathname],
      loadingCards: true
    });
    if (location.pathname === '/callback') {
      this.setState({ initialLoading: false });
      return;
    }
    try {
      await auth0Client.silentAuth();
      if (auth0Client.isAuthenticated()) {
        const email = auth0Client.getEmail();
        Axios.get(`https://api.legion-hq.com:3000/users?email=${email}`).then((emailSearch) => {
          if (emailSearch.data.length === 0) {
            Axios.post(`https://api.legion-hq.com:3000/users`, { email }).then((createResponse) => {
              this.setState({
                initialLoading: false,
                userId: emailSearch.data[0].userId
              });
              this.forceUpdate();
            }).catch((error) => {
              alert(error);
              this.setState({ initialLoading: false });
              this.forceUpdate();
            });
          } else {
            const userId = emailSearch.data[0].userId;
            Axios.get(`https://api.legion-hq.com:3000/lists?userId=${userId}`).then((response) => {
              this.changeUserLists(response.data);
              this.setState({
                userId,
                initialLoading: false
              });
              this.forceUpdate();
            }).catch((error) => {
              console.log(error);
              this.setState({ userId, initialLoading: false })
            });
          }
        });
      } else {
        this.setState({ initialLoading: false });
        this.forceUpdate();
      }
    } catch (err) {
      if (err.error !== 'login_required') {
        alert(err.error);
      }
      this.setState({ initialLoading: false });
    }
    this.setState({ initialLoading: false });
  }

  toggleListMode = () => {
    const { currentList } = this.state;
    const listModes = [
      'standard mode',
      'grand army mode',
      '500-point mode'
    ];
    let listModeIndex = listModes.indexOf(currentList.mode);
    listModeIndex = (listModeIndex + 1) % listModes.length;
    currentList.mode = listModes[listModeIndex];
    this.changeCurrentList(currentList);
  }

  handleOpenSnackbar = (snackbarMessage) => {
    const { isSnackbarOpen } = this.state;
    if (isSnackbarOpen) this.setState({ snackbarMessage });
    else this.setState({ isSnackbarOpen: true, snackbarMessage });
  }

  handleCloseSnackbar = () => this.setState({ isSnackbarOpen: false, snackbarMessage: '' });

  onDragEnd(result) {
    const {
      currentList
    } = this.state;

    if (!result.destination) return;

    currentList.units = reorder(
      currentList.units,
      result.source.index,
      result.destination.index
    );

    currentList.unitObjectStrings = reorder(
      currentList.unitObjectStrings,
      result.source.index,
      result.destination.index
    );

    this.setState({ currentList });
  }

  setCardNameFilter = value => this.setState({ cardNameFilter: value });

  setKeywordFilter = value => this.setState({ keywordFilter: value === null ? [] : value });

  setCardTypeFilter = event => this.setState({ cardTypeFilter: event.target.value });

  setFactionFilter = event => this.setState({ factionFilter: event.target.value });

  setRankFilter = event => this.setState({ rankFilter: event.target.value });

  setUpgradeTypeFilter = event => this.setState({ upgradeTypeFilter: event.target.value });

  setUserId = userId => this.setState({ userId });

  changeActiveTab = activeTab => this.setState({ activeTab })

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
    const { userId } = this.state;
    this.setState({
      activeTab: 1,
      currentList: {
        mode: 'standard mode',
        title: '',
        faction,
        notes: '',
        pointTotal: 0,
        competitive: false,
        units: [],
        unitObjectStrings: [],
        commandCards: [],
        objectiveCards: [],
        conditionCards: [],
        deploymentCards: [],
        uniques: [],
        commanders: []
      }
    }, history.push(`/list/${faction}`));
  }

  handleChangeTitle = (event) => {
    if (event.target.value.length > 30) return
    const { currentList } = this.state;
    currentList.title = event.target.value;
    this.setState({ currentList });
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

  clearList = () => {
    const { currentList } = this.state;
    this.setState({
      currentList: {
        mode: currentList.mode,
        title: currentList.title,
        faction: currentList.faction,
        notes: currentList.notes,
        pointTotal: 0,
        competitive: currentList.competitive,
        units: [],
        commandCards: [],
        objectiveCards: [],
        conditionCards: [],
        deploymentCards: [],
        uniques: [],
        commanders: [],
        unitObjectStrings: [],
        unitCounts: {
          commander: 0,
          operative: 0,
          corps: 0,
          special: 0,
          support: 0,
          heavy: 0
        }
      }
    })
  }

  deleteList = (listId) => {
    Axios.delete(`https://api.legion-hq.com:3000/lists/${listId}`).then((response) => {
      const { userId } = this.state;
      if (userId > 999) {
        Axios.get(`https://api.legion-hq.com:3000/lists?userId=${userId}`).then((response) => {
          this.changeUserLists(response.data);
        }).catch((error) => {
          console.log(error);
        });
      }
      this.handleOpenSnackbar('List has been deleted!');
    }).catch((error) => {
      console.log(error);
      this.handleOpenSnackbar('List failed to be deleted!');
    });
  }

  forkCurrentList = () => {
    const { currentList, userId } = this.state;
    if (Number.parseInt(userId, 10) < 0) return;
    if (currentList.userId === userId) {
      currentList.title += ' copy';
      if (currentList.userId) delete currentList.userId;
      if (currentList.listId) delete currentList.listId;
      if (currentList._id) delete currentList._id;
      Axios.post('https://api.legion-hq.com:3000/lists', {userId, ...currentList}).then((response) => {
        const { listId } = response.data;
        this.setState({ currentList: { ...response.data } });
        this.props.history.push(`/list/${listId}`);
        this.handleOpenSnackbar('List has been forked!');
      }).catch((error) => {
        console.log(error);
        this.handleOpenSnackbar('List unable to be forked!')
        });
    }
  }

  saveCurrentList = () => {
    const { currentList, userId } = this.state;
    if (Number.parseInt(userId, 10) < 0) {
      this.handleOpenSnackbar('User ID error, list unable to be created!');
      return;
    };
    if (currentList.listId && currentList.userId === userId) {
      // update list
      Axios.put(`https://api.legion-hq.com:3000/lists/${currentList.listId}`, currentList).then((response) => {
        this.handleOpenSnackbar('List has been updated!');
      }).catch((error) => {
        console.log(error);
        this.handleOpenSnackbar('List failed to be updated!');
      });
    } else {
      // create new list
      if (currentList.userId) delete currentList.userId;
      if (currentList.listId) delete currentList.listId;
      if (currentList._id) delete currentList._id;
      Axios.post('https://api.legion-hq.com:3000/lists', {userId, ...currentList}).then((response) => {
        const { listId } = response.data;
        this.setState({ currentList: { ...response.data } });
        this.props.history.push(`/list/${listId}`);
        this.handleOpenSnackbar('List has been created!');
      }).catch((error) => {
        console.log(error);
        this.handleOpenSnackbar('List unable to be created!')
      });
    }
  }

  changeUserLists = userLists => this.setState({ userLists });

  changeCurrentList = currentList => {
    const { allCards } = this.context;
    const unitCounts = {
      commander: 0,
      operative: 0,
      corps: 0,
      special: 0,
      support: 0,
      heavy: 0
    };
    const entourageUnits = {
      bc: false, // imperial royal guards
      bd: false // imperial death troopers
    };
    const newUniques = [];
    currentList.pointTotal = 0;
    currentList.units.forEach((unitObject) => {
      if (allCards[unitObject.unitId].isUnique) {
        newUniques.push(unitObject.unitId);
        unitObject.hasUniques = true;
      }
      if (unitObject.unitId in entourageUnits) entourageUnits[unitObject.unitId] = true;
      unitObject.totalUnitCost = allCards[unitObject.unitId].cost * unitObject.count;
      unitCounts[allCards[unitObject.unitId].rank] += unitObject.count;
      unitObject.upgradesEquipped.forEach((upgradeCardId) => {
        if (upgradeCardId) {
          unitObject.totalUnitCost += allCards[upgradeCardId].cost * unitObject.count;
          if (allCards[upgradeCardId].isUnique) {
            newUniques.push(upgradeCardId);
            unitObject.hasUniques = true;
          }
        }
      });
      currentList.pointTotal += unitObject.totalUnitCost;
    });
    currentList.unitCounts = unitCounts;
    currentList.uniques = newUniques;
    if (currentList.uniques.includes('as') && entourageUnits['bc']) { // emperor palpatine + IRG
      currentList.unitCounts.special -= 1;
    }
    if (currentList.uniques.includes('av') && entourageUnits['bd']) { // krennic + IDTs
      currentList.unitCounts.special -= 1;
    }
    if (currentList.uniques.includes('ji') || currentList.uniques.includes('jj')) { // C-3PO
      currentList.unitCounts.operative -= 1;
    }
    this.setState({ currentList });
  }

  render() {
    const {
      userSettings
    } = this.context;
    const {
      activeTab,
      userId,
      currentList,
      userLists,
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
      upgradeTypeFilter,
      isSnackbarOpen,
      snackbarMessage,
      initialLoading
    } = this.state;
    const {
      classes
    } = this.props;
    const commonProps = {
      userId,
      userLists,
      classes,
      factions,
      keywords,
      cards,
      ranks,
      upgradeTypes,
      cardTypes,
      handleChangeTitle: this.handleChangeTitle,
      handleOpenSnackbar: this.handleOpenSnackbar,
      handleCloseSnackbar: this.handleCloseSnackbar
    };
    const homeProps = {
      deleteList: this.deleteList,
      changeUserLists: this.changeUserLists,
      handleFactionClick: this.handleFactionClick,
      ...commonProps
    };
    const listProps = {
      currentList,
      loadListByListId: this.loadListByListId,
      changeCurrentList: this.changeCurrentList,
      changeActiveTab: this.changeActiveTab,
      onDragEnd: this.onDragEnd,
      toggleListMode: this.toggleListMode,
      clearList: this.clearList,
      forkCurrentList: this.forkCurrentList,
      saveCurrentList: this.saveCurrentList,
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
    const callbackProps = {
      changeUserLists: this.changeUserLists,
      setUserId: this.setUserId,
      handleTabClick: this.handleTabClick
    };
    let helmet = undefined;
    if (userSettings.themeColor === 'dark') {
      helmet = (
        <Helmet>
          <style>
            {'body { background-color: #303030 !important; }'}
          </style>
        </Helmet>
      );
    } else if (userSettings.themeColor === 'light') {
      helmet = (
        <Helmet>
          <style>
            {'body { background-color: #FFFFFF !important; }'}
          </style>
        </Helmet>
      );
    } else if (userSettings.themeColor === 'blue') {
      helmet = (
        <Helmet>
          <style>
            {'body { background-color: #394d5b !important; }'}
          </style>
        </Helmet>
      );
    }
    return (
      <div>
        <div>
          {helmet}
          <AppBar position="fixed" color={userSettings.themeColor === 'blue' ? 'secondary' : 'default'}>
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
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          open={isSnackbarOpen}
          autoHideDuration={1500}
          onClose={this.handleCloseSnackbar}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <Typography id="message-id" variant="h6" color="inherit">
              {snackbarMessage}
            </Typography>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>
          ]}
        >

        </Snackbar>
        {!initialLoading && (
          <Switch>
            <Route exact path="/" render={(props) => <AsyncHome {...homeProps} {...props} />} />
            <Route path="/list/:faction/:listString" render={(props) => <AsyncList {...listProps} {...props} />} />
            <Route path="/list/:faction" render={(props) => <AsyncList {...listProps} {...props} />} />
            <Route path="/cards" render={(props) => <AsyncCards {...cardsProps} {...props} />} />
            <Route path="/stats" render={(props) => <AsyncStats {...statsProps} {...props} />} />
            <Route path="/settings" render={(props) => <AsyncSettings {...settingsProps} {...props} />} />
            <Route path="/info" render={(props) => <AsyncInfo {...infoProps} {...props} />} />
            <Route path="/privacy" render={(props) => <PrivacyPolicy {...props} />} />
            <Route exact path="/callback" render={(props) => <Callback {...callbackProps} {...props} />} />
            <Redirect to="/" />
          </Switch>
        )}
      </div>
    );
  }
}

export default withRouter(App);
