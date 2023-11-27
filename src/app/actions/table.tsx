'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Action } from '@prisma/client';

interface ActionsTableProps {
  actions: Action[];
}
export default function ActionsTable({ actions }: ActionsTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'title',
      flex: 1,
    },
    {
      field: 'startDateTime',
      flex: 1,
    },
    {
      field: 'endDateTime',
      flex: 1,
    },
    {
      field: 'donationCount',
      flex: 1,
    },
    {
      field: 'note',
      flex: 1,
    },
  ];
  return (
    <Box sx={{ height: 400, width: 1 }}>
      <DataGrid
        rows={actions}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
      />
    </Box>
  );
}
