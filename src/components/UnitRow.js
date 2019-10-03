import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import ExposurePlus1Icon from '@material-ui/icons/ExposurePlus1';
import ExposureNeg1Icon from '@material-ui/icons/ExposureNeg1';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import RemoveIcon from '@material-ui/icons/Remove';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import UpgradeChip from '../components/UpgradeChip';
import DataContext from '../components/DataContext';

class UnitRow extends React.Component {

  state = {
    showUnitActionBar: false,
    anchorEl: null
  }

  static contextType = DataContext;

  handleClose = () => this.setState({ anchorEl: null });

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
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
      showUnitActionBar,
      anchorEl
    } = this.state;
    const {
      unitsIndex,
      unitObject,
      changeViewFilter,
      incrementUnitCount,
      decrementUnitCount,
      copyUnitRow,
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
    const unitActionBar = [];
    const menuItems = [];
    const upgradeMenuItems = [];
    const unitRankAvatar = (
      <div style={{ display: 'inline-block'}}>
        <div
          style={{
            left: 0,
            bottom: 4,
            width: 22,
            height: 22,
            backgroundColor: 'lightgrey',
            borderRadius: '50%',
            position: 'relative',
            display: unitObject.count < 2 ? 'none' : '',
            zIndex: 9999
          }}
        >
          <Typography
            variant="body1"
            color="inherit"
            style={{
              left: unitObject.count > 9 ? 2.5 : 6.5,
              top: 0,
              position: 'relative'
            }}
          >
            {unitObject.count}
          </Typography>
        </div>
        <img
          src={ranks[allCards[unitObject.unitId].rank].iconLocation}
          alt={allCards[unitObject.unitId].cardName}
          style={{
            left: 0,
            bottom: 1,
            width: 22,
            height: 22,
            position: 'relative',
            zIndex: 9998
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
            width: 75,
            height: 50,
            borderRadius: 25,
            marginTop: 4,
            left: -12,
            position: 'relative'
          }}
          onClick={() => changeViewFilter({ type: 'view card', cardId: unitObject.unitId })}
        />
      </div>
    );
    const emptyUpgradeSlots = [];
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
            handleClick={() => changeViewFilter({
              type: 'add upgrade',
              unitsIndex,
              upgradesIndex: i,
              upgradeType: upgradeBar[i]
            })}
          />
        );
        equippedUpgrades.push(
          <Grid item key={i}>
            {upgradeObject}
          </Grid>
        );
      } else {
        const upgradeObject = (
          <img
            key={i}
            alt={upgradeTypes[upgradeBar[i]].displayName}
            src={upgradeTypes[upgradeBar[i]].iconLocation}
            className={classes.upgradeTypeButton}
            onClick={(event) => {
              this.handleClose();
              changeViewFilter({
                type: 'add upgrade',
                unitsIndex,
                upgradesIndex: i,
                upgradeType: upgradeBar[i]
              });
            }}
          />
        );
        // emptyUpgradeSlots.push(
        //   <Grid item key={i}>
        //     {upgradeObject}
        //   </Grid>
        // );
        upgradeMenuItems.push(upgradeObject);
      }
    });
    const upgradeActionBar = (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {emptyUpgradeSlots}
        {equippedUpgrades}
      </Grid>
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
              <Typography variant="body2" color="primary">
                {`${unitCard.displayName ? unitCard.displayName : unitCard.cardName} (${unitCard.cost})`}
              </Typography>
            </Grid>
            <Grid item style={{ height: '24px' }}>
              <Typography
                variant="body2"
                color="primary"
              >
                {unitObject.count > 1 ? `(${unitObject.count} × ${totalUnitCost/unitObject.count}) ${totalUnitCost}` : `${totalUnitCost}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            {upgradeActionBar}
          </Grid>
        </Grid>
      </div>
    );
    menuItems.push(
      <MenuItem key="upgrades">
        {upgradeMenuItems}
      </MenuItem>
    );
    if (!unitObject.hasUniques) {
      menuItems.push(
        <MenuItem
          key="increment"
          onClick={() => incrementUnitCount(unitsIndex)}
          style={{ cursor: 'pointer' }}
        >
          <ListItemIcon>
            <ExposurePlus1Icon color="primary" />
          </ListItemIcon>
          Increment
        </MenuItem>
      );
      menuItems.push(
        <MenuItem
          key="decrement"
          onClick={() => {
            this.handleClose();
            decrementUnitCount(unitsIndex);
          }}
          style={{ cursor: 'pointer' }}
        >
          <ListItemIcon>
            <ExposureNeg1Icon color="primary" />
          </ListItemIcon>
          Decrement
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
        <ListItemIcon>
          <DeleteIcon color="primary" />
        </ListItemIcon>
        Delete
      </MenuItem>
    );
    return (
      <div
        onMouseOver={() => this.setState({ showUnitActionBar: true })}
        onMouseOut={() => this.setState({ showUnitActionBar: false })}
      >
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
        >
          <Grid
            item
            style={{
              marginRight: '-10px'
            }}
          >
            {unitRankAvatar}
            {unitAvatar}
          </Grid>
          <Grid item style={{ width: 'calc(100% - 125px)' }}>
            {unitContent}
          </Grid>
          <Grid item {...dragHandle}>
            <IconButton
              size="small"
              onClick={this.handleClick}
              style={{
                top: '12px',
                position: 'relative'
              }}
            >
              <MoreVertIcon size="large" />
            </IconButton>
          </Grid>
          <Menu
            id="unit-action-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
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
