import React from 'react';
import MultiSelect from 'react-select';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
// import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
// import FilterListIcon from '@material-ui/icons/FilterList';
// import SortIcon from '@material-ui/icons/Sort';
import CancelIcon from '@material-ui/icons/Cancel';
import DataContext from '../components/DataContext';

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          color: 'textSecondary',
          ...props.innerProps
        }
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return(
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer} style={{ alignItems: 'flex-end' }}>{props.children}</div>;
}

function MultiValue(props) {
  const { data } = props;
  const { label, tooltip } = data;
  return (
    <Tooltip
      title={(
        <Typography variant="body1">
          {tooltip ? tooltip : 'No definition found.'}
        </Typography>
      )}
    >
      <Chip
        tabIndex={-1}
        label={label}
        onDelete={props.removeProps.onClick}
        className={props.selectProps.classes.chip}
        deleteIcon={<CancelIcon {...props.removeProps} />}
        style={{ cursor: 'help' }}
      />
    </Tooltip>
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer
};

class CardsContainer extends React.Component {

  static contextType = DataContext;

  state = {
    single: null,
    multi: null
  }

  getCardVisibility = (card) => {
    const {
      cardTypeFilter,
      cardNameFilter,
      keywordFilter,
      factionFilter,
      rankFilter,
      upgradeTypeFilter
    } = this.props;
    let cardTypesFound = false;
    let cardNameFound = false;
    let keywordsFound = false;
    let factionsFound = false;
    let ranksFound = false;
    let upgradeTypesFound = false;

    if (cardTypeFilter.length === 0) cardTypesFound = true;
    else {
      cardTypesFound = false;
      if (cardTypeFilter.includes('Units') && card.cardType === 'unit') cardTypesFound = true;
      if (cardTypeFilter.includes('Upgrades') && card.cardType === 'upgrade') cardTypesFound = true;
      if (cardTypeFilter.includes('Commands') && card.cardType === 'commmand') cardTypesFound = true;
      if (cardTypeFilter.includes('Battle') && card.cardType === 'battle') cardTypesFound = true;
    }

    if (!cardNameFilter) cardNameFound = true;
    else if (cardNameFilter.value && cardNameFilter.value.includes(card.cardName)) cardNameFound = true;
    else cardNameFound = false;

    if (keywordFilter.length === 0) keywordsFound = true;
    else if (keywordFilter.some(k => card.keywords.includes(k.value))) keywordsFound = true;
    else keywordsFound = false;

    if (factionFilter.length === 0) factionsFound = true;
    else if (!card.faction && factionFilter.length === 4) factionsFound = true;
    else if (!card.faction && factionFilter.length > 0) factionsFound = false;
    else if (factionFilter.includes(card.faction)) factionsFound = true;
    else factionsFound = false;

    if (rankFilter.length === 0) ranksFound = true;
    else if (!card.rank) ranksFound = false;
    else if (rankFilter.includes(card.rank)) ranksFound = true;
    else ranksFound = false;

    if (upgradeTypeFilter.length === 0) upgradeTypesFound = true;
    else if (upgradeTypeFilter.includes(card.cardSubtype)) upgradeTypesFound = true;
    else upgradeTypesFound = false;
    const visible = cardTypesFound && cardNameFound && keywordsFound && factionsFound && ranksFound && upgradeTypesFound;
    return visible ? { display: 'block' } : { display: 'none' };
  }

  render() {
    const {
      classes,
      keywords,
      allCards,
      cardTypes,
      factions,
      ranks,
      upgradeTypes
    } = this.context;
    const {
      keywordFilter,
      setKeywordFilter,
      cardNameFilter,
      setCardNameFilter,
      cardTypeFilter,
      setCardTypeFilter,
      factionFilter,
      setFactionFilter,
      rankFilter,
      setRankFilter,
      upgradeTypeFilter,
      setUpgradeTypeFilter
    } = this.props;
    const names = Object.keys(allCards).map(cardId => ({
      label: allCards[cardId].cardName,
      value: allCards[cardId].cardName
    }));
    const selectStyles = {
      input: base => ({
        ...base,
        '& input': {
          font: 'inherit'
        }
      })
    };
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
      >
        <Grid
          item
          container
          direction="row"
          justify="center"
          alignItems="center"
          style={{
            marginTop: 60,
            marginBottom: 8
          }}
        >
          <Grid item style={{ minWidth: 300, maxWidth: '90vw', marginRight: 4 }}>
            <MultiSelect
              classes={classes}
              styles={selectStyles}
              textFieldProps={{
                label: 'Name',
                InputLabelProps: {
                  shrink: true
                }
              }}
              options={names}
              components={components}
              value={cardNameFilter}
              onChange={setCardNameFilter}
              isClearable
            />
          </Grid>
          <Grid item style={{ minWidth: 200, maxWidth: '90vw' }}>
            <MultiSelect
              classes={classes}
              styles={selectStyles}
              textFieldProps={{
                label: 'Keywords',
                InputLabelProps: {
                  shrink: true
                }
              }}
              options={Object.keys(keywords).map(keyword => ({
                value: keyword,
                label: keyword,
                tooltip: keywords[keyword]
              }))}
              components={components}
              value={keywordFilter}
              onChange={setKeywordFilter}
              isMulti
            />
          </Grid>
        </Grid>
        <Grid
          item
          container
          direction="row"
          justify="center"
          alignItems="center"
          style={{ maxWidth: '90vw', marginBottom: 8 }}
        >
          <Grid item style={{ marginRight: 4 }}>
            <FormControl
              style={{
                minWidth: 120,
                maxWidth: 300
              }}
            >
              <InputLabel>
                Card Types
              </InputLabel>
              <Select
                multiple
                value={cardTypeFilter}
                onChange={setCardTypeFilter}
                input={<Input />}
                style={{
                  maxWidth: 300
                }}
                renderValue={selected => {
                  if (selected.length === cardTypes.length) {
                    return "All";
                  } else {
                    return `${selected} `;
                  }
                }}
              >
                {cardTypes.map(cardType => (
                  <MenuItem
                    key={cardType}
                    value={cardType}
                  >
                    {cardType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item style={{ marginRight: 4  }}>
            <FormControl
              style={{
                minWidth: 100
              }}
            >
              <InputLabel>
                Factions
              </InputLabel>
              <Select
                multiple
                value={factionFilter}
                onChange={setFactionFilter}
                input={<Input />}
                renderValue={selected => {
                  if (selected.length === Object.keys(factions).length) return "All";
                  return (
                    <div>
                      {selected.map(factionName => (
                        <Avatar
                          key={factionName}
                          alt={`${factionName} icon`}
                          src={factions[factionName].iconLocation}
                          style={{
                            marginBottom: -5,
                            marginRight: 5,
                            width: 25,
                            height: 25,
                            padding: 1,
                            display: 'inline-block'
                          }}
                        />
                      ))}
                    </div>
                  );
                }}
              >
                {Object.keys(factions).map(factionName => (
                  <MenuItem
                    key={factionName}
                    value={factionName}
                    style={{
                      maxWidth: 120
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={`${factionName} icon`}
                        src={factions[factionName].iconLocation}
                        style={{
                          marginBottom: -5,
                          marginRight: 5,
                          width: 25,
                          height: 25,
                          padding: 1,
                          display: 'inline-block'
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText>
                      {factions[factionName].shortName}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {cardTypeFilter.includes('Units') && (
            <Grid item style={{ marginRight: 4  }}>
              <FormControl
                style={{
                  minWidth: 100,
                  maxWidth: 240
                }}
              >
                <InputLabel>
                  Ranks
                </InputLabel>
                <Select
                  multiple
                  value={rankFilter}
                  onChange={setRankFilter}
                  input={<Input />}
                  renderValue={selected => {
                    if (selected.length === Object.keys(ranks).length) return "All";
                    return (
                      <div>
                        {selected.map(rank => (
                          <Avatar
                            key={rank}
                            alt={`${rank} icon`}
                            src={ranks[rank].iconLocation}
                            style={{
                              marginBottom: -5,
                              marginRight: 5,
                              width: 25,
                              height: 25,
                              padding: 1,
                              display: 'inline-block'
                            }}
                          />
                        ))}
                      </div>
                    );
                  }}
                >
                  {Object.keys(ranks).map(rank => (
                    <MenuItem
                      key={rank}
                      value={rank}
                      style={{
                        maxWidth: 300
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={`${rank} icon`}
                          src={ranks[rank].iconLocation}
                          style={{
                            margin: 0,
                            width: 25,
                            height: 25
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText>
                        {ranks[rank].displayName}
                      </ListItemText>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {cardTypeFilter.includes('Upgrades') && (
            <Grid item style={{ marginRight: 4  }}>
              <FormControl
                style={{
                  minWidth: 150,
                  maxWidth: 300
                }}
              >
                <InputLabel>
                  Upgrade Types
                </InputLabel>
                <Select
                  multiple
                  value={upgradeTypeFilter}
                  onChange={setUpgradeTypeFilter}
                  input={<Input />}
                  renderValue={selected => {
                    if (selected.length === Object.keys(upgradeTypes).length) return "All";
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {selected.map(upgradeType => (
                          <Avatar
                            key={upgradeType}
                            alt={`${upgradeType} icon`}
                            src={upgradeTypes[upgradeType].iconLocation}
                            style={{
                              marginTop: 0,
                              width: 25,
                              height: 25,
                              padding: 1,
                              display: 'inline-block'
                            }}
                          />
                        ))}
                      </div>
                    );
                  }}
                >
                  {Object.keys(upgradeTypes).map(upgradeType => (
                    <MenuItem
                      key={upgradeType}
                      value={upgradeType}
                      style={{
                        maxWidth: 300
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={`${upgradeType} icon`}
                          src={upgradeTypes[upgradeType].iconLocation}
                          style={{
                            margin: 0,
                            width: 25,
                            height: 25
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText>
                        {upgradeTypes[upgradeType].displayName}
                      </ListItemText>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
        <Grid
          item
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
        >
          {Object.keys(allCards).map((cardId) => {
            const card = allCards[cardId];
            return (
              <Grid item key={cardId} style={{ marginRight: 4, marginBottom: 4, maxWidth: '95vw', ...this.getCardVisibility(card) }}>
                <img src={card.imageLocation} alt={card.displayName} style={{ maxWidth: '95vw' }} />
              </Grid>
            );
          })}
        </Grid>
        <Grid item style={{ marginTop: 24 }} />
      </Grid>
    );
  }
}

export default CardsContainer;
