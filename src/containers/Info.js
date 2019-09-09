import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DataContext from '../components/DataContext';

const bmacButton = (
  <div>
    <a className="bmc-button" target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/TY5SLhK">
    <img src="https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/BMC-btn-logo.svg" alt="Buy me a coffee" />
      <span style={{ marginLeft: '5px' }}>
        Buy me a coffee
      </span>
    </a>
  </div>
);

class InfoContainer extends React.Component {
  static contextType = DataContext;
  state = {}

  render() {
    const {
      communityLinks,
      classes
    } = this.context;
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
            {bmacButton}
          </Grid>
          <Grid item>
            <Typography variant="h3" color="primary" style={{ marginTop: 60 }}>
              Community Links
            </Typography>
          </Grid>
          <Divider
            variant="middle"
            style={{
              marginTop: 10,
              width: '33%'
            }}
          />
          <Grid item style={{ textAlign: 'center' }}>
            <a
              href="https://imperialterrain.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="Imperial Terrain"
                src="/images/imperialTerrain.png"
                style={{
                  width: '66%',
                  height: '66%'
                }}
              />
            </a>
          </Grid>
          <Grid item>
            <Button
              color="default"
              target="_blank"
              size="large"
              variant="contained"
              rel="noopener noreferrer"
              href="https://discord.gg/kX8Vj7d"
              style={{
                marginTop: 10,
                marginBottom: 10
              }}
            >
              <img
                alt="The Legion Discord"
                src="/images/legionDiscord.jpeg"
                style={{
                  height: 75,
                  width: 75,
                  borderRadius: '25%',
                  marginRight: 10
                }}
              />
              <Typography variant="h6">
                Join The Legion Discord
              </Typography>
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="h5" color="secondary" style={{ marginTop: 10 }}>
              Blogs
            </Typography>
          </Grid>
          {communityLinks.Blogs.map((blogObject) => (
            <Grid item key={blogObject.name}>
              <Button
                size="large"
                color="primary"
                target="_blank"
                rel="noopener noreferrer"
                href={blogObject.url}
              >
                <Typography variant="body1">
                  {blogObject.name}
                </Typography>
              </Button>
            </Grid>
          ))}
          <Grid item>
            <Typography variant="h5" color="secondary" style={{ marginTop: 60 }}>
              Podcasts
            </Typography>
          </Grid>
          {communityLinks.Podcasts.map((podcastObject) => (
            <Grid item key={podcastObject.name}>
              <Button
                size="large"
                color="primary"
                target="_blank"
                rel="noopener noreferrer"
                href={podcastObject.url}
              >
                <Typography variant="body1">
                  {podcastObject.name}
                </Typography>
              </Button>
            </Grid>
          ))}
          <Grid item>
            <Typography variant="h5" color="secondary" style={{ marginTop: 60 }}>
              YouTube Channels
            </Typography>
          </Grid>
          {communityLinks.YouTube.map((youtubeObject) => (
            <Grid item key={youtubeObject.name}>
              <Button
                size="large"
                color="primary"
                target="_blank"
                rel="noopener noreferrer"
                href={youtubeObject.url}
              >
                <Typography variant="body1">
                  {youtubeObject.name}
                </Typography>
              </Button>
            </Grid>
          ))}
          <Grid item style={{ marginBottom: 100 }} />
        </Grid>
      </div>
    );
  }
}

export default InfoContainer;
