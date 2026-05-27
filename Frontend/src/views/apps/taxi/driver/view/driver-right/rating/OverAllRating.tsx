/* eslint-disable @typescript-eslint/no-unused-vars */
// React Imports
import type { ReactElement } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type RatingDataType = {
  question: string;
  agree: number;
  disagree: number;
};

const ratingData: RatingDataType[] = [
  { question: "Ease of booking", agree: 100, disagree: 0 },
  { question: "No Bargaining", agree: 100, disagree: 0 },
  { question: "Cleanliness of the taxi", agree: 100, disagree: 0 },
  { question: "Timing & Punctuality", agree: 100, disagree: 0 },
  { question: "Crew behaviour", agree: 100, disagree: 0 }
];

const OverAllRating = (dictionary: any) => {
  return (
    <Card>
      <CardHeader title='Over All Rating' />
      <div className='overflow-x-auto' id="table-container">
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>{dictionary['navigation'].Questions}</th>
              <th>{dictionary['navigation'].Agree}	</th>
              <th>{dictionary['navigation'].Disagree}</th>
            </tr>
          </thead>
          <tbody>
            {ratingData.map((rating, index) => (
              <tr key={rating.question}>
                <td>
                    <Typography className='font-medium' color='text.primary'>
                      {rating.question}
                    </Typography>
                </td>
                <td>
                <div className="flex items-center">
                  <span className="text-green-500 mr-1">👍</span>
                  <Typography className="text-green-500">{rating.agree}%</Typography>
                </div>                </td>
                <td>
                <div className="flex items-center">
                  <span className="text-red-500 mr-1">👎</span>
                  <Typography className="text-red-500">{rating.disagree}%</Typography>
                </div>
                                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default OverAllRating
