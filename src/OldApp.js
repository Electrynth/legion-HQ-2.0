import React, { Component } from 'react';
import {
  Route, withRouter
} from 'react-router-dom';
import SwipeableRoutes from 'react-swipeable-routes';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors/blue';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import asyncComponent from './components/AsyncComponent';
const AsyncHome = asyncComponent(() => import('./containers/Home'));
const AsyncList = asyncComponent(() => import('./containers/List'));
const AsyncCards = asyncComponent(() => import('./containers/Cards'));
const AsyncInfo = asyncComponent(() => import('./containers/Info'));

const styles = theme => ({});

const theme = createMuiTheme({
  palette: {
    primary: blue
  },
  typography: {
    useNextVariants: true
  }
});

const tabRoutes = {
  0: '/',
  1: '/list',
  2: '/cards',
  3: '/info'
};

class App extends Component {
  state = {
    currentTab: 0
  }

  handleTabClick = (event, value) => {
    const { history } = this.props;
    this.setState({
      currentTab: value
    }, history.push(tabRoutes[value]));
  }

  handleTabSwipe = (value) => {
    this.setState({
      currentTab: value
    });
  }

  render() {
    const {
      currentTab
    } = this.state;
    const {
      classes
    } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <AppBar position="static" color="default">
            <Tabs
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              value={currentTab}
              onChange={this.handleTabClick}
            >
              <Tab label="Home" />
              <Tab label="List" />
              <Tab label="Cards" />
              <Tab label="Info" />
            </Tabs>
          </AppBar>
        </div>
        <SwipeableRoutes>
          <Route exact path="/" render={(props) => <AsyncHome {...props} />} />
          <Route path="/list" render={(props) => <AsyncList {...props} />} />
          <Route path="/cards" render={(props) => <AsyncCards {...props} />} />
          <Route path="/info" render={(props) => <AsyncInfo {...props} />} />
        </SwipeableRoutes>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(withRouter(App));
