import React from 'react';
import Axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import mergeImages from 'merge-images';
import domtoimage from 'dom-to-image-more';
import copy from 'clipboard-copy';
import ReactToPrint from 'react-to-print';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';
import Chip from '@material-ui/core/Chip';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import LinkIcon from '@material-ui/icons/Link';
import PrintIcon from '@material-ui/icons/Print';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SaveIcon from '@material-ui/icons/Save';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import ImageIcon from '@material-ui/icons/Image';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import ClearIcon from '@material-ui/icons/Clear';
import CardImage from '../components/CardImage';
import UnitRow from '../components/UnitRow';
import CommandChip from '../components/CommandChip';
import DataContext from '../components/DataContext';
import ListPrintText from '../components/ListPrintText';
import auth0Client from '../components/Auth';

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
    applyUpgradeToAll: false,
    viewFilter: {
      type: ''
    }
  }

  componentDidMount() {
    const { factions } = this.context;
    const {
      match,
      currentList,
      changeActiveTab,
      changeCurrentList
    } = this.props;
    if (factions[match.params.faction] && !match.params.listString) {
      changeCurrentList({ ...currentList, faction: match.params.faction });
      changeActiveTab(1);
    } else if (Number.parseInt(match.params.faction) > 999) {
      const listId = match.params.faction;
      Axios.get(`https://api.legion-hq.com:3000/lists/${listId}`).then((response) => {
        if (response.data.length > 0) {
          changeCurrentList(response.data[0]);
          changeActiveTab(1);
        } else {
          this.props.history.push('/');
          changeActiveTab(0);
        }
      }).catch((error) => {
        alert(`Failed to load list ${listId}.`);
        this.props.history.push('/');
        changeActiveTab(0);
      });
    } else {
      this.convertMatchToList(match);
      changeActiveTab(1);
    }
  }

  convertMatchToList = (match) => {
    const { factions, allCards } = this.context;
    const {
      currentList,
      changeActiveTab,
      changeCurrentList
    } = this.props;
    this.setState({ loadingList: true });
    let listCode = '';
    if (factions[match.params.faction]) listCode = match.params.listString;
    else listCode = match.params.faction;
    let invalidFormat = false;
    let faction = factions[match.params.faction] ? match.params.faction : '';
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
            currentList.uniques.push(unitId);
            if (allCards[unitId].rank === 'commander' || allCards[unitId].rank === 'operative') {
              currentList.commanders.push(allCards[unitId].cardName);
            }
          }
          if (!invalidFormat) {
            let unitObject = {
              unitId,
              count: Number.parseInt(unitCount),
              upgradesEquipped: new Array(allCards[unitId].upgradeBar.length).fill(undefined),
              hasUniques: allCards[unitId].isUnique,
              totalUnitCost: allCards[unitId].cost * unitCount,
              additionalUpgradeSlots: [],
              unitObjectString: `${unitId}`
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
                const upgradeCard = allCards[upgradeId];
                if (upgradeCard.cardName.includes('Comms Technician')) {
                  unitObject.additionalUpgradeSlots.push('comms');
                } else if (upgradeCard.cardName.includes('Captain')) {
                  unitObject.additionalUpgradeSlots.push('training');
                } else if (upgradeCard.cardName.includes('Specialist')) {
                  unitObject.additionalUpgradeSlots.push('gear');
                }
                const upgradeBar = [...allCards[unitId].upgradeBar, ...unitObject.additionalUpgradeSlots];
                if (currentList.uniques.includes(upgradeId) || upgradesEquipped.includes(upgradeId)) {
                  // if upgrade is in uniques list or is already equipped => invalidate
                  invalidFormat = true;
                } else if (allCards[upgradeId].cardSubtype !== upgradeBar[i]) {
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
                  unitObject.unitObjectString += upgradeId;
                }
              } else upgradesEquipped.push(undefined);
            });
            unitObject.upgradesEquipped = upgradesEquipped;
            if (!invalidFormat) {
              if (currentList.unitObjectStrings.includes(unitObject.unitObjectString)) {
                const index = currentList.unitObjectStrings.indexOf(unitObject.unitObjectString);
                unitObjects[index].count += unitObject.count;
              } else {
                unitObjects.push(unitObject);
                currentList.unitObjectStrings.push(unitObject.unitObjectString);
              }
              currentList.pointTotal += unitObject.totalUnitCost;
            }
          }
        } else invalidFormat = true;
      } else if (urlString.charAt(0) && urlString.charAt(1)) {
        const cardId = `${urlString.charAt(0)}${urlString.charAt(1)}`;
        if (allCards[cardId] && (allCards[cardId].cardType === 'command' || allCards[cardId].cardType === 'battle')) {
          if (allCards[cardId].cardType === 'command') {
            if (currentList.commandCards.length < 7) {
              currentList.commandCards.push(cardId);
              currentList.commandCards = currentList.commandCards.sort((firstId, secondId) => {
                const firstType = Number.parseInt(allCards[firstId].cardSubtype);
                const secondType = Number.parseInt(allCards[secondId].cardSubtype);
                if (firstType > secondType) return 1;
                else if (firstType < secondType) return -1;
                return 0;
              });
            }
          } else if (allCards[cardId].cardType === 'battle') {
            switch (allCards[cardId].cardSubtype) {
              case 'objective':
                currentList.objectiveCards.push(cardId);
                break;
              case 'condition':
                currentList.conditionCards.push(cardId);
                break;
              case 'deployment':
                currentList.deploymentCards.push(cardId);
                break;
              default:
                invalidFormat = true;
            }
          } else invalidFormat = true;
        } else invalidFormat = true;
      } else invalidFormat = true;
      if (invalidFormat) return;
    });
    if (invalidFormat) {
      currentList.units = [];
      currentList.faction = 'rebels';
      alert('Invalid List Format - Defaulting to Rebels...');
    } else {
      unitObjects.forEach((unitObject) => {
        currentList.unitCounts[allCards[unitObject.unitId].rank] += Number.parseInt(unitObject.count);
      });
      currentList.units = unitObjects;
      currentList.faction = faction;
      currentList.mode = 'standard mode';
    }
    this.setState({
      loadingList: false
    }, changeCurrentList({ ...currentList }));
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
      currentList
    } = this.props;
    const correctColor = 'primary';
    const errorColor = 'error';
    if (!currentList.unitCounts) return correctColor;
    if (currentList.mode === 'standard mode') {
      switch (rank) {
        case 'commander':
          if (currentList.unitCounts[rank] < 1 || currentList.unitCounts[rank] > 2) return errorColor;
          break;
        case 'operative':
          if (currentList.unitCounts[rank] > 2) return errorColor;
          break;
        case 'corps':
          if (currentList.unitCounts[rank] < 3 || currentList.unitCounts[rank] > 6) return errorColor;
          break;
        case 'special':
          if (currentList.unitCounts[rank] > 3) return errorColor;
          break;
        case 'support':
          if (currentList.unitCounts[rank] > 3) return errorColor;
          break;
        case 'heavy':
          if (currentList.unitCounts[rank] > 2) return errorColor;
          break;
        default:
          return errorColor;
      }
    } else if (currentList.mode === 'grand army mode') {
      switch (rank) {
        case 'commander':
          if (currentList.unitCounts[rank] < 1 || currentList.unitCounts[rank] > 4) return errorColor;
          break;
        case 'operative':
          if (currentList.unitCounts[rank] > 4) return errorColor;
          break;
        case 'corps':
          if (currentList.unitCounts[rank] < 6 || currentList.unitCounts[rank] > 10) return errorColor;
          break;
        case 'special':
          if (currentList.unitCounts[rank] > 5) return errorColor;
          break;
        case 'support':
          if (currentList.unitCounts[rank] > 5) return errorColor;
          break;
        case 'heavy':
          if (currentList.unitCounts[rank] > 4) return errorColor;
          break;
        default:
          return errorColor;
      }
    } else if (currentList.mode === '500-point mode') {
      switch (rank) {
        case 'commander':
          if (currentList.unitCounts[rank] < 1 || currentList.unitCounts[rank] > 1) return errorColor;
          break;
        case 'operative':
          if (currentList.unitCounts[rank] > 1) return errorColor;
          break;
        case 'corps':
          if (currentList.unitCounts[rank] < 2 || currentList.unitCounts[rank] > 4) return errorColor;
          break;
        case 'special':
          if (currentList.unitCounts[rank] > 2) return errorColor;
          break;
        case 'support':
          if (currentList.unitCounts[rank] > 2) return errorColor;
          break;
        case 'heavy':
          if (currentList.unitCounts[rank] > 1) return errorColor;
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
    return undefined;
  }

  changeViewFilter = (viewFilter) => {
    this.setState({
      viewFilter,
      unitStackSize: 1,
      applyUpgradeToAll: false
    });
  }

  copyUnitRow = (unitsIndex) => {
    const {
      allCards
    } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const unitObjectToCopy = JSON.parse(JSON.stringify(currentList.units[unitsIndex]));
    if (!unitObjectToCopy.hasUniques) {
      currentList.units.splice(unitsIndex, 0, unitObjectToCopy);
    }
    changeCurrentList(currentList);
  }

  incrementUnitCount = (unitsIndex) => {
    const { allCards } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    if (!currentList.units[unitsIndex].hasUniques) {
      currentList.units[unitsIndex].count += 1;
    }
    changeCurrentList(currentList);
  }

  decrementUnitCount = (unitsIndex) => {
    const { allCards } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    if (currentList.units[unitsIndex].count === 1) {
      this.removeUnit(unitsIndex);
      return;
    }
    if (!currentList.units[unitsIndex].hasUniques
      && currentList.units[unitsIndex].count > 0) {
      currentList.units[unitsIndex].count -= 1;
    }
    changeCurrentList(currentList);
  }

  removeUnit = (unitsIndex) => {
    const {
      allCards
    } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    this.changeViewFilter({ type: '' });
    const unitObject = currentList.units[unitsIndex];
    if (unitObject.hasUniques) {
      if (currentList.uniques.includes(unitObject.unitId)) {
        currentList.uniques.splice(currentList.uniques.indexOf(unitObject.unitId), 1);
        if (allCards[unitObject.unitId].rank === 'commander' || allCards[unitObject.unitId].rank === 'operative') {
          currentList.commandCards.forEach((commandCardId, i) => {
            const commandCardCommander = allCards[commandCardId].commander;
            if (currentList.commanders.indexOf(commandCardCommander) >= 0
              && commandCardCommander === allCards[unitObject.unitId].cardName) {
              this.removeCommand(i);
            }
          });
          currentList.commanders.splice(currentList.commanders.indexOf(allCards[unitObject.unitId].cardName), 1);
        }
      }
      unitObject.upgradesEquipped.forEach((upgradeEquipped, i) => {
        if (upgradeEquipped && allCards[upgradeEquipped.upgradeId] && allCards[upgradeEquipped.upgradeId].isUnique) {
          currentList.uniques.splice(i, 1);
        }
      });
    }
    currentList.unitObjectStrings.splice(currentList.unitObjectStrings.indexOf(unitObject.unitObjectString), 1);
    currentList.units.splice(unitsIndex, 1);
    changeCurrentList(currentList);
    this.changeViewFilter({ type: '' });
  };

  generateUnitObjectString(unitObject) {
    return `${unitObject.unitId}${unitObject.upgradesEquipped.join('')}`;
  }

  addUpgradeCard = (upgradeCardId, unitsIndex, upgradesIndex) => {
    const {
      allCards
    } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const { applyUpgradeToAll } = this.state;
    const unitObject = currentList.units[unitsIndex];
    const upgradeCard = allCards[upgradeCardId];
    const currentUpgradeCardId = unitObject.upgradesEquipped[upgradesIndex];
    let unitObjectString = this.generateUnitObjectString(unitObject);
    if (applyUpgradeToAll && !upgradeCard.isUnique) {
      unitObject.upgradesEquipped[upgradesIndex] = upgradeCardId;
      if (upgradeCard.cardName.includes('Comms Technician')) {
        unitObject.upgradesEquipped.push(undefined);
        unitObject.additionalUpgradeSlots.push('comms');
      } else if (upgradeCard.cardName.includes('Captain')) {
        unitObject.upgradesEquipped.push(undefined);
        unitObject.additionalUpgradeSlots.push('training');
      } else if (upgradeCard.cardName.includes('Specialist')) {
        unitObject.upgradesEquipped.push(undefined);
        unitObject.additionalUpgradeSlots.push('gear');
      }
      unitObjectString = this.generateUnitObjectString(unitObject);
      if (currentList.unitObjectStrings.indexOf(unitObjectString) > 0) {
        currentList.units[currentList.unitObjectStrings.indexOf(unitObjectString)].count += unitObject.count;
        currentList.units.splice(unitsIndex, 1);
        currentList.unitObjectStrings.splice(unitsIndex, 1);
      } else {
        unitObject.unitObjectString = unitObjectString;
        currentList.unitObject = unitObject;
        currentList.unitObjectStrings[unitsIndex] = unitObject.unitObjectString;
      }
      changeCurrentList(currentList);
      this.changeViewFilter({ type: '' });
    } else if (currentUpgradeCardId) {
      this.swapUpgradeCard(upgradeCardId, unitsIndex, upgradesIndex);
    } else {
      if (upgradeCard.isUnique) {
        currentList.uniques.push(upgradeCardId);
        unitObject.hasUniques = true;
      }
      const newUnitObject = JSON.parse(JSON.stringify(unitObject));
      newUnitObject.count = 1;
      newUnitObject.upgradesEquipped[upgradesIndex] = upgradeCardId;
      if (upgradeCard.cardName.includes('Comms Technician')) {
        newUnitObject.upgradesEquipped.push(undefined);
        newUnitObject.additionalUpgradeSlots.push('comms');
      } else if (upgradeCard.cardName.includes('Captain')) {
        newUnitObject.upgradesEquipped.push(undefined);
        newUnitObject.additionalUpgradeSlots.push('training');
      } else if (upgradeCard.cardName.includes('Specialist')) {
        newUnitObject.upgradesEquipped.push(undefined);
        newUnitObject.additionalUpgradeSlots.push('gear');
      }
      newUnitObject.unitObjectString = this.generateUnitObjectString(newUnitObject);
      if (currentList.unitObjectStrings.includes(newUnitObject.unitObjectString)) { // new combination already exists
        currentList.units[currentList.unitObjectStrings.indexOf(newUnitObject.unitObjectString)].count += 1;
        if (currentList.units[currentList.unitObjectStrings.indexOf(unitObjectString)].count === 1) { // if there was only one left, delete it
          this.removeUnit(unitsIndex);
        } else { // otherwise just decrement its count
          currentList.units[currentList.unitObjectStrings.indexOf(unitObjectString)].count -= 1;
        }
      } else { // new combination doesn't exist, update in place
        if (unitObject.count === 1) {
          unitObject.upgradesEquipped[upgradesIndex] = upgradeCardId;
          if (upgradeCard.cardName.includes('Comms Technician')) {
            unitObject.upgradesEquipped.push(undefined);
            unitObject.additionalUpgradeSlots.push('comms');
          } else if (upgradeCard.cardName.includes('Captain')) {
            unitObject.upgradesEquipped.push(undefined);
            unitObject.additionalUpgradeSlots.push('training');
          } else if (upgradeCard.cardName.includes('Specialist')) {
            unitObject.upgradesEquipped.push(undefined);
            unitObject.additionalUpgradeSlots.push('gear');
          }
          unitObject.unitObjectString = this.generateUnitObjectString(unitObject);
          currentList.unitObjectStrings[unitsIndex] = unitObject.unitObjectString;
        } else {
          unitObject.count -= 1;
          currentList.units.splice(unitsIndex + 1, 0, newUnitObject);
          currentList.unitObjectStrings.splice(unitsIndex + 1, 0, newUnitObject.unitObjectString);
        }
      }
      changeCurrentList(currentList);
      this.changeViewFilter({ type: '' });
    }
  }

  swapUpgradeCard = (newUpgradeCardId, unitsIndex, upgradesIndex) => {
    const {
      allCards
    } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    const unitObject = currentList.units[unitsIndex];
    const oldUpgradeCardId = currentList.units[unitsIndex].upgradesEquipped[upgradesIndex];
    const oldUpgradeCard = allCards[oldUpgradeCardId];
    const newUpgradeCard = allCards[newUpgradeCardId];
    // this.removeUpgrade(unitsIndex, upgradesIndex);
    if (oldUpgradeCard.isUnique) {
      currentList.uniques.splice(currentList.uniques.indexOf(oldUpgradeCardId));
    }
    if (newUpgradeCard.isUnique) {
      currentList.uniques.push(newUpgradeCardId);
      unitObject.hasUniques = true;
    }
    unitObject.upgradesEquipped[upgradesIndex] = newUpgradeCardId;
    if (newUpgradeCard.cardName.includes('Comms Technician')) {
      unitObject.upgradesEquipped.push(undefined);
      unitObject.additionalUpgradeSlots.push('comms');
    } else if (newUpgradeCard.cardName.includes('Captain')) {
      unitObject.upgradesEquipped.push(undefined);
      unitObject.additionalUpgradeSlots.push('training');
    } else if (newUpgradeCard.cardName.includes('Specialist')) {
      unitObject.upgradesEquipped.push(undefined);
      unitObject.additionalUpgradeSlots.push('gear');
    }
    unitObject.unitObjectString = this.generateUnitObjectString(unitObject);
    currentList.unitObjectStrings[unitsIndex] = unitObject.unitObjectString;
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
    const unitObject = currentList.units[unitsIndex];
    const upgradeCardId = unitObject.upgradesEquipped[upgradesIndex];
    const upgradeCard = allCards[upgradeCardId];
    if (upgradeCard.isUnique && currentList.uniques.includes(upgradeCardId)) {
      currentList.uniques.splice(currentList.uniques.indexOf(upgradeCardId), 1);
    }
    if (unitObject.count === 1) {
      unitObject.upgradesEquipped[upgradesIndex] = undefined;
      if (upgradeCard.cardName.includes('Comms Technician')) {
        unitObject.additionalUpgradeSlots.splice(currentList.units[unitsIndex].additionalUpgradeSlots.indexOf('comms'), 1);
        unitObject.upgradesEquipped.pop(); // change this if there is ever another upgrade (in a different slot) that adds upgrade slots
      } else if (upgradeCard.cardName.includes('Captain')) {
        unitObject.additionalUpgradeSlots.splice(currentList.units[unitsIndex].additionalUpgradeSlots.indexOf('training'), 1);
        unitObject.upgradesEquipped.pop(); // change this if there is ever another upgrade (in a different slot) that adds upgrade slots
      } else if (upgradeCard.cardName.includes('Specialist')) {
        unitObject.additionalUpgradeSlots.splice(currentList.units[unitsIndex].additionalUpgradeSlots.lastIndexOf('gear'), 1);
        unitObject.upgradesEquipped.pop(); // change this if there is ever another upgrade (in a different slot) that adds upgrade slots
      }
      unitObject.unitObjectString = this.generateUnitObjectString(unitObject);
      if (currentList.unitObjectStrings.includes(unitObject.unitObjectString)) {
        currentList.units[currentList.unitObjectStrings.indexOf(unitObject.unitObjectString)].count += 1;
        currentList.units.splice(unitsIndex, 1);
        currentList.unitObjectStrings.splice(unitsIndex, 1);
      } else {
        currentList.unitObjectStrings[unitsIndex] = unitObject.unitObjectString;
      }
    } else { // decrement original stack, increment new stack if it exists, otherwise create it
      unitObject.count -= 1;
      const newUnitObject = JSON.parse(JSON.stringify(unitObject));
      newUnitObject.upgradesEquipped[upgradesIndex] = undefined;
      if (upgradeCard.cardName.includes('Comms Technician')) {
        newUnitObject.additionalUpgradeSlots.splice(currentList.units[unitsIndex].additionalUpgradeSlots.indexOf('comms'), 1);
        newUnitObject.upgradesEquipped.pop(); // change this if there is ever another upgrade that adds upgrade slots
      } else if (upgradeCard.cardName.includes('Captain')) {
        newUnitObject.additionalUpgradeSlots.splice(currentList.units[unitsIndex].additionalUpgradeSlots.indexOf('training'), 1);
        newUnitObject.upgradesEquipped.pop(); // change this if there is ever another upgrade (in a different slot) that adds upgrade slots
      } else if (upgradeCard.cardName.includes('Specialist')) {
        newUnitObject.additionalUpgradeSlots.splice(currentList.units[unitsIndex].additionalUpgradeSlots.lastIndexOf('gear'), 1);
        newUnitObject.upgradesEquipped.pop(); // change this if there is ever another upgrade (in a different slot) that adds upgrade slots
      }
      newUnitObject.unitObjectString = this.generateUnitObjectString(newUnitObject);
      if (currentList.unitObjectStrings.includes(newUnitObject.unitObjectString)) { // increment already existing stack
        currentList.units[currentList.unitObjectStrings.indexOf(newUnitObject.unitObjectString)].count += 1;
      } else { // create new stack
        newUnitObject.count = 1;
        currentList.units.splice(unitsIndex + 1, 0, newUnitObject);
        currentList.unitObjectStrings.splice(unitsIndex + 1, 0, newUnitObject.unitObjectString);
      }
    }
    changeCurrentList(currentList);
    this.changeViewFilter({ type: '' });
  }

  addUnitCard = (unitId, stackSize) => {
    const {
      allCards
    } = this.context;
    const unitCard = allCards[unitId];
    const unitObjectString = unitId;
    const unitStackSize = stackSize ? stackSize : this.state.unitStackSize;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    let r2d2Present = true;
    if (!currentList.uniques.includes('jg') && !currentList.uniques.includes('jh')) {
      r2d2Present = false;
    }
    if (!r2d2Present && (unitId === 'ji' || unitId === 'jj')) {
      return;
    } else if (currentList.uniques.includes(unitId) || currentList.commanders.includes(unitCard.cardName)) {
      return
    } else {
      const unitObject = {
        unitId,
        hasUniques: false,
        totalUnitCost: unitCard.cost,
        additionalUpgradeSlots: [],
        upgradesEquipped: new Array(unitCard.upgradeBar.length).fill(undefined),
        unitObjectString
      };
      if (unitCard.isUnique) {
        unitObject.count = 1; // stack size is 1
        unitObject.hasUniques = true; // unit obj has uniques
        currentList.uniques.push(unitId); // add unit to list of uniques
        currentList.units.push(unitObject); // add unit to list of units
        currentList.unitObjectStrings.push(unitObjectString);
        if (unitCard.rank === 'commander' || unitCard.rank === 'operative') {
           currentList.commanders.push(allCards[unitObject.unitId].cardName);
         }
      } else {
        if (currentList.unitObjectStrings.includes(unitObjectString)) {
          currentList.units[currentList.unitObjectStrings.indexOf(unitObjectString)].count += unitStackSize;
        } else {
          unitObject.count = unitStackSize; // stack size
          currentList.units.push(unitObject); // add to list
          currentList.unitObjectStrings.push(unitObjectString);
        }
      }
    }
    changeCurrentList(currentList);
    this.changeViewFilter({ type: '' })
  }

  addObjective = (objectiveCardId) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.objectiveCards.push(objectiveCardId);
    changeCurrentList(currentList);
  }

  removeObjective = (index) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.objectiveCards.splice(index, 1);
    changeCurrentList(currentList);
  }

  addCondition = (conditionCardId) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.conditionCards.push(conditionCardId);
    changeCurrentList(currentList);
  }

  removeCondition = (index) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.conditionCards.splice(index, 1);
    changeCurrentList(currentList);
  }

  addDeployment = (deploymentCardId) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.deploymentCards.push(deploymentCardId);
    changeCurrentList(currentList);
  }

  removeDeployment = (index) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.deploymentCards.splice(index, 1);
    changeCurrentList(currentList);
  }

  addCommandCard = (commandId) => {
    const { allCards } = this.context;
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.commandCards.push(commandId);
    currentList.commandCards = currentList.commandCards.sort((firstId, secondId) => {
      const firstType = Number.parseInt(allCards[firstId].cardSubtype);
      const secondType = Number.parseInt(allCards[secondId].cardSubtype);
      if (firstType > secondType) return 1;
      else if (firstType < secondType) return -1;
      return 0;
    });
    changeCurrentList(currentList);
  }

  removeCommand = (commandIndex) => {
    const {
      currentList,
      changeCurrentList
    } = this.props;
    currentList.commandCards.splice(commandIndex, 1);
    changeCurrentList(currentList);
  }

  generateTournamentText = () => {
    const {
      allCards
    } = this.context;
    const {
      currentList
    } = this.props;
    let listString = '';
    listString += `${currentList.title}\n`;
    listString += `${this.getPointTotalString(currentList)}\n`;
    const c3poPresent = currentList.uniques.includes('ji') || currentList.uniques.includes('jj');
    const id10Present = currentList.uniques.includes('lw');
    currentList.units.forEach((unitObject) => {
      const unitCard = allCards[unitObject.unitId];
      if (unitCard.cardName === 'C-3PO') return;
      if (unitCard.displayName === 'ID10') return;
      Array(unitObject.count).fill().forEach((singleUnitObject) => {
        if (unitCard.cardName === 'R2-D2' && c3poPresent) listString += `${unitCard.cardName} (${unitObject.totalUnitCost/unitObject.count})\n`;
        else if (unitCard.cardName === 'Iden Versio' && id10Present) listString += `${unitCard.cardName} (${unitObject.totalUnitCost/unitObject.count})\n`;
        else listString += `${unitCard.cardName} (${unitObject.totalUnitCost/unitObject.count})\n`;
        unitObject.upgradesEquipped.forEach((upgradeCardId) => {
          if (upgradeCardId) listString += ` - ${allCards[upgradeCardId].cardName} (${allCards[upgradeCardId].cost})\n`
        });
        if (unitCard.cardName === 'R2-D2' && c3poPresent) listString += ' - C-3PO (15)\n'
        if (unitCard.cardName === 'Iden Versio' && id10Present) listString += ' - ID10 (15)\n'
      });
    });
    listString += '\nCommand Cards:\n';
    currentList.commandCards.forEach((commandCardId) => {
      let numPips = '•';
      if (allCards[commandCardId].cardSubtype === '2') numPips = '••';
      else if (allCards[commandCardId].cardSubtype === '3') numPips = '•••';
      listString += `${numPips}${allCards[commandCardId].cardName}\n`;
    });
    if (currentList.commandCards.length > 0) {
      listString += '••••Standing Orders\n';
    }
    listString += '\nBattle Deck\n';
    listString += 'Objectives:\n'
    currentList.objectiveCards.forEach((objectiveCardId) => {
      listString += ` - ${allCards[objectiveCardId].cardName}\n`;
    });
    listString += 'Conditions:\n'
    currentList.conditionCards.forEach((conditionCardId) => {
      listString += ` - ${allCards[conditionCardId].cardName}\n`;
    });
    listString += 'Deployments:\n'
    currentList.deploymentCards.forEach((deploymentCardId) => {
      listString += ` - ${allCards[deploymentCardId].cardName}\n`;
    });
    return listString;
  }

  copyTournamentTextToClipboard = () => {
    copy(this.generateTournamentText());
  }

  copyMinifiedTextToClipboard = () => {
    copy(this.generateMinifiedText());
  }

  generateMinifiedText = () => {
    const { allCards } = this.context;
    const { currentList } = this.props;
    const numActivations = currentList.units.reduce((activations, unitObject) => {
      if (unitObject.unitId !== 'ji' && unitObject.unitId !== 'jj') activations += unitObject.count;
      return activations;
    }, 0);
    let listString = '';
    listString += `${currentList.title}\n`;
    listString += `${this.getPointTotalString(currentList)} (${numActivations} ${numActivations === 1 ? 'activation' : 'activations'})`;
    listString += '\n'
    const r2d2Present = currentList.uniques.includes('jg') || currentList.uniques.includes('jh');
    const c3poPresent = currentList.uniques.includes('ji') || currentList.uniques.includes('jj');
    const idenPresent = currentList.uniques.includes('kg');
    const id10Present = currentList.uniques.includes('lw');
    currentList.units.forEach((unitObject) => {
      let noUpgrades = true;
      const unitCard = allCards[unitObject.unitId];
      if (unitObject.unitId === 'ji' || unitObject.unitId === 'jj') return;
      if (unitObject.unitId === 'lw') return;
      let upgradeString = '';
      unitObject.upgradesEquipped.forEach((upgradeCardId, upgradeIndex) => {
        if (upgradeCardId) {
          const upgradeCard = allCards[upgradeCardId];
          noUpgrades = false;
          upgradeString += `${upgradeCard.displayName ? upgradeCard.displayName : upgradeCard.cardName}, `;
        }
      });
      upgradeString = upgradeString.slice(0, -2);
      if (unitObject.unitId === 'jg' || unitObject.unitId === 'jh') {
        if (c3poPresent) listString += `R2-D2 + C-3PO${noUpgrades ? '' : ` (${upgradeString})`}`;
        else listString += `R2-D2${noUpgrades ? '' : ` (${upgradeString})`}`;
      } else if (unitObject.unitId === 'kg') {
        if (id10Present) listString += `Iden Versio + ID10${noUpgrades ? '' : ` (${upgradeString})`}`;
        else listString += `Iden Versio${noUpgrades ? '' : ` (${upgradeString})`}`;
      } else {
        listString += `${unitObject.count === 1 ? '' : `${unitObject.count}× `}${unitCard.displayName ? unitCard.displayName : unitCard.cardName}${noUpgrades ? '' : ` (${upgradeString})`}`;
      }
      listString += '\n';
    });
    currentList.commandCards.forEach((commandCardId, index) => {
      if (index === 0) listString += 'Commands: ';
      let numPips = '•';
      if (allCards[commandCardId].cardSubtype === '2') numPips = '••';
      else if (allCards[commandCardId].cardSubtype === '3') numPips = '•••';
      listString += `${numPips}${allCards[commandCardId].cardName}, `;
    });
    if (currentList.commandCards.length > 0) {
      listString += '••••Standing Orders';
    }
    return listString;
  }

  generateListText = () => {
    const {
      allCards
    } = this.context;
    const {
      currentList
    } = this.props;
    const numActivations = currentList.units.reduce((activations, unitObject) => {
      if (unitObject.unitId !== 'ji' && unitObject.unitId !== 'jj') activations += unitObject.count;
      return activations;
    }, 0);
    let listString = '';
    listString += `${currentList.title}\n`;
    listString += `${this.getPointTotalString(currentList)} (${numActivations} ${numActivations === 1 ? 'activation' : 'activations'})`;
    listString += '\n';
    const unitString = {
      commander: '',
      operative: '',
      corps: '',
      special: '',
      support: '',
      heavy: ''
    };
    const r2d2Present = currentList.uniques.includes('jg') || currentList.uniques.includes('jh');
    const c3poPresent = currentList.uniques.includes('ji') || currentList.uniques.includes('jj');
    const idenPresent = currentList.uniques.includes('kg');
    const id10Present = currentList.uniques.includes('lw');
    currentList.units.forEach((unitObject) => {
      let noUpgrades = true;
      let r2d2c3po = false;
      let idenid10 = false;
      const unitCard = allCards[unitObject.unitId];
      if (unitObject.unitId === 'ji' || unitObject.unitId === 'jj') return;
      if (unitObject.unitId === 'lw') return;
      unitObject.upgradesEquipped.forEach((upgradeCardId) => {
        if (upgradeCardId) noUpgrades = false;
      });
      if (r2d2Present && c3poPresent && (unitObject.unitId === 'jg' || unitObject.unitId === 'jh')) {
        r2d2c3po = true;
        unitString[unitCard.rank] += ` - R2-D2 (35) + C-3PO (15):`;
      } else if (idenPresent && id10Present && (unitObject.unitId === 'kg')) {
        idenid10 = true;
        unitString[unitCard.rank] += ` - Iden Versio (100) + ID10 (15):`;
      } else if (noUpgrades && unitObject.count === 1) unitString[unitCard.rank] += ` - ${unitCard.displayName ? unitCard.displayName : unitCard.cardName}`;
      else if (noUpgrades && unitObject.count > 1) unitString[unitCard.rank] += ` - ${unitObject.count}× ${unitCard.displayName ? unitCard.displayName : unitCard.cardName} (${unitCard.cost})`;
      else if (unitObject.count > 1) unitString[unitCard.rank] += ` - ${unitObject.count}× ${unitCard.displayName ? unitCard.displayName : unitCard.cardName} (${unitCard.cost}):`;
      else unitString[unitCard.rank] += ` - ${unitCard.displayName ? unitCard.displayName : unitCard.cardName} (${unitCard.cost}):`;
      let upgradeString = '';
      unitObject.upgradesEquipped.forEach((upgradeCardId, i) => {
        const upgradeCard = allCards[upgradeCardId];
        if (upgradeCardId) upgradeString += `${upgradeCard.displayName ? upgradeCard.displayName : upgradeCard.cardName} (${upgradeCard.cost}), `
        if (i === unitObject.upgradesEquipped.length - 1) {
          upgradeString = upgradeString.substring(0, upgradeString.length - 2);
          if (upgradeString.length > 0) {
            if (r2d2c3po || idenid10) unitString[unitCard.rank] += ` ${upgradeString} = ${unitObject.totalUnitCost + 15}\n`;
            else unitString[unitCard.rank] += ` ${upgradeString} = ${unitObject.totalUnitCost}\n`;
          } else {
            if (r2d2c3po || idenid10) unitString[unitCard.rank] += ` = ${unitObject.totalUnitCost + 15}\n`;
            else unitString[unitCard.rank] += ` = ${unitObject.totalUnitCost}\n`;
          }
        }
      });
    });
    if (unitString.commander !== '') listString += 'Commanders:\n';
    listString += unitString.commander;
    if (unitString.operative !== '') listString += 'Operatives:\n';
    listString += unitString.operative;
    if (unitString.corps !== '') listString += 'Corps:\n';
    listString += unitString.corps;
    if (unitString.special !== '') listString += 'Special Forces:\n';
    listString += unitString.special;
    if (unitString.support !== '') listString += 'Supports:\n';
    listString += unitString.support;
    if (unitString.heavy !== '') listString += 'Heavies:\n';
    listString += unitString.heavy;
    listString += '\n';
    currentList.commandCards.forEach((commandCardId) => {
      let numPips = '•';
      if (allCards[commandCardId].cardSubtype === '2') numPips = '••';
      else if (allCards[commandCardId].cardSubtype === '3') numPips = '•••';
      listString += `${numPips}${allCards[commandCardId].cardName}, `;
    });
    if (currentList.commandCards.length > 0) {
      listString += '••••Standing Orders';
    }
    return listString;
  }

  copyTextToClipboard = () => {
    copy(this.generateListText());
  }

  generateLink = (linkType) => {
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
      currentList.commandCards.forEach((commandCardId) => {
        urlStrings.push(commandCardId);
      });
      currentList.objectiveCards.forEach((objectiveCardId) => {
        urlStrings.push(objectiveCardId);
      });
      currentList.deploymentCards.forEach((deploymentCardId) => {
        urlStrings.push(deploymentCardId);
      });
      currentList.conditionCards.forEach((conditionCardId) => {
        urlStrings.push(conditionCardId);
      });
    }
    return `${urlStrings.join(',')}`;
  }

  copyLinkToClipboard = (linkType) => {
    const { currentList } = this.props;
    copy(`https://legion-hq.herokuapp.com/list/${currentList.faction}/${this.generateLink(linkType)}`);
  }

  generateCustomLocation = (cardId) => {
    const {
      allCards
    } = this.context;
    const {
      currentList
    } = this.props;
    let customLocation = undefined;
    const cardData = allCards[cardId];
    if (currentList.faction === 'republic' || currentList.faction === 'separatists') {
      if (cardData.cardName === 'Ambush') customLocation = 'Ambush2.jpeg';
      else if (cardData.cardName === 'Push') customLocation = 'Push2.jpeg';
      else if (cardData.cardName === 'Assault') customLocation = 'Assault2.jpeg';
      else if (cardData.cardName === 'Standing Orders') customLocation = 'Standing Orders2.jpeg';
    }
    return customLocation;
  }

  generateCustomImageLocation = (cardId) => {
    const { allCards } = this.context;
    const customImageLocation = this.generateCustomLocation(cardId);
    if (customImageLocation) {
      if (allCards[cardId].cardType === 'command') {
        return `/images/commandCards/${customImageLocation}`;
      }
    }
    return undefined;
  }

  generateCustomIconLocation = (cardId) => {
    const { allCards } = this.context;
    const customImageLocation = this.generateCustomLocation(cardId);
    if (customImageLocation) {
      if (allCards[cardId].cardType === 'command') {
        return `/images/commandIcons/${customImageLocation}`;
      }
    }
    return undefined;
  }

  generateRightPaneContent(viewFilter, currentList, rightPaneWidth) {
    const {
      allCards
    } = this.context;
    const allIds = Object.keys(allCards);
    let content = undefined;
    if (viewFilter.type === 'add unit') {
      let r2d2Present = true;
      let idenPresent = true;
      if (!currentList.uniques.includes('jg') && !currentList.uniques.includes('jh')) {
        r2d2Present = false;
      } else if (!currentList.uniques.includes('kg')) {
        idenPresent = false;
      }
      content = allIds.filter((cardId) => {
          if (allCards[cardId].cardType === 'unit') {
            if (allCards[cardId].rank !== viewFilter.rank) return false;
            else if (allCards[cardId].faction !== currentList.faction) return false;
            return true;
          } else return false;
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
              size="vsmall"
              cardId={unitCardId}
              key={unitCardId}
              handleClick={() => this.addUnitCard(unitCardId)}
              isDisabled={currentList.uniques.includes(unitCardId)
                || currentList.commanders.includes(allCards[unitCardId].cardName)
                || (!r2d2Present && (unitCardId === 'ji' || unitCardId === 'jj'))
                || (!idenPresent && unitCardId === 'lw')
              }
            />
          </div>
        ));
    } else if (viewFilter.type === 'add upgrade') {
      content = [];
      let equippedUpgrades = [];
      let enabledUpgrades = [];
      let disabledUpgrades = [];
      allIds.filter((cardId) => {
        if (allCards[cardId].cardType === 'upgrade') {
          if (allCards[cardId].cost < 0) return false;
          if (allCards[cardId].cardSubtype !== viewFilter.upgradeType) return false;
          else if (allCards[cardId].faction !== ''
            && allCards[cardId].faction !== currentList.faction) return false;
          return true;
        } else return false;
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
        // if (upgradeCard.isUnique && unitObject.count > 1) isDisabled = true;
        let alreadyEquipped = false;
        // Is upgrade (if unique) already in the list?
        if (currentList.uniques.includes(upgradeCardId)) isDisabled = true;

        // TODO: make a function for this one-off bullshit
        if (viewFilter.upgradeType === 'gear' && unitCard.cardName === 'B1 Battle Droids') {
          isDisabled = upgradeCard.cardName !== 'Electrobinoculars'; // disable all but Electrobinocs for B1s
        }

        if (!isDisabled) { // Does upgrade meet requirements?
          let requirementsMet = 0;
          upgradeCard.requirements.forEach((requirement) => { // Check force affinity/name requirement
            if (requirement instanceof Array) { // specifically for Linked Targeting Array case
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
              size="vsmall"
              showKeywords={true}
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
              size="vsmall"
              showKeywords={true}
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
              size="vsmall"
              showKeywords={true}
              cardId={upgradeCardId}
              key={upgradeCardId}
              isDisabled={true}
            />
          </div>
        );
      });
      content = [...equippedUpgrades, ...enabledUpgrades, ...disabledUpgrades];
    } else if (viewFilter.type === 'add commands') {
      content = [];
      const availableCommands = [];
      let disabledCommands = [];
      allIds.filter((cardId) => {
        if (allCards[cardId].cardType === 'command') {
          const commandCard = allCards[cardId];
          if (cardId === 'aa') return false;
          else if (commandCard.faction === '' || commandCard.faction === currentList.faction) return true;
          return false;
        } else return false;
      }).sort((firstId, secondId) => {
        const firstType = Number.parseInt(allCards[firstId].cardSubtype);
        const secondType = Number.parseInt(allCards[secondId].cardSubtype);
        if (firstType > secondType) return 1;
        else if (firstType < secondType) return -1;
        return 0;
      }).forEach((commandCardId) => {
        const commandCard = allCards[commandCardId];
        if (currentList.commandCards.includes(commandCardId)) {
          availableCommands.push(
            <div
              key={commandCardId}
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
                customImageLocation={this.generateCustomImageLocation(commandCardId)}
                handleClick={() => this.removeCommand(currentList.commandCards.indexOf(commandCardId))}
                additionalStyles={{
                  border: '2px solid lightblue'
                }}
              />
            </div>
          );
        } else if (commandCard.commander === '' || currentList.commanders.includes(commandCard.commander)) {
          let pipCount = 0;
          currentList.commandCards.forEach((currentCommandId) => {
            if (allCards[currentCommandId].cardSubtype === commandCard.cardSubtype) pipCount += 1;
          });
          if (pipCount >= 2) disabledCommands.push(commandCardId);
          else {
            availableCommands.push(
              <div
                key={commandCardId}
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
                  customImageLocation={this.generateCustomImageLocation(commandCardId)}
                  handleClick={() => this.addCommandCard(commandCardId)}
                />
              </div>
            );
          };
        } else disabledCommands.push(commandCardId);
      });
      disabledCommands = disabledCommands.map((commandCardId) => {
        return (
          <div
            key={commandCardId}
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
              isDisabled={true}
              customImageLocation={this.generateCustomImageLocation(commandCardId)}
            />
          </div>
        );
      });
      content = [...availableCommands, ...disabledCommands];
    } else if (viewFilter.type === 'add objectives') {
      content = [];
      let disabledBattleCards = [];
      allIds.filter((cardId) => {
        if (allCards[cardId].cardType === 'battle' && allCards[cardId].cardSubtype === 'objective') {
          return true;
        } return false;
      }).forEach((objectiveCardId) => {
        if (currentList.objectiveCards.includes(objectiveCardId)) {
          content.push(
            <div
              key={objectiveCardId}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-top'
              }}
            >
              <CardImage
                showKeywords={true}
                size="vsmall"
                cardId={objectiveCardId}
                key={objectiveCardId}
                handleClick={() => this.removeObjective(currentList.objectiveCards.indexOf(objectiveCardId))}
                additionalStyles={{
                  border: '2px solid lightblue',
                  opacity: 0.5
                }}
              />
            </div>
          );
        } else if (currentList.objectiveCards.length > 3) {
          disabledBattleCards.push(objectiveCardId);
        } else {
          content.push(
            <div
              key={objectiveCardId}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-top'
              }}
            >
              <CardImage
                showKeywords={true}
                size="vsmall"
                cardId={objectiveCardId}
                key={objectiveCardId}
                handleClick={() => this.addObjective(objectiveCardId)}
              />
            </div>
          );
        }
      });
      disabledBattleCards = disabledBattleCards.map((battleCardId) => {
        return (
          <div
            key={battleCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              disabled={true}
              showKeywords={true}
              size="vsmall"
              cardId={battleCardId}
              key={battleCardId}
            />
          </div>
        );
      });
      content = [...content, ...disabledBattleCards];
    } else if (viewFilter.type === 'add deployments') {
      content = [];
      let disabledBattleCards = [];
      allIds.filter((cardId) => {
        if (allCards[cardId].cardType === 'battle' && allCards[cardId].cardSubtype === 'deployment') {
          return true;
        } return false;
      }).forEach((deploymentCardId) => {
        if (currentList.deploymentCards.includes(deploymentCardId)) {
          content.push(
            <div
              key={deploymentCardId}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-top'
              }}
            >
              <CardImage
                showKeywords={true}
                size="vsmall"
                cardId={deploymentCardId}
                key={deploymentCardId}
                handleClick={() => this.removeDeployment(currentList.deploymentCards.indexOf(deploymentCardId))}
                additionalStyles={{
                  border: '2px solid lightblue',
                  opacity: 0.5
                }}
              />
            </div>
          );
        } else if (currentList.deploymentCards.length > 3) {
          disabledBattleCards.push(deploymentCardId);
        } else {
          content.push(
            <div
              key={deploymentCardId}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-top'
              }}
            >
              <CardImage
                showKeywords={true}
                size="vsmall"
                cardId={deploymentCardId}
                key={deploymentCardId}
                handleClick={() => this.addDeployment(deploymentCardId)}
              />
            </div>
          );
        }
      });
      disabledBattleCards = disabledBattleCards.map((battleCardId) => {
        return (
          <div
            key={battleCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              disabled={true}
              showKeywords={true}
              size="vsmall"
              cardId={battleCardId}
              key={battleCardId}
            />
          </div>
        );
      });
      content = [...content, ...disabledBattleCards];
    } else if (viewFilter.type === 'add conditions') {
      content = [];
      let disabledBattleCards = [];
      allIds.filter((cardId) => {
        if (allCards[cardId].cardType === 'battle' && allCards[cardId].cardSubtype === 'condition') {
          return true;
        } return false;
      }).forEach((conditionCardId) => {
        if (currentList.conditionCards.includes(conditionCardId)) {
          content.push(
            <div
              key={conditionCardId}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-top'
              }}
            >
              <CardImage
                showKeywords={true}
                size="vsmall"
                cardId={conditionCardId}
                key={conditionCardId}
                handleClick={() => this.removeCondition(currentList.conditionCards.indexOf(conditionCardId))}
                additionalStyles={{
                  border: '2px solid lightblue',
                  opacity: 0.5
                }}
              />
            </div>
          );
        } else if (currentList.conditionCards.length > 3) {
          disabledBattleCards.push(conditionCardId);
        } else {
          content.push(
            <div
              key={conditionCardId}
              style={{
                display: 'inline-block',
                verticalAlign: 'text-top'
              }}
            >
              <CardImage
                showKeywords={true}
                size="vsmall"
                cardId={conditionCardId}
                key={conditionCardId}
                handleClick={() => this.addCondition(conditionCardId)}
              />
            </div>
          );
        }
      });
      disabledBattleCards = disabledBattleCards.map((battleCardId) => {
        return (
          <div
            key={battleCardId}
            style={{
              display: 'inline-block',
              verticalAlign: 'text-top'
            }}
          >
            <CardImage
              disabled={true}
              showKeywords={true}
              size="vsmall"
              cardId={battleCardId}
              key={battleCardId}
            />
          </div>
        );
      });
      content = [...content, ...disabledBattleCards];
    } else if (viewFilter.type === 'view card') {
      content = (
        <Grid
          item
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid item>
            <CardImage
              showKeywords={true}
              size="medium"
              cardId={viewFilter.cardId}
              key={viewFilter.cardId}
            />
          </Grid>
        </Grid>
      );
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
                showKeywords={rightPaneWidth === 12}
                size="vsmall"
                cardId={unitObject.unitId}
                key={unitObject.unitId}
                unitCount={unitObject.count}
                handleClick={() => this.changeViewFilter({ type: 'view card', cardId: unitObject.unitId })}
              />
            </Grid>
            {unitObject.upgradesEquipped.map((upgradeCardId) => {
              if (!upgradeCardId) return undefined;
              return (
                <Grid item key={upgradeCardId}>
                  <CardImage
                    showKeywords={rightPaneWidth === 12}
                    size="vsmall"
                    cardId={upgradeCardId}
                    key={upgradeCardId}
                    handleClick={() => this.changeViewFilter({ type: 'view card', cardId: upgradeCardId })}
                  />
                </Grid>
              );
            })}
            <Divider />
          </Grid>
        );
      });
      content.push(
        <Grid
          item
          key="commands"
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
        >
          {currentList.commandCards.map((commandCardId) => {
            return (
              <Grid item key={commandCardId}>
                <CardImage
                  showKeywords={rightPaneWidth === 12}
                  size="vsmall"
                  cardId={commandCardId}
                  key={commandCardId}
                  customImageLocation={this.generateCustomImageLocation(commandCardId)}
                  handleClick={() => this.changeViewFilter({ type: 'view card', cardId: commandCardId })}
                />
              </Grid>
            );
          })}
        </Grid>
      );
    }
    return content;
  }

  getPointTotalString(currentList) {
    if (currentList.mode === '500-point mode') {
      return `${currentList.pointTotal}/500`;
    } else if (currentList.mode === 'standard mode') {
      return `${currentList.pointTotal}/800`;
    } else if (currentList.mode === 'grand army mode') {
      return `${currentList.pointTotal}/1600`;
    }
  }

  addImageToNode = () => {
    const {
      userSettings
    } = this.context;
    const listTitleNode = document.getElementById('listTitle');
    const listContentNode = document.getElementById('listContent');
    const combinedImage = new Image();
    const titleImage = new Image();
    const contentImage = new Image();
    let backgroundColor = 'white';
    if (userSettings.themeColor === 'light') backgroundColor = 'white';
    else if (userSettings.themeColor === 'dark') backgroundColor = '#303030';
    else backgroundColor = '#394d5b';
    domtoimage.toJpeg(listTitleNode, {
      style: {
        backgroundColor: userSettings.themeColor === 'light' ? 'white' : '#303030',
        font: 'small-caps bold 24px/1 sans-serif'
      }
    }).then((listTitleUrl) => {
      titleImage.src = listTitleUrl;
      domtoimage.toJpeg(listContentNode, {
        style: {
          backgroundColor: userSettings.themeColor === 'light' ? 'white' : '#303030'
        }
      }).then((listContentUrl) => {
        contentImage.src = listContentUrl;
        mergeImages([
          { src: listTitleUrl, x: -4, y: 0 },
          { src: listContentUrl, x: 0, y: 55 }
        ]).then((b64) => {
          combinedImage.src = b64;
          const existingImageNode = document.getElementById('listImage');
          while (existingImageNode.firstChild) {
            existingImageNode.removeChild(existingImageNode.firstChild);
          }
          existingImageNode.appendChild(combinedImage);
          const { handleOpenSnackbar } = this.props;
          handleOpenSnackbar('Image has been generated!');
        });
      });
    });
  }

  generateAddUpgradeView = (viewFilter, currentList, rightPaneWidth) => {
    const { allCards } = this.context;
    const allIds = Object.keys(allCards);
    let content = undefined;
    content = [];
    const forceAffinity = {
      'dark side': ['empire', 'separatists'],
      'light side': ['republic', 'rebels'],
      '': ''
    };
    const unitObject = currentList.units[viewFilter.unitsIndex];
    const unitCard = allCards[unitObject.unitId];
    unitObject.upgradesEquipped.forEach((equippedUpgradeId) => {
      if (equippedUpgradeId) {
        content.push();
      } else {

      }
    });
    // allIds.filter((cardId) => {
    //   return (
    //     allCards[cardId].cardType === 'upgrade' &&
    //     allCards[cardId].cost > -1 &&
    //     (allCards[cardId].faction === '' || allCards[cardId].faction === currentList.faction)
    //   );
    // }).forEach((upgradeCardId) => {
    //   const upgradeCard = allCards[upgradeCardId];
    //
    // });
  }

  render() {
    const {
      classes,
      factions,
      ranks,
      upgradeTypes,
      allCards,
      userSettings
    } = this.context;
    const {
      viewFilter,
      unitStackSize
    } = this.state;
    const {
      width,
      userId,
      currentList,
      onDragEnd,
      handleChangeTitle,
      handleOpenSnackbar,
      toggleListMode,
      clearList,
      saveCurrentList,
      forkCurrentList,
      changeUserId,
      reauthenticate,
      reauthMessage
    } = this.props;
    const listMinifiedText = this.generateMinifiedText();
    const listTournamentText = this.generateTournamentText();
    const listUrl = this.generateLink('Legion HQ Link');
    const mobile = width === 'xs' || width === 'sm';
    let commandRows = [];
    const pointTotalString = this.getPointTotalString(currentList);
    currentList.commandCards.forEach((commandId, i) => {
      commandRows.push(
        <CommandChip
          key={commandId}
          currentList={currentList}
          commandIndex={i}
          commandId={commandId}
          changeViewFilter={this.changeViewFilter}
          customIconLocation={this.generateCustomIconLocation(commandId)}
        />
      );
    });
    if (currentList.commandCards.length > 0) {
      commandRows.push(
        <CommandChip
          key="aa"
          currentList={currentList}
          commandId={'aa'}
          changeViewFilter={this.changeViewFilter}
          customIconLocation={this.generateCustomIconLocation('aa')}
        />
      );
    }
    let leftPaneWidth = 5;
    let rightPaneWidth = 7;
    if (userSettings.listLeftPaneWidth === 'none') {
      leftPaneWidth = 0;
      rightPaneWidth = 12;
    } else if (userSettings.listLeftPaneWidth === 'little less than half') {
      leftPaneWidth = 5;
      rightPaneWidth = 7;
    } else if (userSettings.listLeftPaneWidth === 'half') {
      leftPaneWidth = 6;
      rightPaneWidth = 6;
    } else if (userSettings.listLeftPaneWidth === 'little more than half') {
      leftPaneWidth = 7;
      rightPaneWidth = 5;
    }
    const numActivations = currentList.units.reduce((activations, unitObject) => {
      if (
        unitObject.unitId !== 'ji' &&
        unitObject.unitId !== 'jj' &&
        unitObject.unitId !== 'lw'
      ) activations += unitObject.count;
      return activations;
    }, 0);
    const leftPane = leftPaneWidth === 0 ? undefined : (
      <Grid
        item
        container
        md={leftPaneWidth}
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid
          item
          container
          spacing={1}
          direction="row"
          justify="center"
          alignItems="center"
          id="listTitle"
          style={{ marginBottom: 15 }}
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
              value={currentList.title}
              placeholder="Untitled"
              onChange={handleChangeTitle}
              helperText={`${numActivations} ${numActivations === 1 ? 'activation' : 'activations'}`}
            />
          </Grid>
          <Grid item>
            <Button
              size="small"
              variant="outlined"
              onClick={toggleListMode}
            >
              <Typography variant="subtitle2" color="primary">
                {pointTotalString}
              </Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid
          item
          container
          spacing={1}
          direction="row"
          justify="center"
          alignItems="center"
          style={{ marginBottom: 10 }}
        >
          {Object.keys(ranks).map((r) => {
             return (
               <div key={r} className={classes.rankButtonContainer}>
                 <Badge badgeContent={currentList.unitCounts ? currentList.unitCounts[r] : 0} showZero color={this.getBadgeColor(r)}>
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
            marginLeft: 'calc(50% - 185px)',
            minWidth: 360,
            borderBottom: '1px solid rgba(255, 255, 255, 0.23)'
          }}
        />
        <div
          style={{
            maxHeight: '100vh',
            overflowY: 'scroll',
            overflowX: 'hidden'
          }}
        >
          <div>
            <div id="listContent" style={{ paddingBottom: 54 }}>
              <DragDropContext onDragStart={() => this.changeViewFilter({ type: '' })} onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                      {currentList.units.map((unitObject, i) => (
                        <Draggable
                          key={i}
                          index={i}
                          draggableId={`${unitObject.unitId}_${i}`}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                            >
                              <UnitRow
                                unitsIndex={i}
                                unitObject={unitObject}
                                incrementUnitCount={this.incrementUnitCount}
                                decrementUnitCount={this.decrementUnitCount}
                                copyUnitRow={this.copyUnitRow}
                                removeUnit={this.removeUnit}
                                removeUpgrade={this.removeUpgrade}
                                changeViewFilter={this.changeViewFilter}
                                dragHandle={{...provided.dragHandleProps}}
                              />
                              <Divider />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Grid
                item
                container
                direction="row"
                justify="center"
                alignItems="center"
                style={{ marginTop: 4, marginBottom: 2 }}
              >
                {currentList.commandCards.length < 6 && (
                  <Grid item>
                    <Chip
                      label="Commands"
                      color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                      icon={<AddIcon size="small" />}
                      onClick={() => this.changeViewFilter({ type: 'add commands' })}
                      style={{ marginRight: 4, marginBottom: 2 }}
                    />
                  </Grid>
                )}
                {commandRows}
              </Grid>
            </div>
            <Divider />
            <Grid
              item
              container
              direction="row"
              justify="center"
              alignItems="center"
              style={{ marginTop: 4, marginBottom: 4 }}
            >
              {currentList.objectiveCards.length < 4 && (
                <Grid item>
                  <Chip
                    label="Objective"
                    color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                    icon={<AddIcon size="small" />}
                    onClick={() => this.changeViewFilter({ type: 'add objectives' })}
                    style={{ marginRight: 4, marginBottom: 2 }}
                  />
                </Grid>
              )}
              {currentList.objectiveCards.map((objectiveCardId) => {
                return (
                  <Grid item key={objectiveCardId}>
                    <Chip
                      color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                      label={allCards[objectiveCardId].cardName}
                      onClick={() => this.changeViewFilter({ type: 'add objectives' })}
                      style={{ marginRight: 4, marginBottom: 2 }}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="center"
              alignItems="center"
              style={{ marginTop: 4, marginBottom: 4 }}
            >
              {currentList.deploymentCards.length < 4 && (
                <Grid item>
                  <Chip
                    color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                    label="Deployment"
                    icon={<AddIcon size="small" />}
                    onClick={() => this.changeViewFilter({ type: 'add deployments' })}
                    style={{ marginRight: 4, marginBottom: 2 }}
                  />
                </Grid>
              )}
              {currentList.deploymentCards.map((deploymentCardId) => {
                return (
                  <Grid item key={deploymentCardId}>
                    <Chip
                      color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                      label={allCards[deploymentCardId].cardName}
                      onClick={() => this.changeViewFilter({ type: 'add deployments' })}
                      style={{ marginRight: 4, marginBottom: 2 }}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="center"
              alignItems="center"
              style={{ marginTop: 4, marginBottom: 4 }}
            >
              {currentList.conditionCards.length < 4 && (
                <Grid item>
                  <Chip
                    color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                    label="Condition"
                    icon={<AddIcon size="small" />}
                    onClick={() => this.changeViewFilter({ type: 'add conditions' })}
                    style={{ marginRight: 4, marginBottom: 2 }}
                  />
                </Grid>
              )}
              {currentList.conditionCards.map((conditionCardId) => {
                return (
                  <Grid item key={conditionCardId}>
                    <Chip
                      color={userSettings.themeColor === 'default' ? 'secondary' : undefined}
                      label={allCards[conditionCardId].cardName}
                      onClick={() => this.changeViewFilter({ type: 'add conditions' })}
                      style={{ marginRight: 4, marginBottom: 2 }}
                    />
                  </Grid>
                );
              })}
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
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => this.addImageToNode()}
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
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    this.copyTournamentTextToClipboard();
                    handleOpenSnackbar('Copied text to clipboard!');
                  }}
                >
                  <ListAltIcon style={{ marginRight: 5 }} />
                  (Tournament) Text Export
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    this.copyMinifiedTextToClipboard();
                    handleOpenSnackbar('Copied text to clipboard!');
                  }}
                >
                  <ListAltIcon style={{ marginRight: 5 }} />
                  (Minimal) Text Export
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <ReactToPrint
                  content={() => this.componentRef}
                  trigger={() => (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      <PrintIcon style={{ marginRight: 5 }} />
                      Print
                    </Button>
                  )}
                />
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  disabled={userId === -1}
                  onClick={() => saveCurrentList()}
                >
                  <SaveIcon style={{ marginRight: 5 }} />
                  Save
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  disabled={userId < 999 || !currentList.listId || userId !== currentList.userId}
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => forkCurrentList()}
                >
                  <CallSplitIcon style={{ marginRight: 5 }} />
                  Fork List
                </Button>
              </Grid>
              <Grid item style={{ marginRight: 10, marginBottom: 10 }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    this.changeViewFilter({ type: '' });
                    clearList();
                  }}
                >
                  <ClearIcon style={{ marginRight: 5 }} />
                  Clear List
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              <div
                id="listImage"
              />
            </Grid>
            <Grid item style={{ display: 'none' }}>
              <ListPrintText ref={el => (this.componentRef = el)} listTournamentText={listTournamentText} listUrl={listUrl} />
            </Grid>
            <Grid item style={{ marginLeft: '47%' }}>
              {userId > 0 && (
                <Typography variant="caption" color="primary">
                  {`ID ${userId}`}
                </Typography>
              )}
            </Grid>
            <Grid item>
              <div style={{ marginBottom: 500 }} />
            </Grid>
          </div>
        </div>
      </Grid>
    );
    let rightPaneMessage = undefined;
    if (viewFilter.swappingUpgrades) {
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
    } else if (viewFilter.type === 'add commands') {
      let commandCardString = '';
      currentList.commandCards.forEach((commandCardId) => {
        let numPips = '•';
        if (allCards[commandCardId].cardSubtype === '2') numPips = '••';
        else if (allCards[commandCardId].cardSubtype === '3') numPips = '•••';
        commandCardString += `${numPips}${allCards[commandCardId].cardName}, `;
      });
      commandCardString += '••••Standing Orders';
      rightPaneMessage = (
        <Typography
          variant="caption"
          color="primary"
        >
          {`${currentList.commandCards.length + 1} command ${currentList.commandCards.length === 0 ? 'card' : 'cards'} selected: ${commandCardString}`}
        </Typography>
      );
    }
    const rightPane = (
      <Grid
        item
        container
        spacing={1}
        md={rightPaneWidth}
        direction="column"
        justify="flex-start"
        style={{ marginLeft: rightPaneWidth === 12 ? '10%' : 0 }}
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
              {!viewFilter.swappingUpgrades &&
                viewFilter.unitsIndex > -1 &&
                currentList.units[viewFilter.unitsIndex].count > 1 && (
                <FormGroup row>
                  <FormControlLabel
                    label={
                      <Typography
                        variant="h6"
                        color="primary"
                      >
                        Apply to all
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={this.state.applyUpgradeToAll}
                        onChange={() => {
                          this.setState({
                            applyUpgradeToAll: !this.state.applyUpgradeToAll
                          });
                        }}
                      />
                    }
                  >
                  </FormControlLabel>
                </FormGroup>
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
            currentList,
            rightPaneWidth
          )}
          <Grid item>
            <div style={{ marginBottom: 250 }} />
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
          padding: 1
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
          {(!mobile || viewFilter.type !== '' || rightPaneWidth === 12) && rightPane}
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

/*
<Grid item style={{ marginRight: 10, marginBottom: 10 }}>
  <Button
    variant="outlined"
    size="small"
    color="primary"
    disabled={userId !== -1}
    onClick={reauthenticate}
  >
    <VpnKeyIcon style={{ marginRight: 5 }} />
    {reauthMessage === '' ? (
      'Reauthenticate'
    ) : (
      reauthMessage
    )}
  </Button>
</Grid>
*/

export default withWidth()(ListContainer);
