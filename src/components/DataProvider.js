import React from 'react';
import Axios from 'axios';
import compose from 'recompose/compose';
import {
  withStyles,
  createMuiTheme,
  MuiThemeProvider
} from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Data from '../data.json';
import DataContext from './DataContext';

// input: marginTop: '-0.875rem !important'

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  input: {
    display: 'inline-flex !important',
    padding: 0
  },
  valueContainer: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'flex-end',
    overflow: 'hidden'
  },
  chip: {
    marginRight: 4,
    marginBottom: 2,
    height: 'auto !important'
  },
  keywordChip: {
    marginRight: 4,
    height: 'auto !important'
  },
  cardAction: {
    display: 'inline-block !important'
  },
  noOptionsMessage: {
    padding: 8,
    fontSize: '16px !important'
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: 2,
    left: 0,
    right: 0
  },
  rankButton: {
    width: 35,
    height: 35,
    cursor: 'pointer',
    '&:hover': {
      opacity: '0.8'
    }
  },
  rankButtonContainer: {
    display: 'inline-flex',
    marginRight: 15
  },
  textAlignCenter: { textAlign: 'center' },
  divider: {
    marginTop: 8,
    marginBottom: 8,
    height: 1,
    width: 250,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  factionListsContainer: {
    position: 'absolute',
    top: '25vh',
    textAlign: 'center'
  },
  googleButtonContainer: {
    position: 'absolute',
    bottom: 24,
    marginTop: 48
  },
  viewResetButton: {
    zIndex: 1700,
    position: 'absolute',
    top: 75,
    right: 25
  },
  cardImage: {
    margin: 5
  },
  grayHoverOver: {
    display: 'flex',
    cursor: 'pointer',
    borderRadius: 5,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  disabledUpgradeTypeButton: {
    width: 25,
    height: 25,
    marginTop: 4,
    marginRight: 4,
    opacity: 0.5,
    '&:hover': {
      opacity: 0.25
    }
  },
  upgradeTypeButton: {
    width: 25,
    height: 25,
    marginTop: 4,
    marginRight: 4,
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8
    }
  }
});

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#fafafa'
    },
    secondary: {
      main: '#757575'
    },
    error: {
      main: '#f44336'
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: 'Aero Matics Regular'
  }
});

class DataProvider extends React.Component {

  state = {
    cardTypes: ['Units', 'Upgrades', 'Commands', 'Battle'],
    factions: {
      rebels: {
        longName: 'Rebel Alliance',
        shortName: 'Rebels',
        color: '#b71c1c',
        iconLocation: '/images/rebelsIconWhite.svg'
      },
      empire: {
        longName: 'Galactic Empire',
        shortName: 'Empire',
        color: '#555555',
        iconLocation: '/images/empireIconWhite.svg'
      },
      republic: {
        longName: 'Galactic Republic',
        shortName: 'Republic',
        color: '#97084f',
        iconLocation: '/images/republicIconWhite.svg'
      },
      separatists: {
        longName: 'Separatist Alliance',
        shortName: 'Separatists',
        color: '#3f51b6',
        iconLocation: '/images/separatistsIconWhite.svg'
      }
    },
    ranks: {
      commander: {
        displayName: 'Commander',
        iconLocation: '/images/rankIcons/commander.png'
      },
      operative: {
        displayName: 'Operative',
        iconLocation: '/images/rankIcons/operative.png'
      },
      corps: {
        displayName: 'Corps',
        iconLocation: '/images/rankIcons/corps.png'
      },
      special: {
        displayName: 'Special Forces',
        iconLocation: '/images/rankIcons/special.png'
      },
      support: {
        displayName: 'Support',
        iconLocation: '/images/rankIcons/support.png'
      },
      heavy: {
        displayName: 'Heavy Weapon',
        iconLocation: '/images/rankIcons/heavy.png'
      }
    },
    upgradeTypes: {
      'heavy weapon': {
        displayName: 'Heavy Weapon',
        iconLocation: '/images/upgradeTypeIcons/Heavy%20Weapon.png'
      },
      personnel: {
        displayName: 'Personnel',
        iconLocation: '/images/upgradeTypeIcons/personnel.png'
      },
      force: {
        displayName: 'Force',
        iconLocation: '/images/upgradeTypeIcons/force.png'
      },
      command: {
        displayName: 'Command',
        iconLocation: '/images/upgradeTypeIcons/command.png'
      },
      hardpoint: {
        displayName: 'Hardpoint',
        iconLocation: '/images/upgradeTypeIcons/hardpoint.png'
      },
      gear: {
        displayName: 'Gear',
        iconLocation: '/images/upgradeTypeIcons/gear.png'
      },
      grenades: {
        displayName: 'Grenades',
        iconLocation: '/images/upgradeTypeIcons/grenades.png'
      },
      comms: {
        displayName: 'Comms',
        iconLocation: '/images/upgradeTypeIcons/comms.png'
      },
      pilot: {
        displayName: 'Pilot',
        iconLocation: '/images/upgradeTypeIcons/pilot.png'
      },
      training: {
        displayName: 'Training',
        iconLocation: '/images/upgradeTypeIcons/training.png'
      },
      generator: {
        displayName: 'Generator',
        iconLocation: '/images/upgradeTypeIcons/generator.png'
      },
      armament: {
        displayName: 'Armament',
        iconLocation: '/images/upgradeTypeIcons/armament.png'
      },
      crew: {
        displayName: 'Crew',
        iconLocation: '/images/upgradeTypeIcons/crew.png'
      }
    },
    allCards: {},
    unitCardsById: [],
    upgradeCardsById: [],
    commandCardsById: [],
    battleCardsById: [],
    keywordDict: {},
    tabRoutes: {
      0: '/',
      1: '/list',
      2: '/cards',
      3: '/stats',
      4: '/settings',
      5: '/info',
      '/': 0,
      '/list': 1,
      '/cards': 2,
      '/stats': 3,
      '/settings': 4,
      '/info': 5
    }
  }

  componentDidMount() {
    this.setState({ ...Data });
    // Axios.get('/cards').then((cardsResponse) => {
    //   Axios.get('/keywords.json').then((keywordsResponse) => {
    //     this.setState({
    //       keywordDict: { ...keywordsResponse.data },
    //       loadingCards: false,
    //       ...cardsResponse.data
    //     });
    //   });
    // });
  }

  render() {
    const {
      width,
      classes
    } = this.props;
    console.log(this.state);
    return (
      <DataContext.Provider
        value={{
          width,
          classes,
          ...this.state
        }}
      >
        <MuiThemeProvider theme={theme}>
          {this.props.children}
        </MuiThemeProvider>
      </DataContext.Provider>
    );
  }
}

export default compose(
  withStyles(styles),
  withWidth()
)(DataProvider);
