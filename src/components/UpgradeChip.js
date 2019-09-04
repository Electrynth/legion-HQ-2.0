import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import DataContext from '../components/DataContext'

class UpgradeChip extends React.Component {
  static contextType = DataContext;

  state = {}

  render() {
    const {
      allCards
    } = this.context;
    const {
      equippedUpgradeId,
      handleClick,
      removeUpgrade,
      changeViewFilter
    } = this.props;
    let upgradeCard = allCards[equippedUpgradeId];
    const chipAvatar = (
      <Avatar
        alt={upgradeCard.cardName}
        src={upgradeCard.iconLocation}
        onClick={changeViewFilter}
        style={{
          width: 48,
          height: 32,
          borderRadius: '25px'
        }}
      />
    );
    return (
      <Chip
        key={equippedUpgradeId}
        avatar={chipAvatar}
        label={upgradeCard.displayName ? upgradeCard.displayName : upgradeCard.cardName}
        onClick={() => handleClick()}
        onDelete={() => removeUpgrade()}
        style={{ marginRight: 4, marginBottom: 2 }}
      />
    );
  }
}

export default UpgradeChip;
