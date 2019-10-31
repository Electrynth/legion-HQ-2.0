import React from 'react';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import DataContext from './DataContext';
import auth0Client from './Auth';

class Callback extends React.Component {
  static contextType = DataContext;

  state = {
    message: ''
  }

  async componentDidMount() {
    const { changeUserLists, handleTabClick, setUserId } = this.props;
    await auth0Client.handleAuthentication();
    const profile = auth0Client.getProfile();
    let email;
    if (
      profile.hasOwnProperty('email') &&
      profile.email
    ) {
        email = profile.email;
    } else if (
      profile.hasOwnProperty('name') &&
      profile.name
    ) {
      email = profile.name
    } else {
      this.setState({
        email,
        message: `Email and Name not found in profile! Available fields: ${Object.keys(profile).join(', ')}`
      });
    }
    const waitTime = 1000;
    if (email) {
      this.setState({
        email,
        message: `Successfully authenticated...`
      });
      setTimeout(() => {
        Axios.get(`https://api.legion-hq.com:3000/users?email=${email}`).then((emailSearch) => {
          if (emailSearch.data.length === 0) {
            this.setState({
              email,
              message: `Creating new account...`
            });
            setTimeout(() => {
              Axios.post(`https://api.legion-hq.com:3000/users`, { email }).then((createResponse) => {
                this.setState({
                  email,
                  message: `Your account was successfully created!`
                });
                setTimeout(() => {
                  setUserId(createResponse.data.userId);
                  handleTabClick(null, 0);
                }, waitTime);
              });
            }, waitTime);
          } else {
            this.setState({
              email,
              message: `Welcome back! Loading your saved lists...`
            });
            setTimeout(() => {
              Axios.get(`https://api.legion-hq.com:3000/lists?userId=${emailSearch.data[0].userId}`).then((response) => {
                this.setState({
                  email,
                  message: `Found ${response.data.length} ${response.data.length === 1 ? 'list' : 'lists'}...`
                });
                setTimeout(() => {
                  setUserId(emailSearch.data[0].userId);
                  changeUserLists(response.data);
                  handleTabClick(null, 0);
                }, waitTime);
              }).catch((error) => {
                console.log(error);
                alert(error.description);
              });
            }, waitTime);
          }
        });
      }, waitTime);
    } else {
      setTimeout(() => {
        setUserId(-1);
        handleTabClick(null, 0);
      }, 3000);
    }
  }

  render() {
    const {
      email,
      message
    } = this.state;
    return (
      <div
        style={{
          overflowY: 'scroll',
          maxHeight: '100vh'
        }}
      >
        <Grid
          container
          spacing={2}
          direction="column"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item style={{ marginTop: 72 }}>
            <CircularProgress />
          </Grid>
          <Grid item>
            {email !== '' && (
              <Typography variant="caption" color="primary">
                {`[${email}]`}
              </Typography>
            )}
          </Grid>
          <Grid item>
            {message !== '' && (
              <Typography variant="h6" color="primary">
                {message}
              </Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withRouter(Callback);
