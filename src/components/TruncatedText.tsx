import { Tooltip } from '@mui/material';
import React from 'react';

// One line of text cut off with "…"; the full text shows on hover. Renders
// nothing for null, undefined or empty text.
export const TruncatedText = ({
  text,
}: {
  text: string | null | undefined;
}) => {
  if (!text) {
    return null;
  }
  return (
    <Tooltip title={text}>
      <span
        style={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
};
