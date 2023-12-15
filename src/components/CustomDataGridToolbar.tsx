import { Button } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { MdDownload } from 'react-icons/md';

interface Props {
  exportLink?: string;
}

export function CustomDataGridToolbar({ exportLink }: Props) {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      {exportLink && (
        <Button
          size='small'
          target='_blank'
          href={exportLink}
          startIcon={<MdDownload size={24} />}
        >
          Export
        </Button>
      )}
      <GridToolbarQuickFilter sx={{ ml: 'auto' }} />
    </GridToolbarContainer>
  );
}
