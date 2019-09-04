import React from 'react';
import Typography from '@material-ui/core/Typography';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import CloseIcon from '@material-ui/icons/Close';
import DataContext from '../components/DataContext'

class UpgradeRow extends React.PureComponent {

  static contextType = DataContext;

  state = {
    showUpgradeActionBar: false
  }

  render() {
    const {
      allCards,
      upgradeTypes
    } = this.context;
    const {
      classes,
      equippedUpgradeId,
      handleClick,
      removeUpgrade,
      changeViewFilter
    } = this.props;
    const {
      showUpgradeActionBar
    } = this.state;
    let upgradeCard = allCards[equippedUpgradeId];
    const upgradeActionBar = [];
    upgradeActionBar.push(
      <SwapHorizIcon
        key="Swap upgrade button"
        size="small"
        color="primary"
        style={{ marginTop: 2, marginRight: 8 }}
        onClick={() => handleClick()}
      />
    );
    upgradeActionBar.push(
      <CloseIcon
        key="Remove upgrade"
        size="small"
        color="primary"
        style={{ marginTop: 2 }}
        onClick={() => removeUpgrade()}
      />
    );
    return (
      <div
        className={classes.grayHoverOver}
        onMouseOver={() => this.setState({ showUpgradeActionBar: true })}
        onMouseOut={() => this.setState({ showUpgradeActionBar: false })}
        style={{ marginBottom: 1 }}
      >
        <img
          src={upgradeTypes[upgradeCard.cardSubtype].iconLocation}
          alt={upgradeTypes[upgradeCard.cardSubtype].displayName}
          style={{
            width: 20,
            height: 20,
            top: 7.5,
            left: 5,
            position: 'relative',
            marginLeft: 5,
            zIndex: 9998
          }}
        />
        <img
          src={upgradeCard.iconLocation}
          alt={upgradeCard.cardName}
          style={{
            width: 48,
            height: 36,
            borderRadius: 5
          }}
          onClick={() => changeViewFilter({ type: 'view card', cardId: equippedUpgradeId })}
        />
        <Typography
          variant="body1"
          color="primary"
          style={{ marginLeft: 4, marginTop: 6 }}
        >
          {upgradeCard.cardName}
        </Typography>
        <div style={{ flexGrow: 1 }} />
        <div style={{ marginRight: 4, marginTop: 4 }}>
          <div
            style={{
              display: showUpgradeActionBar ? 'block' : 'none'
            }}
          >
            {upgradeActionBar}
          </div>
          <Typography
            variant="h6"
            color="primary"
            style={{
              display: showUpgradeActionBar ? 'none' : 'block'
            }}
          >
            {upgradeCard.cost}
          </Typography>
        </div>
      </div>
    );
  }
}

export default UpgradeRow;
