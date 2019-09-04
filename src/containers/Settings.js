import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DataContext from '../components/DataContext';


/*
default userSettings: {
  primaryColor: '',
  secondaryColor: '',
  errorColor: '',
  fontFamily: 'Aero Matics Regular',
  backgroundColor: '#303030',
  backgroundImage: true,
  themeColor: 'dark'
  list: {
    leftPaneWidth: 5,
    upgradeDisplayType: 'rows'
  }
}
*/

class SettingsContainer extends React.Component {
  static contextType = DataContext;

  state = {}

  render() {
    const {
      userSettings,
      allUserSettings,
      changeUserSettings
    } = this.context;
    return (
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography variant="h6" color="primary" style={{ marginTop: 60 }}>
            Settings
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl style={{ margin: 4, minWidth: 200 }}>
            <InputLabel htmlFor="theme-color">
              Theme Color
            </InputLabel>
            <Select
              name="themeColor"
              value={userSettings.themeColor}
              onChange={changeUserSettings}
            >
              {allUserSettings.themes.map((themeOption) => (
                <MenuItem key={themeOption} value={themeOption}>
                  {themeOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl style={{ margin: 4, minWidth: 200 }}>
            <InputLabel htmlFor="theme-color">
              Font Type
            </InputLabel>
            <Select
              name="fontFamily"
              value={userSettings.fontFamily}
              onChange={changeUserSettings}
            >
              {allUserSettings.fontFamilies.map((fontFamily) => (
                <MenuItem key={fontFamily} value={fontFamily}>
                  {fontFamily}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth style={{ margin: 4, minWidth: 200 }}>
            <InputLabel htmlFor="theme-color">
              List Builder Left Column Width
            </InputLabel>
            <Select
              name="listLeftPaneWidth"
              value={userSettings.listLeftPaneWidth}
              onChange={changeUserSettings}
            >
              {allUserSettings.listLeftPaneWidths.map((listLeftPaneWidth) => (
                <MenuItem key={listLeftPaneWidth} value={listLeftPaneWidth}>
                  {listLeftPaneWidth}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  }
}

export default SettingsContainer;
