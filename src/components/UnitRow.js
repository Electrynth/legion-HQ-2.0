import React from 'react';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import UpgradeRow from '../components/UpgradeRow';
import DataContext from '../components/DataContext';

class UnitRow extends React.Component {

  state = {
    showUnitActionBar: false,
    showUpgradeActionBar: []
  }

  static contextType = DataContext;

  render() {
    const {
      width,
      classes,
      factions,
      ranks,
      upgradeTypes,
      allCards
    } = this.context;
    const {
      showUnitActionBar
    } = this.state;
    const {
      unitsIndex,
      unitObject,
      changeViewFilter,
      incrementUnitCount,
      decrementUnitCount,
      removeUnit,
      removeUpgrade
    } = this.props;
    const unitCard = allCards[unitObject.unitId];
    let totalUnitCost = 0;
    totalUnitCost += unitCard.cost;
    unitObject.upgradesEquipped.forEach((upgradeCardId) => {
      if (upgradeCardId) totalUnitCost += allCards[upgradeCardId].cost;
    });
    totalUnitCost *= unitObject.count;
    const unitActionBar = [];
    if (!unitObject.hasUniques) {
      unitActionBar.push(
        <AddIcon
          key="Increase stack button"
          size="small"
          color="primary"
          style={{
            marginTop: 4,
            marginRight: 8
          }}
          onClick={() => incrementUnitCount(unitsIndex)}
        />
      );
      unitActionBar.push(
        <RemoveIcon
          key="Decrease stack button"
          size="small"
          color="primary"
          style={{
            marginTop: 4,
            marginRight: 8
          }}
          onClick={() => decrementUnitCount(unitsIndex)}
        />
      );
    }
    unitActionBar.push(
      <CloseIcon
        key="Remove stack button"
        size="small"
        color="primary"
        style={{
          marginTop: 4
        }}
        onClick={() => removeUnit(unitsIndex)}
      />
    );
    const upgradeActionBar = [];
    unitCard.upgradeBar.forEach((upgradeType, i) => {
      if (!unitObject.upgradesEquipped[i]) {
        upgradeActionBar.push(
          <img
            key={i}
            alt={upgradeTypes[upgradeType].displayName}
            src={upgradeTypes[upgradeType].iconLocation}
            className={classes.upgradeTypeButton}
            onClick={() => changeViewFilter({
              type: 'add upgrade',
              upgradeType,
              unitsIndex,
              upgradesIndex: i
            })}
          />
        );
      }
    });
    return (
      <div style={{ paddingRight: 10 }}>
        <div
          onMouseOver={() => this.setState({ showUnitActionBar: true })}
          onMouseOut={() => this.setState({ showUnitActionBar: false })}
          className={classes.grayHoverOver}
        >
          <div
            style={{
              borderRadius: 5,
              width: 60,
              height: 40
            }}
          >
            <div
              style={{
                backgroundColor: 'grey',
                position: 'relative',
                top: -3,
                width: 20,
                height: 20,
                borderRadius: 50,
                zIndex: 9999,
                display: unitObject.count < 2 ? 'none' : 'inline-block'
              }}
            >
              <Typography
                variant="caption"
                color="primary"
                style={{
                  left: 6.5,
                  position: 'relative',
                  bottom: 1
                }}
              >
                {unitObject.count}
              </Typography>
            </div>
            <img
              src={ranks[allCards[unitObject.unitId].rank].iconLocation}
              alt={allCards[unitObject.unitId].cardName}
              style={{
                width: 20,
                height: 20,
                top: unitObject.count < 2 ? 10 : 20,
                right: unitObject.count < 2 ? 0 : 20,
                position: 'relative',
                zIndex: 9998
              }}
            />
            <img
              src={allCards[unitObject.unitId].iconLocation}
              alt={allCards[unitObject.unitId].cardName}
              style={{
                width: 60,
                height: 40,
                borderRadius: 5,
                marginLeft: 12.5,
                marginTop: -25
              }}
            />
          </div>
          <div style={{ marginLeft: 16, marginTop: 4 }}>
            <Typography variant="h6" color="primary">
              {allCards[unitObject.unitId].displayName ? allCards[unitObject.unitId].displayName : allCards[unitObject.unitId].cardName}
            </Typography>
          </div>
          <div style={{ flexGrow: 1 }} />
          <div style={{ marginRight: 4, marginTop: 4 }}>
            <div
              style={{
                display: showUnitActionBar ? 'block' : 'none'
              }}
            >
              {unitActionBar}
            </div>
            <Typography
              variant="h6"
              color="primary"
              style={{
                display: showUnitActionBar ? 'none' : 'block'
              }}
            >
              {allCards[unitObject.unitId].cost}
            </Typography>
          </div>
        </div>
        <div style={{ marginTop: 2 }}>
          {unitObject.upgradesEquipped.map((equippedUpgradeId, i) => {
            if (!equippedUpgradeId) return undefined;
            const upgradeType = allCards[equippedUpgradeId].cardSubtype;
            return (
              <UpgradeRow
                key={equippedUpgradeId}
                classes={classes}
                equippedUpgradeId={equippedUpgradeId}
                removeUpgrade={() => removeUpgrade(unitsIndex, i)}
                handleClick={() => changeViewFilter({
                  type: 'add upgrade',
                  upgradeType,
                  unitsIndex,
                  upgradesIndex: i
                })}
              />
            );
          })}
        </div>
        <div
          style={{
            marginTop: 1,
            display: 'flex',
            marginLeft: 12
          }}
        >
          <div>
            {upgradeActionBar}
          </div>
          <div style={{ flexGrow: 1 }} />
          <Typography
            variant="body1"
            color="primary"
            style={{ marginRight: 4, marginTop: 4 }}
          >
            {totalUnitCost}
          </Typography>
        </div>
        <div
          style={{
            marginTop: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <div style={{ marginBottom: 2 }} />
      </div>
    );
  }
}

export default UnitRow;
