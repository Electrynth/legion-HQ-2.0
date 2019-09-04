import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import DataContext from '../components/DataContext'

class CommandChip extends React.Component {
  static contextType = DataContext;
  state = {}

  render() {
    const {
      allCards
    } = this.context;
    const {
      commandId,
      changeViewFilter,
      removeCommand,
      customIconLocation
    } = this.props;
    const commandCard = allCards[commandId];
    const chipAvatar = (
      <Avatar
        src={customIconLocation ? customIconLocation : commandCard.iconLocation}
        style={{
          width: 48,
          height: 32,
          borderRadius: '25px'
        }}
      />
    );
    let numPips = '•';
    if (allCards[commandId].cardSubtype === '2') numPips = '••';
    else if (allCards[commandId].cardSubtype === '3') numPips = '•••';
    else if (allCards[commandId].cardSubtype === '4') numPips = '••••';
    return (
      <Chip
        key={commandId}
        avatar={chipAvatar}
        label={commandCard.displayName
          ? `${numPips} ${commandCard.displayName}`
          : `${numPips} ${commandCard.cardName}`
        }
        onClick={() => changeViewFilter({ type: 'add commands' })}
        onDelete={removeCommand ? () => removeCommand() : undefined}
        style={{ marginRight: 4, marginBottom: 2 }}
      />
    );
  }
}

export default CommandChip;
