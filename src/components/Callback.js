import React from 'react';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import DataContext from './DataContext';
import auth0Client from './Auth';

class Callback extends React.Component {
  static contextType = DataContext;

  async componentDidMount() {
    const { handleTabClick, setUserId } = this.props;
    await auth0Client.handleAuthentication();
    const email = auth0Client.getEmail();
    Axios.get(`https://api.legion-hq.com:3000/users?email=${email}`).then((emailSearch) => {
      if (emailSearch.data.length === 0) {
        Axios.post(`https://api.legion-hq.com:3000/users`, { email }).then((createResponse) => {
          setUserId(createResponse.data.userId);
          handleTabClick(null, 0);
        });
      } else {
        setUserId(emailSearch.data[0].userId);
        handleTabClick(null, 0);
      }
    });
  }

  render() {
    return (
      <div
        style={{
          overflowY: 'scroll',
          maxHeight: '100vh'
        }}
      >
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item style={{ marginTop: 72 }}>
            <Typography color="inherit">
              Loading profile...
            </Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withRouter(Callback);
