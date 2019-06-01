import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
// import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import CloseIcon from '@material-ui/icons/Close';
import CardImage from '../components/CardImage';
import DataContext from '../components/DataContext';

class ListContainer extends React.Component {

  static contextType = DataContext;

  state = {
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
    if (factions[match.params.id]) changeCurrentList({ ...currentList, faction: match.params.id });
    else changeCurrentList({ ...currentList, faction: 'rebels' });
    changeActiveTab(1);
  }

  changeViewFilter = viewFilter => this.setState({ viewFilter });

  addUnitCard = (unitId) => {
    const {
      cards,
      currentList
    } = this.props;
    const { allCards } = cards;
    const unitCard = allCards.unitId;
    if (currentList.uniques.includes(unitId)) return;
    else if (unitCard.isUnique) currentList.uniques.push(unitId);
    const unit = {
      unitId,
      count: 1,
      upgradesEquipped: new Array(unitCard.upgradeBar.length)
    };
    currentList.units.push(unit);
    this.setState({
      currentList
    }, this.changeViewFilter({ type: '' }));
  }

  renderUnitCards = (allCards, unitCardsById) => {
    const { currentList } = this.props;
    const { viewFilter } = this.state;
    const renderedCards = [];
    unitCardsById.forEach((id) => {
      const unitCard = allCards[id];
      const cardStyles = {
        width: '350px',
        height: '250px',
        marginRight: 5,
        marginBottom: 5,
        borderRadius: 10
      };
      if (currentList.uniques[unitCard._id]) {
        cardStyles.opacity = 0.5;
        cardStyles.cursor = 'not-allowed';
      }
      if (unitCard.faction === currentList.faction && unitCard.rank === viewFilter.type) {
        renderedCards.push(
          <CardImage
            size="small"
            cardType="unit"
            key={unitCard.cardName}
            alt={unitCard.cardName}
            src={unitCard.imageLocation}
            showKeywords={false}
          />
        );
      }
    });
    return renderedCards;
  }

  getRankBadgeContent = () => {
    const { currentList } = this.state;

  }

  render() {
    const {
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
      viewFilter
    } = this.state;
    const {
      match,
      mobile,
      currentList
    } = this.props;
    return (
      <div>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
          style={{  marginTop: 60 }}
        >
          <Grid
            item
            container
            xs={12}
            md={6}
            direction="column"
            justify="flex-start"
            alignItems="center"
          >
            <Grid
              item
              container
              spacing={8}
              direction="row"
              justify="center"
              alignItems="flex-end"
              style={{ marginBottom: 12 }}
            >
              {currentList.faction && (
                <Grid item>
                  <Avatar
                    alt="Rebels"
                    src={factions[currentList.faction].iconLocation}
                    style={{
                      width: 25,
                      height: 25,
                      padding: 1
                    }}
                  />
                </Grid>
              )}
              <Grid item>
                <TextField
                  fullWidth
                  label="Title"
                />
              </Grid>
              <Grid item>
                <Typography variant="body1" color="primary">
                  0/800
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
            >
              {Object.keys(ranks).map((r) => {
                return (
                  <div key={r} className={classes.rankButtonContainer}>
                    <Badge badgeContent={0} showZero color="secondary">
                      <img
                        alt={ranks[r].displayName}
                        src={ranks[r].iconLocation}
                        className={classes.rankButton}
                        onClick={() => this.changeViewFilter({ type: r })}
                      />
                    </Badge>
                  </div>
                );
              })}
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            style={{ marginTop: 36 }}
          >
            {this.renderUnitCards(allCards, unitCardsById)}
          </Grid>
        </Grid>
        <div style={{ display: viewFilter.type === '' ? 'none' : 'block' }}>
          <Fab
            size="medium"
            color="inherit"
            className={classes.viewResetButton}
            onClick={() => this.changeViewFilter({ type: '' })}
          >
            <CloseIcon />
          </Fab>
        </div>
      </div>
    );
  }
}

export default ListContainer;
