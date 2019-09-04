import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CardImage from '../components/CardImage';
import DataContext from '../components/DataContext';

class CommandCard extends React.Component {

  static contextType = DataContext;

  state = {};

  render() {
    const {
      allCards,
      classes,
      factions
    } = this.context;
    const {
      commandCardId,
      currentList,
      addCommandCard,
      removeCommand,
      changeCurrentList,
      generateCustomImageLocation
    } = this.props;
    const commandCard = allCards[commandCardId];
    let commandCardState = 'enabled';
    let commandIndex = undefined;
    if (currentList.commandCards.includes(commandCardId)) {
      commandCardState = 'equipped';
      commandIndex = currentList.commandCards.indexOf(commandCardId);
    } else if (commandCard.commander === '' || currentList.commanders.includes(commandCard.commander)) {
      let pipCount = 0;
      currentList.commandCards.forEach((currentCommandId) => {
        if (allCards[currentCommandId].cardSubtype === commandCard.cardSubtype) pipCount += 1;
      });
      if (pipCount >= 2) commandCardState = 'disabled';
      else commandCardState = 'enabled';
    } else commandCardState = 'disabled';
    let handleClick = undefined;
    let additionalStyles = undefined;
    switch (commandCardState) {
      case 'enabled':
        handleClick = () => addCommandCard(commandCardId);
        break;
      case 'equipped':
        handleClick = () => removeCommand(commandIndex);
        additionalStyles = {
          border: '2px solid lightblue',
          opacity: 0.5
        };
        break;
      case 'disabled':
        break;
      default:
    }
    return (
      <div
        style={{
          display: 'inline-block',
          verticalAlign: 'text-top'
        }}
      >
        <CardImage
          showKeywords={true}
          size="vsmall"
          cardId={commandCardId}
          key={commandCardId}
          isDisabled={commandCardState === 'disabled'}
          customImageLocation={generateCustomImageLocation(commandCardId)}
          additionalStyles={additionalStyles}
          handleClick={handleClick}
        />
      </div>
    );
  }
}

export default CommandCard;
