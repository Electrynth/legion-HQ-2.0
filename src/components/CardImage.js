import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

class CardImage extends React.Component {
  state = {};

  render() {
    const {
      cardType,
      size,
      alt,
      src,
      additionalStyles,
      showKeywords,
      handleClick
    } = this.props;
    const cardSizes = {
      unit: {
        small: {
          height: '250px',
          width: '350px'
        },
        medium: {
          height: '275px',
          width: '385px'
        },
        large: {
          height: '300px',
          width: '420px'
        }
      },
      upgrade: {
        small: {
          height: '310px',
          width: '200px'
        },
        medium: {
          height: '340px',
          width: '220px'
        },
        large: {
          height: '420px',
          width: '270px'
        }
      },
      command: {
        small: {
          height: '250px',
          width: '350px'
        },
        medium: {
          height: '275px',
          width: '385px'
        },
        large: {
          height: '300px',
          width: '420px'
        }
      },
      battle: {
        small: {
          height: '350px',
          width: '250px'
        },
        medium: {
          height: '385px',
          width: '275px'
        },
        large: {
          height: '420px',
          width: '300px'
        }
      }
    };
    const styles = {
      marginRight: 5,
      marginBottom: 5,
      borderRadius: 10,
      cursor: 'pointer',
      ...cardSizes[cardType][size],
      ...additionalStyles
    };
    return (
      <div>
        <Card>
          <CardActionArea>
            <CardMedia
              title={alt}
              image={src}
              style={{ ...styles }}
            />
          </CardActionArea>
          <CardActions>
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default CardImage;
