import React from 'react';
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
import CardImage from '../components/CardImage';
import DataContext from '../components/DataContext';

class ListContainer extends React.Component {

  static contextType = DataContext;

  state = {
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

  incrementUnitStackSize = () => {
    const { unitStackSize } = this.state;
    if (unitStackSize < 11) this.setState({ unitStackSize: unitStackSize + 1 });
  }

  decrementUnitStackSize = () => {
    const { unitStackSize } = this.state;
    if (unitStackSize > 1) this.setState({ unitStackSize: unitStackSize - 1 });
  }

  componentDidMount() {
    const { factions } = this.context;
    const {
      match,
      currentList,
      changeActiveTab,
      changeCurrentList
    } = this.props;
    if (factions[match.params.id]) changeCurrentList({ ...currentList, faction: match.params.id });
    else changeCurrentList({ ...currentList, faction: 'rebels' });
    changeActiveTab(1);
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

  changeViewFilter(viewFilter) {
    this.setState({ viewFilter });
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
      currentList
    } = this.props;
    const unitCard = allCards[unitId];
    const unit = {
      unitId,
      upgradesEquipped: new Array(unitCard.upgradeBar.length)
    };
    if (currentList.uniques.includes(unitId)) {
      return
    } else if (unitCard.isUnique) {
      unit.count = 1;
      currentList.uniques.push(unitId);
      unitCounts[unitCard.rank] += 1;
      currentList.pointTotal += unitCard.cost;
      currentList.units.push(unit);
    } else {
      unit.count = unitStackSize;
      unitCounts[unitCard.rank] += unitStackSize;
      currentList.pointTotal += unitCard.cost * unitStackSize;
      currentList.units.push(unit);
    }
    if (currentList.pointTotal > 900) currentList.mode = 'grand army';
    else currentList.mode = 'standard';
    this.setState({
      currentList,
      unitCounts,
      unitStackSize: 1
    }, this.changeViewFilter({ type: '' }));
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
              handleClick={this.addUnitCard}
              isDisabled={currentList.uniques.includes(unitCardId)}
            />
          </div>
        ));
    } else if (viewFilter.type === 'add upgrade') {
      content = upgradeCardsById.filter((upgradeCardId) => {
        if (allCards[upgradeCardId].cardSubtype !== viewFilter.upgradeType) return false;
        else if (currentList.uniques.includes(upgradeCardId)) return false;
        else if (allCards[upgradeCardId].faction !== ''
          && allCards[upgradeCardId].faction !== currentList.faction) return false;
        return true;
      }).map((upgradeCardId) => (
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
          />
        </div>
      ));
    } else {
      content = currentList.units.map((unitObject) => {
        return (
          <div>
            <CardImage
              showKeywords={false}
              size="small"
              cardId={unitObject.unitId}
              key={unitObject.unitId}
            />
            <Divider inset />
          </div>
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
      currentList
    } = this.props;
    const mobile = width === 'xs' || width === 'sm';
    console.log(allCards);
    console.log(currentList);
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
                 width: 25
               }}
               onClick={() => this.changeViewFilter({ type: 'add upgrade', upgradeType: 'heavy weapon' })}
             />
            )}
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              placeholder="Untitled"
              helperText={currentList.mode}
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
            minWidth: '50ch',
            borderBottom: '1px solid rgba(255, 255, 255, 0.23)',
            marginBottom: '2px'
          }}
        />
        <div
          style={{
            width: '95%',
            maxHeight: '100vh',
            overflowY: 'scroll',
            textAlign: 'center'
          }}
        >
          <Grid
            item
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
          >
            {currentList.units.map((unitObject) => {
              return (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                  >
                    {unitObject.unitId}
                  </Button>
                </Grid>
              );
            })}
            <Grid item>
              <div style={{ marginBottom: '200px' }} />
            </Grid>
          </Grid>
        </div>
      </Grid>
    );
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
            <Grid item xs={8}>
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
            </Grid>
            <Grid item xs={2} />
            <Grid item xs={2}>
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
