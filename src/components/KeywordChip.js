import React from 'react';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

class KeywordChip extends React.PureComponent {
  state = { open: false };

  handleTooltipOpen = () => this.setState({ open: true });

  handleTooltipClose = () => this.setState({ open: false });

  render() {
    const { open } = this.state;
    const {
      keyword,
      keywordDefinition,
      className,
      classes,
      onDelete,
      additionalStyles
    } = this.props;
    return (
      <ClickAwayListener onClickAway={this.handleTooltipClose}>
        <Tooltip
          title={(
            <Typography variant="body1">
              {keywordDefinition}
            </Typography>
          )}
          open={open}
          onClose={this.handleTooltipClose}
        >
          <Chip
            label={keyword}
            onClick={this.handleTooltipOpen}
            onDelete={onDelete ? onDelete : undefined}
          />
        </Tooltip>
      </ClickAwayListener>
    );
  }
}

export default KeywordChip;
