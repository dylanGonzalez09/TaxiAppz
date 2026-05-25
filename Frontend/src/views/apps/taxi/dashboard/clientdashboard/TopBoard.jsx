'use client'

import React, { useState } from 'react';

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

const LeaderBoard = ({ type,data={Today: [], "This Week": [], "This Month": [], "All Time": []},dictionary}) => {


  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  const leaderboardData = {
    'driver': {
      'Today': data["Today"]?? 0,
      'This Week': data["This Week"]?? 0,
      'This Month': data["This Month"]?? 0,
      'All Time': data["All Time"]?? 0
    },
    'user': {
      'Today': data["Today"]?? 0,
      'This Week': data["This Week"]?? 0,
      'This Month': data["This Month"]?? 0,
      'All Time': data["All Time"]?? 0
    }
  };

  const handlePeriodChange = (period) => {
    setTransitionStage('fadeOut');
    setTimeout(() => {
      setSelectedPeriod(period);
      setTransitionStage('fadeIn');
    }, 300);
  };

  const periodData = leaderboardData[type][selectedPeriod] || [];
  const sortedData = [...periodData].sort((a, b) => (type === 'driver' ? b.trips : b.trips) - (type === 'driver' ? a.trips : a.trips));

  const topFive = sortedData.slice(0, 5); // Get top 5 items, even if less than 5

  const maxValue = topFive[0]?.[type === 'driver' ? 'trips' : 'trips'] || 0;

  const rankColors = {
    1: 'bg-gradient-to-b from-yellow-400 to-yellow-500',
    2: 'bg-gradient-to-b from-gray-300 to-gray-400',
    3: 'bg-gradient-to-b from-amber-600 to-amber-700'
  };

  const getBarHeight = (value) => {
    const baseHeight = 160; // pixels
    
    return (value / maxValue) * baseHeight;
  };

  return (
    <Card>
      <CardHeader />
      <CardContent>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
          <h2 className="text-2xl font-bold text-gray-800">
          {type === 'driver' ? dictionary['navigation'].Driver : dictionary['navigation'].User}
          </h2>
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg ">
            {['Today', 'This Week', 'This Month', 'All Time'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 mb-1 py-2 text-sm font-medium rounded-lg transition-all duration-300
                  ${period === selectedPeriod 
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
            {dictionary['navigation'][period]}
            </button>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className={`flex flex-col md:flex-row gap-8 transition-opacity duration-300 
          ${transitionStage === 'fadeOut' ? 'opacity-0' : 'opacity-100'}`}>

          {/* Podium Section */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
  <div className="flex justify-center items-end gap-4" style={{ marginTop: '29%' }}>
    {topFive.length === 0 ? (
      <div className="relative flex flex-col items-center w-20 md:w-18">
        {/* Default podium color for #0 */}
        <div className="w-full bg-gray-400 rounded-t-xl shadow-lg" style={{ height: '100px' }}>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 rounded-full border-4 border-white shadow-md bg-gray-300 flex items-center justify-center text-sm font-bold">
              -
            </div>
          </div>
        </div>
        <div className="mt-4 w-8 h-8 rounded-full shadow-lg border-2 border-gray-500 flex items-center justify-center font-bold text-gray-700">0</div>
      </div>
    ) : (
      topFive.slice(0, 3).map((item, index) => (
        <div key={item.id} className="relative flex flex-col items-center w-20 md:w-28">
          <div
            className={`w-full ${rankColors[index + 1] || 'bg-gray-400'} rounded-t-xl shadow-lg`}
            style={{ height: `${getBarHeight(item[type === 'driver' ? 'trips' : 'trips'])}px`, minHeight: '60px' }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center text-sm font-bold">
                {item.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="mt-4 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center font-bold shadow-sm">
            {index + 1}
          </div>
        </div>
      ))
    )}
  </div>
</Grid>
{/* Top 5 List */}
<Grid item xs={12} md={6}>
  <div className="space-y-3">
    {topFive.length === 0 || topFive.every(item => item.trips === 0) ? (
      [...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center p-3 space-x-4 bg-gray-100 rounded-lg">
          <span className="text-gray-500 font-medium w-4">{index + 1}.</span>
          <div className="flex-1 font-medium text-gray-800 truncate">{dictionary['navigation'].NoDataFound}</div>
          <span className="text-gray-600 text-sm whitespace-nowrap">{0} {dictionary['navigation'].trips}</span>

        </div>
      ))
    ) : (
      topFive.concat(
        new Array(5 - topFive.length).fill({ id: null, name: "No Data Found", trips: 0 })
      ).slice(0, 5).map((item, index) => (
        <div key={index} className="flex items-center p-3 space-x-4 bg-gray-100 rounded-lg">
          <span className="text-gray-500 font-medium w-4">{index + 1}.</span>
          <div className="flex-1 font-medium text-gray-800 truncate">{item.name}</div>
          <span className="text-gray-600 text-sm whitespace-nowrap">{item.trips} {dictionary['navigation'].trips}</span>
        </div>
      ))
    )}
  </div>
</Grid>


          </Grid>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderBoard;
