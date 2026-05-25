/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

interface TablePaginationProps {
  table: any;
  totalResults: number;
  pageIndex: number;
  pageSize: number;
  handlePageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  handlePageSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dictionary: any
}

const TablePaginationComponent = ({
  table,
  totalResults,
  pageIndex,
  pageSize,
  handlePageChange,
  handlePageSizeChange,
  dictionary,
}: TablePaginationProps) => {
  const from = totalResults === 0 ? 0 : (pageIndex - 1) * pageSize + 1
  const to = Math.min(((pageIndex - 1) * pageSize) + pageSize, totalResults)

  // Safely fetch translation template
// Safely fetch translation template with fallback
const translationTemplate = dictionary?.navigation?.showingEntries || 
  'Showing {from} to {to} of {total} entries';

// Replace placeholders with actual values
const translation = translationTemplate
  .replace('{from}', from.toString())
  .replace('{to}', to.toString())
  .replace('{total}', totalResults.toString());

  return (
    <div className="flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2">
      <Typography color="text.disabled">
        {translation}
      </Typography>

      <Pagination
        shape="rounded"
        color="primary"
        variant="tonal"
        count={Math.ceil(totalResults / pageSize)}
        page={pageIndex}
        onChange={handlePageChange}
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default TablePaginationComponent
