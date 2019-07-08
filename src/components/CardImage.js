import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import DataContext from '../components/DataContext';

class CardImage extends React.PureComponent {

  static contextType = DataContext;

  state = {};

  generateKeywordChips(cardKeywords) {
    const { keywordDict, classes } = this.context;
    const keywordChips = [];
    cardKeywords.forEach((cardKeyword) => {
      keywordChips.push(
        <Tooltip
          key={cardKeyword}
          title={(
            <Typography variant="body1">
              {keywordDict[cardKeyword] ? keywordDict[cardKeyword] : 'No definition found.'}
            </Typography>
          )}
        >
          <Chip
            label={cardKeyword}
            className={classes.keywordChip}
            style={{ cursor: 'help' }}
          />
        </Tooltip>
      );
    });
    return keywordChips;
  }

  render() {
    const {
      allCards,
      classes
    } = this.context;
    const {
      cardId,
      size,
      additionalStyles,
      showKeywords,
      handleClick,
      isDisabled
    } = this.props;
    const cardData = allCards[cardId];
    const cardSizes = {
      unit: {
        vsmall: {
          height: '217px',
          width: '304px'
        },
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
        vsmall: {
          height: '217px',
          width: '140px'
        },
        small: {
          height: '248px',
          width: '160px'
        },
        medium: {
          height: '310px',
          width: '200px'
        },
        large: {
          height: '340px',
          width: '220px'
        }
      },
      command: {
        vsmall: {
          height: '217px',
          width: '304px'
        },
        small: {
          width: '250px',
          height: '350px'
        },
        medium: {
          width: '275px',
          height: '385px'
        },
        large: {
          width: '300px',
          height: '420px'
        }
      },
      battle: {
        vsmall: {
          height: '217px',
          width: '304px'
        },
        small: {
          width: '350px',
          height: '250px'
        },
        medium: {
          width: '385px',
          height: '275px'
        },
        large: {
          width: '420px',
          height: '300px'
        }
      }
    };
    const styles = {
      marginRight: 5,
      marginBottom: 5,
      borderRadius: 10,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      ...cardSizes[cardData.cardType][size],
    };
    return (
      <div>
        <Card
          className={classes.cardImage}
          style={{
            width: cardSizes[cardData.cardType][size].width,
            ...additionalStyles
          }}
        >
          <CardActionArea>
            <CardMedia
              title={cardData.cardName}
              image={cardData.imageLocation}
              style={{ ...styles }}
              onClick={handleClick ? () => handleClick() : undefined}
            />
          </CardActionArea>
          <div style={{ margin: '-2px' }}>
            {showKeywords && (
              <CardActions disableSpacing className={classes.cardAction}>
                {this.generateKeywordChips(cardData.keywords)}
              </CardActions>
            )}
          </div>
        </Card>
      </div>
    );
  }
}

export default CardImage;
