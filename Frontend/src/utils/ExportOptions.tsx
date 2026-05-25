/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';  // Import toast for error handling

import { useIsDemoUser } from '@/utils/demoUser';  // Assuming the hook is defined like this

type ExportOptionsProps = {
  data: any[];
  tableContainerId: string;
  fileName: string; // Common file name prop
  dictionary: any;
};

const ExportOptions: React.FC<ExportOptionsProps> = ({ data, tableContainerId, fileName, dictionary }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDemoUser = useIsDemoUser(); // Check if the user is a demo user

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportError = () => {
    toast.error(dictionary.exportError);  // Assuming the error message is set directly in the dictionary
  };

  const exportToExcel = () => {
    if (isDemoUser && isDemoUser.isDemoUser === true) {
      handleExportError();

return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    handleClose();
  };

  const handlePrint = () => {
    if (isDemoUser && isDemoUser.isDemoUser === true) {
      handleExportError();

return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    const printContent = document.getElementById(tableContainerId)?.innerHTML || '';

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
        <head>
          <title>${fileName}</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      console.error('Failed to open print window');
    }

    handleClose();
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClick} startIcon={<MoreVertIcon />}>
        {dictionary?.navigation?.export} {/* Directly access export from navigation */}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem>
          <CSVLink
            data={data}
            filename={`${fileName}.csv`}
            className="export-button"
            onClick={(event: any) => {
              if (isDemoUser && isDemoUser.isDemoUser === true) {
                event.preventDefault(); // Prevent export for demo users
                handleExportError(); // Show error for demo users
              } else {
                handleClose(); // Proceed with the export if the user is not a demo user
              }
            }}
          >
            {dictionary?.navigation?.csv} {/* Directly access CSV label from dictionary */}
          </CSVLink>
        </MenuItem>
        <MenuItem onClick={exportToExcel}>
          {dictionary?.navigation?.excel} {/* Directly access Excel label from dictionary */}
        </MenuItem>
        {/* <MenuItem onClick={exportToPDF}>{dictionary?.navigation?.pdf}</MenuItem> */}
        <MenuItem onClick={handlePrint}>
          {dictionary?.navigation?.print} {/* Directly access Print label from dictionary */}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ExportOptions;
