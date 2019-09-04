import React from 'react';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import LooksOneIcon from '@material-ui/icons/LooksOne';
import LooksTwoIcon from '@material-ui/icons/LooksTwo';
import Looks3Icon from '@material-ui/icons/Looks3';
import Looks4Icon from '@material-ui/icons/Looks4';
import DataContext from '../components/DataContext'

class CommandRow extends React.Component {

  static contextType = DataContext;

  state = { showCommandActionBar: true };

  render() {
    const {
      classes,
      allCards
    } = this.context;
    const {
      showCommandActionBar
    } = this.state;
    const {
      commandId,
      commandIndex,
      changeViewFilter,
      removeCommand,
      customIconLocation
    } = this.props;
    const commandCard = allCards[commandId];
    return (
      <div
        className={classes.grayHoverOver}
        style={{ marginRight: 5, marginBottom: 5 }}
      >
        <div
          style={{
            marginTop: 7.5,
            marginLeft: 5,
            zIndex: 9999
          }}
        >
          {commandCard.cardSubtype === '1' && (
            <LooksOneIcon size="small" color="primary" />
          )}
          {commandCard.cardSubtype === '2' && (
            <LooksTwoIcon size="small" color="primary" />
          )}
          {commandCard.cardSubtype === '3' && (
            <Looks3Icon size="small" color="primary" />
          )}
          {commandCard.cardSubtype === '4' && (
            <Looks4Icon size="small" color="primary" />
          )}
        </div>
        <img
          src={customIconLocation ? customIconLocation : commandCard.iconLocation}
          alt={commandCard.cardName}
          style={{
            width: 60,
            height: 40,
            borderRadius: 5,
            left: -10,
            position: 'relative'
          }}
          onClick={() => changeViewFilter({ type: 'view card', cardId: commandId })}
        />
        <Typography variant="h6" color="primary" style={{ marginLeft: 4, marginTop: 4 }}>
          {commandCard.cardName}
        </Typography>
        <div style={{ flexGrow: 1 }} />
        {removeCommand ? (
          <CloseIcon
            size="small"
            color="primary"
            style={{
              marginLeft: 10,
              marginTop: 7.5,
              marginRight: 5,
              zIndex: showCommandActionBar ? 1 : -1,
            }}
            onClick={() => removeCommand(commandIndex)}
          />
        ) : <div style={{ marginRight: 5 }} />}
      </div>
    );
  }
}

export default CommandRow;
