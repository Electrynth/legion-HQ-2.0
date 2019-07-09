import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import copy from 'clipboard-copy';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import LinkIcon from '@material-ui/icons/Link';
import PrintIcon from '@material-ui/icons/Print';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import SaveIcon from '@material-ui/icons/Save';
import ImageIcon from '@material-ui/icons/Image';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import CardImage from '../components/CardImage';
import UnitRow from '../components/UnitRow';
import DataContext from '../components/DataContext';

const entouragePairs = {
  empire: {
    pairs: [
      {
        unitIds: ['5c88a2e88f63424d32d13b9a', '5c88a2e88f63424d32d13ba4'],
        rank: 'special'
      },
      {
        unitIds: ['5c88a2e88f63424d32d13b9d', '5c88a2e88f63424d32d13ba5'],
        rank: 'special'
      }
    ]
  },
  rebels: {
    pairs: []
  },
  separatists: {
    pairs: []
  },
  republic: {
    pairs: []
  }
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'rgba(255, 255, 255, 0.23)' : ''
});

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // change background colour if dragging
  background: isDragging ? 'lightblue' : '',

  // styles we need to apply on draggables
  ...draggableStyle
});

class ListContainer extends React.Component {

  static contextType = DataContext;

  state = {
    loadingList: false,
    unitStackSize: 1,
    viewFilter: {
      type: ''
    },
    unitCounts: {
      commander: 0,
      operative: 0,
      corps: 0,
      special: 0,
      support: 0,
      heavy: 0
    }
  }

  componentDidMount() {
    const { factions, allCards } = this.context;
    const {
      match,
      currentList,
      changeActiveTab,
      changeCurrentList
    } = this.props;
    const { unitCounts } = this.state;
    if (factions[match.params.id]) {
      changeCurrentList({ ...currentList, faction: match.params.id });
    } else {
      this.setState({ loadingList: true });
      const listCode = match.params.id;
      let invalidFormat = false;
      let faction = '';
      let unitObjects = [];
      let urlStrings = listCode.split(',');
      urlStrings.forEach((urlString, i) => {
        if (urlString.charAt(0) && urlString.charAt(1) && urlString.charAt(2)) {
          let unitCount = urlString.charAt(0);
          let unitId = `${urlString.charAt(1)}${urlString.charAt(2)}`;
          if (unitCount > 0 && unitCount < 13 && allCards[unitId] && allCards[unitId].cardType === 'unit') {
            if (currentList.uniques.includes(unitId)) {
              invalidFormat = true;
            } else if (allCards[unitId].isUnique) {
              currentList.uniques.push(unitId)
            }
            if (!invalidFormat) {
              let unitObject = {
                unitId,
                count: unitCount,
                upgradesEquipped: new Array(allCards[unitId].upgradeBar.length).fill(undefined),
                hasUniques: allCards[unitId].isUnique,
                totalUnitCost: allCards[unitId].cost * unitCount
              };
              if (!faction) faction = allCards[unitId].faction;
              else if (allCards[unitId].faction !== faction) invalidFormat = true;
              let upgradeIds = [];
              for (let i = 3; i < urlString.length; i += 1) {
                if (urlString.charAt(i) !== '0' && urlString.charAt(i + 1)) {
                  upgradeIds.push(`${urlString.charAt(i)}${urlString.charAt(i + 1)}`);
                  i += 1;
                } else {
                  upgradeIds.push(undefined);
                }
              }
              let upgradesEquipped = [];
              upgradeIds.forEach((upgradeId, i) => {
                if (upgradeId && !invalidFormat) {
                  if (currentList.uniques.includes(upgradeId) || upgradesEquipped.includes(upgradeId)) {
                    // if upgrade is in uniques list or is already equipped => invalidate
                    invalidFormat = true;
                  } else if (allCards[upgradeId].cardSubtype !== allCards[unitId].upgradeBar[i]) {
                    // if upgrade is not the right type for that particular slot => invalidate
                    invalidFormat = true;
                  } else if (allCards[upgradeId].faction && (allCards[upgradeId].faction !== allCards[unitId].faction)) {
                    // if upgrade has a faction and that faction is not the same as the unit => invalidate
                    invalidFormat = true;
                  } else if (allCards[upgradeId].isUnique) {
                    unitObject.hasUniques = true;
                    currentList.uniques.push(upgradeId);
                  }
                  if (!invalidFormat) {
                    unitObject.totalUnitCost += allCards[upgradeId].cost * unitCount;
                    upgradesEquipped.push(upgradeId);
                  }
                } else upgradesEquipped.push(undefined);
              });
              unitObject.upgradesEquipped = upgradesEquipped;
              if (!invalidFormat) {
                unitObjects.push(unitObject);
                currentList.pointTotal += unitObject.totalUnitCost;
              }
            }
          } else invalidFormat = true;
        } else invalidFormat = true;
        if (invalidFormat) return;
      });
      if (invalidFormat) {
        currentList.units = [];
        currentList.faction = 'rebels';
        alert('Invalid List Format');
      } else {
        unitObjects.forEach((unitObject) => {
          unitCounts[allCards[unitObject.unitId].rank] += Number.parseInt(unitObject.count);
        });
        currentList.units = unitObjects;
        currentList.faction = faction;
      }
      this.setState({
        loadingList: false
      }, changeCurrentList({ ...currentList, unitCounts }));
    }
    changeActiveTab(1);
  }

  incrementUnitStackSize = () => {
    const { unitStackSize } = this.state;
    if (unitStackSize < 11) this.setState({ unitStackSize: unitStackSize + 1 });
  }

  decrementUnitStackSize = () => {
    const { unitStackSize } = this.state;
    if (unitStackSize > 1) this.setState({ unitStackSize: unitStackSize - 1 });
  }

  getBadgeColor = (rank) => {
    const {
      unitCounts
    } = this.state;
    const {
      currentList
    } = this.props;
    const correctColor = 'secondary';
    const errorColor = 'error';
    if (currentList.mode === 'standard') {
      switch (rank) {
        case 'commander':
          if (unitCounts[rank] < 1 || unitCounts[rank] > 2) return errorColor;
          break;
        case 'operative':
          if (unitCounts[rank] > 2) return errorColor;
          break;
        case 'corps':
          if (unitCounts[rank] < 3 || unitCounts[rank] > 6) return errorColor;
          break;
        case 'special':
          if (unitCounts[rank] > 3) return errorColor;
          break;
        case 'support':
          if (unitCounts[rank] > 3) return errorColor;
          break;
        case 'heavy':
          if (unitCounts[rank] > 2) return errorColor;
          break;
        default:
          return errorColor;
      }
    } else {
      switch (rank) {
        case 'commander':
          if (unitCounts[rank] < 1 || unitCounts[rank] > 4) return errorColor;
          break;
        case 'operative':
          if (unitCounts[rank] > 4) return errorColor;
          break;
        case 'corps':
          if (unitCounts[rank] < 6 || unitCounts[rank] > 10) return errorColor;
          break;
        case 'special':
          if (unitCounts[rank] > 5) return errorColor;
          break;
        case 'support':
          if (unitCounts[rank] > 5) return errorColor;
          break;
        case 'heavy':
          if (unitCounts[rank] > 4) return errorColor;
          break;
        default:
          return errorColor;
      }
    }
    return correctColor;
  }

  generateTopContent(viewFilter, currentList) {
    let content = undefined;
    return content;
  }

  generateBottomContent() {
    const content = (undefined);
    return content;
  }

  changeViewFilter = (viewFilter) => {
    this.setState({
      viewFilter,
      unitStackSize: 1
    });
  }

  incrementUnitCount = (unitsIndex) => {
    const { allCards } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const {
      unitCounts
    } = this.state;
    if (!currentList.units[unitsIndex].hasUniques) {
      currentList.pointTotal += currentList.units[unitsIndex].totalUnitCost/currentList.units[unitsIndex].count;
      currentList.units[unitsIndex].totalUnitCost += currentList.units[unitsIndex].totalUnitCost/currentList.units[unitsIndex].count;
      currentList.units[unitsIndex].count += 1;
      unitCounts[allCards[currentList.units[unitsIndex].unitId].rank] += 1;
    }
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    this.setState({
      unitCounts
    }, changeCurrentList(currentList));
  }

  decrementUnitCount = (unitsIndex) => {
    const { allCards } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const {
      unitCounts
    } = this.state;
    if (currentList.units[unitsIndex].count === 1) {
      this.removeUnit(unitsIndex);
      return;
    }
    if (!currentList.units[unitsIndex].hasUniques
      && currentList.units[unitsIndex].count > 0) {
      currentList.pointTotal -= currentList.units[unitsIndex].totalUnitCost/currentList.units[unitsIndex].count;
      currentList.units[unitsIndex].totalUnitCost -= currentList.units[unitsIndex].totalUnitCost/currentList.units[unitsIndex].count;
      currentList.units[unitsIndex].count -= 1;
      unitCounts[allCards[currentList.units[unitsIndex].unitId].rank] -= 1;
    }
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    this.setState({
      unitCounts
    }, changeCurrentList(currentList));
  }

  removeUnit = (unitsIndex) => {
    const {
      allCards
    } = this.context;
    const {
      unitCounts
    } = this.state;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const unitObject = currentList.units[unitsIndex];
    currentList.pointTotal -= unitObject.totalUnitCost;
    if (unitObject.hasUniques) {
      if (currentList.uniques.includes(unitObject.unitId)) {
        currentList.uniques.splice(currentList.uniques.indexOf(unitObject.unitId), 1)
      }
      unitObject.upgradesEquipped.forEach((upgradeEquipped, i) => {
        if (upgradeEquipped && allCards[upgradeEquipped.upgradeId] && allCards[upgradeEquipped.upgradeId].isUnique) {
          currentList.uniques.splice(i, 1);
        }
      });
    }
    currentList.units.splice(unitsIndex, 1);
    unitCounts[allCards[unitObject.unitId].rank] -= 1 * unitObject.count;
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    this.setState({
      unitCounts
    }, () => {
      changeCurrentList(currentList);
      this.changeViewFilter({ type: '' });
    });
  }

  addUpgradeCard = (upgradeCardId, unitsIndex, upgradesIndex) => {
    const {
      allCards
    } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const currentUpgradeCardId = currentList.units[unitsIndex].upgradesEquipped[upgradesIndex];
    if (currentUpgradeCardId) this.removeUpgrade(unitsIndex, upgradesIndex);
    const upgradeCard = allCards[upgradeCardId];
    currentList.units[unitsIndex].totalUnitCost += upgradeCard.cost * currentList.units[unitsIndex].count;
    currentList.pointTotal += upgradeCard.cost * currentList.units[unitsIndex].count;
    if (upgradeCard.isUnique) currentList.uniques.push(upgradeCardId);
    currentList.units[unitsIndex].upgradesEquipped[upgradesIndex] = upgradeCardId;
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    changeCurrentList(currentList);
    this.changeViewFilter({ type: '' });
  }

  removeUpgrade = (unitsIndex, upgradesIndex) => {
    const {
      allCards
    } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const upgradeCardId = currentList.units[unitsIndex].upgradesEquipped[upgradesIndex];
    const upgradeCard = allCards[upgradeCardId];
    currentList.units[unitsIndex].totalUnitCost -= upgradeCard.cost * currentList.units[unitsIndex].count;
    currentList.pointTotal -= upgradeCard.cost * currentList.units[unitsIndex].count;
    if (upgradeCard.isUnique && currentList.uniques.includes(upgradeCardId)) {
      currentList.uniques.splice(currentList.uniques.indexOf(upgradeCardId), 1);
    }
    currentList.units[unitsIndex].upgradesEquipped[upgradesIndex] = undefined;
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    changeCurrentList(currentList);
    this.changeViewFilter({ type: '' });
  }

  addUnitCard = (unitId) => {
    const {
      allCards
    } = this.context;
    const {
      unitCounts,
      unitStackSize
    } = this.state;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const unitCard = allCards[unitId];
    const unitObject = {
      unitId,
      hasUniques: false,
      totalUnitCost: unitCard.cost,
      additionalUpgradeSlots: [],
      upgradesEquipped: new Array(unitCard.upgradeBar.length).fill(undefined)
    };
    if (currentList.uniques.includes(unitId)) {
      return
    } else if (unitCard.isUnique) {
      unitObject.count = 1; // stack size is 1
      unitObject.hasUniques = true; // unit obj has uniques
      currentList.uniques.push(unitId); // add unit to list of uniques
      unitCounts[unitCard.rank] += 1; // add +1 to rank
      currentList.units.push(unitObject); // add unit to list of units
      currentList.pointTotal += unitCard.cost;
    } else {
      unitObject.count = unitStackSize; // stack size
      unitCounts[unitCard.rank] += unitStackSize; // add +X to rank
      currentList.units.push(unitObject); // add to list
      currentList.pointTotal += unitCard.cost * unitStackSize;
    }
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    // if (!currentList.unitsContained.includes(unitObject.unitId)) {
    //   currentList.unitsContained.push(unitObject.unitId);
    // }
    this.setState({
      unitCounts
    }, () => {
      changeCurrentList(currentList);
      this.changeViewFilter({ type: '' })
      // this.applyEntourage();
    });
  }

  copyTextToClipboard = () => {
    const {
      allCards
    } = this.context;
    const {
      currentList
    } = this.props;
    let listString = '';
    listString += `${currentList.title}\n`;
    listString += `${currentList.pointTotal}/${currentList.mode === 'standard' ? 800 : 1600}\n`;
    listString += '\n';
    currentList.units.forEach((unitObject) => {
      const unitCard = allCards[unitObject.unitId];
      Array.from({ length: unitObject.count }).forEach((i) => {
        listString += `${unitCard.cardName} (${unitObject.totalUnitCost/unitObject.count})\n`;
        unitObject.upgradesEquipped.forEach((upgradeId) => {
          if (upgradeId) listString += `- ${allCards[upgradeId].cardName}\n`;
        });
      });
    });
    copy(listString);
  }

  copyLinkToClipboard = (linkType) => {
    const {
      currentList
    } = this.props;
    const urlStrings = [];
    if (linkType === 'Legion HQ Link') {
      currentList.units.forEach((unitObject) => {
        let urlString = `${unitObject.count}${unitObject.unitId}`;
        unitObject.upgradesEquipped.forEach((upgradeId) => {
          if (upgradeId) urlString += upgradeId;
          else urlString += '0';
        });
        urlStrings.push(urlString);
      });
    }
    copy(`https://legion-hq.herokuapp.com/list/${urlStrings.join(',')}`);
  }

  generateRightPaneContent(viewFilter, currentList) {
    const {
      allCards,
      unitCardsById,
      upgradeCardsById,
      commandCardsById,
      battleCardsById
    } = this.context;
    let content = undefined;
    if (viewFilter.type === 'add unit') {
      content = unitCardsById.filter((unitCardId) => {
          if (allCards[unitCardId].rank !== viewFilter.rank) return false;
          else if (allCards[unitCardId].faction !== currentList.faction) return false;
          return true;
        }).map((unitCardId) => (
          <div
            key={unitCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              showKeywords={true}
              size="small"
              cardId={unitCardId}
              key={unitCardId}
              handleClick={() => this.addUnitCard(unitCardId)}
              isDisabled={currentList.uniques.includes(unitCardId)}
            />
          </div>
        ));
    } else if (viewFilter.type === 'add upgrade') {
      content = [];
      let equippedUpgrades = [];
      let enabledUpgrades = [];
      let disabledUpgrades = [];
      upgradeCardsById.filter((upgradeCardId) => {
        if (allCards[upgradeCardId].cost < 0) return false;
        if (allCards[upgradeCardId].cardSubtype !== viewFilter.upgradeType) return false;
        else if (allCards[upgradeCardId].faction !== ''
          && allCards[upgradeCardId].faction !== currentList.faction) return false;
        return true;
      }).forEach((upgradeCardId) => {
        const forceAffinity = {
          'dark side': ['empire', 'separatists'],
          'light side': ['republic', 'rebels'],
          '': ''
        };
        const upgradeCard = allCards[upgradeCardId];
        // Object contains specific data to unit in the list
        const unitObject = currentList.units[viewFilter.unitsIndex];
        // Card contains general non-specific data of unit
        const unitCard = allCards[unitObject.unitId];
        let isDisabled = false;
        // Cannot add unique upgrades to stacks
        if (upgradeCard.isUnique && unitObject.count > 1) isDisabled = true;
        let alreadyEquipped = false;
        // Is upgrade (if unique) already in the list?
        if (currentList.uniques.includes(upgradeCardId)) isDisabled = true;
        if (viewFilter.upgradeType === 'gear' && unitCard.cardName === 'B1 Battle Droids') {
          if (upgradeCard.cardName === 'Electrobinoculars') isDisabled = false;
          else isDisabled = true;
        }
        if (!isDisabled) { // Does upgrade meet requirements?
          let requirementsMet = 0;
          upgradeCard.requirements.forEach((requirement) => { // Check force affinity/name requirement
            if (requirement instanceof Array) {
              requirement.forEach((optionalRequirement) => {
                if (unitCard.cardName.includes(optionalRequirement) || unitCard.cardSubtype.includes(optionalRequirement)) {
                  requirementsMet += 1;
                  return;
                }
              });
            } else if (unitCard.cardName.includes(requirement)) requirementsMet += 1;
            else if (unitCard.cardSubtype.includes(requirement)) requirementsMet += 1;
            else if (forceAffinity[requirement] && forceAffinity[requirement].includes(unitCard.faction)) requirementsMet += 1;
          });
          isDisabled = requirementsMet < upgradeCard.requirements.length;
        }
        if (!isDisabled) { // Is upgrade already equipped?
          unitObject.upgradesEquipped.forEach((equippedUpgradeId) => {
            if (equippedUpgradeId === upgradeCardId) {
              isDisabled = true;
              alreadyEquipped = true;
            }
          });
        }
        if (alreadyEquipped) equippedUpgrades.push(upgradeCardId);
        else if (isDisabled) disabledUpgrades.push(upgradeCardId);
        else enabledUpgrades.push(upgradeCardId);
      });

      equippedUpgrades = equippedUpgrades.map((upgradeCardId) => {
        return (
          <div
            key={upgradeCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              showKeywords={true}
              size="small"
              cardId={upgradeCardId}
              key={upgradeCardId}
              isDisabled={true}
              additionalStyles={{
                border: '2px solid lightblue'
              }}
            />
          </div>
        );
      });
      enabledUpgrades = enabledUpgrades.map((upgradeCardId) => {
        return (
          <div
            key={upgradeCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              showKeywords={true}
              size="small"
              cardId={upgradeCardId}
              key={upgradeCardId}
              isDisabled={false}
              handleClick={() => this.addUpgradeCard(upgradeCardId, viewFilter.unitsIndex, viewFilter.upgradesIndex)}
            />
          </div>
        );
      });
      disabledUpgrades = disabledUpgrades.map((upgradeCardId) => {
        return (
          <div
            key={upgradeCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              showKeywords={true}
              size="small"
              cardId={upgradeCardId}
              key={upgradeCardId}
              isDisabled={true}
            />
          </div>
        );
      });
      content = [...equippedUpgrades, ...enabledUpgrades, ...disabledUpgrades];
    } else if (viewFilter.type === 'add command') {

    } else if (viewFilter.type === 'add objective') {

    } else if (viewFilter.type === 'add deployment') {

    } else if (viewFilter.type === 'add condition') {

    } else {
      content = currentList.units.map((unitObject, i) => {
        return (
          <Grid
            item
            key={i}
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <CardImage
                showKeywords={false}
                size="vsmall"
                cardId={unitObject.unitId}
                key={unitObject.unitId}
                unitCount={unitObject.count}
              />
            </Grid>
            {unitObject.upgradesEquipped.map((upgradeCardId) => {
              if (!upgradeCardId) return undefined;
              return (
                <Grid item key={upgradeCardId}>
                  <CardImage
                    showKeywords={false}
                    size="vsmall"
                    cardId={upgradeCardId}
                    key={upgradeCardId}
                  />
                </Grid>
              );
            })}
            <Divider />
          </Grid>
        );
      });
    }
    return content;
  }

  render() {
    const {
      width,
      classes,
      factions,
      ranks,
      upgradeTypes,
      allCards,
      unitCardsById,
      upgradeCardsById,
      commandCardsById,
      battleCardsById
    } = this.context;
    const {
      viewFilter,
      unitCounts,
      unitStackSize
    } = this.state;
    const {
      currentList,
      onDragEnd,
      handleChangeTitle,
      handleOpenSnackbar
    } = this.props;
    const mobile = width === 'xs' || width === 'sm';
    const leftPane = (
      <Grid
        item
        container
        md={5}
        spacing={3}
        direction="column"
        justify="flex-start"
        alignItems="center"
      >
        <Grid
          item
          container
          spacing={1}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item>
            {currentList.faction && (
              <Avatar
               alt={factions[currentList.faction].longName}
               src={factions[currentList.faction].iconLocation}
               style={{
                 height: 25,
                 width: 25,
                 padding: 1
               }}
             />
            )}
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              placeholder="Untitled"
              helperText={currentList.mode}
              onChange={handleChangeTitle}
            />
          </Grid>
          <Grid item>
            <Typography variant="body1" color="primary">
              {currentList.mode === 'standard' ? (
                `${currentList.pointTotal}/800`
              ) : (
                `${currentList.pointTotal}/1600`
              )}
            </Typography>
          </Grid>
        </Grid>
        <Grid
          item
          container
          spacing={1}
          direction="row"
          justify="center"
          alignItems="center"
        >
          {Object.keys(ranks).map((r) => {
             return (
               <div key={r} className={classes.rankButtonContainer}>
                 <Badge badgeContent={unitCounts[r]} showZero color={this.getBadgeColor(r)}>
                   <img
                     alt={ranks[r].displayName}
                     src={ranks[r].iconLocation}
                     className={classes.rankButton}
                     onClick={() => this.changeViewFilter({ type: 'add unit', rank: r })}
                   />
                 </Badge>
               </div>
             );
           })}
        </Grid>
        <div
          style={{
            minWidth: 360,
            borderBottom: '1px solid rgba(255, 255, 255, 0.23)'
          }}
        />
        <div
          style={{
            width: '95%',
            maxHeight: '100vh',
            overflowY: 'scroll'
          }}
        >
          <div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {currentList.units.map((unitObject, i) => {
                      return (
                        <Draggable
                          key={i}
                          draggableId={`${unitObject.unitId}_${i}`}
                          index={i}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <UnitRow
                                unitsIndex={i}
                                unitObject={unitObject}
                                incrementUnitCount={this.incrementUnitCount}
                                decrementUnitCount={this.decrementUnitCount}
                                removeUnit={this.removeUnit}
                                removeUpgrade={this.removeUpgrade}
                                changeViewFilter={this.changeViewFilter}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Grid item>
              <Button
                disabled
                fullWidth
                variant="outlined"
                size="medium"
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={() => this.changeViewFilter({ type: 'add command' })}
              >
                <AddIcon
                  size="small"
                  style={{ marginRight: 5 }}
                />
                Command
              </Button>
            </Grid>
            <Grid item>
              <ButtonGroup
                fullWidth
                variant="outlined"
                size="medium"
                style={{ marginBottom: 10 }}
              >
                <Button disabled onClick={() => this.changeViewFilter({ type: 'add objective' })}>
                  <AddIcon
                    size="small"
                    style={{ marginRight: 5 }}
                  />
                  Objective
                </Button>
                <Button disabled onClick={() => this.changeViewFilter({ type: 'add deployment' })}>
                  <AddIcon
                    size="small"
                    style={{ marginRight: 5 }}
                  />
                  Deployment
                </Button>
                <Button disabled onClick={() => this.changeViewFilter({ type: 'add condition' })}>
                  <AddIcon
                    size="small"
                    style={{ marginRight: 5 }}
                  />
                  Condition
                </Button>
              </ButtonGroup>
            </Grid>
            <div
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
            <Grid
              item
              container
              direction="row"
              justify="center"
              alignItems="center"
              style={{ marginTop: 10 }}
            >
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    this.copyLinkToClipboard('Legion HQ Link');
                    handleOpenSnackbar('Copied link to clipboard!');
                  }}
                >
                  <LinkIcon style={{ marginRight: 5 }} />
                  Legion HQ Link
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <LinkIcon style={{ marginRight: 5 }} />
                  Tabletop Admiral Link
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <ImageIcon style={{ marginRight: 5 }} />
                  Image Export
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    this.copyTextToClipboard();
                    handleOpenSnackbar('Copied text to clipboard!');
                  }}
                >
                  <ListAltIcon style={{ marginRight: 5 }} />
                  Text Export
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <PrintIcon style={{ marginRight: 5 }} />
                  Print
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <SaveIcon style={{ marginRight: 5 }} />
                  Save
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <CallSplitIcon style={{ marginRight: 5 }} />
                  Fork List
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  <ZoomOutMapIcon style={{ marginRight: 5 }} />
                  Display Mode
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              <div style={{ marginBottom: '250px' }} />
            </Grid>
          </div>
        </div>
      </Grid>
    );
    let rightPaneMessage = undefined;

    if (viewFilter.type === 'add upgrade'
      && currentList.units[viewFilter.unitsIndex].upgradesEquipped[viewFilter.upgradesIndex]) {
      const upgradeTypeIcon = (
        <img
          src={upgradeTypes[viewFilter.upgradeType].iconLocation}
          alt={viewFilter.upgradeType}
          style={{
            width: 25,
            height: 25,
            marginRight: 5,
            marginLeft: 5
          }}
        />
      );
      rightPaneMessage = (
        <Typography
          variant="h6"
          color="primary"
        >
          Swapping out {upgradeTypeIcon} {`${allCards[currentList.units[viewFilter.unitsIndex].upgradesEquipped[viewFilter.upgradesIndex]].cardName}`}...
        </Typography>
      );
    }
    const rightPane = (
      <Grid
        item
        container
        spacing={1}
        md={7}
        direction="column"
        justify="flex-start"
      >
        {viewFilter.type !== '' && (
          <Grid
            item
            container
            spacing={1}
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item xs={1} />
            <Grid item xs={8}>
              {viewFilter.type === 'add unit' && (
                <ButtonGroup
                  fullWidth
                  size="medium"
                  variant="outlined"
                  color="primary"
                >
                  <Button
                    disabled={unitStackSize === 1}
                    onClick={this.decrementUnitStackSize}
                  >
                    <RemoveIcon />
                  </Button>
                  <Button>
                    {`Stack Size: ${unitStackSize}`}
                  </Button>
                  <Button
                    disabled={unitStackSize === 10}
                    onClick={this.incrementUnitStackSize}
                  >
                    <AddIcon />
                  </Button>
                </ButtonGroup>
              )}
              {rightPaneMessage}
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={1}>
              <Button
                fullWidth
                size="medium"
                color="secondary"
                variant="contained"
                onClick={() => this.changeViewFilter({ type: '' })}
              >
                <CloseIcon />
              </Button>
            </Grid>
            <Grid item xs={1} />
          </Grid>
        )}
        <Grid
          item
          style={{
            overflowY: 'scroll',
            maxHeight: '100vh'
          }}
        >
          {this.generateRightPaneContent(
            viewFilter,
            currentList
          )}
          <Grid item>
            <div style={{ marginBottom: '100px' }} />
          </Grid>
        </Grid>
      </Grid>
    );

    return (
      <Grid
        container
        direction="column"
        style={{
          marginTop: 60,
          padding: 5
        }}
      >
        <Grid
          item
          container
          xs={12}
          direction="column"
          justify="flex-start"
          alignItems="center"
        >
          {this.generateTopContent(viewFilter, currentList)}
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction="row"
        >
          {(!mobile || viewFilter.type === '') && leftPane}
          {(!mobile || viewFilter.type !== '') && rightPane}
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction="column"
          justify="flex-start"
          alignItems="center"
        >
          {this.generateBottomContent(viewFilter, currentList)}
        </Grid>
      </Grid>
    );
  }
}

export default ListContainer;
