import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ExposurePlus1Icon from '@material-ui/icons/ExposurePlus1';
import ExposureNeg1Icon from '@material-ui/icons/ExposureNeg1';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import UpgradeChip from '../components/UpgradeChip';
import DataContext from '../components/DataContext';

class UnitRow extends React.Component {

  state = {
    upgradeAnchorEl: null,
    settingsAnchorEl: null
  }

  static contextType = DataContext;

  handleClose = () => {
    this.setState({
      upgradeAnchorEl: null,
      settingsAnchorEl: null
    });
  }

  handleClickUpgrade = (event) => {
    this.setState({
      upgradeAnchorEl: event.currentTarget,
      settingsAnchorEl: null
    });
  }

  handleClickSettings = (event) => {
    this.setState({
      upgradeAnchorEl: null,
      settingsAnchorEl: event.currentTarget
    });
  }

  render() {
    const {
      classes,
      ranks,
      upgradeTypes,
      allCards,
      userSettings
    } = this.context;
    const {
      upgradeAnchorEl,
      settingsAnchorEl
    } = this.state;
    const {
      unitsIndex,
      unitObject,
      changeViewFilter,
      incrementUnitCount,
      decrementUnitCount,
      removeUnit,
      removeUpgrade,
      dragHandle
    } = this.props;
    const unitCard = allCards[unitObject.unitId];
    let totalUnitCost = 0;
    totalUnitCost += unitCard.cost;
    unitObject.upgradesEquipped.forEach((upgradeCardId) => {
      if (upgradeCardId) totalUnitCost += allCards[upgradeCardId].cost;
    });
    totalUnitCost *= unitObject.count;
    const menuItems = [];
    const upgradeMenuItems = [];
    const unitRankAvatar = (
      <div style={{ display: 'inline-block'}}>
        <div
          style={{
            bottom: 5,
            left: 2,
            width: 21,
            height: 21,
            backgroundColor: 'white',
            border: '0.5px solid black',
            borderRadius: '50%',
            position: 'relative',
            display: unitObject.count < 2 ? 'none' : '',
            zIndex: 9999
          }}
        >
          <Typography
            variant="subtitle2"
            color={userSettings.themeColor === 'light' ? 'primary' : 'secondary'}
            style={{
              left: 2,
              top: 0,
              position: 'relative'
            }}
          >
            {unitObject.count < 10 ? `×${unitObject.count}`: `${unitObject.count}` }
          </Typography>
        </div>
        <img
          src={ranks[allCards[unitObject.unitId].rank].iconLocation}
          alt={allCards[unitObject.unitId].cardName}
          style={{
            bottom: 0,
            left: 2,
            width: 22,
            height: 22,
            position: 'relative',
            zIndex: 9998,
            borderRadius: '50%'
          }}
        />
      </div>
    );
    const unitAvatar = (
      <div className={classes.unitAvatarHoverOver}>
        <img
          src={allCards[unitObject.unitId].iconLocation}
          alt={allCards[unitObject.unitId].cardName}
          style={{
            objectFit: 'cover',
            width: 62.5,
            height: 50,
            borderRadius: 25,
            right: 10,
            marginTop: 4,
            position: 'relative'
          }}
          onClick={() => changeViewFilter({ type: 'view card', cardId: unitObject.unitId })}
        />
      </div>
    );
    const equippedUpgrades = [];
    const upgradeBar = [...unitCard.upgradeBar, ...unitObject.additionalUpgradeSlots];
    unitObject.upgradesEquipped.forEach((equippedUpgradeId, i) => {
      if (equippedUpgradeId) {
        const upgradeObject = (
          <UpgradeChip
            key={equippedUpgradeId}
            classes={classes}
            equippedUpgradeId={equippedUpgradeId}
            changeViewFilter={this.changeViewFilter}
            removeUpgrade={() => removeUpgrade(unitsIndex, i)}
            handleClick={() => {
              if (
                allCards[equippedUpgradeId].cardName.includes('Comms Technician') ||
                allCards[equippedUpgradeId].cardName.includes('Captain') ||
                allCards[equippedUpgradeId].cardName.includes('Specialist')
              ) {
                changeViewFilter({
                  type: 'view card',
                  cardId: equippedUpgradeId
                });
              } else {
                changeViewFilter({
                  type: 'add upgrade',
                  unitsIndex,
                  upgradesIndex: i,
                  upgradeType: upgradeBar[i],
                  swappingUpgrades: true
                });
              }
            }}
          />
        );
        equippedUpgrades.push(
          <Grid item key={i}>
            {upgradeObject}
          </Grid>
        );
      } else {
        upgradeMenuItems.push(
          <MenuItem
            key={i}
            onClick={(event) => {
              this.handleClose();
              changeViewFilter({
                type: 'add upgrade',
                unitsIndex,
                upgradesIndex: i,
                upgradeType: upgradeBar[i],
              });
            }}
          >
            <img
              alt={upgradeTypes[upgradeBar[i]].displayName}
              src={upgradeTypes[upgradeBar[i]].iconLocation}
              className={classes.upgradeTypeButton}
            />
          </MenuItem>
        );
      }
    });
    const upgradeActionBar = (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {equippedUpgrades}
      </Grid>
    );
    const unitFooter = (
      <div>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <Grid
            item
            container
            spacing={0}
            direction="row"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item>
              <Typography
                variant="body2"
                color="primary"
              >
                {totalUnitCost}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            container
            spacing={0}
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            <Grid item>
              <IconButton
                size="small"
                onClick={this.handleClickUpgrade}
                style={{
                  opacity: `${upgradeMenuItems.length > 0 ? 1 : 0}`
                }}
              >
                <AddIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                onClick={this.handleClickSettings}
              >
                <MoreHorizIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
    const unitContent = (
      <div>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="stretch"
        >
          <Grid
            item
            container
            direction="row"
            justify="space-between"
            alignItems="flex-start"
          >
            <Grid item>
              <Typography variant="body2" color="primary" style={{ display: 'inline-block' }}>
                {`${unitCard.displayName ? unitCard.displayName : unitCard.cardName} (${unitCard.cost})`}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            {upgradeActionBar}
          </Grid>
        </Grid>
      </div>
    );
    if (!unitObject.hasUniques) {
      menuItems.push(
        <MenuItem
          key="increment"
          onClick={() => incrementUnitCount(unitsIndex)}
          style={{ cursor: 'pointer' }}
        >
          <ExposurePlus1Icon color="primary" />
        </MenuItem>
      );
      menuItems.push(
        <MenuItem
          key="decrement"
          onClick={() => {
            decrementUnitCount(unitsIndex);
          }}
          style={{ cursor: 'pointer' }}
        >
          <ExposureNeg1Icon color="primary" />
        </MenuItem>
      );
    }
    menuItems.push(
      <MenuItem
        key="delete"
        onClick={() => {
          this.handleClose();
          removeUnit(unitsIndex)
        }}
        style={{ cursor: 'pointer' }}
      >
        <DeleteIcon color="primary" />
      </MenuItem>
    );
    const unitIconBundle = (
      <div>
        {unitRankAvatar}
        {unitAvatar}
      </div>
    )
    return (
      <div>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="stretch"
        >
          <Grid item style={{ marginRight: -10 }}>
            {unitIconBundle}
          </Grid>
          <Grid item style={{ width: 'calc(100% - 145px)' }}>
            {unitContent}
          </Grid>
          <Grid
            item
            style={{
              marginTop: 15,
              marginBottom: 15,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
          <Grid
            item
            {...dragHandle}
          >
            {unitFooter}
          </Grid>
          <Menu
            id="unit-upgrade-menu"
            anchorEl={upgradeAnchorEl}
            open={Boolean(upgradeAnchorEl) && !Boolean(settingsAnchorEl)}
            onClose={this.handleClose}
            transitionDuration={{ enter: 150, exit: 0 }}
          >
            {upgradeMenuItems}
          </Menu>
          <Menu
            id="unit-settings-menu"
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl) && !Boolean(upgradeAnchorEl)}
            onClose={this.handleClose}
            transitionDuration={{ enter: 150, exit: 0 }}
          >
            {menuItems}
          </Menu>
        </Grid>
      </div>
    );
  }
}

/*
<MoreVertIcon
  color="primary"
  fontSize="large"
  style={{
    top: '12px',
    position: 'relative'
  }}
  className={userSettings.themeColor === 'light' ? classes.darkerHoverOver : classes.grayHoverOver}
  onClick={(event) => {
    console.log(event);
    this.handleClick(event);
  }}
/>
*/

export default UnitRow;
