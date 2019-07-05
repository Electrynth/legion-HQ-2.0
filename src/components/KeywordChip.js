import React from 'react';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

const KeywordChip = ({ keyword, keywordDefinition, className, classes, onDelete, additionalStyles }) => (
  <Tooltip
    title={(
      <Typography variant="body1">
        {keywordDefinition}
      </Typography>
    )}
  >
    <Chip
      label={keyword}
      onDelete={onDelete ? onDelete : undefined}
    />
  </Tooltip>
);

export default KeywordChip;
